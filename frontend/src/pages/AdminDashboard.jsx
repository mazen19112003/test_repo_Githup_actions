import React, { useState, useEffect,navigate } from 'react';
import axios from 'axios';
import {
  Container,
  Card,
  Tabs,
  Tab,
  Form,
  Button,
  Alert,
  Spinner,
  Table,
  InputGroup,
  FormControl,
  Dropdown,
  Modal,
  Badge,
  Row,
  Col
} from 'react-bootstrap';
import {
  FiUserPlus,
  FiUsers,
  FiMail,
  FiLock,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiCheck,
  FiX,
  FiSearch,
  FiRefreshCw,FiMoreVertical
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
    name: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
const [userToEdit, setUserToEdit] = useState(null);
const [editFormData, setEditFormData] = useState({
  name: '',
  email: '',
  role: 'user'
});

  const token = localStorage.getItem('token');
  const API_URL = process.env.REACT_APP_API_URL;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let results = users;
    
    // Apply search filter
    if (searchTerm) {
        results = results.filter(user => 
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        ); // <-- Closing parenthesis added here
      }
    
    // Apply role filter
    if (activeTab !== 'all') {
      results = results.filter(user => user.role === activeTab);
    }
    
    setFilteredUsers(results);
  }, [searchTerm, activeTab, users]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/user`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers([...users, res.data]);
      setSuccess(`User ${res.data.email} added successfully`);
      setTimeout(() => setSuccess(''), 5000);
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        role: 'user',
        name: ''
      });
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/user/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setSuccess(`User ${userToDelete.email} deleted successfully`);
      setTimeout(() => setSuccess(''), 5000);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };


  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
      };
  
      // Only include password if user entered one
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }
  
      const res = await axios.put(
        `${API_URL}/user/${userToEdit._id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setUsers(users.map(user =>
        user._id === userToEdit._id ? res.data : user
      ));
  
      setSuccess(`User ${res.data.email} updated successfully`);
      setTimeout(() => setSuccess(''), 5000);
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0 d-flex align-items-center">
            <FiShield className="me-2" size={24} />
            User Management
          </h2>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center"
          >
            <FiUserPlus className="me-2" />
            Add User
          </Button>
        </Col>
        
      </Row>

      {success && (
        <Alert variant="success" className="d-flex align-items-center" dismissible>
          <FiCheck className="me-2" />
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="d-flex align-items-center" dismissible>
          <FiX className="me-2" />
          {error}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <FiX />
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
                <Tab eventKey="all" title="All Users" />
                <Tab eventKey="admin" title="Admins" />
                <Tab eventKey="user" title="Regular Users" />
              </Tabs>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No users found</h5>
            <p className="text-muted">
              {searchTerm
                ? 'No users match your search criteria'
                : 'Add your first user to get started'}
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center mx-auto"
            >
              <FiUserPlus className="me-2" />
              Add User
            </Button>
            
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || '-'}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.role === 'admin' ? 'primary' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" size="sm">
                        <FiMoreVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                      <Dropdown.Item
  onClick={() => {
    setUserToEdit(user);
    setEditFormData({
      name: user.name || '',
      email: user.email,
      password: '', // المستخدم يدخلها لو عايز يغير
      role: user.role
    });
    setShowEditModal(true);
  }}
>
  <FiEdit2 className="me-2" />
  Edit
</Dropdown.Item>

                        <Dropdown.Item
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteModal(true);
                          }}
                          className="text-danger"
                        >
                          <FiTrash2 className="me-2" />
                          Delete
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUserPlus className="me-2" />
            Add New User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <FormControl
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FiMail />
                </InputGroup.Text>
                <FormControl
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FiLock />
                </InputGroup.Text>
                <FormControl
                  type="text"
                  name="password"
                  placeholder="Strong password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="8"
                />
                <Button
                  variant="outline-secondary"
                  onClick={generateRandomPassword}
                >
                  Generate
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Minimum 8 characters
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Adding...
                  </>
                ) : (
                  'Add User'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user <strong>{userToDelete?.email}</strong>?
          <p className="text-danger mt-2">
            This action cannot be undone and will permanently remove all user data.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>
      <FiEdit2 className="me-2" />
      Edit User
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form onSubmit={handleEditUser}>
      <Form.Group className="mb-3">
        <Form.Label>Full Name</Form.Label>
        <FormControl
          type="text"
          name="name"
          value={editFormData.name}
          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Email Address</Form.Label>
        <FormControl
          type="email"
          name="email"
          value={editFormData.email}
          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Password (Leave blank to keep current)</Form.Label>
        <FormControl
          type="password"
          name="password"
          value={editFormData.password}
          onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Role</Form.Label>
        <Form.Select
          name="role"
          value={editFormData.role}
          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
        >
          <option value="user">Regular User</option>
          <option value="admin">Administrator</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button
          variant="secondary"
          onClick={() => setShowEditModal(false)}
          className="me-2"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>

    </Container>
  );
};

export default AdminDashboard;