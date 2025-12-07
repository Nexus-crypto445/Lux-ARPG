import React, { useEffect, useState } from "react";
import TopDownScene from "../../topdown/TopDownScene";
import { fetchCharacters, deleteCharacter } from "./characters";

export default function CharacterSlots() {
  const [characters, setCharacters] = useState([]);
  const [playingCharacter, setPlayingCharacter] = useState(null);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, []);

  async function loadCharacters() {
    try {
      const data = await fetchCharacters();
      setCharacters(data);
    } catch (err) {
      console.error("Error loading characters:", err);
    }
  }

  function playCharacter(char) {
    setPlayingCharacter(char);
  }

  function exitGame() {
    setPlayingCharacter(null);
    loadCharacters();
  }

  // If they're in-game, show the world
  if (playingCharacter) {
    return (
      <div>
        <button
          onClick={exitGame}
          style={{ margin: 10, padding: "8px 18px", fontSize: 16 }}
        >
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

      {characters.length === 0 && <p>No characters yet.</p>}

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 20,
        flexWrap: "wrap"
      }}>
        {characters.map((char) => (
          <div
            key={char.id}
            style={{
              border: "2px solid white",
              padding: 15,
              width: 220,
              background: "#222",
              borderRadius: 8,
            }}
          >
            <h2>{char.name}</h2>

            <p><strong>Race:</strong> {char.race}</p>

            <p><strong>Stats:</strong></p>
            <p>STR: {char.stats.strength}</p>
            <p>AGI: {char.stats.agility}</p>
            <p>VIT: {char.stats.vitality}</p>
            <p>INT: {char.stats.intelligence}</p>
            <p>WIS: {char.stats.wisdom}</p>

            <button
              style={{ marginTop: 10, padding: "6px 12px" }}
              onClick={() => playCharacter(char)}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
