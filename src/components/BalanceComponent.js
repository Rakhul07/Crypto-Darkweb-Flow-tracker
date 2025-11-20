import React, { useState } from 'react';
import axios from 'axios';
import ReactApexChart from 'react-apexcharts';
import './BalanceComponent.css';

const BalanceComponent = () => {
  const [balances, setBalances] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [suspiciousTxs, setSuspiciousTxs] = useState([]);
  const [targetAddress, setTargetAddress] = useState('');
  const [cryptoType, setCryptoType] = useState('ETH');
  const [isLoading, setIsLoading] = useState(false);

  const apiKeys = {
    ETH: 'FGFBRUK59JWY3HYVGIJ5VMHHMYBAHY6V6U',
    MATIC: 'DKJ4RGNR687ZYKTSI15H7AHMBITCQMIUZR',
    BNB: 'C2X1AEKX5RS7R7R8YCA2SBSHN6UZEVG77A',
  };

  const fetchCryptoData = async () => {
    setIsLoading(true);
    try {
      let balance, transactionsData = [];
      switch (cryptoType) {
        case 'ETH':
        case 'MATIC':
        case 'BNB':
          ({ balance, transactionsData } = await fetchEtherscanData(apiKeys[cryptoType]));
          break;
        case 'BTC':
          ({ balance, transactionsData } = await fetchBitcoinData());
          break;
        default:
          console.error('Unsupported crypto type');
          break;
      }
      setBalances((prev) => ({ ...prev, [cryptoType]: balance }));
      setTransactions(transactionsData);
      setSuspiciousTxs(detectCoinMixing(transactionsData));
    } catch (error) {
      console.error(Error `fetching ${cryptoType} data:, error.message`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEtherscanData = async (apiKey) => {
    const apiUrl = cryptoType === 'ETH' ? 'https://api.etherscan.io/api' :
                   cryptoType === 'MATIC' ? 'https://api.polygonscan.com/api' :
                   'https://api.bscscan.com/api';

    const balanceResponse = await axios.get(apiUrl, {
      params: { module: 'account', action: 'balance', address: targetAddress, apikey: apiKey },
    });
    const balance = balanceResponse.data.result / 1e18;

    const transactionsResponse = await axios.get(apiUrl, {
      params: {
        module: 'account',
        action: 'txlist',
        address: targetAddress,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 10,
        sort: 'asc',
        apikey: apiKey,
      },
    });

    const transactionsData = transactionsResponse.data.result.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value / 1e18,
      currency: cryptoType,
    }));

    return { balance, transactionsData };
  };

  const fetchBitcoinData = async () => {
    const response = await axios.get(`https://blockchain.info/rawaddr/${targetAddress}`);
    const balance = response.data.final_balance / 1e8;
    const transactionsData = response.data.txs.map((tx) => ({
      hash: tx.hash,
      from: tx.inputs.map((input) => input.prev_out?.addr || 'Unknown').join(', '),
      to: tx.out.map((output) => output.addr || 'Unknown').join(', '),
      value: tx.out.reduce((sum, output) => sum + output.value, 0) / 1e8,
      currency: 'BTC',
    }));

    return { balance, transactionsData };
  };

  const detectCoinMixing = (transactionsData) => {
    return transactionsData.filter((tx) => {
      return (
        tx.value > 0.1 && tx.value < 1 && // Suspicious amount range
        tx.to.length > 2 && // Multiple output addresses
        transactionsData.filter(t => t.from === tx.from).length > 5 // High-frequency transactions
      );
    });
  };

  return (
    <div className="bgcolour">
      <h1>Crypto Balance and Transaction History</h1>
      <label>
        Select Crypto:
        <select value={cryptoType} onChange={(e) => setCryptoType(e.target.value)}>
          <option value="ETH">Ethereum (ETH)</option>
          <option value="BTC">Bitcoin (BTC)</option>
          <option value="MATIC">Polygon (MATIC)</option>
          <option value="BNB">Binance Coin (BNB)</option>
        </select>
      </label>
      <br />
      <label>
        Enter Address:
        <input type="text" value={targetAddress} onChange={(e) => setTargetAddress(e.target.value)} />
      </label>
      <button onClick={fetchCryptoData}>Track</button>

      {isLoading ? (
        <p>Loading Details...</p>
      ) : (
        <>
          <p>{balances[cryptoType] !== undefined ? `Balance: ${balances[cryptoType]} ${cryptoType}` : 'No data available'}</p>
          <h2>Transactions</h2>
          <ul>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <li key={tx.hash}>
                  <strong>Hash:</strong> {tx.hash}<br />
                  <strong>From:</strong> {tx.from}<br />
                  <strong>To:</strong> {tx.to}<br />
                  <strong>Value:</strong> {tx.value} {tx.currency}<br />
                </li>
              ))
            ) : (
              <p>No transactions found</p>
            )}
          </ul>
          <h2>Suspicious Transactions</h2>
          <ul>
            {suspiciousTxs.length > 0 ? (
              suspiciousTxs.map((tx) => (
                <li key={tx.hash} style={{ color: 'red' }}>
                  <strong>Suspicious Hash:</strong> {tx.hash}<br />
                  <strong>From:</strong> {tx.from}<br />
                  <strong>To:</strong> {tx.to}<br />
                  <strong>Value:</strong> {tx.value} {tx.currency}<br />
                </li>
              ))
            ) : (
              <p>No suspicious transactions detected</p>
            )}
          </ul>
          <ReactApexChart options={{ xaxis: { categories: transactions.map((tx) => tx.hash) } }} series={[{ name: 'Transaction Values', data: transactions.map((tx) => tx.value) }]} type="line" height={400} width={1400} />
        </>
      )}
    </div>
  );
};

export default BalanceComponent;