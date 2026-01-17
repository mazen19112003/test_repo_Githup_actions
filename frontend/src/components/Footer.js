import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FiGithub, 
  FiTwitter, 
  FiLinkedin, 
  FiMail,
  FiHeart
} from 'react-icons/fi';
import { FaCloudflare } from 'react-icons/fa';

const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white mt-5">
      <Container className="py-4">
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <FaCloudflare size={28} className="text-primary me-2" />
              <h5 className="mb-0">⚡ Subdomain Manager</h5>
            </div>
            <p className="text-muted">
              A powerful tool for managing your Cloudflare subdomains with ease.
            </p>
            <div className="d-flex gap-3">
              <a href="https://github.com" className="text-white" aria-label="GitHub">
                <FiGithub size={20} />
              </a>
              <a href="https://twitter.com" className="text-white" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="https://linkedin.com" className="text-white" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
              <a href="mailto:contact@example.com" className="text-white" aria-label="Email">
                <FiMail size={20} />
              </a>
            </div>
          </Col>

          <Col md={2} className="mb-4 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/" className="text-white text-decoration-none">Home</a></li>
              <li className="mb-2"><a href="/domains" className="text-white text-decoration-none">Domains</a></li>
              <li className="mb-2"><a href="/add-account" className="text-white text-decoration-none">Add Account</a></li>
              <li><a href="/add-domain" className="text-white text-decoration-none">Add Domain</a></li>
            </ul>
          </Col>

          <Col md={3} className="mb-4 mb-md-0">
            <h5 className="mb-3">Resources</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/docs" className="text-white text-decoration-none">Documentation</a></li>
              <li className="mb-2"><a href="/api" className="text-white text-decoration-none">API Reference</a></li>
              <li className="mb-2"><a href="/blog" className="text-white text-decoration-none">Blog</a></li>
              <li><a href="/support" className="text-white text-decoration-none">Support</a></li>
            </ul>
          </Col>

          <Col md={3}>
            <h5 className="mb-3">Legal</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/privacy" className="text-white text-decoration-none">Privacy Policy</a></li>
              <li className="mb-2"><a href="/terms" className="text-white text-decoration-none">Terms of Service</a></li>
              <li><a href="/cookies" className="text-white text-decoration-none">Cookie Policy</a></li>
            </ul>
          </Col>
        </Row>

        <hr className="my-4 bg-secondary" />

        <Row className="align-items-center">
          <Col md={6} className="mb-3 mb-md-0">
            <p className="mb-0">
              &copy; {currentYear} Mazen's Subdomain Manager. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">
              Made with <FiHeart className="text-danger" /> using React and Cloudflare
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default EnhancedFooter;