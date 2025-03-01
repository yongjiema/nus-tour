import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
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
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PublicHeader } from "./../../components/header/public";
import * as dataProviders from "../../dataProviders";

interface RegisterFormInputs {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormInputs>();
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await dataProviders.backend.custom({
        url: "/auth/register",
        method: "post",
        payload: {
          username: data.username,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
        },
      });
      console.log("Registration successful response:", response);
      alert("Registration successful!");
      navigate("/login");
    } catch (err: unknown) {
      console.error("Registration error:",
        axios.isAxiosError(err)
          ? err.response?.data
          : (err instanceof Error ? err.message : String(err))
      );

      if (axios.isAxiosError(err)) {
        // This type guard is correct and working as expected
        if (err.response?.status === 409) {
          setError("Email is already registered. Please use a different email.");
        } else if (err.response?.status === 400) {
          setError("Bad request. Please check your input.");
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <>
      <PublicHeader />
      <Container maxWidth="sm" style={{ marginTop: "50px" }}>
        <Paper elevation={5} style={{ padding: "40px", borderRadius: "12px" }}>
          <Typography
            variant="h4"
            gutterBottom
            style={{
              color: "#002147",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Register
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {error && <Alert severity="error">{error}</Alert>}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Username"
                  fullWidth
                  required
                  variant="outlined"
                  {...register("username", {
                    required: "Username is required",
                  })}
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
                  {...register("email", { required: "Email is required" })}
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
                  {...register("password", {
                    required: "Password is required",
                  })}
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
                  {...register("confirmPassword", {
                    required: "Confirm Password is required",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  style={{
                    backgroundColor: "#FF6600",
                    color: "#FFFFFF",
                    padding: "10px",
                    fontSize: "16px",
                  }}
                >
                  Register
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" align="center">
                  Already have an account? <Link href="/login">Login</Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </>
  );
};
