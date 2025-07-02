import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, useNotification } from "@refinedev/core";
import { Container, Grid2 as Grid, Alert, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthPaper } from "../../components/styled";
import { PageTitle } from "../../components/shared/ui";
import { FormField } from "../../components/shared/forms/FormField";
import { FormActions } from "../../components/shared/forms/FormActions";
import { AuthHeader } from "../../components/header/auth";
import { useTheme } from "@mui/material/styles";

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
  const { mutateAsync: login } = useLogin();
  const { open } = useNotification();
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

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
        // Show welcome toast using refined redirect (user data now in localStorage)
        const storedUser = localStorage.getItem("user");
        let displayName: string | null = null;
        try {
          if (storedUser) {
            const parsed = JSON.parse(storedUser) as User;
            displayName =
              [parsed.firstName, parsed.lastName].filter(Boolean).join(" ") ||
              (parsed.email ? parsed.email.split("@")[0] : null);
          }
        } catch {
          displayName = null;
        }

        open?.({
          message: `Welcome back${displayName ? ", " + displayName : ""}!`,
          type: "success",
        });
        // No manual navigate – authProvider.redirectTo handles it.
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
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
    <>
      <AuthHeader />
      <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
        <AuthPaper>
          <PageTitle variant="h4" gutterBottom>
            Login
          </PageTitle>

          <form onSubmit={handleFormSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid size={12}>{error && <Alert severity="error">{error}</Alert>}</Grid>

              <Grid size={12}>
                <FormField
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
                <FormField
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
                <Typography variant="body2" color="text.secondary">
                  Don&apos;t have an account?{" "}
                  <RouterLink
                    to="/register"
                    style={{ color: theme.palette.secondary.main, fontWeight: 600, textDecoration: "underline" }}
                  >
                    Register
                  </RouterLink>
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormActions isLoading={isSubmitting} submitText={isSubmitting ? "Logging in..." : "Login"} />
              </Grid>
            </Grid>
          </form>
        </AuthPaper>
      </Container>
    </>
  );
};

export default Login;
