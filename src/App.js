import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import BaseLayout from "./components/layout/BaseLayout";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import Analytics from "./components/Analytics";
import BalanceComponent from "./components/BalanceComponent";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <BaseLayout>
        <Routes>
          {/* Public Routes */}
          <Route exact path="/" render={() => <Navigate to="/home" replace />} />
          <Route path="/home" component={Home} />
          <Route path="/signup" component={Signup} />
          <Route path="/login">
            <Login onLogin={handleLogin} />
          </Route>

          {/* Protected Routes */}
          <Route path="/analytics">
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          </Route>
          <Route path="/balance">
            <ProtectedRoute>
              <BalanceComponent />
            </ProtectedRoute>
          </Route>
        </Routes>
      </BaseLayout>
    </Router>
  );
};

export default App;
