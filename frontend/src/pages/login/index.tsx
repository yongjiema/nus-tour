import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, useNotification } from "@refinedev/core";
import {
  TextField,
  Alert,
  Container,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthPaper, PageTitle, SubmitButton } from '../../components/styled';
import { useErrorHandler } from "../../utils/errorHandler";

interface LoginFormInputs {
  email: string;
  password: string;
}

// Validation schema for login form
const validationSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),
  password: yup
    .string()
    .required("Password is required")
});

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { mutateAsync: login } = useLogin();
  const { open } = useNotification();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(validationSchema)
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);

    try {
      const response = await login(data);
      
      if (response.success) {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'user') {
          navigate('/user-dashboard');
        } else {
          setError('Invalid user role');
        }
        
        const username = localStorage.getItem('username');
        open?.({
          message: `Welcome back, ${username}!`,
          type: "success",
        });
      }
    } catch (err) {
      setError(handleError(err));
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <AuthPaper>
        <PageTitle variant="h4" gutterBottom>
          Login
        </PageTitle>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {error && <Alert severity="error">{error}</Alert>}
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                variant="outlined"
                autoComplete="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                variant="outlined"
                autoComplete="current-password"
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>

            <Grid item xs={12}>
              <SubmitButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </SubmitButton>
            </Grid>
          </Grid>
        </form>
      </AuthPaper>
    </Container>
  );
};

export default Login;
