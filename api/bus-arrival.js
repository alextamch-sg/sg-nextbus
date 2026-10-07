/**
 * LTA DataMall v3 BusArrival Proxy Endpoint
 * 
 * Target: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival
 * Query Parameters:
 *   - BusStopCode (string, required): e.g. 04121, 08031
 *   - ServiceNo (string, optional): e.g. 7, 65, 190
 *   - AccountKey (string, optional): LTA DataMall API Key
 * Headers:
 *   - AccountKey / X-LTA-Account-Key: LTA DataMall API Key
 * 
 * Works as a Vercel Serverless Function and Express route handler.
 */

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey, accountkey, x-lta-account-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Extract query parameters (supporting case variations)
  const query = req.query || {};
  const busStopCode = query.BusStopCode || query.busStopCode || query.bus_stop_code || '08031';
  const serviceNo = query.ServiceNo || query.serviceNo || query.service_no || null;

  if (!busStopCode) {
    res.status(400).json({
      error: 'Missing required parameter: BusStopCode',
      example: '/api/bus-arrival?BusStopCode=04121'
    });
    return;
  }

  // Check headers, query params, and environment variables
  const headerKey =
    req.headers['accountkey'] ||
    req.headers['account-key'] ||
    req.headers['x-lta-account-key'] ||
    '';

  const queryKey = query.AccountKey || query.accountKey || '';
  const envKey = process.env.LTA_ACCOUNT_KEY || process.env.VITE_LTA_ACCOUNT_KEY || '';

  const accountKey = (headerKey || queryKey || envKey || '').toString().trim();

  // If LTA_ACCOUNT_KEY is configured, proxy request directly to LTA DataMall v3
  if (accountKey.length > 0) {
    try {
      const url = new URL('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival');
      url.searchParams.set('BusStopCode', String(busStopCode).trim());
      if (serviceNo) {
        url.searchParams.set('ServiceNo', String(serviceNo).trim());
      }

      const ltaResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          AccountKey: accountKey,
          accept: 'application/json'
        }
      });

      if (!ltaResponse.ok) {
        const errorText = await ltaResponse.text();
        console.warn(`LTA DataMall API responded with status ${ltaResponse.status}:`, errorText);

        const isAuthError = ltaResponse.status === 401 || ltaResponse.status === 403;
        
        // Return 200 with structured notice and fallback so client doesn't break
        res.status(200).json({
          source: isAuthError ? 'lta_datamall_auth_error' : 'lta_datamall_api_error',
          isLive: false,
          ltaHttpStatus: ltaResponse.status,
          message: isAuthError
            ? `LTA DataMall rejected the AccountKey (HTTP ${ltaResponse.status}). Please check that your LTA_ACCOUNT_KEY is active.`
            : `LTA DataMall error (HTTP ${ltaResponse.status}): ${errorText.slice(0, 200)}`,
          retrievedAt: new Date().toISOString(),
          BusStopCode: busStopCode,
          Services: generateFallbackArrivals(busStopCode, serviceNo).Services
        });
        return;
      }

      const data = await ltaResponse.json();

      // Return real LTA DataMall v3 data
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.status(200).json({
        source: 'lta_datamall_v3_live',
        isLive: true,
        accountKeyDetected: true,
        retrievedAt: new Date().toISOString(),
        BusStopCode: data.BusStopCode || busStopCode,
        Services: data.Services || []
      });
      return;
    } catch (err) {
      console.error('Failed to contact LTA DataMall API:', err);
      res.status(200).json({
        source: 'lta_gateway_error',
        isLive: false,
        message: 'Could not connect to datamall2.mytransport.sg: ' + (err instanceof Error ? err.message : String(err)),
        retrievedAt: new Date().toISOString(),
        BusStopCode: busStopCode,
        Services: generateFallbackArrivals(busStopCode, serviceNo).Services
      });
      return;
    }
  }

  // Fallback when LTA_ACCOUNT_KEY is not set
  const fallbackData = generateFallbackArrivals(busStopCode, serviceNo);
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    source: 'simulated_lta_v3_fallback',
    isLive: false,
    message: 'LTA_ACCOUNT_KEY not detected. Add your LTA_ACCOUNT_KEY in settings or environment variables for live real-time sync.',
    retrievedAt: new Date().toISOString(),
    BusStopCode: fallbackData.BusStopCode,
    Services: fallbackData.Services
  });
}

/**
 * Generate LTA DataMall v3 schema-compliant mock arrivals for stops
 */
