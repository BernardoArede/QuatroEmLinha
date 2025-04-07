import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameBoard.css";

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

  const [board, setBoard] = useState(
    Array(rows)
      .fill()
      .map(() => Array(cols).fill(""))
  );
  const [currentPlayer, setCurrentPlayer] = useState("R"); // "R" = Vermelho, "Y" = Amarelo
  const [hoveredCol, setHoveredCol] = useState(null);
  const [droppingPiece, setDroppingPiece] = useState(null);

  const handleColumnClick = (col) => {
    if (droppingPiece) return;

    for (let row = rows - 1; row >= 0; row--) {
      if (board[row][col] === "") {
        startPieceDrop(row, col, currentPlayer);
        break;
      }
    }
  };

  const startPieceDrop = (targetRow, col, player) => {
    let visualRow = -1;
    setDroppingPiece({ row: visualRow, col, player });

    const dropInterval = setInterval(() => {
      visualRow++;
      if (visualRow > targetRow) {
        clearInterval(dropInterval);
        const newBoard = board.map((r) => [...r]);
        newBoard[targetRow][col] = player;
        setBoard(newBoard);
        setCurrentPlayer(player === "R" ? "Y" : "R");
        setDroppingPiece(null);
      } else {
        setDroppingPiece({ row: visualRow, col, player });
      }
    }, 70);
  };

  const handleMouseEnter = (col) => {
    setHoveredCol(col);
  };

  const handleMouseLeave = () => {
    setHoveredCol(null);
  };

  return (
    <div className="board-container">
      <h2>
        Modo de Jogo: {gameMode === "pvp" ? "Jogador vs Jogador" : "Jogador vs Computador"}
      </h2>
      <h3>
        Jogador Atual: {currentPlayer === "R" ? player1 : gameMode === "pvp" ? player2 : "Computador"}
      </h3>

      <div className="game-board">
        {hoveredCol !== null && (
          <div
            className={`indicator ${currentPlayer}`}
            style={{ left: `${hoveredCol * 66 + 10}px` }}
          />
        )}

        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => {
              const isDropping =
                droppingPiece &&
                droppingPiece.row === rowIndex &&
                droppingPiece.col === colIndex;
              const pieceColor = isDropping ? droppingPiece.player : cell;

              return (
                <div
                  key={colIndex}
                  className={`cell ${pieceColor} ${hoveredCol === colIndex ? "highlight" : ""}`}
                  onClick={() => handleColumnClick(colIndex)}
                  onMouseEnter={() => handleMouseEnter(colIndex)}
                  onMouseLeave={handleMouseLeave}
                ></div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameBoard;
