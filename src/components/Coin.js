import './Coin.css';

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value > 1 ? 2 : 6,
  });

const formatCompactCurrency = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  });

const Coin = ({ image, name, price, volume, symbol, priceChange, marketcap, rank, viewMode = 'list' }) => {
  const isPositive = (priceChange || 0) >= 0;

  return (
    <article className={`coin-card ${viewMode}-view`}>
      <div className="coin-card-top">
        <div className="coin-identity">
          <span className="coin-rank">#{rank}</span>
          <img src={image} alt={`${name} logo`} />
          <div>
            <h2>{name}</h2>
            <p className="coin-symbol">{symbol.toUpperCase()}</p>
          </div>
        </div>

        <span className={`coin-change-pill ${isPositive ? 'positive' : 'negative'}`}>
          {priceChange != null ? `${priceChange.toFixed(2)}%` : 'N/A'}
        </span>
      </div>

      <div className="coin-price-block">
        <span className="coin-label">Price</span>
        <strong className="coin-price">{formatCurrency(price)}</strong>
      </div>

      <div className="coin-stats">
        <div className="coin-stat">
          <span className="coin-label">24h Volume</span>
          <strong>{formatCompactCurrency(volume)}</strong>
        </div>
        <div className="coin-stat">
          <span className="coin-label">Market Cap</span>
          <strong>{formatCompactCurrency(marketcap)}</strong>
        </div>
      </div>
    </article>
  );
};

export default Coin;
