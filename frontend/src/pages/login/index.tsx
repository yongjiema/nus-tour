import React, { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useLogin } from "@refinedev/core";
import {
  TextField,
  Typography,
  Alert,
  Link,
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
const validationSchema = yup.object({
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    refineCore: { onFinish, formLoading }
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(validationSchema),
    refineCoreProps: {
      action: "login"
    }
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setError(null);

    try {
      await onFinish(data);
      // AuthProvider's login will handle the redirect
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
                disabled={formLoading || isSubmitting}
              >
                {formLoading || isSubmitting ? "Logging in..." : "Login"}
              </SubmitButton>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" align="center">
                Don't have an account? <Link href="/register">Register</Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </AuthPaper>
    </Container>
  );
};

export default Login;
