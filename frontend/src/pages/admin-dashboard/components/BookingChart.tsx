import React from "react";
import { Box, Paper, Typography, Skeleton, useTheme, Alert } from "@mui/material";
import { styled } from "@mui/system";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import InsightsIcon from "@mui/icons-material/Insights";

const SectionTitle = styled(Typography)({
  fontWeight: "bold",
  color: "#002147",
  marginBottom: "16px",
  display: "flex",
  alignItems: "center",
  "& svg": {
    marginRight: "8px",
  },
});

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: "24px",
  borderRadius: "12px",
  height: "100%",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Direct value instead of theme.shadows
  overflow: "hidden",
}));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1.5, boxShadow: 3, border: "none" }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">
          {`Count: ${payload[0].value}`}
        </Typography>
      </Paper>
    );
  }
  return null;
};

interface BookingChartProps {
  data: { name: string; value: number }[];
  isLoading: boolean;
}

const BookingChart: React.FC<BookingChartProps> = React.memo(({ data, isLoading }) => {
  const theme = useTheme();

  // Define chart colors based on the theme
  const colors = [
    theme.palette.primary.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  // Validate data is properly formatted
  const isValidData = React.useMemo(() => {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return false;
    return data.every(
      (item) =>
        item &&
        typeof item === "object" &&
        "name" in item &&
        "value" in item &&
        typeof item.name === "string" &&
        (typeof item.value === "number" || item.value === null),
    );
  }, [data]);

  return (
    <Box mt={5}>
      <SectionTitle variant="h5" gutterBottom>
        <InsightsIcon /> Booking Statistics
      </SectionTitle>
      <ChartContainer>
        <div style={{ width: "100%", height: 360 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column">
              <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: "8px" }} animation="wave" />
              <Box mt={2} width="100%">
                <Skeleton width="60%" height={24} />
              </Box>
            </Box>
          ) : !isValidData ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" flexDirection="column" p={3}>
              <Alert severity="warning" sx={{ width: "100%", mb: 2 }}>
                Unable to display chart. Data format is invalid or missing.
              </Alert>
              <Typography variant="body2" color="text.secondary" align="center">
                Please refresh the dashboard or check the data source.
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                aria-label="Booking statistics chart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: theme.palette.text.secondary }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  tick={{ fill: theme.palette.text.secondary }}
                  tickLine={{ stroke: theme.palette.divider }}
                  axisLine={{ stroke: theme.palette.divider }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </ChartContainer>
    </Box>
  );
});

export default BookingChart;
