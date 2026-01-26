import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function RotaAdmin({ children }) {
  const { carregando, usuario } = useAdminAuth();
  if (carregando) return <div style={{ padding: 24 }}>Carregando...</div>;
  if (!usuario) return <Navigate to="/admin/login" replace />;
  return children;
}
