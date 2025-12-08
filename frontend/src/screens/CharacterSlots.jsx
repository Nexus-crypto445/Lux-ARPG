import React, { useEffect, useState } from "react";
import TopDownScene from "../topdown/TopDownScene";
import { fetchCharacters, deleteCharacter } from "../characters";

export default function CharacterSlots({ onCreate, onCharacterSelected }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchCharacters();
      setCharacters(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load characters error:", err);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCharacter(id);
      await load();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  return (
    <div style={{ padding: 20, color: "white", textAlign: "center" }}>
      <h1>Your Characters</h1>

      <div style={{ marginBottom: 12 }}>
        <button onClick={onCreate} style={{ padding: "8px 12px", marginRight: 8 }}>
          Create New Character
        </button>
        <button onClick={load} style={{ padding: "8px 12px" }}>
          Refresh
        </button>
      </div>

      {loading && <div>Loading...</div>}

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {characters.length === 0 && !loading && <div>No characters yet.</div>}

        {characters.map((ch) => (
          <div key={ch.id} style={{
            width: 240, padding: 12, background: "#222", border: "1px solid #444", borderRadius: 8
          }}>
            <div style={{ fontSize: 18, fontWeight: "bold" }}>{ch.name}</div>
            <div style={{ marginTop: 6 }}>{ch.race} • Lvl {ch.level ?? 1}</div>

            <div style={{ marginTop: 8, textAlign: "left" }}>
              <div>STR: {ch.stats?.strength ?? "-"}</div>
              <div>AGI: {ch.stats?.agility ?? "-"}</div>
              <div>VIT: {ch.stats?.vitality ?? "-"}</div>
              <div>INT: {ch.stats?.intelligence ?? "-"}</div>
              <div>WIS: {ch.stats?.wisdom ?? "-"}</div>
            </div>

            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => onCharacterSelected(ch)} style={{ padding: "6px 10px" }}>Play</button>
              <button onClick={() => handleDelete(ch.id)} style={{ padding: "6px 10px" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
