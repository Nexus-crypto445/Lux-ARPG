import React, { useEffect, useState, useRef } from "react";
import { createCharacter } from "../api/characters";

/*
  CharacterCreation.js
  - full-body front-facing preview (canvas)
  - menu controls (race, hair, clothes, starter weapon)
  - detailed sliders for facial features
  - base stats (5 each) + 2 free stat points (must spend all to save)
  - level locked to 1, subclass locked to null/"None"
  - calls createCharacter(payload) from ../api/characters
  - props:
    - onSaved(createdCharacter)  // optional callback after successful save
*/

const RACES = ["Human", "Elf", "Dwarf", "Orc", "Halfling", "Tiefling", "Aasimar"];
const HAIRSTYLES = ["Short", "Long", "Ponytail", "Braids", "Bald", "Topknot", "Curly"];
const FACETYPES = ["Soft", "Angular", "Rugged", "Youthful", "Elder"];
const BODY_TYPES = ["Slim", "Average", "Muscular", "Stocky"];
const CLOTHING_BASE = {
  Warrior: ["Leather Tunic", "Simple Mail", "Traveler's Garb"],
  Mage: ["Cloth Robe", "Acolyte Robe", "Traveler's Garb"],
  Rogue: ["Leather Jacket", "Hooded Cloak", "Traveler's Garb"],
  Ranger: ["Archer's Jerkin", "Traveler's Garb", "Leather Tunic"],
  Cleric: ["Initiate Vestments", "Cleric Robe", "Traveler's Garb"]
};

// physical starters + magic starters (added many)
const STARTER_WEAPONS = [
  // Physical
  { id: "whip", name: "Whip", type: "physical", atk: 4 },
  { id: "bow", name: "Short Bow", type: "physical", atk: 4 },
  { id: "dagger", name: "Dagger", type: "physical", atk: 3 },
  { id: "pistol", name: "Flint Pistol", type: "physical", atk: 5 },
  { id: "great_axe", name: "Great Axe", type: "physical", atk: 6 },
  { id: "axe", name: "Hand Axe", type: "physical", atk: 5 },
  { id: "wooden_katana", name: "Wooden Katana", type: "physical", atk: 5 },
  { id: "staff_basic", name: "Wooden Staff", type: "physical", atk: 3 },
  { id: "spear", name: "Training Spear", type: "physical", atk: 4 },
  { id: "mace", name: "Rusted Mace", type: "physical", atk: 4 },

  // Magic / Tomes (15 examples)
  { id: "grimoire_basic", name: "Arcane Grimoire", type: "magic", atk: 3 },
  { id: "wand_flame", name: "Flame Wand", type: "magic", atk: 4 },
  { id: "wand_frost", name: "Frost Wand", type: "magic", atk: 4 },
  { id: "scepter_light", name: "Light Scepter", type: "magic", atk: 4 },
  { id: "shadow_orb", name: "Shadow Orb", type: "magic", atk: 4 },
  { id: "nature_staff", name: "Nature Staff", type: "magic", atk: 3 },
  { id: "crystal_tome", name: "Crystal Tome", type: "magic", atk: 4 },
  { id: "soul_lantern", name: "Soul Lantern", type: "magic", atk: 4 },
  { id: "gravity_orb", name: "Gravity Orb", type: "magic", atk: 5 },
  { id: "necrotome", name: "Necro Tome", type: "magic", atk: 4 },
  { id: "spirit_rod", name: "Spirit Rod", type: "magic", atk: 3 },
  { id: "storm_wand", name: "Storm Wand", type: "magic", atk: 4 },
  { id: "blood_tome", name: "Blood Grimoire", type: "magic", atk: 4 },
  { id: "illusion_rod", name: "Illusion Rod", type: "magic", atk: 3 },
  { id: "arcane_staff", name: "Arcane Staff", type: "magic", atk: 5 }
];

// Divine blessings
const BLESSINGS = [
  { id: "valor", name: "Blessing of Valor", desc: "+8% attack speed" },
  { id: "knowledge", name: "Blessing of Knowledge", desc: "+12% XP gain" },
  { id: "shadows", name: "Blessing of Shadows", desc: "+6% dodge chance" },
  { id: "flame", name: "Blessing of Flame", desc: "+3 fire damage on hit" },
  { id: "fortune", name: "Blessing of Fortune", desc: "+8% loot quality" },
];

// Stat system (Option C): base 5, 2 free points
const BASE_STAT = 5;
const FREE_POINTS = 2;

