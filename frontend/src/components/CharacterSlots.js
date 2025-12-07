import React, { useEffect, useState } from "react";
import TopDownScene from "../topdown/TopDownScene";   // ✅ FIXED IMPORT
import { getCharacters, updateCharacter } from "../api/characters";

export default function CharacterSlots() {
  const [characters, setCharacters] = useState([]);
  const [playingCharacter, setPlayingCharacter] = useState(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    const data = await getCharacters();
    setCharacters(data);
  }

  function playCharacter(char) {
    setPlayingCharacter(char);
  }

  function exitGame() {
    setPlayingCharacter(null);
    loadCharacters(); // reload in case stats changed
  }

  // If a character is selected, show the game scene
  if (playingCharacter) {
    return (
      <div>
        <button onClick={exitGame} style={{ margin: "10px" }}>
          Exit Game
        </button>
        <TopDownScene character={playingCharacter} />
      </div>
    );
  }

  // Character selection screen
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h1>Your Characters</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        {characters.map((char) => (
          <div
            key={char.id}
            style={{
              border: "2px solid white",
              padding: "15px",
              width: "200px",
              background: "#333",
            }}
          >
            <h2>{char.name}</h2>
            <p>Strength: {char.stats.strength}</p>
            <p>Agility: {char.stats.agility}</p>
            <p>Intelligence: {char.stats.intelligence}</p>

            <button onClick={() => playCharacter(char)}>
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
