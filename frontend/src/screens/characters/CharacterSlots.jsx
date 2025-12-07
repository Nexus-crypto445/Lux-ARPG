import React, { useEffect, useState } from "react";
import { fetchCharacters, deleteCharacter } from "../api/characters";
import CharacterCreation from "./CharacterCreation";
import TopDownScene from "../topdown/TopDownScene";

export default function CharacterSlots() {
  const [characters, setCharacters] = useState([]);
  const [playingCharacter, setPlayingCharacter] = useState(null);
  const [creating, setCreating] = useState(false);

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

  // If currently playing a character
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

  // If creating a new character
  if (creating) {
    return <CharacterCreation onCreated={() => { setCreating(false); loadCharacters(); }} />;
  }

  // Default: character selection
  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <h1>Your Characters</h1>

      <button
        onClick={() => setCreating(true)}
        style={{
          marginBottom: 20,
          padding: "10px 24px",
          fontSize: 18
        }}
      >
        Create New Character
      </button>

      {characters.length === 0 && <p>No characters yet.</p>}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          flexWrap: "wrap"
        }}
      >
        {characters.map((char) => (
          <div
            key={char.id}
            style={{
              border: "2px solid white",
              padding: 15,
              width: 220,
              background: "#222",
              borderRadius: 8
            }}
          >
            <h2>{char.name}</h2>

            <p><strong>Race:</strong> {char.race}</p>
            <p>STR: {char.stats.strength}</p>
            <p>AGI: {char.stats.agility}</p>
            <p>VIT: {char.stats.vitality}</p>
            <p>INT: {char.stats.intelligence}</p>
            <p>WIS: {char.stats.wisdom}</p>

            <button
              style={{
                marginTop: 10,
                padding: "6px 12px",
                width: "100%"
              }}
              onClick={() => playCharacter(char)}
            >
              Play
            </button>

            <button
              style={{
                marginTop: 8,
                padding: "6px 12px",
                width: "100%",
                background: "darkred",
                color: "white",
                border: "none"
              }}
              onClick={() => {
                deleteCharacter(char.id);
                loadCharacters();
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
