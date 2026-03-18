/**
 * Heuristic engine for suspicious wallet/transaction detection.
 * Scores each transaction and returns flagged results with reasons.
 */

// Known mixer / high-risk contract addresses (Tornado Cash pools, etc.)
const KNOWN_MIXER_ADDRESSES = new Set([
  '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
  '0x910cbd523d972eb0a6f4cae4418a184084d8a59d',
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dcf5aca9a3479',
  '0x12d66f87a04a9e220743712ce6d9bb1b56f6c8e1',
  '0x5a18a9fc48525bafcd888e5d0de79cfbf4a64860',
  '0x07687e702b410fa43f4cb4af7fa097918ffd2730',
  '0x23773e65ed146a459667303b6428d4171f93b27a',
  '0x22aaa7720ddd5388a3c0a3333430953c68f1849b',
]);

// Common mixer denomination amounts in ETH (Tornado Cash: 0.1, 1, 10, 100)
const MIXER_DENOMINATIONS = new Set([0.1, 1, 10, 100]);

const WEI = 1e18;

/**
 * Convert wei string to ETH float.
 */
const toEth = (wei) => {
  if (!wei) return 0;
  return parseFloat(wei) / WEI;
};

/**
 * Score a single transaction against heuristic rules.
 * Returns { suspicious: bool, score: number, reasons: string[] }
 */
export const scoreTx = (tx, allTxs) => {
  const reasons = [];
  let score = 0;
  const value = toEth(tx.value || '0');
  const from = (tx.from || '').toLowerCase();
  const to = (tx.to || '').toLowerCase();

  // Rule 1: Interaction with known mixer address
  if (KNOWN_MIXER_ADDRESSES.has(to)) {
    reasons.push('Sent to a known coin mixer (e.g. Tornado Cash).');
    score += 40;
  }
  if (KNOWN_MIXER_ADDRESSES.has(from)) {
    reasons.push('Received from a known coin mixer.');
    score += 40;
  }

  // Rule 2: Exact mixer denomination
  if (value > 0 && MIXER_DENOMINATIONS.has(parseFloat(value.toFixed(4)))) {
    reasons.push(`Exact mixer denomination detected (${value} ETH).`);
    score += 25;
  }

  // Rule 3: High-frequency sender — same `from` appears > 10 times
  const senderCount = allTxs.filter(t => (t.from || '').toLowerCase() === from).length;
  if (senderCount > 10) {
    reasons.push(`High-frequency sender: ${senderCount} txns from same address.`);
    score += 15;
  }

  // Rule 4: Rapid-fire transactions — > 5 txns within 60 seconds of this one
  const ts = parseInt(tx.timeStamp || '0', 10);
  const rapidCount = allTxs.filter(t => {
    const diff = Math.abs(parseInt(t.timeStamp || '0', 10) - ts);
    return diff <= 60 && t.hash !== tx.hash;
  }).length;
  if (rapidCount >= 5) {
    reasons.push(`Rapid-fire activity: ${rapidCount} other txns within 60 seconds.`);
    score += 20;
  }

  // Rule 5: Contract creation (no `to` address)
  if (!tx.to) {
    reasons.push('Contract creation transaction (no destination address).');
    score += 10;
  }

  // Rule 6: Zero-value transaction (potential phishing / approval drain)
  if (value === 0 && tx.input && tx.input !== '0x') {
    reasons.push('Zero-value transaction with contract call data (possible approval/phishing).');
    score += 20;
  }

  // Rule 7: Unusually large single transfer (> 100 ETH)
  if (value > 100) {
    reasons.push(`Large transfer detected: ${value.toFixed(4)} ETH.`);
    score += 15;
  }

  return {
    suspicious: score >= 25,
    score,
    reasons,
  };
};

/**
 * Run heuristics over a full transaction list.
 * Returns array of { tx, score, reasons } for suspicious ones only.
 */
export const analyzeTransactions = (txList) => {
  if (!Array.isArray(txList) || txList.length === 0) return [];

  return txList
    .map(tx => {
      const result = scoreTx(tx, txList);
      return { tx, ...result };
    })
    .filter(r => r.suspicious)
    .sort((a, b) => b.score - a.score);
};

/**
 * Produce a wallet-level risk summary from flagged transactions.
 */
export const walletRiskSummary = (flagged, total) => {
  if (flagged.length === 0) return { level: 'Low', color: '#10b981', label: 'Clean' };
  const ratio = flagged.length / Math.max(total, 1);
  if (ratio > 0.3 || flagged.some(f => f.score >= 60)) {
    return { level: 'High', color: '#ef4444', label: 'High Risk' };
  }
  if (ratio > 0.1 || flagged.some(f => f.score >= 40)) {
    return { level: 'Medium', color: '#f59e0b', label: 'Moderate Risk' };
  }
  return { level: 'Low', color: '#10b981', label: 'Low Risk' };
};
