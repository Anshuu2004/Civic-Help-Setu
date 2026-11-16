/**
 * src/components/waterQuality/ParameterResultsTable.jsx
 * Accessible table component for displaying water test parameters
 * against Bureau of Indian Standards IS 10500:2012 thresholds.
 *
 * Enforces accessibility: does not rely on color alone (uses icons + text tags).
 */

import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { IS_10500_STANDARDS } from '../../data/waterQualityContract.js';

const getStatusBadge = (evaluation) => {
  if (!evaluation) {
    return {
      label: 'Verified',
      badgeClass: 'badge-success',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" aria-hidden="true" />,
    };
  }

  if (evaluation.level === 'hazardous_exceeded') {
    return {
      label: evaluation.isMicrobialRisk ? 'Hazardous (Pathogen)' : 'Statutory Limit Exceeded',
      badgeClass: 'badge-danger',
      icon: <AlertOctagon className="w-4 h-4 text-rose-600 inline mr-1" aria-hidden="true" />,
    };
  }

  if (evaluation.level === 'permissible_warning') {
    return {
      label: 'Permissible Warning',
      badgeClass: 'badge-warning',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 inline mr-1" aria-hidden="true" />,
    };
  }

  return {
    label: 'Desirable Limit Compliant',
    badgeClass: 'badge-success',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" aria-hidden="true" />,
  };
};

export default function ParameterResultsTable({ results = [], isSuperseded = false }) {
  if (!results || results.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-lg border border-[var(--border-light)]">
        No laboratory parameter results recorded for this sampling event.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto my-3">
      <table
        className={`w-full text-left text-xs md:text-sm border-collapse ${isSuperseded ? 'opacity-60 bg-gray-50 dark:bg-gray-900/40' : ''}`}
        aria-label="Water Quality Parameter Results vs IS 10500 Standards"
      >
        <caption className="sr-only">
          Laboratory parameter results comparison against IS 10500:2012 Drinking Water Specification
        </caption>
        <thead>
          <tr className="border-b border-[var(--border-light)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
            <th scope="col" className="p-2.5 font-semibold">Parameter</th>
            <th scope="col" className="p-2.5 font-semibold">Tested Value</th>
            <th scope="col" className="p-2.5 font-semibold">Acceptable Limit (Desirable)</th>
            <th scope="col" className="p-2.5 font-semibold">Permissible Limit (No Alternate)</th>
            <th scope="col" className="p-2.5 font-semibold">Compliance Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const paramDef = IS_10500_STANDARDS.parameters[result.parameterCode] || {};
            const paramName = paramDef.name || result.parameterCode;
            const unit = paramDef.unit || '';
            const status = getStatusBadge(result.evaluation);

            return (
              <tr
                key={result.id}
                className="border-b border-[var(--border-light)] hover:bg-[var(--glass-bg)] transition-colors"
              >
                <td className="p-2.5 font-medium text-[var(--text-primary)]">
                  <div>{paramName}</div>
                  {paramDef.testMethod && (
                    <span className="text-[10px] text-[var(--text-secondary)] block">
                      Ref: {paramDef.testMethod}
                    </span>
                  )}
                </td>
                <td className="p-2.5 font-bold text-[var(--text-primary)]">
                  <span className={isSuperseded ? 'line-through text-gray-500' : ''}>
                    {result.testedValue} {unit}
                  </span>
                </td>
                <td className="p-2.5 text-[var(--text-secondary)]">
                  {paramDef.acceptableMin !== undefined && paramDef.acceptableMax !== undefined ? (
                    paramDef.acceptableMin === 0 && paramDef.acceptableMax === 0 ? (
                      'Absent (0)'
                    ) : paramDef.acceptableMin > 0 ? (
                      `${paramDef.acceptableMin} - ${paramDef.acceptableMax} ${unit}`
                    ) : (
                      `Max ${paramDef.acceptableMax} ${unit}`
                    )
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="p-2.5 text-[var(--text-secondary)]">
                  {paramDef.relaxationAllowed ? (
                    `Max ${paramDef.permissibleMax} ${unit}`
                  ) : (
                    <span className="italic text-xs">No relaxation</span>
                  )}
                </td>
                <td className="p-2.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status.badgeClass}`}
                  >
                    {status.icon}
                    <span>{isSuperseded ? 'Superseded' : status.label}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
