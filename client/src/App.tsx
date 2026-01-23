import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminProductVariants from "./pages/admin/ProductVariants";
import ProductPricing from "./pages/admin/ProductPricing";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";
import AdminSoldLicenses from "./pages/admin/SoldLicenses";
import AdminPaymentMethods from "./pages/admin/PaymentMethods";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Returns from "./pages/Returns";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyAccount from "./pages/MyAccount";
import OrderSuccess from "./pages/OrderSuccess";

function Router() {
  return (
    <Switch>
       <Route path="/" component={Home} />
      <Route path="/producto/:slug" component={ProductDetail} />
      <Route path="/mis-pedidos" component={MyOrders} />
      <Route path="/order-success" component={OrderSuccess} />
      
      {/* Customer Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/registro" component={Register} />
      <Route path="/mi-cuenta" component={MyAccount} />
      
      {/* Legal & Support Routes */}
      <Route path="/soporte" component={Support} />
      <Route path="/terminos" component={Terms} />
      <Route path="/privacidad" component={Privacy} />
      <Route path="/devoluciones" component={Returns} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/:productId/variants" component={AdminProductVariants} />
      <Route path="/admin/products/:productId/pricing" component={ProductPricing} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/sold-licenses" component={AdminSoldLicenses} />
      <Route path="/admin/payment-methods" component={AdminPaymentMethods} />
      
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
