import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useCustomMutation, useNotification } from "@refinedev/core";
import { Container, Grid2 as Grid, Alert, Typography } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AuthPaper } from "../../components/styled";
import { PageTitle } from "../../components/shared/ui";
import { handleRefineError } from "../../utils/errorHandler";
import { FormField } from "../../components/shared/forms/FormField";
import { FormActions } from "../../components/shared/forms/FormActions";
import { AuthHeader } from "../../components/header/auth";
import { useTheme } from "@mui/material/styles";

interface RegisterFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Validation schema for registration form
const validationSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().required("Email is required").email("Invalid email format"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(validationSchema),
  });

  const { mutate: registerUser } = useCustomMutation();

  const onSubmit = (data: RegisterFormInputs) => {
    setError(null);

    try {
      registerUser(
        {
          url: "auth/register",
          method: "post",
          values: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
          },
        },
        {
          onSuccess: (response) => {
            const responseData = response.data as Record<string, unknown> | undefined;

            if (responseData) {
              // Extract user data safely
              const userId = typeof responseData.id === "string" ? responseData.id : "";
              const userEmail = typeof responseData.email === "string" ? responseData.email : "";
              const userFirstName = typeof responseData.firstName === "string" ? responseData.firstName : "";
              const userLastName = typeof responseData.lastName === "string" ? responseData.lastName : "";
              const userRoles = Array.isArray(responseData.roles) ? responseData.roles : [];

              // Store user data in localStorage
              localStorage.setItem(
                "user",
                JSON.stringify({
                  id: userId,
                  email: userEmail,
                  firstName: userFirstName,
                  lastName: userLastName,
                  roles: userRoles,
                }),
              );

              if (typeof open === "function") {
                open({
                  message: "Registration successful! Please log in.",
                  type: "success",
                });
              }

              void navigate("/login");
            }
          },
          onError: (error) => {
            const errorMessage = handleRefineError(error, open);
            setError(errorMessage);
          },
        },
      );
    } catch (err) {
      handleRefineError(err, open);
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
            Register
          </PageTitle>

          <form onSubmit={handleFormSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid size={12}>{error && <Alert severity="error">{error}</Alert>}</Grid>

              <Grid size={6}>
                <FormField
                  label="First Name"
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="given-name"
                  {...register("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName ? errors.firstName.message ?? "" : ""}
                />
              </Grid>

              <Grid size={6}>
                <FormField
                  label="Last Name"
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="family-name"
                  {...register("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName ? errors.lastName.message ?? "" : ""}
                />
              </Grid>

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
                  helperText={errors.email ? errors.email.message ?? "" : ""}
                />
              </Grid>

              <Grid size={12}>
                <FormField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="new-password"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password ? errors.password.message ?? "" : ""}
                />
              </Grid>

              <Grid size={12}>
                <FormField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  required
                  variant="outlined"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword ? errors.confirmPassword.message ?? "" : ""}
                />
              </Grid>

              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <RouterLink
                    to="/login"
                    style={{ color: theme.palette.secondary.main, fontWeight: 600, textDecoration: "underline" }}
                  >
                    Login
                  </RouterLink>
                </Typography>
              </Grid>

              <Grid size={12}>
                <FormActions isLoading={isSubmitting} submitText={isSubmitting ? "Registering..." : "Register"} />
              </Grid>
            </Grid>
          </form>
        </AuthPaper>
      </Container>
    </>
  );
};

export default Register;
