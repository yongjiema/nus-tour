import { Suspense, lazy } from "react";
import { Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  notificationProvider,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { PublicHeader } from "./components/header/public";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { CustomLayout } from "./components/layout";
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
import { BookingForm, BookingConfirmation } from "./pages/booking";
import { Payment } from "./pages/payment";
import Checkin from "./pages/checkin";
import * as dataProviders from "./dataProviders";
import PrivateRoute from "./components/PrivateRoute";
import { TourInformation } from "./pages/tour-information";

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
                  {
                    name: "information",
                    list: "/information",
                  }
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "7OkvOR-FCEx0r-2vArZl",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <CustomLayout Header={() => <PublicHeader />}>
                        <Suspense fallback={<div>Loading...</div>}>
                          <Outlet />
                        </Suspense>
                      </CustomLayout>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="/information">
                      <Route index element={<InformationHome />} />
                      <Route path="academic-programs" element={<AcademicPrograms />} />
                      <Route path="bus-routes" element={<BusRoutes />} />
                      <Route path="canteens" element={<Canteens />} />
                      <Route path="convenience-stores" element={<ConvenienceStores />} />
                    </Route>
                    <Route path="/tour-information" element={<TourInformation />} />
                    <Route path="/booking">
                      <Route index element={<BookingForm />} />
                      <Route path="confirmation" element={<BookingConfirmation />} />
                    </Route>
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/checkin" element={<Checkin />} />
                    <Route path="/login" element={<Login />} />
                  </Route>

                  <Route element={<PrivateRoute />}>
                    <Route
                      path="/admin"
                      element={
                        <CustomLayout Header={Header}>
                          <Suspense fallback={<div>Loading...</div>}>
                            <AdminDashboard />
                          </Suspense>
                        </CustomLayout>
                      }
                    />
                  </Route>

                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
