'use client';
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (auth.loading) return; 

    if (!auth.auth.isAuthenticated) {
      router.push('/'); 
    }
  }, [auth.loading, auth.auth.isAuthenticated, router]);

  if (auth.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-900">
        <p className="text-white text-xl animate-pulse">Kontrollerar användare...</p>
      </div>
    );
  }

  if (!auth.auth.isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
