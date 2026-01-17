const Domain = require('../models/domainModel');
const Account = require('../models/accountModel');
const axios = require('axios');


const Add_account = async (req, res) => {
    try {
      const { name, apiToken, email,customerId } = req.body;
      const account = await Account.create({ name, apiToken, email ,customerId});
      res.status(201).json(account);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  const getAccounts = async (req, res) => {
    try {
      const accounts = await Account.find();
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  };

  const updateAccount = async (req, res) => {
    const { id } = req.params;
    const { name, email, note } = req.body;
  
    try {
      const account = await Account.findById(id);
      if (!account) return res.status(404).json({ message: 'Account not found' });
  
      account.name = name || account.name;
      account.email = email || account.email;
      account.note = note || account.note

      await account.save();
      res.json(account);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to update account' });
    }
  };

  const deleteAccount = async (req, res) => {
    const { id } = req.params;
  
    try {
      const account = await Account.findByIdAndDelete(id);
      if (!account) return res.status(404).json({ message: 'Account not found' });
      res.json({ message: 'Account deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to delete account' });
    }
  };

  const getcustomeraccount = async (req, res) => {
    const { customerId } = req.params;
    const accounts = await Account.find({ customerId });
    res.json(accounts);
  };

  const getaccount = async (req, res) => {
    try {
      const account = await Account.findById(req.params.id);
  
      if (!account) {
        return res.status(404).json({ message: 'Account not found' });
      }
  
      res.json(account); // بيرجع كل البيانات، منهم note
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  const getNameserversForDomain = async (req, res) => {
    const { accountId, domain } = req.params;
  
    try {
      // Find the Cloudflare account by accountId
      const account = await Account.findById(accountId);
  
      if (!account) {
        return res.status(404).json({ error: 'Cloudflare account not found' });
      }
  
      // Call Cloudflare API to get the zone info by domain
      const zoneResp = await axios.get(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
        headers: {
          'Authorization': `Bearer ${account.apiToken}`,  // Use token from account
          'Content-Type': 'application/json',
        }
      });
  
      const zone = zoneResp.data.result[0];
      if (!zone) {
        return res.status(404).json({ error: 'Domain not found in Cloudflare account' });
      }
  
      // Return the domain and its nameservers
      return res.json({
        domain: zone.name,
        nameServers: zone.name_servers
      });
  
    } catch (error) {
      console.error('Error fetching nameservers:', error.message);
      return res.status(500).json({ error: 'Failed to fetch nameservers' });
    }
  };
  module.exports = { Add_account, getAccounts, updateAccount, deleteAccount, getcustomeraccount,getaccount,getNameserversForDomain };
