import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameBoard.css"; // CSS para a parte visual

function GameBoard() {
  const location = useLocation();
  const navigate = useNavigate();

  const { player1, player2, gameMode } = location.state || {};

  useEffect(() => {
    if (!player1 || (gameMode === "pvp" && !player2)) {
      navigate("/");
    }
  }, [player1, player2, gameMode, navigate]);

  const rows = 6;
  const cols = 7;

  const [board, setBoard] = useState(Array(rows).fill().map(() => Array(cols).fill("")));
  const [currentPlayer, setCurrentPlayer] = useState("R"); // "R" = Vermelho, "Y" = Amarelo
  const [hoveredCol, setHoveredCol] = useState(null); // Coluna que está sendo "hovered"
  const [droppingPiece, setDroppingPiece] = useState(null); // Indica se estamos em modo de animação de queda

  const handleColumnClick = (col) => {
    for (let row = rows - 1; row >= 0; row--) {
      if (board[row][col] === "") {
        const newBoard = board.map((r) => [...r]);
        newBoard[row][col] = currentPlayer;
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === "R" ? "Y" : "R");
        startPieceDrop(row, col); // Chama o método de animação
        break;
      }
    }
  };

  const startPieceDrop = (row, col) => {
    // Inicia a animação da peça descendo pela coluna
    setDroppingPiece({ row, col });
  };

  const handleMouseEnter = (col) => {
    setHoveredCol(col);
  };

  const handleMouseLeave = () => {
    setHoveredCol(null);
  };

  return (
    <div className="board-container">
      <h2>Modo de Jogo: {gameMode === "pvp" ? "Jogador vs Jogador" : "Jogador vs Computador"}</h2>
      <h3>Jogador Atual: {currentPlayer === "R" ? player1 : (gameMode === "pvp" ? player2 : "Computador")}</h3>

      <div className="game-board">
        <div className="indicator" style={{ left: hoveredCol !== null ? `${hoveredCol * 70  }px` : "0px" }}>
          <div className="piece-indicator" />
        </div>

        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell} ${droppingPiece?.col === colIndex && droppingPiece?.row === rowIndex ? "dropping" : ""}`}
                onClick={() => handleColumnClick(colIndex)}
                onMouseEnter={() => handleMouseEnter(colIndex)}
                onMouseLeave={handleMouseLeave}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameBoard;
