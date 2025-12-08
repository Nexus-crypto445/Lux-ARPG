import React, { useEffect, useState } from "react";
import { fetchCharacters } from "../api/characters";

export default function CharacterSlots({ onCharacterSelected }) {
  const [characters, setCharacters] = useState([]);

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

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h1>Your Characters</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
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
            <p>Race: {char.race}</p>

            <p>STR: {char.stats.strength}</p>
            <p>AGI: {char.stats.agility}</p>
            <p>VIT: {char.stats.vitality}</p>
            <p>INT: {char.stats.intelligence}</p>
            <p>WIS: {char.stats.wisdom}</p>

            <button
              style={{ marginTop: 10, padding: "6px 12px" }}
              onClick={() => onCharacterSelected(char)}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
