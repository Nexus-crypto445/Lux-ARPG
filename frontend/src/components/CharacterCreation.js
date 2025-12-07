import React, { useState } from "react";
import { createCharacter, updateCharacter } from "../api/characters";

export default function CharacterCreation({ existing, onSaved }) {
  const isEditing = !!existing;

  // Allowed stat points
  const STAT_LIMIT = 10;

  // Base model
  const [form, setForm] = useState(
    existing || {
      name: "",
      level: 1, // ALWAYS level 1
      race: "",
      appearance: {
        skin: "#c58c5c",
        eyes: "#000000",
        hairColor: "#000000",
        hairType: "short",
        facial: "none",
        clothing: "cloth",
      },
      starterWeapon: "",
      divineBlessing: "",
      stats: {
        strength: 0,
        agility: 0,
        vitality: 0,
        intelligence: 0,
        wisdom: 0,
      },
    }
  );

  // Calculate remaining stat points
  const usedPoints =
    form.stats.strength +
    form.stats.agility +
    form.stats.vitality +
    form.stats.intelligence +
    form.stats.wisdom;

  const remaining = STAT_LIMIT - usedPoints;

  // Safe stat change
  const changeStat = (stat, amount) => {
    const newValue = form.stats[stat] + amount;

    // No negatives
    if (newValue < 0) return;

    // No exceeding allowed total
    if (amount > 0 && remaining <= 0) return;

    setForm({
      ...form,
      stats: { ...form.stats, [stat]: newValue },
    });
  };

  const submit = async () => {
    const payload = { ...form, level: 1 }; // LEVEL ALWAYS 1

    if (isEditing) {
      await updateCharacter(existing.id, payload);
    } else {
      await createCharacter(payload);
    }

    onSaved(payload);
  };

  // Starter Weapons
  const starterWeapons = [
    // Physical
    "Whip",
    "Bow",
    "Staff",
    "Magic Grimoire",
    "Dagger",
    "Single Pistol",
    "Great Axe",
    "Axe",
    "Wooden Katana",
    "Shortsword",
    "Longsword",
    "Great Hammer",
    "Spear",
    "Dual Knives",

    // Magic expanded list
    "Ember Wand",
    "Frost Wand",
    "Storm Wand",
    "Void Scepter",
    "Healing Rod",
    "Mana Baton",
    "Crystal Focus",
    "Arcane Needle",
    "Solar Tome",
    "Lunar Tome",
    "Inferno Catalyst",
    "Glacier Orb",
    "Thunder Charm",
    "Chaos Rune",
    "Spirit Branch",
  ];

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h2>{isEditing ? "Edit Character" : "Create Character"}</h2>

      {/* NAME */}
      <label>Name:</label><br />
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      /><br /><br />

      {/* RACE */}
      <label>Race:</label><br />
      <select
        value={form.race}
        onChange={(e) => setForm({ ...form, race: e.target.value })}
      >
        <option value="">Select race</option>
        <option>Human</option>
        <option>Elf</option>
        <option>Dwarf</option>
        <option>Beastkin</option>
        <option>Fae</option>
        <option>Demonkin</option>
      </select><br /><br />

      {/* APPEARANCE */}
      <h3>Appearance</h3>

      <label>Skin Color:</label><br />
      <input
        type="color"
        value={form.appearance.skin}
        onChange={(e) =>
          setForm({
            ...form,
            appearance: { ...form.appearance, skin: e.target.value },
          })
        }
      /><br /><br />

      <label>Eye Color:</label><br />
      <input
        type="color"
        value={form.appearance.eyes}
        onChange={(e) =>
          setForm({
            ...form,
            appearance: { ...form.appearance, eyes: e.target.value },
          })
        }
      /><br /><br />

      <label>Hair Color:</label><br />
      <input
        type="color"
        value={form.appearance.hairColor}
        onChange={(e) =>
          setForm({
            ...form,
            appearance: { ...form.appearance, hairColor: e.target.value },
          })
        }
      /><br /><br />

      <label>Hair Type:</label><br />
      <select
        value={form.appearance.hairType}
        onChange={(e) =>
          setForm({
            ...form,
            appearance: { ...form.appearance, hairType: e.target.value },
          })
        }
      >
        <option value="short">Short</option>
        <option value="long">Long</option>
        <option value="curly">Curly</option>
        <option value="braided">Braided</option>
        <option value="afro">Afro</option>
        <option value="shaved">Shaved</option>
      </select><br /><br />

      <label>Facial Features:</label><br />
      <select
        value={form.appearance.facial}
        onChange={(e) =>
          setForm({
            ...form,
            appearance: { ...form.appearance, facial: e.target.value },
          })
        }
      >
        <option value="none">None</option>
        <option value="scar">Scar</option>
        <option value="freckles">Freckles</option>
        <option value="tattoo">Tattoo</option>
        <option value="beard">Beard</option>
      </select><br /><br />

      <label>Clothing:</label><br />
      <select
        value={form.appearance.clothing}
        onChange={(e) =>
          setForm({
            ...form,
            appearance: { ...form.appearance, clothing: e.target.value },
          })
        }
      >
        <option value="cloth">Cloth</option>
        <option value="leather">Leather</option>
        <option value="travel">Traveler Outfit</option>
        <option value="monk">Monk Robe</option>
      </select><br /><br />

      {/* STARTER WEAPON */}
      <label>Starter Weapon:</label><br />
      <select
        value={form.starterWeapon}
        onChange={(e) =>
          setForm({ ...form, starterWeapon: e.target.value })
        }
      >
        <option value="">Select weapon</option>
        {starterWeapons.map((w) => (
          <option key={w}>{w}</option>
        ))}
      </select><br /><br />

      {/* DIVINE BLESSING */}
      <label>Divine Blessing:</label><br />
      <select
        value={form.divineBlessing}
        onChange={(e) =>
          setForm({ ...form, divineBlessing: e.target.value })
        }
      >
        <option value="">None</option>
        <option>Fire</option>
        <option>Water</option>
        <option>Earth</option>
        <option>Wind</option>
        <option>Light</option>
        <option>Shadow</option>
      </select><br /><br />

      {/* STATS */}
      <h3>Stats (Remaining: {remaining})</h3>

      {Object.keys(form.stats).map((stat) => (
        <div key={stat} style={{ marginBottom: 10 }}>
          <strong>{stat.charAt(0).toUpperCase() + stat.slice(1)}:</strong>
          <button onClick={() => changeStat(stat, -1)}>-</button>
          <span style={{ margin: "0 10px" }}>{form.stats[stat]}</span>
          <button onClick={() => changeStat(stat, 1)}>+</button>
        </div>
      ))}

      <br />

      <button onClick={submit}>
        {isEditing ? "Save Changes" : "Create Character"}
      </button>
    </div>
  );
}
