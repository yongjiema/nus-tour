import React from "react";
import { useForm, UseFormProps } from "@refinedev/react-hook-form";
import { useNotification, useApiUrl } from "@refinedev/core";
import {
  Container,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Alert,
  Link,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "../../components/header/public";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useErrorHandler } from "../../utils/errorHandler";
import { AuthPaper, PageTitle, SubmitButton } from "../../components/styled";

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Validation schema using yup for more robust validation
const validationSchema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string()
    .required("Email is required")
    .email("Invalid email address"),
  password: yup.string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup.string()
    .required("Confirm Password is required")
    .oneOf([yup.ref('password')], "Passwords must match")
});

export const Register: React.FC = () => {
  const apiUrl = useApiUrl();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { handleError } = useErrorHandler();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const formProps: UseFormProps<RegisterFormInputs> = {
    mode: "onChange",
    resolver: yupResolver(validationSchema)
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<RegisterFormInputs>(formProps);

  const onSubmit = async (data: RegisterFormInputs) => {
    setApiError(null);

    try {
      // Using fetch directly for registration to simplify the code
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, data: errorData };
      }

      open?.({
        message: "Registration successful!",
        type: "success",
        description: "You can now login with your credentials",
      });

      navigate("/login");
    } catch (err: unknown) {
      setApiError(handleError(err));
    }
  };

  return (
    <>
      <PublicHeader />
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <AuthPaper>
          <PageTitle variant="h4" gutterBottom>
            Register
          </PageTitle>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={3}>
              {apiError && (
                <Grid item xs={12}>
                  <Alert severity="error">{apiError}</Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  label="Username"
                  fullWidth
                  required
                  variant="outlined"
                  {...register("username")}
                  error={!!errors.username}
                  helperText={errors.username?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email Address"
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
                  autoComplete="new-password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>

              <Grid item xs={12}>
                <SubmitButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!isValid}
                >
                  Register
                </SubmitButton>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" align="center">
                  Already have an account? <Link href="/login">Login</Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </AuthPaper>
      </Container>
    </>
  );
};
