import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, useNotification } from "@refinedev/core";
import { TextField, Container, Grid2 as Grid, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthPaper, PageTitle, SubmitButton } from "../../components/styled";

interface LoginFormInputs {
  email: string;
  password: string;
}

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
}

// Validation schema for login form
const validationSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required"),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: login } = useLogin();
  const { open } = useNotification();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(validationSchema),
  });

  const onSubmit = async (data: LoginFormInputs): Promise<void> => {
    setError(null);

    try {
      const response = await login(data);

      if (response.success) {
        // Get user data from localStorage after successful login
        const storedUser = localStorage.getItem("user");
        const user = storedUser ? (JSON.parse(storedUser) as User) : null;

        // Create display name from user data
        const displayName = user
          ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email?.split("@")[0]
          : null;

        // Show welcome message with fallback
        open?.({
          message: `Welcome back${displayName ? `, ${displayName}` : ""}!`,
          type: "success",
        });

        // Navigate based on role
        const roles = user?.roles;
        if (roles?.includes("ADMIN")) {
          await navigate("/admin");
        } else if (roles?.includes("USER")) {
          await navigate("/dashboard/user");
        } else {
          open?.({
            message: "Invalid user role",
            type: "error",
          });
        }
      }
    } catch (err: unknown) {
      // Handle error and display it in the UI
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
      // Only log errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", err);
      }
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSubmit(onSubmit)(event);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <AuthPaper>
        <PageTitle variant="h4" gutterBottom>
          Login
        </PageTitle>

        <form onSubmit={handleFormSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid size={12}>{error && <Alert severity="error">{error}</Alert>}</Grid>

            <Grid size={12}>
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

            <Grid size={12}>
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

            <Grid size={12}>
              <SubmitButton type="submit" variant="contained" fullWidth disabled={isSubmitting}>
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
