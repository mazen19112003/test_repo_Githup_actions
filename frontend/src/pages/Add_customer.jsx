import React, { useState, useEffect } from 'react';
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
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiRefreshCw,
  FiMoreVertical
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddCustomer = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    name: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: ''
  });

const token = localStorage.getItem('token')

 const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.get('/customers/list');
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err.response?.data?.message || 'Failed to fetch customers');
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let results = customers;
    
    if (searchTerm) {
      results = results.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }
    
    setFilteredCustomers(results);
  }, [searchTerm, activeTab, customers]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.post(
        '/customers/add',
        formData
      );
      setCustomers([...customers, res.data]);
      setSuccess(`Customer ${res.data.name} added successfully`);
      toast.success('Customer added successfully');
      setTimeout(() => setSuccess(''), 5000);
      setShowAddModal(false);
      setFormData({ name: '' });
      fetchCustomers();
    } catch (err) {
      console.error('Error adding customer:', err);
      setError(err.response?.data?.message || 'Failed to add customer');
      toast.error('Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/customers/delete/${customerToDelete._id}`);
      setCustomers(customers.filter(customer => customer._id !== customerToDelete._id));
      setSuccess(`Customer ${customerToDelete.name} deleted successfully`);
      toast.success('Customer deleted successfully');
      setTimeout(() => setSuccess(''), 5000);
      setShowDeleteModal(false);
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err.response?.data?.message || 'Failed to delete customer');
      toast.error('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axiosInstance.put(
        `/customers/update/${customerToEdit._id}`,
        { name: editFormData.name }
      );
      setCustomers(customers.map(customer =>
        customer._id === customerToEdit._id ? res.data : customer
      ));
      setSuccess(`Customer ${res.data.name} updated successfully`);
      toast.success('Customer updated successfully');
      setTimeout(() => setSuccess(''), 5000);
      setShowEditModal(false);
      fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      setError(err.response?.data?.message || 'Failed to update customer');
      toast.error('Failed to update customer');
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

  return (
    <Container className="py-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0 d-flex align-items-center">
            <FiUsers className="me-2" size={24} />
            Customer Management
          </h2>
        </Col>
        <Col xs="auto">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center"
          >
            <FiUserPlus className="me-2" />
            Add Customer
          </Button>
        </Col>
      </Row>

      {success && (
        <Alert variant="success" className="d-flex align-items-center" dismissible>
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="d-flex align-items-center" dismissible>
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
                  placeholder="Search customers..."
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
              <Button
                variant="outline-secondary"
                onClick={fetchCustomers}
                className="d-flex align-items-center"
              >
                <FiRefreshCw className="me-2" />
                Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading customers...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No customers found</h5>
            <p className="text-muted">
              {searchTerm
                ? 'No customers match your search criteria'
                : 'Add your first customer to get started'}
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center mx-auto"
            >
              <FiUserPlus className="me-2" />
              Add Customer
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" size="sm">
                        <FiMoreVertical />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={() => {
                            setCustomerToEdit(customer);
                            setEditFormData({
                              name: customer.name
                            });
                            setShowEditModal(true);
                          }}
                        >
                          <FiEdit2 className="me-2" />
                          Edit
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => {
                            setCustomerToDelete(customer);
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

      {/* Add Customer Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUserPlus className="me-2" />
            Add New Customer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCustomer}>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <FormControl
                type="text"
                name="name"
                placeholder="Customer name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
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
                disabled={loading || !formData.name}
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
                  'Add Customer'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiEdit2 className="me-2" />
            Edit Customer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditCustomer}>
            <Form.Group className="mb-3">
              <Form.Label>Customer Name</Form.Label>
              <FormControl
                type="text"
                name="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
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

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete customer <strong>{customerToDelete?.name}</strong>?
          <p className="text-danger mt-2">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteCustomer}
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
                Deleting...
              </>
            ) : (
              'Delete Customer'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AddCustomer;