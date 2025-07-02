import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { TextFieldProps } from "@mui/material";

export const FormField = styled(TextField)<TextFieldProps>(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1),
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: "2px",
    },
  },
  "& .MuiInputLabel-root": {
    fontWeight: 500,
  },
}));
