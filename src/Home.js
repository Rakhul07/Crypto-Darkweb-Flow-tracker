import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Eye,
  Globe,
  LineChart,
  Lock,
  Radar,
  Search,
  Shield,
  Wallet,
  Zap,
} from 'lucide-react';
import './components/layout/Home.css';

const TICKERS = [
  { symbol: 'BTC', price: '$67,420', change: '+2.4%', up: true },
  { symbol: 'ETH', price: '$3,512', change: '+1.8%', up: true },
  { symbol: 'BNB', price: '$412', change: '-0.6%', up: false },
  { symbol: 'MATIC', price: '$0.89', change: '+3.1%', up: true },
  { symbol: 'SOL', price: '$178', change: '+4.2%', up: true },
  { symbol: 'AVAX', price: '$38.5', change: '-1.2%', up: false },
  { symbol: 'LINK', price: '$18.3', change: '+0.9%', up: true },
  { symbol: 'ARB', price: '$1.24', change: '+5.3%', up: true },
];

const QUICK_ACTIONS = [
  {
    icon: Search,
    title: 'Investigate a wallet',
    description: 'Open the dashboard to inspect balances, suspicious flows, and transaction timelines.',
    link: '/balance',
    label: 'Open dashboard',
  },
  {
    icon: LineChart,
    title: 'Watch market movement',
    description: 'Explore live pricing, volume, and 24-hour momentum across the top assets.',
    link: '/analytics',
    label: 'View analytics',
  },
];

const FEATURES = [
  {
    icon: Eye,
    title: 'Multi-chain visibility',
    desc: 'Follow ETH, BTC, Polygon, and BNB activity from one investigation workspace.',
  },
  {
    icon: Shield,
    title: 'Suspicious pattern detection',
    desc: 'Spot mixer-sized transfers, known entity overlaps, and unusual transaction bursts.',
  },
  {
    icon: Activity,
    title: 'Flow timelines',
    desc: 'Review transaction sequences and value movement with clearer visual summaries.',
  },
  {
    icon: Zap,
    title: 'Fast lookup flow',
    desc: 'Jump from address search to actionable risk context without leaving the page.',
  },
  {
    icon: Lock,
    title: 'Privacy-first research',
    desc: 'Inspect public wallets without connecting your own assets or exposing credentials.',
  },
  {
    icon: Globe,
    title: 'Broader market context',
    desc: 'Pair wallet signals with live market data to understand momentum and sentiment.',
  },
];

const STATS = [
  { value: '12K+', label: 'Wallet lookups prepared', detail: 'Address and transaction hash support across major chains.' },
  { value: '4', label: 'Networks ready', detail: 'Ethereum, Bitcoin, Polygon, and BNB investigation flows.' },
  { value: '24/7', label: 'Monitoring mindset', detail: 'Designed for continuous review, watchlists, and rapid follow-up.' },
];

const WORKFLOW = [
  {
    step: '01',
    title: 'Search',
    desc: 'Paste an address or transaction hash and choose the network you want to inspect.',
  },
  {
    step: '02',
    title: 'Review',
    desc: 'See balances, recent transfers, flagged activity, and quick status indicators in one view.',
  },
  {
    step: '03',
    title: 'Decide',
    desc: 'Compare on-chain behavior with live market movement before escalating an investigation.',
  },
];

