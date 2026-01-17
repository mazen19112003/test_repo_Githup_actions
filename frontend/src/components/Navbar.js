import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import { 
  FiHome, 
  FiPlusCircle, 
  FiServer, 
  FiUser,
  FiMenu,
  FiX
} from 'react-icons/fi';

const user = JSON.parse(localStorage.getItem('user'))
 
const EnhancedNavbar = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate(); // Hook to redirect user

  const handleLogout = () => {
    // Clear everything from localStorage
    localStorage.clear();
    // Redirect user to login page
    
    navigate('/login');
    window.location.reload();

  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" expanded={expanded}>
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FiServer className="me-2" size={24} />
          <span className="fw-bold">⚡ Cloudflare Manager</span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <FiX size={24} /> : <FiMenu size={24} />}
        </Navbar.Toggle>
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
           {user && <Nav.Link 
              as={NavLink} 
              to="/" 
              end
              className="d-flex align-items-center"
            >
              <FiHome className="me-1" /> Home
            </Nav.Link>}
            
           {user && <Nav.Link 
              as={NavLink} 
              to="/customer_accounts" 
              end
              className="d-flex align-items-center"
            >
              <FiHome className="me-1" /> Accounts
            </Nav.Link>}
            
            { user && user.role === 'admin' && (
  <Dropdown as={Nav.Item}>
    <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center">
      <FiPlusCircle className="me-1" /> Add
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item as={Link} to="/add-account">
        <FiUser className="me-2" /> Account
      </Dropdown.Item>
      <Dropdown.Item as={Link} to="/admin/dashboard">
        <FiUser className="me-2" /> User
      </Dropdown.Item>
      <Dropdown.Item as={Link} to="/add_customer">
        <FiUser className="me-2" /> Customer
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
)}
          </Nav>
          
          <Nav>
              (
             {user && <Dropdown align="end">
                <Dropdown.Toggle as={Button} variant="outline-light" size="sm">
                  <span className="d-flex align-items-center">
                    <FiUser className="me-1" /> {user?.name || ""}
                  </span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Profile</Dropdown.Item>
                  <Dropdown.Item>Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>}
            ) : (
{  !user && <Nav.Link 
                as={NavLink} 
                to="/login" 
                end
                className="d-flex align-items-center"
              >
                <FiHome className="me-1" /> Login
              </Nav.Link>}
            )
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default EnhancedNavbar;
