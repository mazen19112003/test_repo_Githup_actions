import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, 
  FiArrowRight, 
  FiSearch, 
  FiPlus,
  FiRefreshCw,
  FiCalendar,
  FiCreditCard,
  FiMail,
  FiCloud,
  FiServer,
  FiShield,
  FiGlobe,
  FiBarChart2,
  FiSettings
} from 'react-icons/fi';
import 'bootstrap/dist/css/bootstrap.min.css';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();
  const [accountsCounts, setAccountsCounts] = useState({});
// Search by IP states
const [ipSearch, setIpSearch] = useState('');
const [ipResults, setIpResults] = useState([]);
const [ipLoading, setIpLoading] = useState(false);
const [ipError, setIpError] = useState('');


  // Modern cloudflare-inspired color theme
  const theme = {
    primary: 'primary',
    secondary: 'secondary',
    success: 'success',
    danger: 'danger',
    warning: 'warning',
    info: 'info',
    light: 'light',
    dark: 'dark',
    cloudflareOrange: 'warning', // Using warning as orange
    cloudflareBlue: 'info'      // Using info as blue
  };


  const token = localStorage.getItem('token')
  
  const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchAccountsCount = async () => {
      const counts = {};
      for (const customer of customers) {
        try {
          const res = await axiosInstance.get(`/accounts/by-customer/${customer._id}`);
          counts[customer._id] = res.data.length;
        } catch (error) {
          counts[customer._id] = 0;
        }
      }
      setAccountsCounts(counts);
    };
  
    if (customers.length > 0) {
      fetchAccountsCount();
    }
  }, [customers]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get('/customers/list');
        setCustomers(res.data);
        setFilteredCustomers(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load accounts. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    let results = customers;
    
    if (searchTerm) {
      results = results.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    
    if (activeFilter !== 'all') {
      results = results.filter(customer => 
        activeFilter === 'active' ? customer.status === 'active' : customer.status !== 'active'
      );
    }
    
    setFilteredCustomers(results);
  }, [searchTerm, customers, activeFilter]);

  const goToCustomerAccounts = (customerId) => {
    navigate(`/customers/${customerId}/accounts`);
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get('/customers/list');
      setCustomers(res.data);
      setFilteredCustomers(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to refresh data. Please try again.');
      setIsLoading(false);
    }
  };

  const getRandomVariant = (seed) => {
    const variants = [
      theme.cloudflareOrange,
      theme.cloudflareBlue,
      theme.success,
      theme.info,
      theme.secondary
    ];
    const index = (seed.charCodeAt(0) + seed.charCodeAt(seed.length - 1)) % variants.length;
    return variants[index];
  };


 const handleSearchByIp = async () => {
  if (!ipSearch) return;

  try {
    setIpLoading(true);
    setIpError('');
    setIpResults([]);

    const res = await axios.get(
      `${API_URL}/domains/search`,
      {
        params: { ip: ipSearch },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setIpResults(res.data);
  } catch (err) {
    setIpError(err.response?.data?.message || 'Search failed');
  } finally {
    setIpLoading(false);
  }
};


  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <div>
            {error}
            <button 
              onClick={refreshData}
              className="btn btn-link p-0 ms-2 text-danger fw-bold"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Modern Header */}
      <header className="bg-white shadow-sm py-3">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <FiCloud className="me-2 text-primary" size={28} />
            <h4 className="mb-0 fw-bold">CloudFlare Account Management</h4>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-sm btn-outline-secondary">
              <FiSettings size={16} />
            </button>
            <div className="avatar bg-primary bg-opacity-10 text-primary rounded-circle p-2">
              <FiUser size={18} />
            </div>
          </div>
        </div>
      </header>

      <div className="container py-4">
        {/* Dashboard Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h2 className="mb-1">Account Directory</h2>
            <p className="text-muted mb-0">Manage all your CloudFlare accounts in one place</p>
          </div>
          
          <div className="d-flex gap-2 w-100 w-md-auto">
            <button
              onClick={refreshData}
              className={`btn btn-${theme.cloudflareOrange} d-flex align-items-center gap-2`}
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>


{/* Search by IP */}
<div className="card border-0 shadow-sm mb-4">
  <div className="card-body p-3">
    <div className="input-group">
      <span className="input-group-text bg-white border-end-0">
        <FiSearch className="text-muted" />
      </span>

      <input
        type="text"
        className="form-control border-start-0"
        placeholder="Search DNS by IP (e.g. 204.12.0.53)"
        value={ipSearch}
        onChange={(e) => setIpSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearchByIp()}
      />

      <button
        className="btn btn-primary"
        onClick={handleSearchByIp}
        disabled={ipLoading}
      >
        {ipLoading ? 'Searching…' : 'Search'}
      </button>
    </div>

    {ipError && (
      <div className="text-danger mt-2">{ipError}</div>
    )}
  </div>
</div>
{/* IP Search Results */}
{ipResults.length > 0 && (
  <div className="card border-0 shadow-sm mb-4">
    <div className="card-body">
      <h6 className="mb-3">
        Results for IP: <strong>{ipSearch}</strong>
      </h6>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>Account</th>
              <th>Domain</th>
              <th>Record</th>
              <th>IP</th>
              <th>CDN</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {ipResults.map((r, i) => (
              <tr key={i}>
                <td>{r.accountName}</td>
                <td>{r.domain}</td>
                <td>{r.recordName}</td>
                <td>{r.ip}</td>
                <td>
                  {r.proxied ? (
                    <span className="badge bg-success">ON</span>
                  ) : (
                    <span className="badge bg-secondary">OFF</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      navigate(
                        `/account/${r.accountId}/${r.domain}/records/${r.recordId}`
                      )
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

        {/* Search Card */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <FiSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search accounts by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards - CloudFlare Style */}
        <div className="row g-4 mb-4">
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                    <FiCloud className="text-primary" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Total Customers</h6>
                    <h3 className="mb-0">{customers.length}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        
          
          <div className="col-sm-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                    <FiGlobe className="text-info" size={20} />
                  </div>
                  <div>
                    <h6 className="text-muted mb-1">Accounts</h6>
                    <h3 className="mb-0">
                      {customers.reduce((acc, c) => acc + (accountsCounts[c._id] || 0), 0)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
          

        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center py-5 my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="card border-0 shadow-sm text-center py-5 my-3">
            <div className="card-body">
              <FiCloud className="mx-auto text-muted mb-3" size={48} />
              <h3 className="card-title">
                {searchTerm ? 'No matching accounts found' : 'No accounts yet'}
              </h3>
              <p className="card-text text-muted mb-4">
                {searchTerm
                  ? 'Try adjusting your search to find what you\'re looking for.'
                  : 'Get started by adding your first account.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredCustomers.map((customer) => (
              <div key={customer._id} className="col">
                <div className="card border-0 shadow-sm h-100 hover-lift">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className={`avatar avatar-lg bg-${getRandomVariant(customer._id)}-subtle text-${getRandomVariant(customer._id)} rounded-circle me-3`}>
                        <span className="avatar-text">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="card-title mb-0">{customer.name}</h5>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <FiMail size={12} />
                          <span className="text-truncate">{customer.email || 'No email'}</span>
                        </small>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="d-flex align-items-center text-muted gap-1">
                          <FiServer size={14} />
                          Accounts:
                        </span>
                        <span className="fw-medium">{accountsCounts[customer._id] || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="d-flex align-items-center text-muted gap-1">
                          <FiCalendar size={14} />
                          Created:
                        </span>
                        <span className="fw-medium">{formatDate(customer.createdAt)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => goToCustomerAccounts(customer._id)}
                      className={`btn btn-${theme.cloudflareBlue} w-100 d-flex align-items-center justify-content-center gap-2`}
                    >
                      Manage Account
                      <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersList;