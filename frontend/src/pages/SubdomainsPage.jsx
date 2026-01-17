import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
  Button,
  Badge,
  Row,
  Col,
  InputGroup,
  FormControl,
  Dropdown,
  Modal,
  Pagination,Form
} from 'react-bootstrap';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiPlus,
  FiRefreshCw,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiExternalLink,
  FiFilter,
  FiSearch,
  FiMoreVertical
} from 'react-icons/fi';

const SubdomainsPage = () => {
  const { domainName, accountId } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [newRecord, setNewRecord] = useState({
    name: '',
    content: '',
    type: 'A',
    ttl: 300,
    proxied: false
  });
  const [showEditModal, setShowEditModal] = useState(false);
const [recordToEdit, setRecordToEdit] = useState(null);
const [editIp, setEditIp] = useState('');
const [editProxied, setEditProxied] = useState(true);



  const token = localStorage.getItem('token');


  const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: `${API_URL}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchSubdomains = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/domains/${accountId}/${domainName}/records`);
      setRecords(response.data);
      setFilteredRecords(response.data);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError(err.response?.data?.message || 'Failed to fetch DNS records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubdomains();
  }, [domainName]);

  useEffect(() => {
    const results = records.filter(record =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(results);
    setCurrentPage(1);
  }, [searchTerm, records]);

  const handleCreateRecord = async () => {
    try {
      const response = await axiosInstance.post(
        `/domains/${accountId}/${domainName}/records`,
        newRecord
      );
      setRecords([...records, response.data]);
      setSuccessMessage(`Record ${response.data.name} created successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setShowCreateModal(false);
      setNewRecord({
        name: '',
        content: '',
        type: 'A',
        ttl: 300,
        proxied: false
      });
    } catch (err) {
      console.error('Error creating record:', err);
      setError(err.response?.data?.message || 'Failed to create DNS record.');
    }
  };

  const handleDeleteRecord = async () => {
    try {
      await axiosInstance.delete(
        `/domains/${accountId}/${domainName}/records/${recordToDelete.id}`
      );
      setRecords(records.filter(record => record.id !== recordToDelete.id));
      setSuccessMessage(`Record ${recordToDelete.name} deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting record:', err);
      setError(err.response?.data?.message || 'Failed to delete DNS record.');
    }
  };

  const handleEditRecord = async () => {
  try {
    const res = await axiosInstance.put(
      `/domains/${accountId}/${domainName}/records/${recordToEdit.id}`,
      {
        content: editIp,
        proxied: editProxied
      }
    );

    // تحديث الليست بدون reload
    setRecords(records.map(record =>
      record.id === recordToEdit.id
        ? { ...record, content: editIp, proxied: editProxied }
        : record
    ));

    setSuccessMessage(`Record ${recordToEdit.name} updated successfully!`);
    setTimeout(() => setSuccessMessage(''), 5000);

    setShowEditModal(false);
  } catch (err) {
    console.error('Error updating record:', err);
    setError(err.response?.data?.message || 'Failed to update DNS record.');
  }
};

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccessMessage('Copied to clipboard!');
    setTimeout(() => setSuccessMessage(''), 2000);
  };

  const openEditModal = (record) => {
  setRecordToEdit(record);
  setEditIp(record.content);       // الـ IP الحالي
  setEditProxied(record.proxied);  // حالة الـ CDN
  setShowEditModal(true);
};

  const openInCloudflare = () => {
    window.open(`https://dash.cloudflare.com/${accountId}/${domainName}/dns`, '_blank');
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Container className="py-4">
      {/* Header Section */}
      <Row className="mb-4 align-items-center">
        <Col>
          <Button variant="outline-secondary" onClick={() => navigate(`/accounts/${accountId}/domains`)}>
            <FiArrowLeft className="me-2" />
            Back to Domains
          </Button>
          <h4 className="mt-3 mb-0">
            DNS Records for <strong>{domainName}</strong>
            <Badge bg="light" text="dark" className="ms-2">
              {filteredRecords.length} records
            </Badge>
          </h4>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2">
            <Button variant="outline-primary" onClick={fetchSubdomains}>
              <FiRefreshCw />
            </Button>
            {/* <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="me-2" />
              Add Record
            </Button> */}
          </div>
        </Col>
      </Row>

      {/* Status Messages */}
      {successMessage && (
        <Alert variant="success" className="d-flex align-items-center" dismissible>
          <FiCheck className="me-2" />
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="d-flex align-items-center" dismissible>
          <FiX className="me-2" />
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FiSearch />
                </InputGroup.Text>
                <FormControl
                  placeholder="Search records..."
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
            <Col md={6} className="mt-2 mt-md-0 text-end">
              <Button variant="outline-secondary" onClick={openInCloudflare}>
                <FiExternalLink className="me-2" />
                Open in Cloudflare
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading DNS records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h5>No DNS records found</h5>
            <p className="text-muted">
              {searchTerm
                ? 'No records match your search criteria'
                : 'Add your first DNS record to get started'}
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="me-2" />
              Add DNS Record
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Records List */}
          <Card>
            <ListGroup variant="flush">
              {currentRecords.map((record) => (
                <ListGroup.Item key={record.id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <div className="d-flex align-items-center">
                        <Badge bg="info" className="me-2">
                          {record.type}
                        </Badge>
                        <strong>{record.name}</strong>
                      </div>
                    </Col>
                    <Col md={4}>
                      <span className="text-muted">→</span> {record.content}
                      {record.proxied && (
                        <Badge bg="success" className="ms-2">
                          Proxied
                        </Badge>
                      )}
                    </Col>
                    <Col md={4} className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() =>
  copyToClipboard(
    `cdn : ${record.name}
ip : ${record.content}`
  )
}
                        >
                          <FiCopy />
                        </Button>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="light"
                            size="sm"
                            className="px-2"
                          >
                            <FiMoreVertical />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
<Dropdown.Item
  as="button"
  onClick={() => openEditModal(record)}
>
  <FiEdit2 className="me-2" />
  Edit
</Dropdown.Item>


                            <Dropdown.Item
                              onClick={() => {
                                setRecordToDelete(record);
                                setShowDeleteModal(true);
                              }}
                              className="text-danger"
                            >
                              <FiTrash2 className="me-2" />
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* Pagination */}
          {filteredRecords.length > recordsPerPage && (
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
      )}

      {/* Create Record Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiPlus className="me-2" />
            Create DNS Record
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Record Type</Form.Label>
              <Form.Select
                value={newRecord.type}
                onChange={(e) => setNewRecord({...newRecord, type: e.target.value})}
              >
                <option value="A">A (IPv4 Address)</option>
                <option value="AAAA">AAAA (IPv6 Address)</option>
                <option value="CNAME">CNAME (Canonical Name)</option>
                <option value="MX">MX (Mail Exchange)</option>
                <option value="TXT">TXT (Text Record)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <InputGroup>
                <FormControl
                  type="text"
                  placeholder="subdomain"
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({...newRecord, name: e.target.value})}
                />
                <InputGroup.Text>.{domainName}</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                {newRecord.type === 'A' ? 'IPv4 Address' :
                 newRecord.type === 'AAAA' ? 'IPv6 Address' :
                 newRecord.type === 'CNAME' ? 'Target Hostname' :
                 'Content'}
              </Form.Label>
              <FormControl
                type="text"
                placeholder={
                  newRecord.type === 'A' ? '192.168.1.1' :
                  newRecord.type === 'AAAA' ? '2001:0db8:85a3::8a2e:0370:7334' :
                  newRecord.type === 'CNAME' ? 'example.com' :
                  'Record content'
                }
                value={newRecord.content}
                onChange={(e) => setNewRecord({...newRecord, content: e.target.value})}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>TTL (Seconds)</Form.Label>
                  <FormControl
                    type="number"
                    min="60"
                    value={newRecord.ttl}
                    onChange={(e) => setNewRecord({...newRecord, ttl: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Proxy Status</Form.Label>
                  <Form.Check
                    type="switch"
                    label={newRecord.proxied ? 'Proxied' : 'DNS Only'}
                    checked={newRecord.proxied}
                    onChange={(e) => setNewRecord({...newRecord, proxied: e.target.checked})}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateRecord}
            disabled={!newRecord.name || !newRecord.content}
          >
            Create Record
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the record <strong>{recordToDelete?.name}</strong>?
          <p className="text-danger mt-2">
            This action cannot be undone and may affect services using this record.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRecord}>
            Delete Record
          </Button>
          
        </Modal.Footer>
      </Modal>
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Edit DNS Record</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>IP Address</Form.Label>
        <Form.Control
          type="text"
          value={editIp}
          onChange={(e) => setEditIp(e.target.value)}
          placeholder="Enter new IP"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Check
          type="switch"
          label={editProxied ? 'CDN Enabled (Proxied)' : 'DNS Only'}
          checked={editProxied}
          onChange={(e) => setEditProxied(e.target.checked)}
        />
      </Form.Group>
    </Form>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowEditModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleEditRecord}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>

    </Container>
  );
};

export default SubdomainsPage;