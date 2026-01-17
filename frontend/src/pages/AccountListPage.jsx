import React, { useEffect, useState } from 'react';
import { Link, useNavigate ,useParams} from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  ListGroup,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Badge,
  Row,
  Col,
  Dropdown,
  InputGroup,
  Tab,
  Tabs,
  Pagination
} from 'react-bootstrap';
import {
  FiEdit2,
  FiTrash2,
  FiGlobe,
  FiUser,
  FiMail,
  FiPlus,
  FiRefreshCw,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiShield,
  FiSearch,
  FiFilter,
  FiDownload,
  FiGrid,
  FiList,
  FiSettings
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const AccountListPage = () => {
  const { customerId } = useParams();

  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage] = useState(10);
  const navigate = useNavigate();
  const [noteToShow, setNoteToShow] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  

  const user = JSON.parse(localStorage.getItem('user')); // أو sessionStorage
  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // تحقق من التوكن
  useEffect(() => {
    const token = localStorage.getItem('token'); // أو sessionStorage
    if (!token) {
      navigate('/login'); // إذا لم يكن هناك توكن، سيتم إعادة التوجيه إلى صفحة تسجيل الدخول
    }
  }, [navigate]);


  const handleShowNote = async (accountId) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.get(`/accounts/${accountId}`);
      const noteFromDb = response.data.note || 'No notes provided.';
      setNoteToShow(noteFromDb);
      setShowNoteModal(true);
    } catch (err) {
      console.error('Failed to fetch note:', err);
      toast.error('Could not load note');
    } finally {
      setActionLoading(false);
    }
  };
  

  

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, activeTab]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get(
        `/accounts/by-customer/${customerId}`, // استخدم axiosInstance هنا
        formData
      );
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let results = accounts;
  
    // Apply search filter
    if (searchTerm) {
      results = results.filter(account =>
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (account.email && account.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
  
    // Apply status filter (placeholder for future status field)
    if (activeTab !== 'all') {
      if (activeTab === 'withDomains') {
        results = results.filter(account => account.domains?.length > 0);
      } else if (activeTab === 'withoutDomains') {
        results = results.filter(account => !account.domains || account.domains.length === 0);
      }
    }
  
    setFilteredAccounts(results);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      name: account.name,
      email: account.email || '',
      note: account.note || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setActionLoading(true);
      await axiosInstance.put(
        `/accounts/${selectedAccount._id}`,
        formData
      );
      setAccounts(accounts.map(account => 
        account._id === selectedAccount._id ? { ...account, ...formData } : account
      ));
      setSuccessMessage('Account updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating account:', error);
      setError(error.response?.data?.message || 'Failed to update account. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account? All associated domains will be removed.')) {
      try {
        setActionLoading(true);
        await axiosInstance.delete(`/accounts/${id}`,formData);
        setAccounts(accounts.filter(account => account._id !== id));
        setSuccessMessage('Account deleted successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        console.error('Error deleting account:', error);
        setError('Failed to delete account. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateAccountNotes = async (id, newNote) => {
    try {
      const token = localStorage.getItem('token');
  
      const response = await axiosInstance.put(`${API_URL}/accounts/${id}`, {
        note: newNote, // خليها note مش notes علشان تتوافق مع الـ backend
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('Updated Account:', response.data);
      toast.success('Notes updated successfully!');
    } catch (err) {
      console.error('Failed to update notes:', err);
      toast.error('Failed to update notes');
    }
  };
  

  const exportAccounts = () => {
    // Simple export to JSON (could be enhanced to CSV)
    const dataStr = JSON.stringify(filteredAccounts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'cloudflare-accounts.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Pagination logic
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = filteredAccounts.slice(indexOfFirstAccount, indexOfLastAccount);
  const totalPages = Math.ceil(filteredAccounts.length / accountsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0 d-flex align-items-center">
            <FiShield className="me-2" size={24} />
            Cloudflare Accounts
            <Badge bg="light" text="dark" className="ms-2">
              {filteredAccounts.length} accounts
            </Badge>
          </h2>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </Button>
            <Button variant="outline-primary" onClick={fetchAccounts}>
              <FiRefreshCw />
            </Button>
            {user.role === "admin" && <Button
              variant="primary"
              as={Link}
              to="/add-account"
              className="d-flex align-items-center"
            >
              <FiPlus className="me-2" />
              Add Account
            </Button>}
          </div>
        </Col>
      </Row>

      {/* Filter/Search Section */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <FiXCircle />
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={6} className="mt-2 mt-md-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-0"
              >
                <Tab eventKey="all" title="All Accounts" />
                <Tab eventKey="withDomains" title="With Domains" />
                <Tab eventKey="withoutDomains" title="Without Domains" />
              </Tabs>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Status Messages */}
      {successMessage && (
        <Alert variant="success" className="d-flex align-items-center" dismissible>
          <FiCheckCircle className="me-2" />
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="d-flex align-items-center" dismissible>
          <FiXCircle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading accounts...</p>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No accounts found</h5>
            <p className="text-muted">
              {searchTerm 
                ? 'No accounts match your search criteria'
                : 'Add your first Cloudflare account to get started'}
            </p>
            <Button
              variant="primary"
              as={Link}
              to="/add-account"
              className="d-flex align-items-center mx-auto"
            >
              <FiPlus className="me-2" />
              Add Account
            </Button>
          </Card.Body>
        </Card>
      ) : viewMode === 'list' ? (
        /* List View */
        <>
          <Card>
            <ListGroup variant="flush">
              {currentAccounts.map((account) => (
                <ListGroup.Item key={account._id} className="py-3">
                  <Row className="align-items-center">
                    <Col md={5}>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                          <FiUser size={20} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0">{account.name}</h6>
                          <small className="text-muted">
                            {account.email || 'No email provided'}
                          </small>
                          {account.notes && (
                            <small className="d-block text-truncate text-muted">
                              {account.notes}
                            </small>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md={3}>
                      {/* <div className="d-flex gap-2">
                        <Badge bg="light" text="dark">
                          {account.domains?.length || 0} domains
                        </Badge>
                        <Badge bg="light" text="dark">
                          {account.apiKeys?.length || 0} API keys
                        </Badge>
                      </div> */}
                    </Col>
                    <Col md={4} className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        as={Link}
                        to={`/accounts/${account._id}/domains`}
                        className="me-2"
                      >
                        <FiGlobe className="me-1" />
                        View Domains
                      </Button>
                      <Button
  variant="outline-secondary"
  size="sm"
  onClick={() => handleShowNote(account._id)}
  className="me-2"
>
  <FiMail className="me-1" />
  Show Notes
</Button>

                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          className="px-2"
                        >
                          <FiMoreVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => handleEdit(account)}>
                            <FiEdit2 className="me-2" />
                            Edit Account
                          </Dropdown.Item>
                          {/* <Dropdown.Item
                            onClick={() => navigate(`/accounts/${account._id}/settings`)}
                          >
                            <FiSettings className="me-2" />
                            Settings
                          </Dropdown.Item> */}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleDelete(account._id)}
                            className="text-danger"
                          >
                            <FiTrash2 className="me-2" />
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* Pagination */}
          {filteredAccounts.length > accountsPerPage && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
                
                {[...Array(totalPages).keys()].map(number => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </>
      ) : (
        /* Grid View */
        <Row>
          {currentAccounts.map(account => (
            <Col key={account._id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex align-items-start mb-3">
                    <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                      <FiUser size={20} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="mb-0">{account.name}</h5>
                      <small className="text-muted d-block">
                        {account.email || 'No email provided'}
                      </small>
                    </div>
                  </div>
                  
                  {account.notes && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Notes:</strong> {account.notes}
                      </small>
                    </div>
                  )}
                  
                  <div className="d-flex gap-2 mb-3">
                    <Badge bg="light" text="dark">
                      {account.domains?.length || 0} domains
                    </Badge>
                    <Badge bg="light" text="dark">
                      {account.apiKeys?.length || 0} API keys
                    </Badge>
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      as={Link}
                      to={`/accounts/${account._id}/domains`}
                    >
                      <FiGlobe className="me-1" />
                      View Domains
                    </Button>
                    <Button
  variant="outline-secondary"
  size="sm"
  onClick={() => handleShowNote(account._id)}
>
  <FiMail className="me-1" />
  Show Notes
</Button>

                    <Dropdown>
                      <Dropdown.Toggle
                        variant="outline-secondary"
                        size="sm"
                        id="dropdown-actions"
                      >
                        <FiMoreVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleEdit(account)}>
                          <FiEdit2 className="me-2" />
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => navigate(`/accounts/${account._id}/settings`)}
                        >
                          <FiSettings className="me-2" />
                          Settings
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onClick={() => handleDelete(account._id)}
                          className="text-danger"
                        >
                          <FiTrash2 className="me-2" />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Export Button */}
      {filteredAccounts.length > 0 && (
        <div className="text-end mt-3">
          <Button variant="outline-secondary" onClick={exportAccounts}>
            <FiDownload className="me-2" />
            Export Accounts
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit2 className="me-2" />
            Edit Cloudflare Account
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Account Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Account name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="account@example.com"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
  <Form.Label>Notes</Form.Label>
  <Form.Control
    as="textarea"
    rows={3}
    name="note"
    value={formData.note}
    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
    placeholder="Additional information about this account"
  />
</Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={actionLoading || !formData.name}
          >
            {actionLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
  show={showNoteModal}
  onHide={() => setShowNoteModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Account Notes</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p className="mb-0">{noteToShow}</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
};

export default AccountListPage;
