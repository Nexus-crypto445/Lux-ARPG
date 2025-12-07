import React, { useState } from "react";
import { createCharacter } from "../api/characters";

export default function CharacterCreation({ onCreated }) {
  const [name, setName] = useState("");
  const [race, setRace] = useState("Human");

  const [stats, setStats] = useState({
    strength: 5,
    agility: 5,
    vitality: 5,
    intelligence: 5,
    wisdom: 5
  });

  async function submit() {
    await createCharacter({
      name,
      race,
      stats
    });

    onCreated();
  }

  return (
    <div style={{ color: "white", textAlign: "center" }}>
      <h1>Create Character</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 8, marginBottom: 10 }}
      />

      <br />

      <label>Race:</label>
      <select
        value={race}
        onChange={(e) => setRace(e.target.value)}
        style={{ padding: 8, marginLeft: 10 }}
      >
        <option>Human</option>
        <option>Elf</option>
        <option>Orc</option>
        <option>Dwarf</option>
      </select>

      <h2>Stats</h2>

      {Object.entries(stats).map(([key, value]) => (
        <div key={key} style={{ margin: 5 }}>
          <strong>{key.toUpperCase()}</strong>: {value}{" "}
          <button onClick={() => setStats({ ...stats, [key]: value + 1 })}>+</button>
          <button onClick={() => setStats({ ...stats, [key]: value - 1 })}>-</button>
        </div>
      ))}

      <button
        style={{ marginTop: 20, padding: "10px 20px", fontSize: 18 }}
        onClick={submit}
      >
        Create
      </button>
    </div>
  );
}

