import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const createDomain = (data) => axios.post(`${API_BASE}/domains`, data);
export const fetchAccounts = () => axios.get(`${API_BASE}/accounts`); // لاحقًا هنحتاجه لو أضفنا واجهة الحسابات
export const createAccount = (data) => axios.post(`${API_BASE}/accounts`, data);

export const fetchDomains = () => axios.get(`${API_BASE}/domains`);
export const createSubdomain = (domainId, data) =>
  axios.post(`${API_BASE}/domains/${domainId}/subdomain`, data);
