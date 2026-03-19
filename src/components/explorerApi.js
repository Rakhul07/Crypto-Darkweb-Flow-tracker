const DEFAULT_ETHERSCAN_API_KEY = 'FGFBRUK59JWY3HYVGIJ5VMHHMYBAHY6V6U';

const PLACEHOLDER_API_KEYS = new Set([
  '',
  'null',
  'undefined',
  'react_app_api_key',
  'your_api_key',
  'your_api_key_token',
  'your_etherscan_api_key',
  'yourapikeytoken',
]);

export const EXPLORER_API_URL = 'https://api.etherscan.io/v2/api';

export const NETWORK_LABELS = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  MATIC: 'Polygon',
  BNB: 'BNB Chain',
};

export const CHAIN_IDS = {
  ETH: 1,
  MATIC: 137,
  BNB: 56,
};

const normalizeCandidateKey = (value) => String(value || '').trim();

export const getExplorerApiKey = () => {
  const candidate = normalizeCandidateKey(process.env.REACT_APP_API_KEY);

  if (!candidate || PLACEHOLDER_API_KEYS.has(candidate.toLowerCase())) {
    return DEFAULT_ETHERSCAN_API_KEY;
  }

  return candidate;
};

export const usingFallbackExplorerApiKey = () =>
  getExplorerApiKey() === DEFAULT_ETHERSCAN_API_KEY;

export const buildExplorerParams = (network, params = {}) => ({
  chainid: CHAIN_IDS[network] || 1,
  ...params,
  apikey: getExplorerApiKey(),
});

export const buildExplorerUrl = (network, params = {}) =>
  `${EXPLORER_API_URL}?${new URLSearchParams(buildExplorerParams(network, params)).toString()}`;

const getExplorerPayload = (value) => {
  if (value && typeof value === 'object' && 'response' in value) {
    return value.response?.data || value.data || value;
  }

  return value;
};

const getRawExplorerMessage = (value, label = 'request') => {
  const payload = getExplorerPayload(value);

  if (typeof payload === 'string') {
    return payload.trim() || `Unexpected response while loading ${label}.`;
  }

  if (typeof payload?.result === 'string' && payload.result.trim()) {
    return payload.result.trim();
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message.trim();
  }

  return `Unexpected response while loading ${label}.`;
};

export const getExplorerErrorMessage = (value, network, label = 'request') => {
  const rawMessage = getRawExplorerMessage(value, label);
  const networkLabel = NETWORK_LABELS[network] || network || 'This network';

  if (/Invalid API Key/i.test(rawMessage)) {
    return usingFallbackExplorerApiKey()
      ? 'The explorer API key is invalid. Remove placeholder REACT_APP_API_KEY values or add a fresh Etherscan V2 key.'
      : 'The explorer API key is invalid. Update REACT_APP_API_KEY in GitHub Secrets or your local .env file.';
  }

  if (/Free API access is not supported for this chain/i.test(rawMessage)) {
    return `${networkLabel} lookups require a paid Etherscan API V2 plan in this static deployment. Ethereum and Polygon will still work with the bundled fallback key.`;
  }

  if (/Max rate limit reached/i.test(rawMessage)) {
    return 'The explorer rate limit was reached. Please wait a moment and try again.';
  }

  if (/Query Timeout|timeout/i.test(rawMessage)) {
    return 'The explorer request timed out. Please try again.';
  }

  return rawMessage;
};

export const getExplorerBalanceResult = (payload, network) => {
  const result = payload?.result;

  if (result !== null && result !== undefined && /^-?\d+$/.test(String(result))) {
    return result;
  }

  throw new Error(getExplorerErrorMessage(payload, network, 'balance'));
};

export const getExplorerArrayResult = (payload, network, label = 'transactions') => {
  if (Array.isArray(payload?.result)) {
    return payload.result;
  }

  const rawMessage = getRawExplorerMessage(payload, label);
  if (/No transactions found|No records found/i.test(rawMessage)) {
    return [];
  }

  throw new Error(getExplorerErrorMessage(payload, network, label));
};

export const getExplorerProxyResult = (payload, network, label, options = {}) => {
  const { allowNull = false } = options;

  if (payload?.result === null && allowNull) {
    return null;
  }

  if (payload?.result && typeof payload.result === 'object' && !Array.isArray(payload.result)) {
    return payload.result;
  }

  throw new Error(getExplorerErrorMessage(payload, network, label));
};
