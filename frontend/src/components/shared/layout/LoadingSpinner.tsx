import { Box, CircularProgress, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { getLoadingOverlayBackground } from "../../../theme/constants";

const SpinnerContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
  minHeight: "200px",
}));

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ size = 40, fullScreen = false }: LoadingSpinnerProps) => {
  const theme = useTheme();

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: getLoadingOverlayBackground(theme),
          zIndex: 9999,
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <SpinnerContainer>
      <CircularProgress size={size} />
    </SpinnerContainer>
  );
};
