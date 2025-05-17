import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameBoard.css";

function GameBoard() {
  const location = useLocation();
  const navigate = useNavigate();

  const { player1, player2, gameMode } = location.state || {};

  const rows = 6;
  const cols = 7;

  const getRandomSpecialSpaces = () => {
    const specialSet = new Set();

    while (specialSet.size < 5) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      specialSet.add(`${row},${col}`);
    }

    return Array.from(specialSet).map((coord) => {
      const [row, col] = coord.split(",").map(Number);
      return { row, col };
    });
  };

  const [specialSpaces, setSpecialSpaces] = useState(getRandomSpecialSpaces());
  const [winner, setWinner] = useState(null);
  const [board, setBoard] = useState(Array(rows).fill().map(() => Array(cols).fill("")));
  const [currentPlayer, setCurrentPlayer] = useState("R");
  const [hoveredCol, setHoveredCol] = useState(null);
  const [droppingPiece, setDroppingPiece] = useState(null);

  useEffect(() => {
    if (!player1 || (gameMode === "pvp" && !player2)) {
      navigate("/");
    }
  }, [player1, player2, gameMode, navigate]);

  const checkWinner = (board) => {
    const directions = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: -1 }
    ];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const player = board[row][col];
        if (!player) continue;

        for (const { x, y } of directions) {
          let count = 1;

          for (let i = 1; i < 4; i++) {
            const r = row + y * i;
            const c = col + x * i;
            if (r < 0 || r >= rows || c < 0 || c >= cols || board[r][c] !== player) break;
            count++;
          }

          if (count === 4) {
            return player;
          }
        }
      }
    }

    return null;
  };

  const handleColumnClick = (col) => {
    if (droppingPiece || winner) return;

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

        const result = checkWinner(newBoard);
        const isSpecialSpot = specialSpaces.some(
          (s) => s.row === targetRow && s.col === col
        );

        if (result) {
          setWinner(result);
        } else {
          if (!isSpecialSpot) {
            setCurrentPlayer(player === "R" ? "Y" : "R");
          }
        }

        setDroppingPiece(null);
      } else {
        setDroppingPiece({ row: visualRow, col, player });
      }
    }, 150);
  };

  const handleMouseEnter = (col) => setHoveredCol(col);
  const handleMouseLeave = () => setHoveredCol(null);

  const resetGame = () => {
    setBoard(Array(rows).fill().map(() => Array(cols).fill("")));
    setCurrentPlayer("R");
    setWinner(null);
    setDroppingPiece(null);
    setSpecialSpaces(getRandomSpecialSpaces());
  };

  return (
    <div className="board-container">
      <h2>
        Modo de Jogo: {gameMode === "pvp" ? "Jogador vs Jogador" : "Jogador vs Computador"}
      </h2>
      <h3>
        Jogador Atual: {currentPlayer === "R" ? player1 : gameMode === "pvp" ? player2 : "Computador"}
      </h3>

      {winner && (
        <div className="winner-message">
          <h2>🎉 {winner === "R" ? player1 : gameMode === "pvp" ? player2 : "Computador"} venceu!</h2>
        </div>
      )}

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
              const isSpecial = specialSpaces.some(
                (s) => s.row === rowIndex && s.col === colIndex
              );
              const pieceColor = isDropping ? droppingPiece.player : cell;

              return (
                <div
                  key={colIndex}
                  className={`cell ${pieceColor} ${hoveredCol === colIndex ? "highlight" : ""} ${isSpecial ? "special" : ""}`}
                  onClick={() => handleColumnClick(colIndex)}
                  onMouseEnter={() => handleMouseEnter(colIndex)}
                  onMouseLeave={handleMouseLeave}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="buttons-container">
        <button className="homeButton" onClick={() => navigate("/")}>
          Home
        </button>
        <button className="restartButton" onClick={resetGame}>
          Restart
        </button>
      </div>
    </div>
  );
}

export default GameBoard;
