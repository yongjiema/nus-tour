import React, { Suspense, lazy } from 'react';
import {
  Refine,
  Authenticated,
} from '@refinedev/core';
import {
  DevtoolsPanel,
  DevtoolsProvider,
} from '@refinedev/devtools';
import {
  RefineKbar,
  RefineKbarProvider,
} from '@refinedev/kbar';
import {
  ErrorComponent,
  notificationProvider,
  RefineSnackbarProvider,
  ThemedLayoutV2,
} from '@refinedev/mui';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import nestjsxCrudDataProvider from '@refinedev/nestjsx-crud';
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router-v6';
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { authProvider } from './authProvider';
import { Header } from './components/header';
import { PublicHeader } from './components/header/public';
import { ColorModeContextProvider } from './contexts/color-mode';
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
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

// Lazy load the Admin Dashboard component
const AdminDashboard = lazy(() => import('./pages/admin-dashboard'));

// Mock Authenticated component for development
const MockAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

function App() {
  const API_URL = "https://api.nestjsx-crud.refine.dev";
  const dataProvider = nestjsxCrudDataProvider(API_URL);

  const isDevelopment = true;

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider}
                notificationProvider={notificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "blog_posts",
                    list: "/blog-posts",
                    create: "/blog-posts/create",
                    edit: "/blog-posts/edit/:id",
                    show: "/blog-posts/show/:id",
                    meta: {
                      canDelete: true,
                    },
                  },
                  {
                    name: "categories",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/edit/:id",
                    show: "/categories/show/:id",
                    meta: {
                      canDelete: true,
                    },
                  },
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
                    <Route path="/information" element={<InformationHome />} />
                    <Route path="/information/academic-programs" element={<AcademicPrograms />} />
                    <Route path="/information/bus-routes" element={<BusRoutes />} />
                    <Route path="/information/canteens" element={<Canteens />} />
                    <Route path="/information/convenience-stores" element={<ConvenienceStores />} />
                    <Route path="/booking" element={<BookingForm />} />
                    <Route path="/booking/confirmation" element={<BookingConfirmation />} />
                    <Route path="/payment" element={<Payment />} />
                  </Route>

                  {/* Authenticated or MockAuthenticated based on environment */}
                  <Route
                    path="/admin"
                    element={
                      isDevelopment ? (
                        <MockAuthenticated>
                          <ThemedLayoutV2 Header={Header}>
                            <Outlet />
                          </ThemedLayoutV2>
                        </MockAuthenticated>
                      ) : (
                        <Authenticated
                          key="authenticated-wrapper"
                          fallback={<CatchAllNavigate to="/login" />}
                          v3LegacyAuthProviderCompatible
                        >
                          <ThemedLayoutV2 Header={Header}>
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      )
                    }
                  >
                    {/* Child Routes */}
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
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
