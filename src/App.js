import React from "react";
import { HashRouter as Router } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import "./styles.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
