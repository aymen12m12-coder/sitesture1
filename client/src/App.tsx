import { Switch, Route, useLocation as useWouterLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LocationProvider, useUserLocation } from "./context/LocationContext";
import { UiSettingsProvider, useUiSettings } from "./context/UiSettingsContext";
import { NotificationProvider } from "./context/NotificationContext";
import { LocationPermissionModal } from "./components/LocationPermissionModal";
import Layout from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DriverLoginPage from "./pages/driver/DriverLoginPage";
import AdminApp from "./pages/AdminApp";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDeliveryFees from "./pages/admin/AdminDeliveryFees";
import AdminUiSettings from "./pages/admin/AdminUiSettings";
import AdvancedReports from "./pages/admin/AdvancedReports";
import RestaurantReports from "./pages/admin/RestaurantReports";
import AdminDriversAdvanced from "./pages/AdminDriversAdvanced";
import AdminFinancialReports from "./pages/AdminFinancialReports";
import AdminHRManagement from "./pages/AdminHRManagement";
import AdminRestaurantsAdvanced from "./pages/AdminRestaurantsAdvanced";
import AdminSecurity from "./pages/AdminSecurity";
import RatingsManagement from "./pages/RatingsManagement";
import WalletManagement from "./pages/WalletManagement";
import { DriverDashboard } from "./pages/DriverDashboard";
import { useState } from "react";
import Home from "./pages/Home";
import Restaurant from "./pages/Restaurant";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Location from "./pages/Location";
import OrderTracking from "./pages/OrderTracking";
import OrdersPage from "./pages/OrdersPage";
import TrackOrdersPage from "./pages/TrackOrdersPage";
import Settings from "./pages/Settings";
import Privacy from "./pages/Privacy";
import SearchPage from "./pages/SearchPage";
// Admin pages removed - now handled separately
import NotFound from "@/pages/not-found";

import SplashScreen from "./components/SplashScreen";

function MainApp() {
  const { location } = useUserLocation();
  const [, setLocation] = useWouterLocation();
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splash_seen');
  });
  const [isGuest, setIsGuest] = useState(() => {
    return localStorage.getItem('is_guest') === 'true';
  });

  const { isAuthenticated } = useAuth();

  // Handle splash finish
  const handleSplashFinish = () => {
    sessionStorage.setItem('splash_seen', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // If not authenticated and not guest, redirect to auth (unless already on auth or login pages)
  const isAuthPage = window.location.pathname === '/auth' || 
                     window.location.pathname === '/admin-login' || 
                     window.location.pathname === '/driver-login';

  if (!isAuthenticated && !isGuest && !isAuthPage && !window.location.pathname.startsWith('/admin') && !window.location.pathname.startsWith('/driver')) {
    setLocation('/auth');
    return null;
  }

  // Handle login pages first (without layout)
  if (window.location.pathname === '/admin-login') {
    return <AdminLoginPage />;
  }
  
  if (window.location.pathname === '/driver-login') {
    return <DriverLoginPage />;
  }

  // Handle admin routes (direct access without authentication)
  if (window.location.pathname.startsWith('/admin')) {
    return (
      <Switch>
        <Route path="/admin" component={AdminApp} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/delivery-fees" component={AdminDeliveryFees} />
        <Route path="/admin/ui-settings" component={AdminUiSettings} />
        <Route path="/admin/advanced-reports" component={AdvancedReports} />
        <Route path="/admin/restaurant-reports" component={RestaurantReports} />
        <Route path="/admin/drivers-advanced" component={AdminDriversAdvanced} />
        <Route path="/admin/financial-reports" component={AdminFinancialReports} />
        <Route path="/admin/hr-management" component={AdminHRManagement} />
        <Route path="/admin/restaurants-advanced" component={AdminRestaurantsAdvanced} />
        <Route path="/admin/security" component={AdminSecurity} />
        <Route path="/admin/ratings" component={RatingsManagement} />
        <Route path="/admin/wallet" component={WalletManagement} />
        <Route path="/admin/:rest*" component={AdminApp} />
      </Switch>
    );
  }

  // Handle driver routes (direct access without authentication)  
  if (window.location.pathname.startsWith('/driver')) {
    // التحقق من تسجيل الدخول للسائق
    const driverToken = localStorage.getItem('driver_token');
    const driverUser = localStorage.getItem('driver_user');
    
    if (!driverToken || !driverUser) {
      // إعادة توجيه إلى صفحة تسجيل الدخول
      window.location.href = '/driver-login';
      return null;
    }
    
    return <DriverDashboard onLogout={() => {
      localStorage.removeItem('driver_token');
      localStorage.removeItem('driver_user');
      window.location.href = '/';
    }} />;
  }

  // Default customer app
  return (
    <>
      <Layout>
        <Router />
      </Layout>
      
      {showLocationModal && !location.hasPermission && (
        <LocationPermissionModal
          onPermissionGranted={(position) => {
            console.log('تم منح الإذن للموقع:', position);
            setShowLocationModal(false);
          }}
          onPermissionDenied={() => {
            console.log('تم رفض الإذن للموقع');
            setShowLocationModal(false);
          }}
        />
      )}
    </>
  );
}

import CategoryPage from "./pages/CategoryPage";
import ProductDetails from "./pages/ProductDetails";
import CustomerAuthPage from "./pages/CustomerAuthPage";
import Favorites from "./pages/Favorites";

function Router() {
  // Check UiSettings for page visibility
  const { isFeatureEnabled } = useUiSettings();
  const showOrdersPage = isFeatureEnabled('show_orders_page');
  const showTrackOrdersPage = isFeatureEnabled('show_track_orders_page');

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/restaurant/:id" component={Restaurant} />
      <Route path="/cart" component={Cart} />
      <Route path="/profile" component={Profile} />
      <Route path="/auth" component={CustomerAuthPage} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/addresses" component={Location} />
      {showOrdersPage && <Route path="/orders" component={OrdersPage} />}
      <Route path="/orders/:orderId" component={OrderTracking} />
      {showTrackOrdersPage && <Route path="/track-orders" component={TrackOrdersPage} />}
      <Route path="/settings" component={Settings} />
      <Route path="/privacy" component={Privacy} />
      
      {/* Authentication Routes */}
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/driver-login" component={DriverLoginPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

import { LanguageProvider } from "./context/LanguageContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <UiSettingsProvider>
                <LocationProvider>
                  <CartProvider>
                    <NotificationProvider>
                      <Toaster />
                      <MainApp />
                    </NotificationProvider>
                  </CartProvider>
                </LocationProvider>
              </UiSettingsProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
