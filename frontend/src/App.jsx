import { Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Review from "./pages/Review";
import ReviewDetail from "./pages/ReviewDetail";
import Audit from "./pages/Audit";
import Login from "./pages/Login";
import FailedRecords from "./pages/FailedRecords";

import ProtectedRoute from "./ProtectedRoute";

function Sidebar() {
  const role = localStorage.getItem("role");
  

  const logout = () => {
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        width: "220px",
        background: "#1f2937",
        color: "white",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <h2>🌱 ESG Panel</h2>

      <div style={{ marginTop: "30px" }}>
        <Link to="/" style={{ color: "white" }}>Dashboard</Link>

        <br /><br />

        {/* Admin only */}
        {role === "admin" && (
          <>
            <Link to="/upload" style={{ color: "white" }}>Upload</Link>
            <br /><br />
          </>
        )}

        {/* Both admin + analyst */}
        <Link to="/review" style={{ color: "white" }}>Review</Link>

        <br /><br />

        <Link to="/audit" style={{ color: "white" }}>Audit</Link>

        <br /><br />

        {/* ✅ ADD FAILED RECORDS LINK */}
        <Link to="/failed" style={{ color: "white" }}>
          Failed Records
        </Link>

        <br /><br />

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Upload */}
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <Layout>
              <Upload />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Review */}
      <Route
        path="/review"
        element={
          <ProtectedRoute>
            <Layout>
              <Review />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Review Detail */}
      <Route
        path="/review/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ReviewDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Audit */}
      <Route
        path="/audit"
        element={
          <ProtectedRoute>
            <Layout>
              <Audit />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* ❌ FAILED RECORDS ROUTE (MISSING BEFORE) */}
      <Route
        path="/failed"
        element={
          <ProtectedRoute>
            <Layout>
              <FailedRecords />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}