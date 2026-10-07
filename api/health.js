/**
 * Health check endpoint for SGNextBus API
 * Used to monitor if the API routes and environment are operational.
 * Compatible with Vercel Serverless Functions and Express.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const accountKey = process.env.LTA_ACCOUNT_KEY || process.env.VITE_LTA_ACCOUNT_KEY || '';
  const hasLtaKey = Boolean(accountKey && accountKey.trim().length > 0);

  const payload = {
    status: 'ok',
    service: 'SGNextBus API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime ? Math.round(process.uptime()) : null,
    ltaDataMall: {
      accountKeyConfigured: hasLtaKey,
      keyMasked: hasLtaKey ? `${accountKey.slice(0, 4)}...${accountKey.slice(-4)}` : null,
      apiEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival',
      status: hasLtaKey ? 'READY_LIVE_SYNC' : 'AWAITING_LTA_ACCOUNT_KEY'
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

  res.status(200).json(payload);
}