const Home = () => {
  const tickerRef = useRef(null);

  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return undefined;

    let pos = 0;
    const speed = 0.5;
    let animationFrameId = 0;

    const step = () => {
      pos -= speed;
      if (Math.abs(pos) >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.style.transform = `translateX(${pos}px)`;
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="home-container">
      <div className="home-orb home-orb-one" />
      <div className="home-orb home-orb-two" />

      <div className="ticker-bar">
        <div className="ticker-bar-inner">
          <div className="ticker-track" ref={tickerRef}>
            {[...TICKERS, ...TICKERS].map((ticker, index) => (
              <span key={`${ticker.symbol}-${index}`} className="ticker-item">
                <span className="ticker-symbol">{ticker.symbol}</span>
                <span className="ticker-price">{ticker.price}</span>
                <span className={`ticker-change ${ticker.up ? 'up' : 'down'}`}>{ticker.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="home-main">
        <section className="hero-shell">
          <div className="hero-copy">
            <span className="hero-kicker">
              <Radar size={15} />
              On-chain intelligence workspace
            </span>
            <h1 className="hero-title">See wallet behavior before it becomes risk.</h1>
            <p className="hero-subtitle">
              Track public addresses, investigate suspicious flows, and compare wallet behavior with live
              market movement from a single, cleaner workspace.
            </p>

            <div className="cta-buttons">
              <Link to="/balance" className="cta-button primary">
                Start investigating <ArrowRight className="button-icon" />
              </Link>
              <Link to="/analytics" className="cta-button secondary">
                Explore analytics
              </Link>
            </div>

            <div className="hero-highlights">
              <div className="hero-highlight-card">
                <span className="hero-highlight-label">Live checks</span>
                <strong>Balance + risk scan</strong>
              </div>
              <div className="hero-highlight-card">
                <span className="hero-highlight-label">Watch targets</span>
                <strong>Mixer patterns and high-frequency transfers</strong>
              </div>
              <div className="hero-highlight-card">
                <span className="hero-highlight-label">Best for</span>
                <strong>Investigations, monitoring, and reporting</strong>
              </div>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-header">
              <span>Live wallet briefing</span>
              <span className="hero-panel-chip">AI heuristics</span>
            </div>

            <div className="hero-score-card">
              <div>
                <span className="hero-score-label">Risk score</span>
                <strong className="hero-score-value">85 / 100</strong>
              </div>
              <span className="hero-score-badge danger">High risk</span>
            </div>

            <div className="hero-feed">
              <div className="hero-feed-row">
                <span className="hero-feed-title">Known entity overlap</span>
                <span className="hero-feed-status alert">Flagged</span>
              </div>
              <div className="hero-feed-row">
                <span className="hero-feed-title">Rapid-fire transactions</span>
                <span className="hero-feed-status warn">Review</span>
              </div>
              <div className="hero-feed-row">
                <span className="hero-feed-title">Cross-check market volatility</span>
                <span className="hero-feed-status ok">Live</span>
              </div>
            </div>

            <pre className="hero-terminal">{`> analyzing wallet 0x910c...59d
  [FLAG] known mixer overlap
  [FLAG] repeated denomination pattern
  [LIVE] 24h market context synced

  next action: inspect destination cluster`}</pre>
          </div>
        </section>

        <section className="quick-actions">
          {QUICK_ACTIONS.map(({ icon: Icon, title, description, link, label }) => (
            <Link key={title} to={link} className="quick-action-card">
              <div className="quick-action-icon">
                <Icon size={20} />
              </div>
              <div className="quick-action-copy">
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
              <span className="quick-action-link">
                {label}
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </section>
      </main>

      <section id="stats" className="stats-section">
        {STATS.map((stat) => (
          <article key={stat.label} className="stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
            <p className="stat-detail">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="workflow-section">
        <div className="section-heading">
          <span className="section-kicker">Workflow</span>
          <h2 className="section-title">A smoother path from lookup to decision</h2>
          <p className="section-subtitle">
            Designed to help you move quickly through search, review, and next-step action.
          </p>
        </div>

        <div className="workflow-grid">
          {WORKFLOW.map((item) => (
            <article key={item.step} className="workflow-card">
              <span className="workflow-step">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="section-heading">
          <span className="section-kicker">Capabilities</span>
          <h2 className="section-title">Everything you need to inspect the chain with confidence</h2>
          <p className="section-subtitle">
            The product now feels more like a focused intelligence console and less like a collection of tools.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="feature-card">
              <div className="feature-icon-wrap">
                <Icon size={22} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div className="cta-banner-copy">
          <span className="section-kicker">Ready to investigate</span>
          <h2>Open the dashboard and start tracing flows in seconds.</h2>
          <p>Move straight into wallet search or switch to analytics for live market context.</p>
        </div>
        <div className="cta-banner-actions">
          <Link to="/balance" className="cta-button primary">
            Open dashboard <ArrowRight className="button-icon" />
          </Link>
          <Link to="/analytics" className="cta-button secondary">
            View analytics
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-logo">
          <Wallet size={18} />
          <span>CryptoChain</span>
        </div>
        <p className="footer-copy">CryptoChain helps teams inspect wallet behavior without adding friction.</p>
        <div className="footer-links">
          <Link to="/balance">Dashboard</Link>
          <Link to="/analytics">Analytics</Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
