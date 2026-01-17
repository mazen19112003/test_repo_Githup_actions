// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const role = user.role

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  console.log(user);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Redirect unauthorized users
  }

  return children;
};

export default PrivateRoute;
