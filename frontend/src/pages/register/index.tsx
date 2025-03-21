import React from "react";
import { useForm } from "react-hook-form";
import { useNotification, useApiUrl } from "@refinedev/core";
import { Container, TextField, Typography, Grid, Alert, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useErrorHandler } from "../../utils/errorHandler";
import { AuthPaper, PageTitle, SubmitButton } from "../../components/styled";

const validationSchema = yup.object({
  username: yup.string().required("Username is required"),
  email: yup.string().required("Email is required").email("Invalid email address"),
  password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm Password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export const Register: React.FC = () => {
  const apiUrl = useApiUrl();
  const navigate = useNavigate();
  const { open } = useNotification();
  const { handleError } = useErrorHandler();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: yupResolver<RegisterFormData>(validationSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      username: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    console.log("Registration attempt with data:", { ...data, password: "[REDACTED]" });

    try {
      // Registration API call
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw { status: response.status, data: errorData };
      }

      const responseData = await response.json();

      // Store token and user info
      if (responseData.access_token) {
        localStorage.setItem("access_token", responseData.access_token);

        // Make sure we have the user data to store
        if (responseData.user) {
          localStorage.setItem("user", JSON.stringify(responseData.user));
          console.log("Stored user data:", { id: responseData.user.id, email: responseData.user.email });
        } else {
          console.warn("User data missing in registration response");
        }

        // After registration, fetch the user profile to ensure token works
        try {
          const profileResponse = await fetch(`${apiUrl}/auth/profile`, {
            headers: {
              Authorization: `Bearer ${responseData.access_token}`,
            },
          });
          if (profileResponse.ok) {
            console.log("Token verification successful");
          }
        } catch (e) {
          console.warn("Profile verification failed:", e);
        }
      }

      open?.({
        message: "Registration successful!",
        type: "success",
        description: "Proceeding to booking...",
      });

      // Navigate to booking page
      navigate("/booking");
    } catch (err: unknown) {
      console.error("Registration error:", err);
      setApiError(handleError(err));
    }
  };

  return (
    <>
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
                <SubmitButton type="submit" variant="contained" fullWidth disabled={!isValid}>
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
