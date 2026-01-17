const Domain = require('../models/domainModel');
const Account = require('../models/accountModel');
const { getZoneId } = require('../services/cloudflareService');
const axios = require('axios');
const getZoneIdByDomain = require('../utlits/getZoneIdByDomain')

// POST /api/domains
const createDomain = async (req, res) => {
  const { domainName, customerName, notes, accountId } = req.body;
  const domain = await Domain.create({ domainName, customerName, notes, account: accountId });
  res.status(201).json(domain);
};

// GET /api/domains
const getAllDomains = async (req, res) => {
  const domains = await Domain.find().populate('account');
  res.json(domains);
};

// POST /api/domains/:id/subdomain
// const createSubdomainForDomain = async (req, res) => {
//   const { subdomain, ip } = req.body;
//   const domain = await Domain.findById(req.params.id).populate('account');

//   const zoneId = await getZoneId(domain.domainName, domain.account.apiToken);
//   const fullSubdomain = `${subdomain}.${domain.domainName}`;

//   const result = await createSubdomain(domain.account.apiToken, zoneId, fullSubdomain, ip);
//   res.json(result);
// };


const getDomainsFromCloudflare = async (req, res) => {
    try {
      const { accountId } = req.params;
      const account = await Account.findById(accountId);
      console.log(accountId);
      
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
  
      const response = await axios.get('https://api.cloudflare.com/client/v4/zones', {
        headers: {
          Authorization: `Bearer ${account.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
  

      
      const domains = response.data.result.map(zone => ({
        id: zone.id,
        name: zone.name,
        status: zone.status,
        created_on: zone.created_on,
        plan : zone.plan.name,
        subscription_created: zone.subscriptionCreated
      }));
  
      res.json(domains);
    } catch (error) {
      console.error('Error fetching domains:', error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to fetch domains from Cloudflare' });
    }
  };


  
  const createSubdomain = async (req, res) => {
    const { id } = req.params; // zoneId
    const { subdomain, accountId, ipAddress, domain } = req.body;
  
    try {
        console.log(accountId);
        
      const account = await Account.findById(accountId);
      if (!account) return res.status(404).json({ message: 'Account not found' });
  
      const fullDomain = `${subdomain}.${domain}`;
  
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${id}/dns_records`,
        {
          type: 'A',
          name: fullDomain,
          content: ipAddress, // استخدم الـ IP اللي دخلته
          ttl: 3600,
          proxied: true,
        },
        {
          headers: {
            Authorization: `Bearer ${account.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      res.json(response.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ message: 'Failed to create subdomain' });
    }
  };


  const getsubdomians = async (req, res) => {
    const { domainName,accountId  } = req.params;
    const account = await Account.findById(accountId);
    // console.log(account.apiToken);
    // console.log(domainName);
    
    
    try {
      const zoneId = await getZoneIdByDomain(domainName, account.apiToken); // You fetch Zone ID from domain
      console.log(zoneId);
     
      const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        headers: {
          Authorization: `Bearer ${account.apiToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Filter only subdomains (e.g., A, CNAME records where name ≠ domainName)
      const subdomains = response.data.result.filter(record => record.name !== domainName);
  
      res.json(subdomains);
    } catch (err) {
      console.error('Error fetching DNS records:', err.response?.data || err.message);
      res.status(500).json({ message: 'Failed to fetch DNS records' });
    }
  };

  
const deleteRecord = async (req, res) => {
    const { domainName, recordId,accountId } = req.params;
    const account = await Account.findById(accountId);

    try {
      const zoneId = await getZoneIdByDomain(domainName,account.apiToken);
  
      const deleteResponse = await axios.delete(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
        {
          headers: {
            Authorization: `Bearer ${account.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!deleteResponse.data.success) {
        return res.status(400).json({ message: 'Failed to delete record from Cloudflare' });
      }
  
      res.status(200).json({ message: 'Record deleted successfully from Cloudflare' });
    } catch (err) {
      console.error('Error deleting record from Cloudflare:', err.message);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  };

 const editRecord = async (req, res) => {
  const { domainName, recordId, accountId } = req.params;
  const { content, proxied } = req.body;

  try {
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // 1️⃣ Zone ID
    const zoneId = await getZoneIdByDomain(domainName, account.apiToken);

    // 2️⃣ Get current record (مهم حتى لو A)
    const recordRes = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      {
        headers: {
          Authorization: `Bearer ${account.apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const record = recordRes.data.result;

    // 3️⃣ تأكيد إنه A (اختياري)
    if (record.type !== 'A') {
      return res.status(400).json({
        message: 'Only A records are supported'
      });
    }

    // 4️⃣ Payload كامل
    const payload = {
      type: 'A',
      name: record.name,
      ttl: record.ttl,
      content: content,
      proxied: proxied
    };

    // 5️⃣ Update
    const updateResponse = await axios.put(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${account.apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!updateResponse.data.success) {
      return res.status(400).json({
        message: 'Failed to update DNS record',
        errors: updateResponse.data.errors
      });
    }

    res.status(200).json(updateResponse.data.result);

  } catch (err) {
    console.error('Cloudflare update error:', err.response?.data || err.message);
    res.status(500).json({
      message: err.response?.data?.errors?.[0]?.message || err.message
    });
  }
};
const searchDnsAcrossAccounts = async (req, res) => {
  const { ip } = req.query;

  if (!ip) {
    return res.status(400).json({ message: 'IP is required' });
  }

  try {
    const accounts = await Account.find(); // فيها الـ apiToken
    const results = [];

    for (const account of accounts) {
      const headers = {
        Authorization: `Bearer ${account.apiToken}`,
        'Content-Type': 'application/json'
      };

      // 1️⃣ Get zones for this account
      const zonesRes = await axios.get(
        'https://api.cloudflare.com/client/v4/zones',
        { headers }
      );

      const zones = zonesRes.data.result;

      // 2️⃣ Loop zones
      for (const zone of zones) {
        const recordsRes = await axios.get(
          `https://api.cloudflare.com/client/v4/zones/${zone.id}/dns_records?type=A&per_page=100`,
          { headers }
        );

        const records = recordsRes.data.result;

        for (const record of records) {
          if (record.content === ip) {
            results.push({
              accountId: account._id,
              accountName: account.name,
              zoneId: zone.id,
              domain: zone.name,
              recordId: record.id,
              recordName: record.name,
              ip: record.content,
              proxied: record.proxied
            });
          }
        }
      }
    }

    res.json(results);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: 'Search failed' });
  }
};

module.exports = { createDomain, getAllDomains , getDomainsFromCloudflare,createSubdomain,getsubdomians,deleteRecord ,editRecord,searchDnsAcrossAccounts};
 