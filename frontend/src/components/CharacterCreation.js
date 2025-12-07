import React, { useEffect, useState } from "react";
import TopDownScene from "../components/TopDownScene";
import { getCharacters } from "../api/characters";

export default function CharacterSlots() {
  const [characters, setCharacters] = useState([]);
  const [playingCharacter, setPlayingCharacter] = useState(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    const data = await getCharacters();
    setCharacters(data.slice(0, 6)); // up to 6 slots
  }

  function playCharacter(char) {
    setPlayingCharacter(char);
  }

  function exitGame() {
    setPlayingCharacter(null);
    loadCharacters(); // refresh data
  }

  // GAME VIEW
  if (playingCharacter) {
    return (
      <div style={{ textAlign: "center", color: "white" }}>
        <button
          onClick={exitGame}
          style={{
            margin: "10px",
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Exit Game
        </button>

        <TopDownScene character={playingCharacter} />
      </div>
    );
  }

  // CHARACTER SELECT VIEW
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h1>Your Characters</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px",
        }}
      >
        {characters.map((char, index) => (
          <div
            key={index}
            style={{
              padding: "20px",
              width: "150px",
              background: "#333",
              borderRadius: "10px",
              cursor: "pointer",
            }}
            onClick={() => playCharacter(char)}
          >
            <h3>{char.name}</h3>
            <p>Level {char.level}</p>
            <p>STR: {char.stats.strength}</p>
            <p>AGI: {char.stats.agility}</p>
            <p>INT: {char.stats.intelligence}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