function generateFallbackArrivals(stopCode, serviceNo) {
  const now = Date.now();

  const sampleFleets = {
    '08031': [
      { service: '65', op: 'SBST', dest: '14009', m1: 0, m2: 7, m3: 19, load: ['SEA', 'SDA', 'LSD'], types: ['DD', 'SD', 'DD'] },
      { service: '190', op: 'SMRT', dest: '10049', m1: 3, m2: 11, m3: 22, load: ['SDA', 'LSD', 'SEA'], types: ['DD', 'DD', 'DD'] },
      { service: '147', op: 'SBST', dest: '17009', m1: 5, m2: 14, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'DD', 'SD'] },
      { service: '857', op: 'TTS', dest: '02089', m1: 2, m2: 12, m3: 26, load: ['SDA', 'SEA', 'SEA'], types: ['DD', 'SD', 'DD'] },
      { service: '106', op: 'TTS', dest: '03239', m1: 8, m2: 21, m3: null, load: ['SEA', 'SDA', 'SEA'], types: ['DD', 'SD', 'DD'] },
    ],
    '08041': [
      { service: '7', op: 'SBST', dest: '84009', m1: 4, m2: 12, m3: 20, load: ['SEA', 'SEA', 'SDA'], types: ['DD', 'DD', 'SD'] },
      { service: '14', op: 'SBST', dest: '84009', m1: 0, m2: 8, m3: 18, load: ['SDA', 'SEA', 'SEA'], types: ['DD', 'SD', 'DD'] },
      { service: '36', op: 'GAS', dest: '95009', m1: 9, m2: 18, m3: 28, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '16', op: 'SBST', dest: '84009', m1: 12, m2: 24, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '77', op: 'TTS', dest: '02089', m1: 6, m2: 17, m3: 29, load: ['SDA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '174', op: 'SBST', dest: '14009', m1: 15, m2: 28, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['DD', 'DD', 'DD'] },
    ],
    '08019': [
      { service: '124', op: 'SBST', dest: '03239', m1: 2, m2: 14, m3: 25, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '167', op: 'TTS', dest: '03391', m1: 8, m2: 19, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['DD', 'DD', 'DD'] },
      { service: '174e', op: 'SBST', dest: '14009', m1: 17, m2: 32, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['DD', 'DD', 'DD'] },
      { service: '190', op: 'SMRT', dest: '10049', m1: 4, m2: 13, m3: 24, load: ['SDA', 'SEA', 'SEA'], types: ['DD', 'DD', 'DD'] },
    ],
    '04121': [
      { service: '7', op: 'SBST', dest: '84009', m1: 4, m2: 12, m3: 20, load: ['SEA', 'SEA', 'SDA'], types: ['DD', 'DD', 'SD'] },
      { service: '14', op: 'SBST', dest: '84009', m1: 1, m2: 8, m3: 18, load: ['SDA', 'SEA', 'SEA'], types: ['DD', 'SD', 'DD'] },
      { service: '16', op: 'SBST', dest: '84009', m1: 9, m2: 19, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '36', op: 'GAS', dest: '95009', m1: 6, m2: 15, m3: 27, load: ['SEA', 'SDA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '111', op: 'SBST', dest: '03239', m1: 7, m2: 16, m3: 30, load: ['SEA', 'SDA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '124', op: 'SBST', dest: '03239', m1: 5, m2: 15, m3: 28, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '174', op: 'SBST', dest: '14009', m1: 8, m2: 21, m3: null, load: ['SEA', 'SDA', 'SEA'], types: ['DD', 'DD', 'DD'] },
    ]
  };

  const defaultList = sampleFleets[stopCode] || [
    { service: '65', op: 'SBST', dest: '14009', m1: 1, m2: 9, m3: 21, load: ['SEA', 'SDA', 'SEA'], types: ['DD', 'SD', 'DD'] },
    { service: '190', op: 'SMRT', dest: '10049', m1: 4, m2: 12, m3: 23, load: ['SDA', 'LSD', 'SEA'], types: ['DD', 'DD', 'DD'] },
    { service: '147', op: 'SBST', dest: '17009', m1: 6, m2: 15, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'DD', 'SD'] },
  ];

  const filtered = serviceNo
    ? defaultList.filter(s => s.service.toLowerCase() === String(serviceNo).toLowerCase())
    : defaultList;

  const services = filtered.map(item => ({
    ServiceNo: item.service,
    Operator: item.op,
    NextBus: {
      OriginCode: '16009',
      DestinationCode: item.dest,
      EstimatedArrival: new Date(now + item.m1 * 60000).toISOString(),
      Latitude: '1.2995',
      Longitude: '103.8458',
      VisitNumber: '1',
      Load: item.load[0],
      Feature: 'WAB',
      Type: item.types[0]
    },
    NextBus2: item.m2 !== null ? {
      OriginCode: '16009',
      DestinationCode: item.dest,
      EstimatedArrival: new Date(now + item.m2 * 60000).toISOString(),
      Latitude: '1.2980',
      Longitude: '103.8430',
      VisitNumber: '1',
      Load: item.load[1],
      Feature: 'WAB',
      Type: item.types[1]
    } : {},
    NextBus3: item.m3 !== null ? {
      OriginCode: '16009',
      DestinationCode: item.dest,
      EstimatedArrival: new Date(now + item.m3 * 60000).toISOString(),
      Latitude: '1.2940',
      Longitude: '103.8390',
      VisitNumber: '1',
      Load: item.load[2],
      Feature: 'WAB',
      Type: item.types[2]
    } : {}
  }));

  return {
    BusStopCode: String(stopCode),
    Services: services
  };
}
