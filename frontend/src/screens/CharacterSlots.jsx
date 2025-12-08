// src/screens/CharacterSlots.js

import React, { useEffect, useState } from "react";
import { fetchCharacters } from "../characters";
import TopDownScene from "../topdown/TopDownScene";

export default function CharacterSlots() {
  const [characters, setCharacters] = useState([]);
  const [playingCharacter, setPlayingCharacter] = useState(null);

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

  if (playingCharacter) {
    return (
      <div>
        <button
          onClick={exitGame}
          style={{ padding: "10px", margin: "10px" }}
        >
          Exit Game
        </button>

        <TopDownScene character={playingCharacter} />
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h1>Your Characters</h1>

      {characters.length === 0 && <p>No characters created yet.</p>}

      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap"
      }}>
        {characters.map((char) => (
          <div
            key={char.id}
            style={{
              border: "2px solid white",
              padding: 20,
              width: 220,
              background: "#222",
              borderRadius: 10
            }}
          >
            <h2>{char.name}</h2>

            <p>STR: {char.stats.strength}</p>
            <p>AGI: {char.stats.agility}</p>
            <p>VIT: {char.stats.vitality}</p>
            <p>INT: {char.stats.intelligence}</p>
            <p>WIS: {char.stats.wisdom}</p>

            <button
              onClick={() => playCharacter(char)}
              style={{ marginTop: 10 }}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
