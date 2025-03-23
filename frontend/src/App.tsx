import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./providers/auth-provider";
import ProtectedRoute from "./components/protected-route";
import LoginPage from "./pages/login-page";
import ProductManagementPage from "./pages/product-management-page";
import TransactionPage from "./pages/transaction-page";
import AppShell from "./components/app-shell";
import UsersPage from "./pages/users-page";
import SupplierManagementPage from "./pages/supplier-management-page";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppShell/>}>
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ProductManagementPage />} />
              <Route path="/products" element={<ProductManagementPage />} />
              <Route path="/transactions" element={<TransactionPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/suppliers" element={<SupplierManagementPage />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
