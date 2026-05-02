import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../style.css' 
import { AuthProvider, useAuth } from './context/AuthContext'
import LoadingScreen from './components/LoadingScreen'

const Root = () => {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return <App />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
)