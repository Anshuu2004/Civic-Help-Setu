/**
 * src/components/waterQuality/WaterPointCard.jsx
 * Presentation component for individual public water point asset cards.
 */

import { Droplet, MapPin, Calendar, Activity, ShieldCheck, AlertTriangle, AlertOctagon, Clock } from 'lucide-react';
import { WATER_POINT_TYPES, OPERATIONAL_STATUSES } from '../../data/waterQualityContract.js';

export default function WaterPointCard({
  waterPoint,
  onViewDetails,
  onRecordSample,
  onAddCorrectiveAction,
  userRole = 'public',
}) {
  const typeDef = WATER_POINT_TYPES[waterPoint.pointType] || { label: waterPoint.pointType };
  const opStatus = OPERATIONAL_STATUSES[waterPoint.operationalStatus] || { label: waterPoint.operationalStatus, badgeClass: 'badge-neutral' };

  const getComplianceIndicator = (compliance) => {
    switch (compliance) {
      case 'compliant':
        return {
          label: 'IS 10500 Compliant',
          badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600 inline mr-1" aria-hidden="true" />,
        };
      case 'critical_hazard':
        return {
          label: 'Critical Hazard (Action Required)',
          badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700',
          icon: <AlertOctagon className="w-4 h-4 text-rose-600 inline mr-1" aria-hidden="true" />,
        };
      case 'exceeded':
        return {
          label: 'Parameter Exceeded (Under Review)',
          badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 inline mr-1" aria-hidden="true" />,
        };
      default:
        return {
          label: 'Pending Initial Lab Analysis',
          badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700',
          icon: <Clock className="w-4 h-4 text-gray-500 inline mr-1" aria-hidden="true" />,
        };
    }
  };

  const complianceBadge = getComplianceIndicator(waterPoint.overallComplianceStatus);
  const sampleAge = waterPoint.sampleAge || { text: 'Not yet sampled', isStale: false };

  return (
    <article
      className="p-5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
      aria-labelledby={`wp-title-${waterPoint.id}`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-light)]">
            {waterPoint.id}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${opStatus.badgeClass}`}
            >
              {opStatus.label}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center ${complianceBadge.badgeClass}`}
            >
              {complianceBadge.icon}
              {complianceBadge.label}
            </span>
          </div>
        </div>

        {/* Title & Type */}
        <h3
          id={`wp-title-${waterPoint.id}`}
          className="text-lg font-bold text-[var(--text-primary)] mb-1 leading-snug"
        >
          {waterPoint.name}
        </h3>
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1">
          <Droplet className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{typeDef.label}</span>
          <span className="text-[var(--text-tertiary)]">•</span>
          <span>{waterPoint.sourceType}</span>
        </p>

        {/* Location & Landmark */}
        <div className="space-y-1.5 text-xs text-[var(--text-secondary)] mb-4">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold text-[var(--text-primary)]">{waterPoint.ward}</span>, {waterPoint.city}
              {waterPoint.landmark && (
                <div className="text-[11px] text-[var(--text-secondary)] italic mt-0.5">
                  Landmark: {waterPoint.landmark}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-500 shrink-0" aria-hidden="true" />
            <span>
              {waterPoint.testedCount > 0
                ? `${waterPoint.testedCount} official surveillance tests completed`
                : 'No historical test records'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
            <span className={sampleAge.isStale ? 'font-semibold text-rose-600 dark:text-rose-400' : ''}>
              {sampleAge.text}
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-[var(--border-light)] flex flex-wrap items-center justify-between gap-2 mt-2">
        <button
          type="button"
          onClick={() => onViewDetails(waterPoint.id)}
          className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
          aria-label={`View laboratory test history and parameters for ${waterPoint.name}`}
        >
          <span>Laboratory Results & History</span>
        </button>

        {['sampler', 'official_reviewer', 'admin'].includes(userRole) && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onRecordSample(waterPoint.id)}
              className="btn btn-primary text-xs px-2.5 py-1.5"
              aria-label={`Log new sampling event for ${waterPoint.name}`}
            >
              + Log Sample
            </button>
            {['official_reviewer', 'admin'].includes(userRole) && (
              <button
                type="button"
                onClick={() => onAddCorrectiveAction(waterPoint.id)}
                className="btn btn-secondary text-xs px-2 py-1.5 text-amber-700 dark:text-amber-300"
                aria-label={`Sanction remedial action for ${waterPoint.name}`}
              >
                Remedial Action
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
