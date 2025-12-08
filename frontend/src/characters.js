import React, { useState } from "react";
import { fetchCharacters, createCharacter, updateCharacter, deleteCharacter } from "../characters";

export default function CharacterCreation({ onDone }) {
  const [name, setName] = useState("");
  const [race, setRace] = useState("Human");

  const [stats, setStats] = useState({
    strength: 5,
    agility: 5,
    vitality: 5,
    intelligence: 5,
    wisdom: 5,
  });

  const [points, setPoints] = useState(10);

  const races = ["Human", "Elf", "Orc", "Dwarf", "Fae"];

  const appearancePresets = [
    "Wanderer",
    "Soldier",
    "Nomad",
    "Scholar",
    "Hunter",
  ];

  const [appearance, setAppearance] = useState("Wanderer");

  function modifyStat(stat, amount) {
    if (amount > 0 && points === 0) return;
    if (stats[stat] + amount < 1) return;

    setStats((prev) => ({
      ...prev,
      [stat]: prev[stat] + amount,
    }));

    setPoints((p) => p - amount);
  }

  async function finish() {
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    const payload = {
      name,
      race,
      appearance,
      stats,
      level: 1,
      health: 100 + stats.vitality * 5,
      mana: 50 + stats.intelligence * 5,
      position: { x: 500, y: 500 },
    };

    await createCharacter(payload);

    onDone(); // Go back to character slots
  }

  return (
    <div
      style={{
        color: "white",
        height: "100vh",
        width: "100vw",
        background: "black",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 30,
      }}
    >
      <h1 style={{ fontSize: 50 }}>Create Your Character</h1>

      {/* NAME */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px 15px",
            fontSize: 18,
            border: "2px solid white",
            background: "black",
            color: "white",
          }}
        />
      </div>

      {/* RACE SELECT */}
      <h2 style={{ marginTop: 30 }}>Race</h2>
      <div style={{ display: "flex", gap: 15 }}>
        {races.map((r) => (
          <button
            key={r}
            onClick={() => setRace(r)}
            style={{
              padding: "10px 20px",
              border: r === race ? "3px solid white" : "1px solid gray",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {/* APPEARANCE */}
      <h2 style={{ marginTop: 30 }}>Appearance Preset</h2>
      <div style={{ display: "flex", gap: 15 }}>
        {appearancePresets.map((p) => (
          <button
            key={p}
            onClick={() => setAppearance(p)}
            style={{
              padding: "8px 16px",
              border: p === appearance ? "3px solid white" : "1px solid gray",
              background: "transparent",
              color: "white",
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* STATS */}
      <h2 style={{ marginTop: 30 }}>Stats</h2>
      <p>Points Remaining: {points}</p>

      <div style={{ marginTop: 10 }}>
        {Object.keys(stats).map((stat) => (
          <div
            key={stat}
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: 300,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <strong style={{ textTransform: "capitalize" }}>
              {stat}:
            </strong>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => modifyStat(stat, -1)}
                style={{
                  padding: "4px 10px",
                  border: "1px solid white",
                  background: "transparent",
                  color: "white",
                }}
              >
                -
              </button>

              <span>{stats[stat]}</span>

              <button
                onClick={() => modifyStat(stat, 1)}
                style={{
                  padding: "4px 10px",
                  border: "1px solid white",
                  background: "transparent",
                  color: "white",
                }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FINALIZE */}
      <button
        onClick={finish}
        style={{
          marginTop: 40,
          padding: "12px 28px",
          fontSize: 20,
          background: "transparent",
          border: "2px solid white",
          color: "white",
          cursor: "pointer",
        }}
      >
        Finalize Character
      </button>
    </div>
  );
}
