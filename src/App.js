import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PlayerForm from "./components/PlayerForm";
import GameBoard from "./components/GameBoard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerForm />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
