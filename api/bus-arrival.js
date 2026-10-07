/**
 * LTA DataMall v3 BusArrival Proxy Endpoint
 * 
 * Target: https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival
 * Query Parameters:
 *   - BusStopCode (string, required): e.g. 04121, 08031
 *   - ServiceNo (string, optional): e.g. 7, 65, 190
 * Headers:
 *   - AccountKey: Processed from process.env.LTA_ACCOUNT_KEY
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
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, AccountKey'
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

  const accountKey = process.env.LTA_ACCOUNT_KEY || process.env.VITE_LTA_ACCOUNT_KEY || '';

  // If LTA_ACCOUNT_KEY is configured, proxy request directly to LTA DataMall v3
  if (accountKey && accountKey.trim().length > 0) {
    try {
      const url = new URL('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival');
      url.searchParams.set('BusStopCode', String(busStopCode));
      if (serviceNo) {
        url.searchParams.set('ServiceNo', String(serviceNo));
      }

      const ltaResponse = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          AccountKey: accountKey.trim(),
          accept: 'application/json'
        }
      });

      if (!ltaResponse.ok) {
        const errorText = await ltaResponse.text();
        console.warn(`LTA DataMall API responded with status ${ltaResponse.status}:`, errorText);
        
        // Return structured error but with fallback payload
        res.status(ltaResponse.status).json({
          source: 'lta_datamall_error',
          status: ltaResponse.status,
          message: `LTA DataMall responded with ${ltaResponse.statusText}`,
          BusStopCode: busStopCode,
          fallback: generateFallbackArrivals(busStopCode, serviceNo)
        });
        return;
      }

      const data = await ltaResponse.json();

      // Return real LTA DataMall v3 data
      res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=20');
      res.status(200).json({
        source: 'lta_datamall_v3_live',
        retrievedAt: new Date().toISOString(),
        BusStopCode: data.BusStopCode || busStopCode,
        Services: data.Services || []
      });
      return;
    } catch (err) {
      console.error('Failed to contact LTA DataMall API:', err);
      res.status(502).json({
        source: 'lta_gateway_error',
        message: 'Could not connect to datamall2.mytransport.sg',
        error: err instanceof Error ? err.message : String(err),
        BusStopCode: busStopCode,
        Services: generateFallbackArrivals(busStopCode, serviceNo).Services
      });
      return;
    }
  }

  // Fallback when LTA_ACCOUNT_KEY is not yet set in environment variables
  const fallbackData = generateFallbackArrivals(busStopCode, serviceNo);
  res.setHeader('X-SGNextBus-Notice', 'Awaiting LTA_ACCOUNT_KEY in environment variables');
  res.status(200).json({
    source: 'simulated_lta_v3_fallback',
    message: 'LTA_ACCOUNT_KEY not detected. Set LTA_ACCOUNT_KEY in Vercel environment variables to enable live DataMall feed.',
    isLive: false,
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
    '04121': [
      { service: '7', op: 'SBST', dest: '84009', m1: 4, m2: 12, m3: 20, load: ['SEA', 'SEA', 'SDA'], types: ['DD', 'DD', 'SD'] },
      { service: '14', op: 'SBST', dest: '84009', m1: 1, m2: 8, m3: 18, load: ['SDA', 'SEA', 'SEA'], types: ['DD', 'SD', 'DD'] },
      { service: '16', op: 'SBST', dest: '84009', m1: 9, m2: 19, m3: null, load: ['SEA', 'SEA', 'SEA'], types: ['SD', 'SD', 'SD'] },
      { service: '36', op: 'GAS', dest: '95009', m1: 6, m2: 15, m3: 27, load: ['SEA', 'SDA', 'SEA'], types: ['SD', 'SD', 'SD'] },
    ]
  };

  const defaultList = sampleFleets[stopCode] || sampleFleets['08031'];
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
