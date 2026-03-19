import React, { useState } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  ChartColumn,
  Clock3,
  Network,
  Radar,
  Search,
  ShieldAlert,
  Wallet2,
} from 'lucide-react';
import './BalanceComponent.css';
import {
  buildExplorerParams,
  EXPLORER_API_URL,
  getExplorerArrayResult,
  getExplorerBalanceResult,
  getExplorerErrorMessage,
  getExplorerProxyResult,
  NETWORK_LABELS,
} from './explorerApi';

const formatNumber = (value, maximumFractionDigits = 4) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
  }).format(numericValue);
};

const formatCompact = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(numericValue);
};

const shortenHash = (value = '') => {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
};

const formatTimestamp = (timeStamp) => {
  const numericStamp = Number(timeStamp);
  if (!numericStamp) {
    return 'Unknown';
  }

  return new Date(numericStamp * 1000).toLocaleString();
};

const getTransactionStatus = (status) => {
  if (status === '0x1') {
    return { label: 'Success', tone: 'success' };
  }

  if (status === '0x0') {
    return { label: 'Failed', tone: 'danger' };
  }

  return { label: 'Pending', tone: 'pending' };
};

const BalanceComponent = () => {
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [targetAddress, setTargetAddress] = useState('');
  const [privateNotes] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txDetails, setTxDetails] = useState(null);
  const [lookupType, setLookupType] = useState('');
  const [cryptoType, setCryptoType] = useState('ETH');
  const [suspiciousTxs, setSuspiciousTxs] = useState([]);

  const isAddress = (input) => /^0x[a-fA-F0-9]{40}$/.test(input);
  const isBitcoinAddress = (input) =>
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{11,71}$/.test(input);
  const isTxHash = (input) => /^0x[a-fA-F0-9]{64}$/.test(input);

  const requestExplorer = (params) =>
    axios.get(EXPLORER_API_URL, {
      params: buildExplorerParams(cryptoType, params),
    });

  const weiToEther = (wei, type = 'ETH') => {
    if (!wei) return '0';

    let value;
    if (typeof wei === 'string' && wei.startsWith('0x')) {
      value = parseInt(wei, 16);
    } else {
      value = parseFloat(wei);
    }

    if (Number.isNaN(value)) return '0';

    const divisor = type === 'BTC' ? 1e8 : 1e18;
    return (value / divisor).toFixed(6);
  };

  const hexToDecimal = (hex) => {
    if (!hex) return 'N/A';
    if (typeof hex === 'string' && hex.startsWith('0x')) {
      return parseInt(hex, 16).toString();
    }
    return hex;
  };

  const detectCoinMixing = (transactionsData) => {
    return transactionsData.filter((tx) => {
      const val = parseFloat(tx.value);
      return (
        val > 0.1 &&
        val < 5 &&
        transactionsData.filter((item) => item.from === tx.from).length > 5
      );
    });
  };

  const detectSingleSuspicious = (tx, type) => {
    const reasons = [];
    const val = parseFloat(weiToEther(tx.value || '0', type));

    if (val === 0.1 || val === 1 || val === 10 || val === 100) {
      reasons.push(`Exact match for a common mixing denomination (${val} ${type}).`);
    } else if (val >= 0.1 && val <= 5 && type === 'ETH') {
      reasons.push('Value falls inside a high-risk range often seen in suspicious transfers.');
    }

    const knownEntities = [
      '0xd90e2f925da726b50c4ed8d0fb90ad053324f31b',
      '0x910cbd523d972eb0a6f4cae4418a184084d8a59d',
      '0x47ce0c6ed5b0ce3d3a51fdb1c52dcf5aca9a3479',
      '0x12d66f87a04a9e220743712ce6d9bb1b56f6c8e1',
      '0x5a18a9fc48525bafcd888e5d0de79cfbf4a64860',
    ];

    if (tx.to && knownEntities.includes(tx.to.toLowerCase())) {
      reasons.push('Destination address is associated with a known mixer entity.');
    }

    if (tx.from && knownEntities.includes(tx.from.toLowerCase())) {
      reasons.push('Source address is associated with a known mixer entity.');
    }

    if (!tx.to) {
      reasons.push('Contract creation detected because no destination address was found.');
    }

    return reasons;
  };

  const fetchTransactionByHash = async (txHash) => {
    setIsLoading(true);
    setError('');
    setTxDetails(null);
    setBalances({});
    setTransactions([]);
    setSuspiciousTxs([]);
    setLookupType('txhash');

    try {
      const txResponse = await requestExplorer({
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txHash,
      });

      const txData = getExplorerProxyResult(txResponse.data, cryptoType, 'transaction details');

      const receiptResponse = await requestExplorer({
        module: 'proxy',
        action: 'eth_getTransactionReceipt',
        txhash: txHash,
      });

      const receiptData = getExplorerProxyResult(
        receiptResponse.data,
        cryptoType,
        'transaction receipt',
        { allowNull: true }
      );
      const normalizedTx = {
        ...txData,
        hash: txData.hash || receiptData?.transactionHash || txHash,
        from: txData.from || receiptData?.from || 'Unknown',
        to: txData.to || receiptData?.to || null,
        blockNumber: txData.blockNumber || receiptData?.blockNumber || null,
        gasUsed: receiptData?.gasUsed || null,
        status: receiptData?.status || null,
      };

      const suspiciousReasons = detectSingleSuspicious(
        normalizedTx,
        cryptoType
      );

      setTxDetails({
        ...normalizedTx,
        suspicious: suspiciousReasons.length > 0,
        suspiciousReasons,
      });
    } catch (err) {
      setError(`Unable to load transaction details: ${getExplorerErrorMessage(err, cryptoType, 'transaction details')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBitcoinData = async (address) => {
    setIsLoading(true);
    setError('');
    setBalances({});
    setTransactions([]);
    setTxDetails(null);
    setSuspiciousTxs([]);
    setLookupType('address');

    try {
      const response = await axios.get(`https://blockchain.info/rawaddr/${address}`);
      const balance = response.data.final_balance / 1e8;
      const transactionsData = response.data.txs.map((tx) => ({
        hash: tx.hash,
        from: tx.inputs[0]?.prev_out?.addr || 'Multiple/Unknown',
        to: tx.out[0]?.addr || 'Multiple/Unknown',
        value: tx.out.reduce((sum, output) => sum + output.value, 0),
        timeStamp: tx.time,
        currency: 'BTC',
      }));

      setBalances({ BTC: balance });
      setTransactions(transactionsData);
      setSuspiciousTxs(detectCoinMixing(transactionsData));
    } catch (err) {
      setError('Could not fetch Bitcoin data. Verify the address.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEVMData = async (address, type) => {
    setIsLoading(true);
    setError('');
    setTxDetails(null);
    setTransactions([]);
    setSuspiciousTxs([]);
    setLookupType('address');

    try {
      const balanceRes = await axios.get(EXPLORER_API_URL, {
        params: buildExplorerParams(type, {
          module: 'account',
          action: 'balance',
          address,
          tag: 'latest',
        }),
      });

      const balanceVal = Number(getExplorerBalanceResult(balanceRes.data, type)) / 1e18;
      setBalances((prev) => ({ ...prev, [type]: balanceVal }));

      const txRes = await axios.get(EXPLORER_API_URL, {
        params: buildExplorerParams(type, {
          module: 'account',
          action: 'txlist',
          address,
          startblock: 0,
          endblock: 99999999,
          page: 1,
          offset: 20,
          sort: 'desc',
        }),
      });

      const txs = getExplorerArrayResult(txRes.data, type, 'normal transactions');

      const intRes = await axios.get(EXPLORER_API_URL, {
        params: buildExplorerParams(type, {
          module: 'account',
          action: 'txlistinternal',
          address,
          page: 1,
          offset: 10,
          sort: 'desc',
        }),
      });
      const intTxs = getExplorerArrayResult(intRes.data, type, 'internal transactions');

      const combined = []
        .concat(txs)
        .concat(intTxs)
        .map((transaction) => ({
          ...transaction,
          privateNote: privateNotes[transaction.hash] || '',
          currency: type,
        }));

      setTransactions(combined);
      setSuspiciousTxs(detectCoinMixing(combined));
    } catch (err) {
      setError(`Unable to load ${NETWORK_LABELS[type]} data: ${getExplorerErrorMessage(err, type, 'wallet data')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchData = () => {
    const trimmed = targetAddress.trim();
    if (!trimmed) {
      setError('Enter an address or transaction hash.');
      return;
    }

    if (cryptoType === 'BTC') {
      if (isBitcoinAddress(trimmed)) {
        fetchBitcoinData(trimmed);
      } else {
        setError('Invalid BTC address.');
      }
      return;
    }

    if (isAddress(trimmed)) {
      fetchEVMData(trimmed, cryptoType);
    } else if (isTxHash(trimmed)) {
      fetchTransactionByHash(trimmed);
    } else {
      setError('Invalid input for the selected network.');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleFetchData();
  };

  const placeholder =
    cryptoType === 'BTC'
      ? 'Enter a Bitcoin wallet address'
      : 'Enter an address or EVM transaction hash';

  const currentBalance = balances[cryptoType];
  const riskAlertCount =
    lookupType === 'txhash' && txDetails
      ? txDetails.suspiciousReasons.length
      : suspiciousTxs.length;
  const txStatus = txDetails ? getTransactionStatus(txDetails.status) : null;

  const overviewCards = [
    {
      icon: Network,
      label: 'Selected network',
      value: NETWORK_LABELS[cryptoType],
      tone: 'neutral',
    },
    {
      icon: Wallet2,
      label: lookupType === 'txhash' ? 'Lookup mode' : 'Current balance',
      value:
        lookupType === 'txhash'
          ? 'Transaction review'
          : currentBalance !== undefined
            ? `${formatNumber(currentBalance, 6)} ${cryptoType}`
            : 'Awaiting search',
      tone: 'neutral',
    },
    {
      icon: Activity,
      label: 'Records analyzed',
      value:
        lookupType === 'txhash' && txDetails
          ? '1 transaction'
          : `${transactions.length} records`,
      tone: 'neutral',
    },
    {
      icon: ShieldAlert,
      label: 'Risk alerts',
      value:
        riskAlertCount > 0
          ? `${riskAlertCount} flagged`
          : lookupType
            ? 'No active flags'
            : 'Scan pending',
      tone: riskAlertCount > 0 ? 'danger' : 'success',
    },
  ];

  const chartTransactions = [...transactions].slice(0, 12).reverse();
  const chartOptions = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'Montserrat, Helvetica Neue, Arial, sans-serif',
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    colors: ['#4caf50'],
    grid: {
      borderColor: 'rgba(38, 50, 56, 0.08)',
    },
    xaxis: {
      categories: chartTransactions.map((tx, index) => `Tx ${index + 1}`),
      labels: {
        style: {
          colors: '#94a1ab',
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (value) => formatNumber(value, 3),
        style: {
          colors: '#94a1ab',
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: (value) => `${formatNumber(value, 6)} ${cryptoType}`,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Transaction value',
      data: chartTransactions.map((tx) => parseFloat(weiToEther(tx.value, cryptoType))),
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="dashboard-kicker">
            <Radar size={15} />
            Wallet investigation workspace
          </span>
          <h1 className="dashboard-title">Track balances, follow flows, and surface suspicious activity faster.</h1>
          <p className="dashboard-subtitle">
            Search an address or transaction hash to review blockchain movement, risk clues, and recent value flow
            in a single cleaner dashboard.
          </p>
        </div>

        <div className="dashboard-overview-grid">
          {overviewCards.map(({ icon: Icon, label, value, tone }) => (
            <article key={label} className={`overview-card ${tone}`}>
              <div className="overview-icon">
                <Icon size={18} />
              </div>
              <span className="overview-label">{label}</span>
              <strong className="overview-value">{value}</strong>
            </article>
          ))}
        </div>
      </section>

      <form className="search-panel" onSubmit={handleSubmit}>
        <div className="control-field control-select">
          <label htmlFor="network-select">Network</label>
          <select
            id="network-select"
            className="network-select"
            value={cryptoType}
            onChange={(event) => setCryptoType(event.target.value)}
          >
            <option value="ETH">Ethereum (ETH)</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="MATIC">Polygon (MATIC)</option>
            <option value="BNB">Binance (BNB)</option>
          </select>
        </div>

        <div className="control-field control-input">
          <label htmlFor="target-input">Address or transaction hash</label>
          <div className="input-shell">
            <Search size={18} className="input-icon" />
            <input
              id="target-input"
              type="text"
              className="search-input"
              value={targetAddress}
              onChange={(event) => setTargetAddress(event.target.value)}
              placeholder={placeholder}
            />
          </div>
        </div>

        <button className="track-btn" type="submit" disabled={isLoading}>
          {isLoading ? 'Analyzing...' : 'Analyze flow'}
        </button>
      </form>

      <div className="helper-row">
        <span className="helper-chip">Address and transaction lookup</span>
        <span className="helper-chip">Mixer pattern heuristics</span>
        <span className="helper-chip">Recent transaction timeline</span>
      </div>

      {error && (
        <div className="dashboard-message error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="dashboard-message loading">
          <Clock3 size={18} />
          <span>Analyzing blockchain data...</span>
        </div>
      )}

      {!isLoading && !lookupType && !error && (
        <section className="empty-state-card">
          <span className="dashboard-kicker">Start here</span>
          <h2>Paste a wallet address or transaction hash to begin.</h2>
          <p>
            The dashboard will return balances, recent activity, flagged transfers, and a lightweight value chart
            once results are available.
          </p>
          <div className="empty-state-grid">
            <div className="empty-state-item">
              <Wallet2 size={18} />
              <span>Wallet balances by selected network</span>
            </div>
            <div className="empty-state-item">
              <ShieldAlert size={18} />
              <span>Suspicious transaction summaries and reasoning</span>
            </div>
            <div className="empty-state-item">
              <ChartColumn size={18} />
              <span>Visual transaction flow history for quick review</span>
            </div>
          </div>
        </section>
      )}

      {!isLoading && lookupType === 'txhash' && txDetails && (
        <section className="transaction-shell">
          <div className="transaction-summary-card">
            <div>
              <span className="dashboard-kicker">Transaction overview</span>
              <h2>{txDetails.suspicious ? 'Suspicious transfer detected' : 'Transaction looks regular'}</h2>
              <p>
                Review execution status, the sending and receiving parties, and the heuristics that influenced the
                classification.
              </p>
            </div>

            <div className={`transaction-status-card ${txDetails.suspicious ? 'danger' : 'safe'}`}>
              <span className="transaction-status-label">Classification</span>
              <strong>{txDetails.suspicious ? 'Suspicious' : 'Safe / regular'}</strong>
              <small>{formatNumber(weiToEther(txDetails.value, cryptoType), 6)} {cryptoType}</small>
            </div>
          </div>

          <div className="transaction-grid">
            <article className="dashboard-card">
              <h3>Transaction details</h3>
              <div className="detail-grid">
                <div className="detail-row">
                  <span>Hash</span>
                  <strong className="mono-text">{txDetails.hash}</strong>
                </div>
                <div className="detail-row">
                  <span>Status</span>
                  <strong className={`status-chip ${txStatus.tone}`}>
                    {txStatus.label}
                  </strong>
                </div>
                <div className="detail-row">
                  <span>Block</span>
                  <strong>{hexToDecimal(txDetails.blockNumber)}</strong>
                </div>
                <div className="detail-row">
                  <span>Gas used</span>
                  <strong>{hexToDecimal(txDetails.gasUsed)}</strong>
                </div>
                <div className="detail-row">
                  <span>From</span>
                  <strong className="mono-text">{txDetails.from}</strong>
                </div>
                <div className="detail-row">
                  <span>To</span>
                  <strong className="mono-text">{txDetails.to || 'Contract creation'}</strong>
                </div>
              </div>
            </article>

            <article className="dashboard-card">
              <h3>Risk reasoning</h3>
              {txDetails.suspicious ? (
                <ul className="reason-list">
                  {txDetails.suspiciousReasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : (
                <p className="empty-copy">No suspicious heuristics were triggered for this transaction.</p>
              )}
            </article>
          </div>
        </section>
      )}

      {!isLoading && lookupType === 'address' && (
        <>
          {suspiciousTxs.length > 0 && (
            <section className="dashboard-card suspicious-card">
              <div className="section-head">
                <div>
                  <span className="dashboard-kicker">Risk alert</span>
                  <h2>{suspiciousTxs.length} suspicious transactions detected</h2>
                </div>
                <span className="count-pill">{formatCompact(suspiciousTxs.length)} flagged</span>
              </div>

              <div className="suspicious-list">
                {suspiciousTxs.map((tx) => (
                  <article key={tx.hash} className="suspicious-item">
                    <div>
                      <span className="suspicious-label">Pattern match</span>
                      <strong className="mono-text">{shortenHash(tx.hash)}</strong>
                    </div>
                    <span className="suspicious-value">
                      {formatNumber(weiToEther(tx.value, cryptoType), 6)} {cryptoType}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="dashboard-results-grid">
            <article className="dashboard-card history-card">
              <div className="section-head">
                <div>
                  <span className="dashboard-kicker">Ledger</span>
                  <h2>Recent transactions</h2>
                </div>
                <span className="count-pill">{transactions.length} records</span>
              </div>

              {transactions.length > 0 ? (
                <ul className="history-list">
                  {transactions.map((tx, index) => (
                    <li key={`${tx.hash}-${index}`} className="history-item">
                      <div className="history-item-top">
                        <span className="history-hash">{shortenHash(tx.hash)}</span>
                        <span className="history-value">
                          {formatNumber(weiToEther(tx.value, cryptoType), 6)} {cryptoType}
                        </span>
                      </div>
                      <div className="history-meta">
                        <span>
                          <ArrowRightLeft size={14} />
                          {shortenHash(tx.from || 'Unknown')} to {shortenHash(tx.to || 'Contract creation')}
                        </span>
                        <span>
                          <Clock3 size={14} />
                          {formatTimestamp(tx.timeStamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-copy">No transaction history was returned for this address.</p>
              )}
            </article>

            <div className="dashboard-side-column">
              {transactions.length > 0 && (
                <article className="dashboard-card chart-card">
                  <div className="section-head">
                    <div>
                      <span className="dashboard-kicker">Visualization</span>
                      <h2>Flow analysis chart</h2>
                    </div>
                  </div>
                  <ReactApexChart
                    options={chartOptions}
                    series={chartSeries}
                    type="line"
                    height={320}
                  />
                </article>
              )}

              <article className="dashboard-card insight-card">
                <div className="section-head">
                  <div>
                    <span className="dashboard-kicker">Investigation tips</span>
                    <h2>What to review next</h2>
                  </div>
                </div>

                <div className="insight-list">
                  <div className="insight-item">
                    <Search size={16} />
                    <span>Cross-check repeated destination addresses for clustering patterns.</span>
                  </div>
                  <div className="insight-item">
                    <ShieldAlert size={16} />
                    <span>Use flagged transfers as the starting point for higher-risk follow-up.</span>
                  </div>
                  <div className="insight-item">
                    <ChartColumn size={16} />
                    <span>Compare sharp value spikes against broader market movement in analytics.</span>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default BalanceComponent;
