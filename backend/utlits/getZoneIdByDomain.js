const axios = require('axios');

const getZoneIdByDomain = async (domainName, apiToken) => {
    try {
      const response = await axios.get('https://api.cloudflare.com/client/v4/zones', {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          name: domainName,
        },
      });
       console.log(response.data.result[0].id);
       
      console.log('Cloudflare Response:', response.data);
  
      if (response.data.result.length === 0) {
        throw new Error('Domain not found in Cloudflare');
      }
  
      return response.data.result[0].id;
    } catch (error) {
      console.error('Error fetching Zone ID:', error.response?.data || error.message);
      throw new Error('Failed to fetch Zone ID from Cloudflare');
    }
  };
  
  

module.exports = getZoneIdByDomain;
