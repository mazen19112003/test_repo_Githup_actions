import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  Button,
  ListGroup,
  Spinner,
  Form,
  Row,
  Col,
  Badge,
  Modal,
  Accordion,
  InputGroup,
  FormControl,
  ProgressBar,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap';
import {
  FiGlobe,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiCopy,
  FiShield,
  FiZap,
  FiServer,
  FiLock,
  FiCloud,
  FiBarChart ,
} from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdDns } from 'react-icons/md'; // Material DNS icon
import { FaClock } from 'react-icons/fa';

const AccountDomainsPage = () => {
  const { accountId } = useParams();
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubdomainForms, setActiveSubdomainForms] = useState({});
  const [subdomainData, setSubdomainData] = useState({
    name: '',
    ipAddress: '',
    ttl: 300
  });
  const [subdomains, setSubdomains] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState(null);
  const [nameservers, setNameservers] = useState({});
  const [loadingNameservers, setLoadingNameservers] = useState({});
  const [showNsModal, setShowNsModal] = useState(false);
  const [modalNameservers, setModalNameservers] = useState([]);
  const [modalDomain, setModalDomain] = useState('');
  const [loadingNs, setLoadingNs] = useState(false);
  const [stats, setStats] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState('0');

  const token = localStorage.getItem('token');


  const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Cloudflare brand colors
  const cloudflareTheme = {
    primary: '#F38020', // Cloudflare orange
    secondary: '#2B7DE9', // Cloudflare blue
    dark: '#1E1E1E',
    light: '#F5F7FA'
  };

  const generateRandomSubdomain = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleShowNameservers = async (domainName) => {
    setLoadingNs(true);
    setModalDomain(domainName);
    setShowNsModal(true);
    try {
      const response = await axiosInstance.get(`/nameservers/${accountId}/${domainName}`);
      setModalNameservers(response.data.nameServers || []);
    } catch (error) {
      setModalNameservers([]);
      toast.error('Failed to fetch nameservers');
    }
    setLoadingNs(false);
  };

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/domains/cloudflare/${accountId}`);
      setDomains(response.data);
      
      // Fetch stats
      // const statsResponse = await axiosInstance.get(`/domains/cloudflare/${accountId}/stats`);
      // setStats(statsResponse.data);
      
      toast.success('Domains loaded successfully');
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchDomains();
  }, [accountId]);

  const toggleSubdomainForm = (domainId) => {
    setActiveSubdomainForms(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
    if (!activeSubdomainForms[domainId]) {
      setSubdomainData({
        name: generateRandomSubdomain(),
        ipAddress: '',
        ttl: 300
      });
    }
  };

  const handleSubdomainInputChange = (e) => {
    const { name, value } = e.target;
    setSubdomainData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubdomain = async (zoneId, domainName) => {
    try {
      const response = await axiosInstance.post(
        `/domains/${zoneId}/subdomain`,
        {
          subdomain: subdomainData.name,
          accountId,
          domain: domainName,
          ipAddress: subdomainData.ipAddress,
          ttl: subdomainData.ttl
        }
      );
  
      setSubdomains(prev => ({
        ...prev,
        [domainName]: [...(prev[domainName] || []), {
          name: subdomainData.name,
          fullName: `${subdomainData.name}.${domainName}`,
          ipAddress: subdomainData.ipAddress,
          createdAt: new Date().toISOString()
        }]
      }));
  
      toast.success(`Subdomain ${subdomainData.name}.${domainName} created successfully!`);
  
      setSubdomainData({
        name: generateRandomSubdomain(),
        ipAddress: '',
        ttl: 300
      });
      setActiveSubdomainForms(prev => ({ ...prev, [zoneId]: false }));
    } catch (error) {
      console.error('Error creating subdomain:', error);
      toast.error(error.response?.data?.message || 'Failed to create subdomain');
    }
  };

  const handleDeleteDomain = async () => {
    try {
      await axiosInstance.delete(`/domains/${domainToDelete.id}`);
      setDomains(domains.filter(d => d.id !== domainToDelete.id));
      toast.success(`Domain ${domainToDelete.name} deleted successfully!`);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast.error('Failed to delete domain. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info('Copied to clipboard!', {
      autoClose: 2000,
      hideProgressBar: true
    });
  };

    const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
  const getSecurityBadge = (status) => {
    switch(status) {
      case 'high':
        return <Badge bg="success" className="d-flex align-items-center"><FiShield className="me-1" /> Secure</Badge>;
      case 'medium':
        return <Badge bg="warning" className="d-flex align-items-center"><FiShield className="me-1" /> Medium</Badge>;
      case 'low':
        return <Badge bg="danger" className="d-flex align-items-center"><FiShield className="me-1" /> Vulnerable</Badge>;
      default:
        return <Badge bg="secondary" className="d-flex align-items-center"><FiShield className="me-1" /> Unknown</Badge>;
    }
  };

  
  return (
    <Container className="py-4" style={{ maxWidth: '1400px' }}>
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Header Section */}
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3" style={{ backgroundColor: `${cloudflareTheme.primary}20` }}>
              <FiGlobe size={28} style={{ color: cloudflareTheme.primary }} />
            </div>
            <div>
              <h2 className="mb-0" style={{ color: cloudflareTheme.dark }}>
                Cloudflare Domains
              </h2>
              <small className="text-muted">Account ID: {accountId}</small>
            </div>
          </div>
        </Col>
        <Col xs="auto">
          <Button 
            variant="primary" 
            onClick={fetchDomains} 
            disabled={loading}
            style={{ backgroundColor: cloudflareTheme.primary, borderColor: cloudflareTheme.primary }}
          >
            <FiRefreshCw className={`me-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </Col>
      </Row>

      {/* Stats Overview */}
      {stats && (
        <Row className="mb-4 g-4">
          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Total Domains</h6>
                    <h3 className="mb-0" style={{ color: cloudflareTheme.primary }}>{stats.totalDomains}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle" style={{ backgroundColor: `${cloudflareTheme.primary}10` }}>
                    <FiGlobe size={24} style={{ color: cloudflareTheme.primary }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Active Domains</h6>
                    <h3 className="mb-0" style={{ color: cloudflareTheme.secondary }}>{stats.activeDomains}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle" style={{ backgroundColor: `${cloudflareTheme.secondary}10` }}>
                    <FiZap size={24} style={{ color: cloudflareTheme.secondary }} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Subdomains</h6>
                    <h3 className="mb-0">{stats.totalSubdomains}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FiServer size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">Threats Blocked</h6>
                    <h3 className="mb-0">{stats.threatsBlocked}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                    <FiShield size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" style={{ color: cloudflareTheme.primary }} />
          <p className="mt-3">Loading domains...</p>
        </div>
      ) : domains.length === 0 ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="text-center py-5">
            <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
              <FiGlobe size={48} className="text-muted" />
            </div>
            <h4>No domains found in this account</h4>
            <p className="text-muted mb-4">
              Add domains to your Cloudflare account to manage them here
            </p>
            <Button 
              variant="primary"
              size="lg"
              style={{ backgroundColor: cloudflareTheme.primary, borderColor: cloudflareTheme.primary }}
            >
              <FiPlus className="me-2" />
              Add First Domain
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0" style={{ color: cloudflareTheme.dark }}>Your Domains</h5>
            <small className="text-muted">{domains.length} domains</small>
          </div>
          
          <Accordion activeKey={activeAccordion} onSelect={(key) => setActiveAccordion(key)}>
            {domains.map((domain, index) => (
              <Card key={domain.id} className="mb-3 shadow-sm border-0">
                <Accordion.Item eventKey={index.toString()}>
                  <Card.Header className="p-0 bg-white">
                    <Accordion.Header className="p-3">
                      <Row className="w-100 align-items-center">
                        <Col md={6}>
                          <div className="d-flex align-items-center">
                            <div 
                              className="p-2 rounded me-3"
                              style={{ 
                                backgroundColor: domain.status === 'active' 
                                  ? `${cloudflareTheme.primary}20` 
                                  : '#f8f9fa'
                              }}
                            >
                              <FiGlobe 
                                size={20} 
                                style={{ 
                                  color: domain.status === 'active' 
                                    ? cloudflareTheme.primary 
                                    : '#6c757d'
                                }} 
                              />
                            </div>
                            <div>
                              <h6 className="mb-0 d-flex align-items-center">
                                {domain.name}
                                {domain.status === 'active' && (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Domain is active and serving traffic</Tooltip>}
                                  >
                                    <span className="ms-2">
                                      <Badge pill bg="success">Active</Badge>
                                    </span>
                                  </OverlayTrigger>
                                )}
                              </h6>
<OverlayTrigger
  placement="top"
  overlay={<Tooltip>Click to copy</Tooltip>}
>
  <small
    className="text-muted d-flex align-items-center mt-1 cursor-pointer"
    style={{ cursor: 'pointer' }}
    onClick={() => {
      const dateToCopy = formatDateTime(domain.activated_on || domain.created_on);
      navigator.clipboard.writeText(dateToCopy);
      toast.success('Subscription date copied');
    }}
  >
    <FaClock size={14} className="me-1" />
    Subscription Date: {formatDateTime(domain.activated_on || domain.created_on)}
    <FiCopy className="ms-2" size={14} />
  </small>
</OverlayTrigger>

                            </div>
                          </div>
                        </Col>
                        <Col md={6} className="text-md-end mt-2 mt-md-0">
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="d-flex align-items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSubdomainForm(domain.id);
                              }}
                              style={{ borderColor: cloudflareTheme.primary, color: cloudflareTheme.primary }}
                            >
                              <FiPlus className="me-1" />
                              Subdomain
                            </Button>
                            
                            <Link
                              to={`/account/${accountId}/${domain.name}/subdomains`}
                              className="btn btn-outline-success btn-sm d-flex align-items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiBarChart  className="me-1" />
                              Analytics
                            </Link>
                            
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="d-flex align-items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowNameservers(domain.name);
                              }}
                            >
                              <MdDns className="me-1" />
                              NS
                            </Button>
                            
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              href={`https://dash.cloudflare.com/${accountId}/${domain.name}/dns`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="d-flex align-items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FiExternalLink className="me-1" />
                              Open
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </Accordion.Header>
                  </Card.Header>
                  <Accordion.Body>
                    <div className="mb-3">
                      <Row className="mb-4">
                        {/* <Col md={4}>
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">Security Status</h6>
                            {getSecurityBadge(domain.security_level)}
                          </div>
                        </Col> */}
                        
                        <Col md={4}>
  <div className="mb-3">
    <h6 className="text-muted mb-2">Plan</h6>
    <Badge style={{ backgroundColor: 'black', color: 'white' }} className="text-uppercase">
      {domain.plan || 'Free'}
    </Badge>
  </div>
</Col>

                        {/* <Col md={4}>
                          <div className="mb-3">
                            <h6 className="text-muted mb-2">SSL</h6>
                            <Badge bg={domain.ssl?.status === 'active' ? 'success' : 'warning'} className="d-flex align-items-center">
                              <FiLock className="me-1" size={12} />
                              {domain.ssl?.status || 'Inactive'}
                            </Badge>
                          </div>
                        </Col> */}
                      </Row>

                      {activeSubdomainForms[domain.id] && (
                        <Card className="mb-4 border-primary">
                          <Card.Body>
                            <h5 className="mb-3 d-flex align-items-center">
                              <FiPlus className="me-2" />
                              Create New Subdomain
                            </h5>
                            <Form>
                              <Row>
                                <Col md={4}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>Subdomain Name</Form.Label>
                                    <InputGroup>
                                      <FormControl
                                        type="text"
                                        name="name"
                                        value={subdomainData.name}
                                        onChange={handleSubdomainInputChange}
                                        placeholder="subdomain"
                                      />
                                      <InputGroup.Text>.{domain.name}</InputGroup.Text>
                                    </InputGroup>
                                  </Form.Group>
                                </Col>
                                <Col md={4}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>IP Address</Form.Label>
                                    <FormControl
                                      type="text"
                                      name="ipAddress"
                                      value={subdomainData.ipAddress}
                                      onChange={handleSubdomainInputChange}
                                      placeholder="192.168.1.1"
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md={4}>
                                  <Form.Group className="mb-3">
                                    <Form.Label>TTL (Seconds)</Form.Label>
                                    <FormControl
                                      type="number"
                                      name="ttl"
                                      value={subdomainData.ttl}
                                      onChange={handleSubdomainInputChange}
                                      placeholder="300"
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <div className="d-flex justify-content-end gap-2">
                                <Button
                                  variant="outline-secondary"
                                  onClick={() => toggleSubdomainForm(domain.id)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="primary"
                                  onClick={() => handleCreateSubdomain(domain.id, domain.name)}
                                  disabled={!subdomainData.name || !subdomainData.ipAddress}
                                  style={{ backgroundColor: cloudflareTheme.primary, borderColor: cloudflareTheme.primary }}
                                >
                                  Create Subdomain
                                </Button>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      )}

                      {(subdomains[domain.name]?.length > 0) && (
                        <div className="mt-4">
                          <h5 className="mb-3 d-flex align-items-center">
                            <FiServer className="me-2" />
                            Recent Subdomains
                          </h5>
                          <ListGroup variant="flush">
                            {subdomains[domain.name]?.map((subdomain, i) => (
                              <ListGroup.Item key={i} className="py-3">
                                <Row className="align-items-center">
                                  <Col md={5}>
                                    <div className="d-flex align-items-center">
                                      <div className="bg-light rounded-circle p-2 me-3">
                                        <FiServer size={16} />
                                      </div>
                                      <div>
                                        <strong>{subdomain.fullName}</strong>
                                        <div className="small text-muted">
                                          Created: {new Date(subdomain.createdAt).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </Col>
                                  <Col md={3}>
                                    <code>{subdomain.ipAddress}</code>
                                  </Col>
                                  <Col md={2}>
                                    <Badge bg="light" text="dark">
                                      TTL: {subdomain.ttl || 300}
                                    </Badge>
                                  </Col>
                                  <Col md={2} className="text-end">
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={<Tooltip>Copy to clipboard</Tooltip>}
                                    >
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() =>
  copyToClipboard(
    `cdn : ${subdomain.fullName}
ip : ${subdomain.ipAddress}`
  )
}

                                        className="me-2"
                                      >
                                        <FiCopy size={14} />
                                      </Button>
                                    </OverlayTrigger>
                                  </Col>
                                </Row>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <div className="mt-3 text-end">
                            <Link
                              to={`/account/${accountId}/${domain.name}/subdomains`}
                              className="btn btn-sm btn-outline-primary"
                            >
                              View All Subdomains
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Card>
            ))}
          </Accordion>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <FiTrash2 className="me-2" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the domain <strong>{domainToDelete?.name}</strong>?
          </p>
          <p className="text-danger">
            This will remove all DNS records and settings associated with this domain. This action cannot be undone.
          </p>
          <Form.Group className="mb-3">
            <Form.Label>Type the domain name to confirm:</Form.Label>
            <FormControl
              type="text"
              placeholder={`Enter ${domainToDelete?.name} to confirm`}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteDomain}
            style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
          >
            <FiTrash2 className="me-2" />
            Delete Permanently
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Nameservers Modal */}
      <Modal show={showNsModal} onHide={() => setShowNsModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>
            <MdDns className="me-2" />
            Nameservers for {modalDomain}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingNs ? (
            <div className="text-center py-4">
              <Spinner animation="border" style={{ color: cloudflareTheme.primary }} />
              <p className="mt-2">Loading nameservers...</p>
            </div>
          ) : modalNameservers.length ? (
            <ListGroup variant="flush">
              {modalNameservers.map((ns, i) => (
                <ListGroup.Item key={i} className="d-flex justify-content-between align-items-center py-3">
                  <code>{ns}</code>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>Copy to clipboard</Tooltip>}
                  >
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(ns);
                        toast.success(`Copied ${ns} to clipboard!`);
                      }}
                    >
                      <FiCopy size={16} />
                    </Button>
                  </OverlayTrigger>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center py-4">
              <FiCloud size={48} className="text-muted mb-3" />
              <p>No nameservers found for this domain.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="secondary" 
            onClick={() => setShowNsModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccountDomainsPage;