import React from "react";
import { auth } from "../firebase";

const Dashboard = () => {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido, {auth.currentUser?.displayName || "Usuario"}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
};

export default Dashboard;