export default function CharacterCreation({ onSaved }) {
  // Basic
  const [name, setName] = useState("");
  const [charClass, setCharClass] = useState("Warrior");

  // Appearance
  const [race, setRace] = useState(RACES[0]);
  const [skinColor, setSkinColor] = useState("#f2d7c9");
  const [eyeColor, setEyeColor] = useState("#2b2b2b");
  const [hairStyle, setHairStyle] = useState(HAIRSTYLES[0]);
  const [hairColor, setHairColor] = useState("#301a0f");
  const [faceType, setFaceType] = useState(FACETYPES[0]);
  const [bodyType, setBodyType] = useState(BODY_TYPES[1]);

  // Detailed facial sliders
  const [jawWidth, setJawWidth] = useState(0.5); // 0..1
  const [noseHeight, setNoseHeight] = useState(0.5);
  const [eyeSize, setEyeSize] = useState(0.5);
  const [browAngle, setBrowAngle] = useState(0.5);

  // Stats
  const [stats, setStats] = useState({
    strength: BASE_STAT,
    agility: BASE_STAT,
    vitality: BASE_STAT,
    intelligence: BASE_STAT
  });
  const [pointsLeft, setPointsLeft] = useState(FREE_POINTS);

  // Equipment & blessing
  const [clothing, setClothing] = useState(CLOTHING_BASE[charClass][0]);
  const [weaponId, setWeaponId] = useState(STARTER_WEAPONS[0].id);
  const [blessing, setBlessing] = useState(BLESSINGS[0].id);

  // preview ref
  const canvasRef = useRef(null);

  // when class changes, set clothing default
  useEffect(() => {
    setClothing((CLOTHING_BASE[charClass] || ["Traveler's Garb"])[0]);
  }, [charClass]);

  // Stat adjustments
  function changeStat(stat, delta) {
    if (delta > 0 && pointsLeft <= 0) return;
    if (delta < 0 && stats[stat] <= BASE_STAT) return;
    setStats(prev => ({ ...prev, [stat]: Math.max(BASE_STAT, prev[stat] + delta) }));
    setPointsLeft(prev => prev - delta);
  }

  // Preview renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width = 220;
    const h = canvas.height = 360;

    // clear
    ctx.clearRect(0,0,w,h);
    // background
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,w,h);

    // draw body (simple shapes)
    const bodyX = w/2;
    const bodyY = h/2 + 20;

    // body size by bodyType
    const sizeMap = { Slim: 0.9, Average: 1.0, Muscular: 1.12, Stocky: 1.18 };
    const bodyScale = sizeMap[bodyType] || 1.0;

    // skin
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY - 30, 26*bodyScale, 36*bodyScale, 0, 0, Math.PI*2);
    ctx.fill();

    // neck
    ctx.fillStyle = skinColor;
    ctx.fillRect(bodyX-8, bodyY-10, 16, 12);

    // torso (clothing)
    ctx.fillStyle = "#444";
    // clothing color derived from class
    const classColor = {
      Warrior: "#7b4d3b",
      Mage: "#3b4f8a",
      Rogue: "#2b2b2b",
      Ranger: "#3b6a3b",
      Cleric: "#7b5a9a"
    }[charClass] || "#444";
    ctx.fillStyle = classColor;
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY + 28, 34*bodyScale, 44*bodyScale, 0, 0, Math.PI*2);
    ctx.fill();

    // hair (top)
    ctx.fillStyle = hairColor;
    if (hairStyle === "Bald") {
      // no hair
    } else if (hairStyle === "Short") {
      ctx.fillRect(bodyX-26, bodyY-68, 52, 18);
    } else if (hairStyle === "Long") {
      ctx.fillRect(bodyX-30, bodyY-78, 60, 40);
    } else if (hairStyle === "Ponytail") {
      ctx.fillRect(bodyX-26, bodyY-68, 52, 18);
      ctx.beginPath(); ctx.ellipse(bodyX+22, bodyY-48, 10, 18, 0, 0, Math.PI*2); ctx.fill();
    } else if (hairStyle === "Braids") {
      ctx.fillRect(bodyX-26, bodyY-68, 52, 18);
      ctx.fillRect(bodyX-30, bodyY-40, 10, 30);
      ctx.fillRect(bodyX+20, bodyY-40, 10, 30);
    } else if (hairStyle === "Topknot") {
      ctx.fillRect(bodyX-26, bodyY-68, 52, 18);
      ctx.beginPath(); ctx.ellipse(bodyX, bodyY-86, 12, 12, 0, 0, Math.PI*2); ctx.fill();
    } else {
      ctx.fillRect(bodyX-26, bodyY-68, 52, 18);
    }

    // eyes - position influenced by jawWidth / eyeSize
    const eyeSz = 4 + (eyeSize - 0.5) * 6;
    const eyeOffsetX = 14 - (jawWidth - 0.5) * 6;
    const eyeY = bodyY - 44 - (noseHeight - 0.5) * 4;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.ellipse(bodyX - eyeOffsetX, eyeY, eyeSz, eyeSz, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bodyX + eyeOffsetX, eyeY, eyeSz, eyeSz, 0, 0, Math.PI*2); ctx.fill();
    // pupils
    ctx.fillStyle = eyeColor;
    ctx.beginPath(); ctx.ellipse(bodyX - eyeOffsetX, eyeY, eyeSz/2, eyeSz/2, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(bodyX + eyeOffsetX, eyeY, eyeSz/2, eyeSz/2, 0, 0, Math.PI*2); ctx.fill();

    // nose
    ctx.fillStyle = "#d2b48c";
    ctx.fillRect(bodyX - 3, bodyY - 40 + (noseHeight - 0.5) * 6, 6, 8);

    // mouth (slight changes by faceType)
    ctx.fillStyle = "#9a5a4a";
    if (faceType === "Soft") {
      ctx.fillRect(bodyX - 8, bodyY - 24, 16, 4);
    } else if (faceType === "Angular") {
      ctx.fillRect(bodyX - 8, bodyY - 26, 16, 3);
    } else if (faceType === "Rugged") {
      ctx.fillRect(bodyX - 9, bodyY - 22, 18, 5);
    } else if (faceType === "Youthful") {
      ctx.fillRect(bodyX - 6, bodyY - 23, 12, 3);
    } else {
      ctx.fillRect(bodyX - 7, bodyY - 24, 14, 4);
    }

    // small chest / clothing details
    ctx.fillStyle = "#111";
    ctx.fillRect(bodyX - 10, bodyY + 6, 20, 6);

    // weapon icon (small)
    const wpn = STARTER_WEAPONS.find(w => w.id === weaponId);
    ctx.fillStyle = "#ccc";
    ctx.fillRect(bodyX + 24, bodyY + 20, 10, 30); // simplistic shaft
    if (wpn && wpn.type === "magic") {
      // magic orb on top
      ctx.fillStyle = "#8ee";
      ctx.beginPath(); ctx.arc(bodyX + 29, bodyY + 14, 8, 0, Math.PI*2); ctx.fill();
    } else {
      // blade / head
      ctx.fillStyle = "#aaa";
      ctx.fillRect(bodyX + 20, bodyY + 8, 18, 6);
    }

    // hair highlight
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#fff";
    ctx.fillRect(bodyX-20, bodyY-78, 12, 8);
    ctx.globalAlpha = 1.0;

    // small name label
    ctx.fillStyle = "#fff";
    ctx.font = "12px sans-serif";
    ctx.fillText(name || "Unnamed", 12, h - 12);
  }, [
    name, race, skinColor, eyeColor, hairStyle, hairColor,
    faceType, bodyType, jawWidth, noseHeight, eyeSize, browAngle,
    charClass, clothing, weaponId
  ]);

  // Save handler
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    if (!name || name.trim().length < 1) {
      setMessage("Please enter a name.");
      return;
    }
    if (pointsLeft !== 0) {
      setMessage(`You must spend all ${FREE_POINTS} free stat points before saving. (${pointsLeft} left)`);
      return;
    }

    const appearance = {
      race,
      skinColor,
      eyeColor,
      hairStyle,
      hairColor,
      faceType,
      bodyType,
      facialSliders: { jawWidth, noseHeight, eyeSize, browAngle }
    };

    const equipment = {
      armor: clothing,
      weapon: STARTER_WEAPONS.find(w => w.id === weaponId) || null
    };

    const payload = {
      name: name.trim(),
      class: charClass,
      subclass: null,
      level: 1,
      appearance,
      equipment,
      divineBlessing: BLESSINGS.find(b => b.id === blessing)?.id || null,
      stats,
      createdAt: new Date().toISOString()
    };

    try {
      setBusy(true);
      setMessage("");
      const created = await createCharacter(payload);
      setMessage("Character saved!");
      if (typeof onSaved === "function") onSaved(created);
    } catch (err) {
      console.error(err);
      setMessage("Save failed. Check console.");
    } finally {
      setBusy(false);
    }
  };

  // Points left recalculation if stats change externally
  useEffect(() => {
    const used = (stats.strength + stats.agility + stats.vitality + stats.intelligence) - (BASE_STAT * 4);
    setPointsLeft(FREE_POINTS - used);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.strength, stats.agility, stats.vitality, stats.intelligence]);

  return (
    <div style={{ display: "flex", gap: 16, padding: 14, color: "white", fontFamily: "sans-serif" }}>
      {/* Left: preview + summary */}
      <div style={{ width: 260 }}>
        <canvas ref={canvasRef} width={220} height={360} style={{ border: "1px solid #333", background: "#111", display: "block" }} />
        <div style={{ marginTop: 8 }}>
          <strong>{name || "Unnamed"}</strong>
          <div>{charClass} · Level 1</div>
          <div style={{ marginTop: 6 }}>Blessing: {BLESSINGS.find(b => b.id === blessing)?.name}</div>
          <div style={{ marginTop: 6 }}>
            <strong>Weapon:</strong> {STARTER_WEAPONS.find(w => w.id === weaponId)?.name}
          </div>
        </div>
      </div>

      {/* Right: controls */}
      <div style={{ flex: 1 }}>
        <h2>Create Character</h2>

        {/* Basic */}
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: "block" }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: 6 }} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Class</label>
            <select value={charClass} onChange={e => setCharClass(e.target.value)} style={{ width: "100%", padding: 6 }}>
              <option>Warrior</option>
              <option>Mage</option>
              <option>Rogue</option>
              <option>Ranger</option>
              <option>Cleric</option>
            </select>
          </div>

          <div style={{ width: 160 }}>
            <label>Clothing</label>
            <select value={clothing} onChange={e => setClothing(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {(CLOTHING_BASE[charClass] || ["Traveler's Garb"]).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Appearance */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div>
            <label>Race</label>
            <select value={race} onChange={e => setRace(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {RACES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label>Skin Color</label>
            <input type="color" value={skinColor} onChange={e => setSkinColor(e.target.value)} style={{ width: "100%", padding: 6 }} />
          </div>

          <div>
            <label>Hair Style</label>
            <select value={hairStyle} onChange={e => setHairStyle(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {HAIRSTYLES.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>

          <div>
            <label>Hair Color</label>
            <input type="color" value={hairColor} onChange={e => setHairColor(e.target.value)} style={{ width: "100%", padding: 6 }} />
          </div>

          <div>
            <label>Eye Color</label>
            <input type="color" value={eyeColor} onChange={e => setEyeColor(e.target.value)} style={{ width: "100%", padding: 6 }} />
          </div>

          <div>
            <label>Face Type</label>
            <select value={faceType} onChange={e => setFaceType(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {FACETYPES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>

          <div>
            <label>Body Type</label>
            <select value={bodyType} onChange={e => setBodyType(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {BODY_TYPES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Facial sliders */}
        <div style={{ marginTop: 12 }}>
          <h4>Facial Details</h4>
          <div>
            <label>Jaw width</label>
            <input type="range" min="0" max="1" step="0.01" value={jawWidth} onChange={e => setJawWidth(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div>
            <label>Nose height</label>
            <input type="range" min="0" max="1" step="0.01" value={noseHeight} onChange={e => setNoseHeight(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div>
            <label>Eye size</label>
            <input type="range" min="0" max="1" step="0.01" value={eyeSize} onChange={e => setEyeSize(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div>
            <label>Brow angle</label>
            <input type="range" min="0" max="1" step="0.01" value={browAngle} onChange={e => setBrowAngle(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 12 }}>
          <h4>Stats (Base {BASE_STAT} each)</h4>
          <div>Free points left: <strong>{pointsLeft}</strong> (must spend all)</div>
          {Object.keys(stats).map(k => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ flex: 1, textTransform: "capitalize" }}>{k}: {stats[k]}</div>
              <div>
                <button onClick={() => changeStat(k, -1)} disabled={stats[k] <= BASE_STAT}>-</button>
                <button onClick={() => changeStat(k, +1)} disabled={pointsLeft <= 0}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* Weapon and Blessing */}
        <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Starter Weapon</label>
            <select value={weaponId} onChange={e => setWeaponId(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {STARTER_WEAPONS.map(w => <option key={w.id} value={w.id}>{w.name} {w.type === "magic" ? "(magic)" : ""}</option>)}
            </select>
          </div>

          <div style={{ width: 220 }}>
            <label>Divine Blessing</label>
            <select value={blessing} onChange={e => setBlessing(e.target.value)} style={{ width: "100%", padding: 6 }}>
              {BLESSINGS.map(b => <option key={b.id} value={b.id}>{b.name} — {b.desc}</option>)}
            </select>
          </div>
        </div>

        {/* Save */}
        <div style={{ marginTop: 12 }}>
          <button onClick={handleSave} disabled={busy} style={{ padding: "10px 16px", fontSize: 16 }}>
            {busy ? "Saving..." : "Create Character"}
          </button>
          <div style={{ marginTop: 8, color: "#ffb4b4" }}>{message}</div>
        </div>
      </div>
    </div>
  );
}
