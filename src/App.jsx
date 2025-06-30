import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Header from "./components/layout/Header";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import "./index.css";
import ProductsPage from "./pages/products/ProductsPage";
import ManageProductsPage from "./pages/products/ManageProductsPage";
import CreateProductPage from "./pages/products/CreateProductPage";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/orders/CartPage";
import CheckoutPage from "./pages/orders/CheckoutPage";
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import ManageOrdersPage from "./pages/orders/ManageOrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";

import {
  AdminDashboard,
  SellerDashboard,
  ClientDashboard,
} from "./components/dashboard/Dashboard";

const AuthenticatedLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="py-6">{children}</main>
    </div>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();

  const getDashboardContent = () => {
    switch (user?.role) {
      case "admin":
        return <AdminDashboard />;
      case "seller":
        return <SellerDashboard />;
      case "client":
        return <ClientDashboard />;
      default:
        return (
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Rol no reconocido: {user?.role}
              </p>
            </div>
          </div>
        );
    }
  };

  return <AuthenticatedLayout>{getDashboardContent()}</AuthenticatedLayout>;
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🛒 Bienvenido al Ecommerce
        </h1>
        <p className="text-xl text-gray-600 mb-8">Tu tienda online completa</p>
        <div className="space-x-4">
          <button
            onClick={() => (window.location.href = "/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => (window.location.href = "/register")}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Registrarse
          </button>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Página no encontrada</p>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute allowedRoles={["seller"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route path="/products" element={<ProductsPage />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <CartPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-orders"
              element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <MyOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <ProtectedRoute allowedRoles={["admin", "seller"]}>
                  <ManageOrdersPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={["admin", "seller"]}>
                  <ManageProductsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AuthenticatedLayout>
                    <ManageUsersPage />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
