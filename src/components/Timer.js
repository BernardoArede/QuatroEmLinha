import React from "react";
import "../styles/Timer.css"; // Se quiseres, pode mover os estilos para um ficheiro separado

function Timer({ timeLeft }) {
  return (
    <div className="timer-container">
      <div className="timer-circle" style={{ '--time-left': `${(timeLeft / 10) * 100}%` }}>
        <div className="timer-content">
          <span className="timer-text">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
}

export default Timer;