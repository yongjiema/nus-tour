import { Refine } from "@refinedev/core";
import { useNotificationProvider, RefineSnackbarProvider } from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import routerProvider from "@refinedev/react-router";
import { authProvider } from "./authProvider";
import { PublicHeader } from "./components/header/public";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import Login from "./pages/login";
import Register from "./pages/register";
import { Home } from "./pages/home";
import { Information, AcademicPrograms, BusRoutes, Canteens, ConvenienceStores } from "./pages/information";
import { BookingForm, BookingConfirmation } from "./pages/booking";
import { PaymentPage, PaymentSuccessPage } from "./pages/payment";
import Checkin from "./pages/checkin";
import { dataProviders } from "./dataProviders";
import PrivateRoute from "./components/PrivateRoute";
import { TestimonialsPage } from "./pages/testimonial";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import UserDashboard, { UserBookingsManagement } from "./pages/dashboard/user";
import { UserLayout } from "./components/layout/UserLayout";
import { UserRole } from "./types/auth.types";
import { AdminDashboard } from "./pages/dashboard/admin";
import { AdminBookingManagement } from "./pages/dashboard/admin/bookingManagement";
import { AdminCheckInManagement } from "./pages/dashboard/admin/checkInManagement";
import { ErrorBoundary } from "./components/shared/layout/ErrorBoundary";
import { usePageTitle } from "./hooks/usePageTitle";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProfilePage } from "./pages/profile";
import DashboardRoot from "./pages/dashboard";

const RefineApp = () => {
  usePageTitle();

  return (
    <Refine
      authProvider={authProvider}
      dataProvider={dataProviders}
      routerProvider={routerProvider}
      notificationProvider={useNotificationProvider}
      resources={[
        {
          name: "dashboard",
          list: "/dashboard/admin",
          meta: {
            label: "Dashboard",
            icon: "🏠",
          },
        },
        {
          name: "bookings",
          list: "/admin/bookings",
          create: "/admin/bookings/create",
          edit: "/admin/bookings/edit/:id",
          meta: {
            label: "Bookings",
            icon: "📅",
          },
        },
        {
          name: "check-ins",
          list: "/admin/check-ins",
          meta: {
            label: "Check-ins",
            icon: "✅",
          },
        },
        {
          name: "users",
          list: "/admin/users",
          meta: {
            label: "Users",
            icon: "👥",
          },
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        disableTelemetry: true,
        projectId: "nus-tour-dashboard",
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicHeader />}>
          <Route path="/" element={<Home />} />
          <Route path="/information" element={<Information />} />
          <Route path="/academic-programs" element={<AcademicPrograms />} />
          <Route path="/bus-routes" element={<BusRoutes />} />
          <Route path="/canteens" element={<Canteens />} />
          <Route path="/convenience-stores" element={<ConvenienceStores />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/checkin" element={<Checkin />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes - Requires Authentication */}
        <Route element={<PrivateRoute />}>
          <Route element={<PublicHeader />}>
            <Route path="/booking" element={<BookingForm />} />
            <Route path="/dashboard" element={<DashboardRoot />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<PrivateRoute requiredRole={UserRole.ADMIN} />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/bookings" element={<AdminBookingManagement />} />
            <Route path="/admin/check-ins" element={<AdminCheckInManagement />} />
          </Route>
        </Route>

        {/* User Routes */}
        <Route element={<PrivateRoute requiredRole={UserRole.USER} />}>
          <Route element={<UserLayout />}>
            <Route path="/dashboard/user" element={<UserDashboard />} />
            <Route path="/dashboard/user/bookings" element={<UserBookingsManagement />} />
          </Route>
        </Route>

        {/* Profile route for any authenticated user */}
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/payment/:bookingId" element={<PaymentPage />} />
        <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
      </Routes>
    </Refine>
  );
};

function App() {
  return (
    <ColorModeContextProvider>
      <CssBaseline />
      <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
      <RefineSnackbarProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <BrowserRouter>
            <ErrorBoundary>
              <RefineApp />
            </ErrorBoundary>
          </BrowserRouter>
        </LocalizationProvider>
      </RefineSnackbarProvider>
    </ColorModeContextProvider>
  );
}

export default App;
