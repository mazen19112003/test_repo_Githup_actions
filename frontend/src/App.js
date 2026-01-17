import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link,Navigate } from 'react-router-dom';
import AddAccountPage from './pages/AddAccountForm';
import Home from './pages/Home'
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AccountDomainsPage from './pages/AccountDomainsPage';
import AccountListPage from './pages/AccountListPage';
import SubdomainsPage from './pages/SubdomainsPage'
import Login from './pages/Login'
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/AdminDashboard'
import Add_customer from './pages/Add_customer'
import Customer_accounts from './pages/Customer_accounts'

function App() {
  return (
          <div className="app-container d-flex flex-column min-vh-100">

      {/* <div className="App"> */}
          <Navbar/>
          <div className="flex-grow-1">

          <Routes>
  <Route 
    path="/add-account" 
    element={
      <PrivateRoute allowedRoles={['admin']}>
        <AddAccountPage />
      </PrivateRoute>
    } 
  />
  <Route path="/" element={<Home />} />

  <Route 
    path="/accounts/:accountId/domains" 
    element={
      <PrivateRoute>
        <AccountDomainsPage />
      </PrivateRoute>
    } 
  />

  <Route 
    path="/customers/:customerId/accounts" 
    element={
      <PrivateRoute>
        <AccountListPage />
      </PrivateRoute>
    } 
  />


<Route 
    path="/admin/dashboard" 
    element={
      <PrivateRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </PrivateRoute>
    } 
  />

<Route 
    path="/customer_accounts" 
    element={
      <PrivateRoute>
        <Customer_accounts />
      </PrivateRoute>
    } 
  />

<Route 
    path="/add_customer" 
    element={
      <PrivateRoute allowedRoles={['admin']}>
        <Add_customer />
      </PrivateRoute>
    } 
  />

  <Route 
    path="/account/:accountId/:domainName/subdomains" 
    element={
      <PrivateRoute>
        <SubdomainsPage />
      </PrivateRoute>
    } 
  />

  <Route path="/login" element={<Login />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>

      </div>
          <Footer/>
      </div>

  );
}

export default App;
