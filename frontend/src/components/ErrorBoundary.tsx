import React, { Component } from "react";
import type { ReactNode } from "react";
import { Box, Typography, Button, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </Typography>
            {this.state.error && (
              <Typography variant="caption" sx={{ display: "block", mt: 1, fontFamily: "monospace" }}>
                Error: {this.state.error.message}
              </Typography>
            )}
          </Alert>
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={this.handleReset} sx={{ mr: 2 }}>
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
