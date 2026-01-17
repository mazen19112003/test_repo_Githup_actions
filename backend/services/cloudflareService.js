const axios = require('axios');

const getZoneId = async (domainName, apiToken) => {
  const response = await axios.get(
    `https://api.cloudflare.com/client/v4/zones?name=${domainName}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const zone = response.data.result[0];
  return zone.id;
};

const createSubdomain = async (apiToken, zoneId, subdomain, ip) => {
  const data = {
    type: 'A',
    name: subdomain,
    content: ip,
    ttl: 120,
    proxied: false
  };

  const response = await axios.post(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    data,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
};

module.exports = { getZoneId, createSubdomain };
