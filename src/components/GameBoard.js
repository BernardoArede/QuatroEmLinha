import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/GameBoard.css";

function GameBoard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10);

  const { player1: initialPlayer1, player2: initialPlayer2, gameMode } = location.state || {};

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
  const [showNameChoice, setShowNameChoice] = useState(false);
  const [showNameForm, setShowNameForm] = useState(false);
  const [player1, setPlayer1] = useState(initialPlayer1 || "");
  const [player2, setPlayer2] = useState(initialPlayer2 || "");
  const [newPlayer1, setNewPlayer1] = useState("");
  const [newPlayer2, setNewPlayer2] = useState("");

  useEffect(() => {
    if (!player1 || (gameMode === "pvp" && !player2)) {
      navigate("/");
    }
  }, [player1, player2, gameMode, navigate]);

  useEffect(() => {
  if (winner || droppingPiece || showNameChoice || showNameForm) return;

  const timer = setInterval(() => {
    setTimeLeft((prevTime) => prevTime - 1);
  }, 1000);

  return () => clearInterval(timer);
  }, [currentPlayer, winner, droppingPiece, showNameChoice, showNameForm]);

  useEffect(() => {
    if (timeLeft <= 0 && !winner && !droppingPiece) {
      setCurrentPlayer((prev) => (prev === "R" ? "Y" : "R"));
      setTimeLeft(10);
    }
  }, [timeLeft, winner, droppingPiece]);

  useEffect(() => {
  if (gameMode === "pvc" && currentPlayer === "Y" && !winner && !droppingPiece && !showNameChoice && !showNameForm) {
    const botDelay = setTimeout(() => {
      const botCol = getBotMove();
      if (botCol !== undefined) {
        handleColumnClick(botCol);
      }
    }, 1000); 

    return () => clearTimeout(botDelay);
  }
  }, [gameMode, currentPlayer, winner, droppingPiece, board, showNameChoice, showNameForm]);


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

  

  const isBoardFull = (board) => {
  return board.every(row => row.every(cell => cell !== ""));
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

  const getBotMove = () => {
  for (let col = 0; col < cols; col++) {
    const row = getAvailableRow(board, col);
    if (row === -1) continue;

    const tempBoard = board.map((r) => [...r]);
    tempBoard[row][col] = "Y";
    if (checkWinner(tempBoard) === "Y") return col;
  }

  for (let col = 0; col < cols; col++) {
    const row = getAvailableRow(board, col);
    if (row === -1) continue;

    const tempBoard = board.map((r) => [...r]);
    tempBoard[row][col] = "R";
    if (checkWinner(tempBoard) === "R") return col;
  }

  const center = Math.floor(cols / 2);
  if (getAvailableRow(board, center) !== -1) return center;
  
  const validCols = [];
  for (let col = 0; col < cols; col++) {
    if (getAvailableRow(board, col) !== -1) validCols.push(col);
  }
  return validCols[Math.floor(Math.random() * validCols.length)];
};

const getAvailableRow = (board, col) => {
  for (let row = rows - 1; row >= 0; row--) {
    if (board[row][col] === "") return row;
  }
  return -1;
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
        } else if (isBoardFull(newBoard)) {
          setWinner("draw");
        } else {
          if (!isSpecialSpot) {
            setCurrentPlayer(player === "R" ? "Y" : "R");
          }
        }

        setDroppingPiece(null);
        setTimeLeft(10);
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
    setTimeLeft(10);
  };

  const handleRestart = () => {
    setShowNameChoice(true);
  };

  const handleSameNames = () => {
    resetGame();
    setShowNameChoice(false);
  };

  const handleDifferentNames = () => {
    setShowNameChoice(false);
    setShowNameForm(true);
    setNewPlayer1("");
    setNewPlayer2("");
  };

  const handleSubmitNames = (e) => {
    e.preventDefault();
    setPlayer1(newPlayer1);
    setPlayer2(newPlayer2);
    resetGame();
    setShowNameForm(false);
  };

  return (
    <div className="board-container">
      <h2>
        Modo de Jogo: {gameMode === "pvp" ? "Jogador vs Jogador" : "Jogador vs Computador"}
      </h2>
      <h3>
        Jogador Atual: {currentPlayer === "R" ? player1 : gameMode === "pvp" ? player2 : "Computador"}
      </h3>

      <div className="timer-container">
        <div className="timer-circle" style={{ '--time-left': `${(timeLeft / 10) * 100}%` }}>
          <div className="timer-content">
            <span className="timer-text">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {winner && (
        <div className="winner-message">
          {winner === "draw" ? (
            <h2>😐 Empate!</h2>
          ) : (
            <h2>🎉 {winner === "R" ? player1 : gameMode === "pvp" ? player2 : "Computador"} venceu!</h2>
          )}
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
        <button className="homeButton" onClick={() => navigate("/")}>Home</button>
        <button className="restartButton" onClick={handleRestart}>Restart</button>
      </div>

      {showNameChoice && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Queres manter os nomes atuais?</h3>
            <button onClick={handleSameNames}>Sim</button>
            <button onClick={handleDifferentNames}>Não</button>
          </div>
        </div>
      )}

      {showNameForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Insere os novos nomes:</h3>
            <form onSubmit={handleSubmitNames}>
              <input
                type="text"
                placeholder="Nome Jogador 1"  
                value={newPlayer1}
                onChange={(e) => setNewPlayer1(e.target.value)}
                required
              />
              {gameMode === "pvp" && (
                <input
                  type="text"
                  placeholder="Nome Jogador 2"
                  value={newPlayer2}
                  onChange={(e) => setNewPlayer2(e.target.value)}
                  required
                />
              )}
              <button type="submit">Começar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameBoard;
