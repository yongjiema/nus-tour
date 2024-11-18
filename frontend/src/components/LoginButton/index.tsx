import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';

const LoginButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <Button variant="contained" color="primary" onClick={handleLogin}>
      Login
    </Button>
  );
};

export default LoginButton;
