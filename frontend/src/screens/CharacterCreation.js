import React, { useEffect, useState, useRef } from "react";
import { createCharacter } from "../characters";

const RACES = ["Human", "Elf", "Dwarf", "Orc", "Halfling", "Tiefling"];
const CLASSES = ["Warrior", "Mage", "Rogue", "Ranger", "Cleric"];
const STARTER_WEAPONS = [
  "Whip","Short Bow","Dagger","Flint Pistol","Great Axe","Hand Axe","Wooden Katana",
  "Wooden Staff","Training Spear","Rusted Mace",
  // magic starters
  "Arcane Grimoire","Flame Wand","Frost Wand","Storm Wand","Void Scepter","Nature Staff",
  "Crystal Tome","Soul Lantern","Gravity Orb","Necro Tome","Spirit Rod","Storm Wand II","Blood Grimoire",
  "Illusion Rod","Arcane Staff"
];

const BASE = 5;
const FREE = 2;

export default function CharacterCreation({ existing, onSaved, onCancel }) {
  const [name, setName] = useState(existing?.name || "");
  const [race, setRace] = useState(existing?.race || RACES[0]);
  const [classType, setClassType] = useState(existing?.class || CLASSES[0]);
  const [skinColor, setSkinColor] = useState(existing?.appearance?.skinColor || "#f2d7c9");
  const [eyeColor, setEyeColor] = useState(existing?.appearance?.eyeColor || "#222");
  const [hairColor, setHairColor] = useState(existing?.appearance?.hairColor || "#2b1b0f");
  const [weapon, setWeapon] = useState(existing?.equipment?.weapon?.name || STARTER_WEAPONS[0]);
  const [blessing, setBlessing] = useState(existing?.divineBlessing || "None");

  const [stats, setStats] = useState(existing?.stats || {
    strength: BASE, agility: BASE, vitality: BASE, intelligence: BASE, wisdom: BASE
  });

  const [pointsLeft, setPointsLeft] = useState(FREE);

  useEffect(() => {
    const used = (stats.strength + stats.agility + stats.vitality + stats.intelligence + stats.wisdom) - (BASE * 5);
    setPointsLeft(FREE - used);
  }, [stats]);

  function changeStat(key, delta) {
    const newVal = Math.max(BASE, (stats[key] || BASE) + delta);
    // compute prospective used
    const prospectiveUsed = (stats.strength + stats.agility + stats.vitality + stats.intelligence + stats.wisdom) - (BASE * 5) + Math.max(0, delta);
    if (delta > 0 && pointsLeft <= 0) return;
    if (delta < 0 && newVal < BASE) return;
    setStats(prev => ({ ...prev, [key]: newVal }));
  }

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSave() {
    if (!name.trim()) {
      setMsg("Please enter a name.");
      return;
    }
    if (pointsLeft !== 0) {
      setMsg(`Spend all free points (left: ${pointsLeft}).`);
      return;
    }

    const payload = {
      name: name.trim(),
      race,
      class: classType,
      subclass: null,
      level: 1,
      appearance: { skinColor, eyeColor, hairColor },
      equipment: { weapon: { name: weapon } },
      divineBlessing: blessing,
      stats,
      createdAt: new Date().toISOString()
    };

    try {
      setBusy(true);
      setMsg("");
      await createCharacter(payload);
      setMsg("Character created!");
      if (typeof onSaved === "function") onSaved();
    } catch (err) {
      console.error(err);
      setMsg("Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16, color: "white" }}>
      <h2>Create Character</h2>

      <div style={{ display: "flex", gap: 20 }}>
        <div style={{ flex: 1 }}>
          <label>Name</label><br />
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 8 }} />

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Race</label><br />
              <select value={race} onChange={e => setRace(e.target.value)} style={{ width: "100%", padding: 6 }}>
                {RACES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label>Class</label><br />
              <select value={classType} onChange={e => setClassType(e.target.value)} style={{ width: "100%", padding: 6 }}>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Skin Color</label><br />
            <input type="color" value={skinColor} onChange={e => setSkinColor(e.target.value)} />
            <label style={{ marginLeft: 12 }}>Eye</label>
            <input type="color" value={eyeColor} onChange={e => setEyeColor(e.target.value)} style={{ marginLeft: 8 }} />
            <label style={{ marginLeft: 12 }}>Hair</label>
            <input type="color" value={hairColor} onChange={e => setHairColor(e.target.value)} style={{ marginLeft: 8 }} />
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Starter Weapon</label><br />
            <select value={weapon} onChange={e => setWeapon(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {STARTER_WEAPONS.map(w => <option key={w}>{w}</option>)}
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Divine Blessing</label><br />
            <select value={blessing} onChange={e => setBlessing(e.target.value)} style={{ width: "100%", padding: 6 }}>
              <option>None</option>
              <option>Valor</option>
              <option>Knowledge</option>
              <option>Fortune</option>
              <option>Shadows</option>
            </select>
          </div>
        </div>

        <div style={{ width: 320 }}>
          <h4>Stats (Base {BASE})</h4>
          <div>Free points left: <strong>{pointsLeft}</strong></div>

          {Object.keys(stats).map(k => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <div style={{ textTransform: "capitalize" }}>{k}: {stats[k]}</div>
              <div>
                <button onClick={() => changeStat(k, -1)} disabled={stats[k] <= BASE}>-</button>
                <button onClick={() => changeStat(k, +1)} disabled={pointsLeft <= 0} style={{ marginLeft: 6 }}>+</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 14 }}>
            <button onClick={handleSave} disabled={busy} style={{ padding: "10px 14px" }}>
              {busy ? "Saving..." : "Create"}
            </button>
            <button onClick={onCancel} style={{ marginLeft: 8, padding: "10px 12px" }}>Cancel</button>
            <div style={{ color: "#f88", marginTop: 8 }}>{msg}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
