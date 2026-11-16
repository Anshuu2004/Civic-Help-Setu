import { useState } from 'react';
import {
  X,
  Wrench,
  ShieldCheck,
  Edit3,
} from 'lucide-react';
import {
  StreetlightPriorityBadge,
  StreetlightStatusBadge,
} from './StreetlightStates';
import {
  PRIORITY_TIERS,
  PRIORITY_TIER_LABELS,
  ASSET_STATUS_LABELS,
} from '../../services/streetlightConstants';
import { canStreetlight } from '../../services/streetlightAccessControl';

export default function StreetlightClusterDetailModal({
  cluster,
  onClose,
  onTriageOverride,
  onDispatchWorkOrder,
  activeActor,
}) {
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [selectedTier, setSelectedTier] = useState(cluster?.priorityTier || 'high');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideError, setOverrideError] = useState('');

  if (!cluster) return null;

  const canOverride = canStreetlight('cluster.override', activeActor);
  const canDispatch = canStreetlight('workOrder.create', activeActor);
  const isResolved = cluster.status === 'resolved';

  const handleSaveOverride = (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      setOverrideError('Please provide an explicit operational reason for this priority override.');
      return;
    }
    setOverrideError('');
    onTriageOverride(cluster.id, {
      priorityTier: selectedTier,
      overrideReason,
    });
    setIsEditingPriority(false);
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cluster-detail-title"
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'var(--bg-primary, #ffffff)',
          borderRadius: '0.85rem',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '1px solid var(--border-main, #e2e8f0)',
            paddingBottom: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 700, color: '#64748b' }}>
                {cluster.id}
              </span>
              <StreetlightPriorityBadge tier={cluster.priorityTier} score={cluster.priorityScore} />
              <StreetlightStatusBadge status={cluster.status} type="cluster" />
            </div>
            <h2 id="cluster-detail-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
              {cluster.corridorName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
            aria-label="Close details"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Corridor Meta */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary, #f8fafc)',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-secondary, #64748b)', display: 'block', fontSize: '0.75rem' }}>Ward Jurisdiction</span>
            <strong>{cluster.jurisdictionId}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary, #64748b)', display: 'block', fontSize: '0.75rem' }}>Poles in Corridor</span>
            <strong>{cluster.poleCount || cluster.assetIds?.length || 1} Streetlights</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary, #64748b)', display: 'block', fontSize: '0.75rem' }}>Centroid Coordinates</span>
            <strong>{cluster.centroid ? `${cluster.centroid.lat}, ${cluster.centroid.lng}` : 'N/A'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary, #64748b)', display: 'block', fontSize: '0.75rem' }}>Active Work Order</span>
            <strong>{cluster.assignedWorkOrderId || 'None Assigned'}</strong>
          </div>
        </div>

        {/* Explainability Breakdown Section */}
        <section style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} style={{ color: '#2563eb' }} aria-hidden="true" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Prioritization Scoring Explainability
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Ruleset: {cluster.explainability?.rulesetVersion || 'v1.0.0'}
            </span>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary, #475569)', margin: '0 0 0.75rem' }}>
            Deterministic ranking derived from outage persistence, streetlight density, and verified public safety contexts (hospitals, pedestrian crossings, transit stops).
          </p>

          <div style={{ border: '1px solid var(--border-main, #e2e8f0)', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f8fafc)', borderBottom: '1px solid var(--border-main, #e2e8f0)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Factor Category</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>Observed Context & Field Impact</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, width: '90px' }}>Contribution</th>
                </tr>
              </thead>
              <tbody>
                {cluster.explainability?.factors?.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-main, #f1f5f9)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#1e293b' }}>
                      {f.field}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#475569' }}>
                      {f.impact}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 700, color: '#2563eb' }}>
                      +{f.points} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Human-in-the-Loop Override Section */}
        {canOverride && !isResolved && (
          <section
            style={{
              padding: '1rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '0.6rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <Edit3 size={16} aria-hidden="true" />
                Human Priority Review & Override
              </div>
              {!isEditingPriority && (
                <button
                  type="button"
                  onClick={() => setIsEditingPriority(true)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  Edit Priority Tier
                </button>
              )}
            </div>

            {cluster.overrideLog && (
              <div style={{ fontSize: '0.8rem', color: '#854d0e', background: '#fefce8', padding: '0.4rem 0.6rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                <strong>Prior Override:</strong> {cluster.overrideLog.reason} (by {cluster.overrideLog.operatorId} at {new Date(cluster.overrideLog.overriddenAt).toLocaleString()})
              </div>
            )}

            {isEditingPriority && (
              <form onSubmit={handleSaveOverride} style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Target Priority Tier
                    </label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem' }}
                    >
                      {Object.entries(PRIORITY_TIERS).map(([key, val]) => (
                        <option key={key} value={val}>
                          {PRIORITY_TIER_LABELS[val]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Operational Reason for Override (Mandatory)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near critical medical cold-storage or upcoming school exam center route"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontSize: '0.85rem' }}
                    />
                    {overrideError && <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>{overrideError}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ fontSize: '0.8rem' }}>
                    Save Override
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingPriority(false);
                      setOverrideError('');
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {/* Member Poles & Reports */}
        <section style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Constituent Streetlight Poles & Reports
          </h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {cluster.assets?.map((asset) => (
              <div
                key={asset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  border: '1px solid var(--border-main, #e2e8f0)',
                  borderRadius: '0.4rem',
                  fontSize: '0.825rem',
                }}
              >
                <div>
                  <strong>{asset.id}</strong> — {asset.street} ({asset.poleType})
                  <div style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.75rem' }}>
                    {asset.landmark || 'Near corridor marker'}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: asset.operationalStatus === 'dark' ? '#dc2626' : '#ea580c',
                  }}
                >
                  {ASSET_STATUS_LABELS[asset.operationalStatus] || asset.operationalStatus}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline btn-sm">
            Close
          </button>
          {canDispatch && !isResolved && cluster.status !== 'work_order_created' && cluster.status !== 'in_progress' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDispatchWorkOrder(cluster);
              }}
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#2563eb' }}
            >
              <Wrench size={15} aria-hidden="true" />
              Dispatch Work Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
