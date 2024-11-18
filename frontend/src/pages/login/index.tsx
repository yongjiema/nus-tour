import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface LoginFormInputs {
  username: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await axios.post('http://localhost:3000/auth/login', data);
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        navigate('/admin');
      }
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Box
        sx={{
          maxWidth: '400px',
          width: '100%',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h5" fontWeight="bold" align="center" mb={2}>
          Welcome to NUS Tour
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            {...register('username', { required: 'Username is required' })}
            error={!!errors.username}
            helperText={errors.username?.message}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            {...register('password', { required: 'Password is required' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
