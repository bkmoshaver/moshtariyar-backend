import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Services from "./pages/Services";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import UserManagement from "./pages/UserManagement";
import StoreSettings from "./pages/StoreSettings";
import StaffManagement from "./pages/StaffManagement";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ShopManagement from "./pages/ShopManagement";
import ActivityLogs from "./pages/ActivityLogs";
import UserProfile from "./pages/UserProfile";
import PublicStore from "./pages/PublicStore";
import ProfileSettings from "./pages/ProfileSettings";
import ProductManagement from "./pages/ProductManagement";
import Orders from "./pages/Orders";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/clients" component={() => (
        <ProtectedRoute>
          <Clients />
        </ProtectedRoute>
      )} />
      <Route path="/clients/:id" component={() => (
        <ProtectedRoute>
          <ClientDetail />
        </ProtectedRoute>
      )} />
      <Route path="/services" component={() => (
        <ProtectedRoute>
          <Services />
        </ProtectedRoute>
      )} />
      <Route path="/products" component={() => (
        <ProtectedRoute allowedRoles={['tenant_admin', 'staff', 'super_admin']}>
          <ProductManagement />
        </ProtectedRoute>
      )} />
      <Route path="/orders" component={() => (
        <ProtectedRoute allowedRoles={['tenant_admin', 'staff', 'super_admin']}>
          <Orders />
        </ProtectedRoute>
      )} />
      <Route path="/reports" component={() => (
        <ProtectedRoute>
          <Reports />
        </ProtectedRoute>
      )} />
      <Route path="/settings" component={() => (
        <ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']}>
          <StoreSettings />
        </ProtectedRoute>
      )} />
      <Route path="/profile-settings" component={() => (
        <ProtectedRoute>
          <ProfileSettings />
        </ProtectedRoute>
      )} />
      <Route path="/staff" component={() => (
        <ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']}>
          <StaffManagement />
        </ProtectedRoute>
      )} />
      
      {/* Super Admin Routes */}
      <Route path="/admin" component={() => (
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      )} />
      <Route path="/admin/tenants" component={() => (
        <ProtectedRoute allowedRoles={['super_admin']}>
          <ShopManagement />
        </ProtectedRoute>
      )} />
      <Route path="/admin/logs" component={() => (
        <ProtectedRoute allowedRoles={['super_admin']}>
          <ActivityLogs />
        </ProtectedRoute>
      )} />
      <Route path="/users" component={() => (
        <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
          <UserManagement />
        </ProtectedRoute>
      )} />
      
      {/* Public Routes - Must be last to avoid conflict */}
      <Route path="/s/:slug" component={PublicStore} />
      <Route path="/:username" component={UserProfile} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
