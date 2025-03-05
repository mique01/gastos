import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import "./styles.css";

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
