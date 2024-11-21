import { Box, TextField } from "@mui/material";
import { Edit } from "@refinedev/mui";
import { useForm, FieldError } from "@refinedev/react-hook-form";

export const CategoryEdit = () => {
  const {
    saveButtonProps,
    register,
    formState: { errors },
  } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <TextField
          {...register("title", {
            required: "This field is required",
          })}
          error={!!(errors as FieldError)?.title}
          helperText={(errors as FieldError)?.title?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label={"Title"}
          name="title"
        />
      </Box>
    </Edit>
  );
};
