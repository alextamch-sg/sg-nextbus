/**
 * Health check endpoint for SGNextBus API
 * Used to monitor if the API routes and environment are operational.
 * Compatible with Vercel Serverless Functions and Express.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey, accountkey, x-lta-account-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const headerKey =
    req.headers['accountkey'] ||
    req.headers['account-key'] ||
    req.headers['x-lta-account-key'] ||
    '';
  const queryKey = req.query?.AccountKey || req.query?.accountKey || '';
  const envKey = process.env.LTA_ACCOUNT_KEY || process.env.VITE_LTA_ACCOUNT_KEY || '';

  const accountKey = (headerKey || queryKey || envKey || '').toString().trim();
  const hasLtaKey = accountKey.length > 0;

  let liveVerification = null;
  if (hasLtaKey) {
    try {
      const testRes = await fetch(
        'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=08031&ServiceNo=65',
        {
          method: 'GET',
          headers: {
            AccountKey: accountKey,
            accept: 'application/json'
          }
        }
      );
      liveVerification = {
        httpStatus: testRes.status,
        authorized: testRes.ok,
        statusText: testRes.statusText
      };
    } catch (e) {
      liveVerification = {
        httpStatus: 0,
        authorized: false,
        error: e instanceof Error ? e.message : String(e)
      };
    }
  }

  const payload = {
    status: 'ok',
    service: 'SGNextBus API',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime ? Math.round(process.uptime()) : null,
    ltaDataMall: {
      accountKeyConfigured: hasLtaKey,
      keyMasked: hasLtaKey ? `${accountKey.slice(0, 4)}...${accountKey.slice(-4)}` : null,
      apiEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
      status: hasLtaKey
        ? liveVerification?.authorized
          ? 'VERIFIED_ACTIVE'
          : `KEY_REJECTED_${liveVerification?.httpStatus || 'ERROR'}`
        : 'AWAITING_LTA_ACCOUNT_KEY',
      liveVerification
    },
    endpoints: [
      {
        path: '/api/health',
        method: 'GET',
        description: 'Health and diagnostics endpoint'
      },
      {
        path: '/api/bus-arrival',
        method: 'GET',
        description: 'LTA BusArrival v3 live telemetry proxy',
        parameters: {
          BusStopCode: 'string (required, e.g. 04121, 08031)',
          ServiceNo: 'string (optional, e.g. 7, 65, 190)'
        },
        example: '/api/bus-arrival?BusStopCode=04121&ServiceNo=7'
      }
    ]
  };

  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json(payload);
}
