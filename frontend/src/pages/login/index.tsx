import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Container,
  Paper,
  Grid,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as dataProviders from "../../dataProviders";

interface LoginFormInputs {
  username: string;
  password: string;
}

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const response = await dataProviders.backend.custom({
        url: "/auth/login",
        method: "post",
        payload: data,
      });
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/admin");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError("Invalid username or password");
        } else if (err.response?.status === 400) {
          setError("Bad request. Please check your input.");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "50px" }}>
      <Paper elevation={5} style={{ padding: "40px", borderRadius: "12px" }}>
        <Typography
          variant="h4"
          gutterBottom
          style={{ color: "#002147", fontWeight: "bold", textAlign: "center" }}
        >
          Login
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {error && <Alert severity="error">{error}</Alert>}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Username"
                type="username"
                fullWidth
                required
                variant="outlined"
                {...register("username", { required: "Username is required" })}
                error={!!errors.username}
                helperText={errors.username?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                variant="outlined"
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message}
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
                Login
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" align="center">
                Don't have an account? <Link href="/register">Register</Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Login;
