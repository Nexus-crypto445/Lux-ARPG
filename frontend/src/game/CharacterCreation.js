import React, { useState, useEffect } from "react";
import { createCharacter, updateCharacter } from "../api/characters";

const CLASSES = {
  Fighter: ["Champion", "Battlemaster", "Eldritch Knight"],
  Rogue: ["Thief", "Assassin", "Arcane Trickster"],
  Wizard: ["Evoker", "Necromancer", "Chronomancer"],
  Cleric: ["Life", "Light", "Trickery"]
};

const DEFAULT_STATS = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };

export default function CharacterCreation({ existing, onSaved }) {
  // existing: optional character object to edit
  const [name, setName] = useState(existing?.name || "");
  const [charClass, setCharClass] = useState(existing?.class || "Fighter");
  const [subclass, setSubclass] = useState(existing?.subclass || CLASSES["Fighter"][0]);
  const [stats, setStats] = useState(existing?.stats || DEFAULT_STATS);
  const [level, setLevel] = useState(existing?.level || 1);
  const [difficulty, setDifficulty] = useState(existing?.difficulty || "Normal");
  const [rarityBias, setRarityBias] = useState(existing?.rarityBias || "Common");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(()=>{
    // when class changes update subclass default
    if (!existing) {
      setSubclass(CLASSES[charClass][0]);
    }
  }, [charClass]);

  // Autosave — debounce, save every 10s if changes
  useEffect(() => {
    if (!existing) return;
    const id = setInterval(() => {
      handleSave();
    }, 10000);
    return () => clearInterval(id);
  }, [name, charClass, subclass, stats, level, difficulty, rarityBias]);

  const handleStatChange = (k, v) => {
    setStats(prev => ({ ...prev, [k]: Math.max(1, Math.min(9999, Number(v) || 0)) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const payload = {
      name, class: charClass, subclass, stats, level, difficulty, rarityBias
    };
    try {
      let res;
      if (existing && existing.id) {
        res = await updateCharacter(existing.id, payload);
      } else {
        res = await createCharacter(payload);
      }
      setMessage("Saved");
      if (onSaved) onSaved(res);
    } catch (err) {
      setMessage("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 700 }}>
      <h2>{existing ? "Edit Character" : "Create Character"}</h2>

      <label>
        Name: <input value={name} onChange={e => setName(e.target.value)} />
      </label>

      <div style={{ marginTop: 8 }}>
        <label>
          Class:
          <select value={charClass} onChange={e => setCharClass(e.target.value)}>
            {Object.keys(CLASSES).map(c => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label style={{ marginLeft: 12 }}>
          Subclass:
          <select value={subclass} onChange={e => setSubclass(e.target.value)}>
            {CLASSES[charClass].map(sc => <option key={sc}>{sc}</option>)}
          </select>
        </label>
      </div>

      <div style={{ marginTop: 8 }}>
        <label>Level:
          <input type="number" value={level} onChange={e => setLevel(Math.max(1, Number(e.target.value)||1))} min="1" />
        </label>
        <label style={{ marginLeft: 12 }}>
          Difficulty:
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
            <option>Story</option>
            <option>Easy</option>
            <option>Normal</option>
            <option>Hard</option>
            <option>Nightmare</option>
          </select>
        </label>

        <label style={{ marginLeft: 12 }}>
          Rarity bias:
          <select value={rarityBias} onChange={e => setRarityBias(e.target.value)}>
            <option>Common</option>
            <option>Uncommon</option>
            <option>Rare</option>
            <option>Epic</option>
            <option>Legendary</option>
          </select>
        </label>
      </div>

      <h3 style={{ marginTop: 12 }}>Stats</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {["str","dex","con","int","wis","cha"].map(key => (
          <label key={key} style={{ display: "block" }}>
            {key.toUpperCase()}:
            <input
              type="number"
              value={stats[key]}
              onChange={e => handleStatChange(key, e.target.value)}
              min="1"
              max="9999"
            />
          </label>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Character"}</button>
        <span style={{ marginLeft: 10 }}>{message}</span>
      </div>
    </div>
  );
}
