
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./components/admin/AdminLayout";
import Branches from "./pages/admin/Branches";
import Staff from "./pages/admin/Staff";
import Subscription from "./pages/admin/Subscription";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="branches" replace />} />

          <Route
            path="dashboard"
            element={
              <div style={{ padding: "2rem" }}>
                <h2>Dashboard Coming Soon</h2>
              </div>
            }
          />

          <Route path="branches" element={<Branches />} />
          <Route path="staff" element={<Staff />} />
          <Route path="subscription" element={<Subscription />} />

          <Route
            path="settings"
            element={
              <div style={{ padding: "2rem" }}>
                <h2>Settings Coming Soon</h2>
              </div>
            }
          />
        </Route>

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;