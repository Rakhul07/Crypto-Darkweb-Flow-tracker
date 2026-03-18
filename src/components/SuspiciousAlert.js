import React, { useState } from 'react';

/**
 * Displays heuristic suspicious transaction results with expandable details.
 */
const SuspiciousAlert = ({ flagged, total, riskSummary }) => {
  const [expanded, setExpanded] = useState(null);

  if (!flagged || flagged.length === 0) {
    return (
      <div style={styles.clean}>
        <span style={{ fontSize: '1.2rem' }}>✅</span>
        <span>No suspicious activity detected across {total} transactions.</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={{ ...styles.header, borderLeft: `5px solid ${riskSummary.color}` }}>
        <div style={styles.headerTop}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: riskSummary.color }}>
            {riskSummary.label} — {flagged.length} Suspicious Transaction{flagged.length > 1 ? 's' : ''} Detected
          </span>
          <span style={{ ...styles.badge, backgroundColor: riskSummary.color }}>
            {riskSummary.level} Risk
          </span>
        </div>
        <p style={styles.subtext}>
          {flagged.length} of {total} transactions flagged by heuristic analysis.
        </p>
      </div>

      <ul style={styles.list}>
        {flagged.map((item, i) => (
          <li key={item.tx.hash + i} style={styles.item}>
            <div style={styles.itemHeader} onClick={() => setExpanded(expanded === i ? null : i)}>
              <div style={styles.itemLeft}>
                <span style={{ ...styles.scoreBadge, backgroundColor: item.score >= 60 ? '#ef4444' : item.score >= 40 ? '#f59e0b' : '#6366f1' }}>
                  Score: {item.score}
                </span>
                <span style={styles.hash}>{item.tx.hash}</span>
              </div>
              <span style={styles.toggle}>{expanded === i ? '▲ Hide' : '▼ Details'}</span>
            </div>

            {expanded === i && (
              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>From:</span>
                  <span style={styles.mono}>{item.tx.from || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>To:</span>
                  <span style={styles.mono}>{item.tx.to || 'Contract Creation'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Value:</span>
                  <span>{(parseFloat(item.tx.value || '0') / 1e18).toFixed(6)} ETH</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Block:</span>
                  <span>{item.tx.blockNumber}</span>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <span style={styles.label}>Flags:</span>
                  <ul style={styles.reasonList}>
                    {item.reasons.map((r, j) => (
                      <li key={j} style={styles.reason}>⚑ {r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#1a1a2e', border: '1px solid #ef4444', borderRadius: '10px', padding: '20px', marginBottom: '24px' },
  header: { padding: '12px 16px', backgroundColor: '#2d1b1b', borderRadius: '8px', marginBottom: '16px' },
  headerTop: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  badge: { padding: '3px 10px', borderRadius: '12px', color: '#fff', fontSize: '0.8rem', fontWeight: 700 },
  subtext: { margin: '6px 0 0 0', color: '#aaa', fontSize: '0.9rem' },
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: { backgroundColor: '#111827', borderRadius: '8px', marginBottom: '10px', overflow: 'hidden', border: '1px solid #374151' },
  itemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer', userSelect: 'none' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' },
  scoreBadge: { padding: '2px 8px', borderRadius: '10px', color: '#fff', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' },
  hash: { fontFamily: 'monospace', fontSize: '0.82rem', color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '420px' },
  toggle: { color: '#9ca3af', fontSize: '0.82rem', whiteSpace: 'nowrap', marginLeft: '10px' },
  details: { padding: '12px 16px', borderTop: '1px solid #374151', backgroundColor: '#0f172a' },
  detailRow: { display: 'flex', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' },
  label: { color: '#9ca3af', fontWeight: 600, minWidth: '60px' },
  mono: { fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0', wordBreak: 'break-all' },
  reasonList: { listStyle: 'none', padding: '6px 0 0 0', margin: 0 },
  reason: { color: '#fca5a5', fontSize: '0.88rem', marginBottom: '4px' },
  clean: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#052e16', border: '1px solid #10b981', borderRadius: '10px', padding: '16px 20px', color: '#6ee7b7', marginBottom: '24px' },
};

export default SuspiciousAlert;
