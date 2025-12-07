import React, { useEffect, useState } from "react";
import { fetchCharacters, deleteCharacter } from "../api/characters";
import CharacterCreation from "./CharacterCreation";

export default function CharacterSlots() {
  const [chars, setChars] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    const data = await fetchCharacters();
    setChars(data.slice(0, 6)); // only up to 6 slots
  }

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await deleteCharacter(id);
    await load();
  };

  const onSaved = (newChar) => {
    setEditing(null);
    setShowCreate(false);
    load();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Your Characters (max 6)</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const ch = chars[i];
          return (
            <div key={i} style={{ border: "1px solid #666", padding: 12, width: 200 }}>
              {ch ? (
                <>
                  <div><strong>{ch.name}</strong></div>
                  <div>{ch.class} - {ch.subclass}</div>
                  <div>Lvl {ch.level}</div>
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => setEditing(ch)}>Edit</button>
                    <button onClick={() => handleDelete(ch.id)} style={{ marginLeft: 8 }}>Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>Empty Slot</div>
                  <button onClick={() => setShowCreate(true)}>Create</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {editing && <div style={{ marginTop: 20 }}>
        <CharacterCreation existing={editing} onSaved={onSaved} />
      </div>}

      {showCreate && <div style={{ marginTop: 20 }}>
        <CharacterCreation onSaved={onSaved} />
      </div>}
    </div>
  );
}
