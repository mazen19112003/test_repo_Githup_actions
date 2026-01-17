import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Row,
  Col,
  InputGroup,
  FormControl,
  Spinner
} from 'react-bootstrap';
import {
  FiUser,
  FiKey,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const token = localStorage.getItem('token');

 const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
const EnhancedAddAccountForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    apiToken: '',
    email: '',
    customerId: '' // <- NEW FIELD
  });

  const [customers, setCustomers] = useState([]); // <- CUSTOMER LIST
  const [message, setMessage] = useState({ text: '', variant: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(false);
  const navigate = useNavigate();

  // Auth Check + Fetch Customers
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token && !user) {
      navigate('/login');
      return;
    }

    // Fetch customers
    const fetchCustomers = async () => {
      try {
        const res = await axiosInstance.get('/customers/list');
        setCustomers(res.data);
      } catch (err) {
        console.error('Error fetching customers:', err);
      }
    };

    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', variant: '' });

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage({ text: 'Authentication token is missing', variant: 'danger' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post(
        `${API_URL}/accounts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        text: 'Account added successfully!',
        variant: 'success'
      });

      setFormData({
        name: '',
        apiToken: '',
        email: '',
        customerId: '' // reset
      });
    } catch (err) {
      console.error('Error adding account:', err);
      setMessage({
        text: err.response?.data?.message || 'Failed to add account',
        variant: 'danger'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateApiToken = (token) => {
    return token.length >= 40;
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 d-flex align-items-center">
                <FiUser className="me-2" size={20} />
                Add Cloudflare Account
              </h4>
            </Card.Header>
            <Card.Body>
              {message.text && (
                <Alert variant={message.variant} className="d-flex align-items-center">
                  {message.variant === 'success' ?
                    <FiCheckCircle className="me-2" size={20} /> :
                    <FiXCircle className="me-2" size={20} />}
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Select Customer Dropdown */}
                <Form.Group className="mb-3">
                  <Form.Label>Select Customer</Form.Label>
                  <Form.Select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map(cust => (
                      <option key={cust._id} value={cust._id}>
                        {cust.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Account Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FiUser />
                    </InputGroup.Text>
                    <FormControl
                      type="text"
                      name="name"
                      placeholder="e.g., DNS Bot"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    API Token
                    <Button
                      variant="link"
                      size="sm"
                      className="ms-2 p-0 align-top"
                      onClick={() => setShowTokenHelp(!showTokenHelp)}
                    >
                      <FiHelpCircle size={16} />
                    </Button>
                  </Form.Label>
                  {showTokenHelp && (
                    <Alert variant="info" className="small">
                      <p>You can create an API token in your Cloudflare dashboard:</p>
                      <ol>
                        <li>Go to My Profile &gt; API Tokens</li>
                        <li>Click "Create Token"</li>
                        <li>Use the "Edit Zone DNS" template</li>
                      </ol>
                    </Alert>
                  )}
                  <InputGroup>
                    <InputGroup.Text>
                      <FiKey />
                    </InputGroup.Text>
                    <FormControl
                      type="password"
                      name="apiToken"
                      placeholder="API Token (starts with 'v1.0...')"
                      value={formData.apiToken}
                      onChange={handleChange}
                      required
                      isInvalid={formData.apiToken && !validateApiToken(formData.apiToken)}
                    />
                    <Form.Control.Feedback type="invalid">
                      API token should be at least 40 characters long
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Email (Optional)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FiMail />
                    </InputGroup.Text>
                    <FormControl
                      type="email"
                      name="email"
                      placeholder="account@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Used for notifications and account recovery
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isLoading || !validateApiToken(formData.apiToken)}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Adding Account...
                      </>
                    ) : (
                      'Add Account'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EnhancedAddAccountForm;
