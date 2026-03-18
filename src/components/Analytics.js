import './Analytics.css';
import { useEffect, useState } from 'react';
import { Activity, LayoutGrid, Rows3, Search, TrendingUp, Waves } from 'lucide-react';
import Coin from './Coin';

function Analytics() {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
        );

        const data = await response.json();
        if (Array.isArray(data)) {
          setCoins(data);
        } else {
          setError('The market API did not return the expected response.');
        }
      } catch (err) {
        setError('Unable to load market data right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  const filteredCoins = coins.filter((coin) =>
    coin.name.toLowerCase().includes(search.toLowerCase())
  );

  const positiveMovers = filteredCoins.filter((coin) => (coin.price_change_percentage_24h || 0) > 0).length;
  const topMover = [...filteredCoins]
    .sort(
      (first, second) =>
        Math.abs(second.price_change_percentage_24h || 0) - Math.abs(first.price_change_percentage_24h || 0)
    )[0];
  const averagePrice =
    filteredCoins.length > 0
      ? filteredCoins.reduce((sum, coin) => sum + (coin.current_price || 0), 0) / filteredCoins.length
      : 0;

  return (
    <div className="analytics-page">
      <section className="analytics-hero">
        <div className="analytics-hero-copy">
          <span className="analytics-kicker">
            <Waves size={15} />
            Live market intelligence
          </span>
          <h1 className="analytics-title">Track the market with a cleaner, faster analytics view.</h1>
          <p className="analytics-subtitle">
            Filter the top assets, scan price momentum, and review market capitalization and volume in a more useful layout.
          </p>
        </div>

        <div className="analytics-summary-grid">
          <article className="analytics-summary-card">
            <div className="analytics-summary-icon">
              <Activity size={18} />
            </div>
            <span className="analytics-summary-label">Assets loaded</span>
            <strong className="analytics-summary-value">{coins.length}</strong>
          </article>
          <article className="analytics-summary-card">
            <div className="analytics-summary-icon">
              <TrendingUp size={18} />
            </div>
            <span className="analytics-summary-label">Positive movers</span>
            <strong className="analytics-summary-value">{positiveMovers}</strong>
          </article>
          <article className="analytics-summary-card">
            <div className="analytics-summary-icon">
              <Search size={18} />
            </div>
            <span className="analytics-summary-label">Average price</span>
            <strong className="analytics-summary-value">
              ${averagePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </strong>
          </article>
        </div>
      </section>

      <section className="analytics-toolbar">
        <div className="analytics-search-shell">
          <Search size={18} className="analytics-search-icon" />
          <input
            type="text"
            className="analytics-search-input"
            placeholder="Search a cryptocurrency..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="analytics-toolbar-meta">
          <span className="analytics-chip">{filteredCoins.length} matches</span>
          {topMover && (
            <span className="analytics-chip accent">
              Top mover: {topMover.symbol.toUpperCase()} {(topMover.price_change_percentage_24h || 0).toFixed(2)}%
            </span>
          )}
          <div className="analytics-view-toggle" aria-label="Currency view mode">
            <button
              type="button"
              className={`analytics-view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <Rows3 size={16} />
              <span>List</span>
            </button>
            <button
              type="button"
              className={`analytics-view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid size={16} />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </section>

      {error && <div className="analytics-message error">{error}</div>}
      {loading && <div className="analytics-message">Loading live market data...</div>}

      {!loading && !error && filteredCoins.length === 0 && (
        <div className="analytics-message">No assets match that search yet. Try a broader keyword.</div>
      )}

      {!loading && !error && filteredCoins.length > 0 && (
        <div className={`coin-grid ${viewMode}-view`}>
          {filteredCoins.map((coin, index) => (
            <Coin
              key={coin.id}
              viewMode={viewMode}
              rank={index + 1}
              name={coin.name}
              image={coin.image}
              symbol={coin.symbol}
              marketcap={coin.market_cap}
              price={coin.current_price}
              priceChange={coin.price_change_percentage_24h}
              volume={coin.total_volume}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Analytics;
