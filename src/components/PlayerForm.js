import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PlayerForm.css";

function PlayerForm() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState("pvp"); 
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");

  const handleStartGame = (event) => {
    event.preventDefault();
    navigate("/game", { state: { player1, player2, gameMode } });
  };

  return (
    <div className="App">
      <h1 className="title">Quatro em Linha</h1>
      <div className="form">
        <h2>Inscrição de Jogadores</h2>
        <form className="input" onSubmit={handleStartGame}>
          <label className="label1">
            Jogador 1:
            <input
              type="text"
              className="input1"
              placeholder="Inserir nome do jogador 1"
              value={player1}
              onChange={(e) => setPlayer1(e.target.value)}
              required
            />
          </label>
          <br />

          {/* Se o usuário escolher Jogador vs Computador, o campo do Jogador 2 desaparece */}
          {gameMode === "pvp" && (
            <>
              <label className="label2">
                Jogador 2:
                <input
                  type="text"
                  className="input2"
                  placeholder="Inserir nome do jogador 2"
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  required
                />
              </label>
              <br />
            </>
          )}

          
          <div className="game-mode">
            <label>
              <input
                type="radio"
                name="gameMode"
                value="pvp"
                checked={gameMode === "pvp"}
                onChange={() => setGameMode("pvp")}
              />
              Jogador vs Jogador
            </label>
            <br />
            <br />
            <label>
              <input
                type="radio"
                name="gameMode"
                value="pvc"
                checked={gameMode === "pvc"}
                onChange={() => setGameMode("pvc")}
              />
              Jogador vs Computador
            </label>
          </div>

          <button className="button" type="submit">Iniciar Jogo</button>
        </form>
      </div>
    </div>
  );
}

export default PlayerForm;
