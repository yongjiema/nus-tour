import { Suspense, lazy } from "react";
import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  notificationProvider,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { PublicHeader } from "./components/header/public";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import Login from "./pages/login";
import { Register } from "./pages/register";
import { Home } from "./pages/home";
import {
  InformationHome,
  AcademicPrograms,
  BusRoutes,
  Canteens,
  ConvenienceStores,
} from "./pages/information";
import { BookingForm } from "./pages/booking";
import BookingConfirmation from "./pages/booking/Confirmation";
import PaymentPage from "./pages/payment";
import Checkin from "./pages/checkin";
import * as dataProviders from "./dataProviders";
import PrivateRoute from "./components/PrivateRoute";
import UserDashboard from "./pages/user-dashboard";
import FeedbackList from "./pages/feedback/list";
import TestimonialsPage from "./pages/testimonial";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BookingManagement from "./pages/admin-dashboard/booking/bookingManagement";

const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Refine
                  authProvider={authProvider}
                  dataProvider={dataProviders.backend}
                  notificationProvider={notificationProvider}
                  routerProvider={routerBindings}
                  resources={[
                    {
                      name: "bookings",
                      list: "/admin/bookings",
                      create: "/admin/bookings/create",
                      edit: "/admin/bookings/edit/:id",
                    },
                    {
                      name: "check_ins",
                      list: "/admin/check-ins",
                      create: "/admin/check-ins/create",
                      edit: "/admin/check-ins/edit/:id",
                    },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "7OkvOR-FCEx0r-2vArZl",
                  }}
                >
                  <Routes>
                    <Route element={<PublicHeader />}>
                      <Route index path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/information" element={<InformationHome />} />
                      <Route
                        path="/information/academic-programs"
                        element={<AcademicPrograms />}
                      />
                      <Route path="/information/bus-routes" element={<BusRoutes />} />
                      <Route path="/information/canteens" element={<Canteens />} />
                      <Route
                        path="/information/convenience-stores"
                        element={<ConvenienceStores />}
                      />
                      <Route path="/booking" element={<BookingForm />} />
                      <Route path="/booking/confirmation" element={<BookingConfirmation />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/checkin" element={<Checkin />} />
                      <Route path="/testimonials" element={<TestimonialsPage />} />
                    </Route>

                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/admin"
                      element={
                        <ThemedLayoutV2 Header={Header}>
                          <Suspense fallback={<div>Loading...</div>}>
                            <AdminDashboard />
                          </Suspense>
                        </ThemedLayoutV2>
                      }
                    />
                  </Route>

                    <Route path="/payment/:bookingId" element={<PaymentPage />} />
                    <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </LocalizationProvider>
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
