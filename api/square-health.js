// api/square-health.js
// Safe Square connection test for Vercel serverless functions.
// Uses SQUARE_ACCESS_TOKEN only on the server. Never exposes the token.

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const env = String(process.env.SQUARE_ENVIRONMENT || 'production').toLowerCase();
  const applicationId = process.env.SQUARE_APPLICATION_ID || '';
  const locationId = process.env.SQUARE_LOCATION_ID || '';
  const accessToken = process.env.SQUARE_ACCESS_TOKEN || '';

  const missing = [];
  if (!applicationId) missing.push('SQUARE_APPLICATION_ID');
  if (!locationId) missing.push('SQUARE_LOCATION_ID');
  if (!accessToken) missing.push('SQUARE_ACCESS_TOKEN');

  if (missing.length) {
    return res.status(500).json({
      ok: false,
      error: 'Missing Vercel environment variable(s).',
      missing
    });
  }

  const baseUrl = env === 'sandbox'
    ? 'https://connect.squareupsandbox.com'
    : 'https://connect.squareup.com';

  try {
    const squareRes = await fetch(`${baseUrl}/v2/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2026-01-22',
        'Content-Type': 'application/json'
      }
    });

    const bodyText = await squareRes.text();
    let body;
    try { body = JSON.parse(bodyText); } catch { body = { raw: bodyText }; }

    if (!squareRes.ok) {
      return res.status(502).json({
        ok: false,
        error: 'Square API request failed.',
        squareStatus: squareRes.status,
        squareResponse: body
      });
    }

    const locations = Array.isArray(body.locations)
      ? body.locations.map(loc => ({
          id: loc.id,
          name: loc.name || '',
          businessName: loc.business_name || '',
          status: loc.status || '',
          type: loc.type || '',
          currency: loc.currency || '',
          country: loc.country || '',
          mcc: loc.merchant_category_code || ''
        }))
      : [];

    return res.status(200).json({
      ok: true,
      environment: env,
      applicationId,
      expectedLocationId: locationId,
      locationFound: locations.some(loc => loc.id === locationId),
      locationCount: locations.length,
      locations
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: 'Server error while checking Square connection.',
      message: err && err.message ? err.message : String(err)
    });
  }
};
