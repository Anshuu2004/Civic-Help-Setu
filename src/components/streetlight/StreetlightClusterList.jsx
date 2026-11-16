import {
  MapPin,
  Clock,
  Layers,
  Wrench,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  StreetlightStatusBadge,
  StreetlightPriorityBadge,
  StreetlightEmptyState,
} from './StreetlightStates';
import { canStreetlight } from '../../services/streetlightAccessControl';

export default function StreetlightClusterList({
  clusters = [],
  onSelectCluster,
  onDispatchWorkOrder,
  activeActor,
}) {
  if (!clusters || clusters.length === 0) {
    return <StreetlightEmptyState />;
  }

  const canCreateWorkOrder = canStreetlight('workOrder.create', activeActor);

  return (
    <div
      className="streetlight-cluster-list"
      style={{ display: 'grid', gap: '1rem', width: '100%' }}
      role="region"
      aria-label="Streetlight Outage Clusters"
    >
      {clusters.map((cluster) => {
        const topFactor = cluster.explainability?.factors?.[0];
        const isResolved = cluster.status === 'resolved';

        return (
          <article
            key={cluster.id}
            className="card"
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              transition: 'border-color 0.2s ease',
              borderLeft: `4px solid ${
                cluster.priorityTier === 'critical'
                  ? '#dc2626'
                  : cluster.priorityTier === 'high'
                  ? '#ea580c'
                  : '#ca8a04'
              }`,
            }}
          >
            {/* Header row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'var(--text-tertiary, #64748b)',
                    background: 'var(--bg-secondary, #f1f5f9)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                  }}
                >
                  {cluster.id}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600 }}>
                  {cluster.jurisdictionId}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StreetlightPriorityBadge tier={cluster.priorityTier} score={cluster.priorityScore} />
                <StreetlightStatusBadge status={cluster.status} type="cluster" />
              </div>
            </div>

            {/* Corridor Title & Counts */}
            <div>
              <h2
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  margin: '0 0 0.35rem',
                  color: 'var(--text-primary, #0f172a)',
                }}
              >
                {cluster.corridorName}
              </h2>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '1.25rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary, #475569)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Layers size={14} aria-hidden="true" />
                  <span>
                    <strong>{cluster.poleCount || cluster.assetIds?.length || 1}</strong> Streetlight Poles
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} aria-hidden="true" />
                  <span>
                    Centroid: {cluster.centroid ? `${cluster.centroid.lat}, ${cluster.centroid.lng}` : 'Ward Center'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} aria-hidden="true" />
                  <span>
                    Reported: {cluster.createdAt ? new Date(cluster.createdAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explainability Snippet Callout */}
            {topFactor && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem',
                  background: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-main, #e2e8f0)',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary, #475569)',
                }}
              >
                <Info size={14} style={{ color: '#2563eb', flexShrink: 0 }} aria-hidden="true" />
                <span>
                  <strong>Prioritization Factor:</strong> {topFactor.impact} (+{topFactor.points} pts)
                </span>
              </div>
            )}

            {/* Action Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.6rem',
                borderTop: '1px solid var(--border-main, #e2e8f0)',
                paddingTop: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => onSelectCluster(cluster.id)}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem' }}
              >
                View Triage & Explainability
                <ChevronRight size={14} aria-hidden="true" />
              </button>

              {canCreateWorkOrder && !isResolved && cluster.status !== 'work_order_created' && cluster.status !== 'in_progress' && (
                <button
                  type="button"
                  onClick={() => onDispatchWorkOrder(cluster)}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    background: '#2563eb',
                    borderColor: '#2563eb',
                  }}
                >
                  <Wrench size={14} aria-hidden="true" />
                  Dispatch Repair Work Order
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
