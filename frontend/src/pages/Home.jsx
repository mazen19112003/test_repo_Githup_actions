import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Card, 
  Row, 
  Col, 
  Button, 
  Spinner,
  ProgressBar,
  Badge,
  ListGroup
} from 'react-bootstrap';
import { 
  FaCloudflare, 
  FaPlus, 
  FaList, 
  FaServer, 
  FaChartLine,
  FaUserCog,
  FaShieldAlt,
  FaGlobe,
  FaHistory,
  FaBell
} from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    domains: 0,
    accounts: 0,
    subdomains: 0,
    activeDomains: 0,
    securityLevel: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const API_URL = process.env.REACT_APP_API_URL;

    if (!token || !user) {
      navigate('/login');
      return;
    }

    // Fetch stats
    axios.get(`${API_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(response => {
      const data = response.data;
      setStats({
        domains: data.customers || 0,
        accounts: data.accounts || 0,
        customers: data.customers|| 0,
        subdomains: data.subdomains || 45,
        activeDomains: data.activeDomains || Math.floor(data.customers * 0.7),
        securityLevel: data.securityLevel || 85
      });
      
     
      
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching stats:', error);
      setIsLoading(false);
    });

  }, [navigate]);



  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="text-center mb-5 position-relative">
        
        <FaCloudflare size={48} className="text-primary mb-3" />
        <h1 className="display-4 text-primary">Cloudflare Manager</h1>
        <p className="lead text-muted">
          Welcome back, {user?.name || 'Admin'}! Here's your dashboard overview.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}

          <Row className="mb-4 g-4">
          <Col md={1}>
          </Col>
            <Col md={5}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <FaServer className="text-primary" size={24} />
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Cloudflare Accounts</h6>
                      <h3 className="mb-0">{stats.accounts}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={5}>
  <Card className="shadow-sm h-100">
    <Card.Body>
      <div className="d-flex align-items-center">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <FaUserCog className="text-primary" size={24} />
        </div>
        <div>
          <h6 className="text-muted mb-1">Total Customers</h6>
          <h3 className="mb-0">{stats.customers}</h3>
        </div>
      </div>
    </Card.Body>
  </Card>
</Col>
          </Row>

          {/* Quick Actions */}
          {user?.role === "admin" && (
            <Card className="shadow mb-4">
              <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Quick Actions</h5>
                <FiActivity className="text-muted" />
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Button 
                      as={Link} 
                      to="/add-account" 
                      variant="outline-primary" 
                      className="w-100 py-3 d-flex flex-column align-items-center"
                    >
                      <FaPlus className="mb-2" size={20} />
                      Add Cloudflare Account
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      as={Link} 
                      to="/add_customer" 
                      variant="outline-success" 
                      className="w-100 py-3 d-flex flex-column align-items-center"
                    >
                      <FaPlus className="mb-2" size={20} />
                      Add Customer
                    </Button>
                  </Col>
                  <Col md={4}>
                    <Button 
                      as={Link} 
                      to="/admin/dashboard" 
                      variant="outline-info" 
                      className="w-100 py-3 d-flex flex-column align-items-center"
                    >
                      <FaUserCog className="mb-2" size={20} />
                      Manage Users
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

        </>
      )}
    </Container>
  );
};

export default HomePage;