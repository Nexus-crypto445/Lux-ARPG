import React, { useEffect, useRef, useState } from "react";
import { fetchCharacters } from "../api/characters";

/*
  TopDownScene:
  - loads a character (object with stats)
  - computes derived stats: HP, Mana, Speed, Attack
  - spawns simple enemies that roam, detect, chase, and attack
  - basic combat: damage reduces HP, death handled, respawn after delay
  - ESC or Exit button will call onExit()
*/

function computeDerivedStats(char) {
  // Expect char.stats like { str, dex, con, int, wis, cha } OR flattened props
  const s = char.stats || {
    str: char.str || 8,
    dex: char.dex || 8,
    con: char.con || 8,
    int: char.int || 8,
    wis: char.wis || 8,
    cha: char.cha || 8,
  };

  const hp = Math.max(10, 20 + s.con * 5);           // base HP scaled by CON
  const mana = Math.max(0, s.int * 3);               // mana from INT
  const speed = 1.5 + (s.dex / 25);                  // movement speed influenced by DEX
  const attack = Math.max(1, Math.round(s.str * 1.5)); // damage scale with STR

  return { hp, mana, speed, attack };
}

export default function TopDownScene({ characterId, character: passedCharacter, onExit }) {
  const canvasRef = useRef(null);
  const [character, setCharacter] = useState(passedCharacter || null);
  const [log, setLog] = useState([]);
  const enemiesRef = useRef([]);
  const gameRef = useRef({ running: true });

  useEffect(() => {
    if (!passedCharacter && characterId) {
      fetchCharacters().then(chars => {
        const found = chars.find(c => String(c.id) === String(characterId));
        setCharacter(found || null);
      });
    }
  }, [characterId, passedCharacter]);

  useEffect(() => {
    if (!character) return;
    const derived = computeDerivedStats(character);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 900;
    canvas.height = 600;

    // player state
    const player = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 18,
      maxHp: derived.hp,
      hp: derived.hp,
      mana: derived.mana,
      speed: derived.speed * 2.0, // scale for feel
      attack: derived.attack,
      alive: true,
      invulnUntil: 0,
    };

    // enemies
    const enemies = [];
    enemiesRef.current = enemies;

    // simple world bounds
    const world = { w: canvas.width, h: canvas.height };

    // spawn N enemies with simple AI
    function spawnEnemies(n = 4) {
      for (let i = 0; i < n; i++) {
        const e = {
          id: "e" + Date.now() + "_" + i,
          x: Math.random() * world.w,
          y: Math.random() * world.h,
          vx: 0,
          vy: 0,
          radius: 14,
          hp: 10 + Math.round(Math.random() * 20),
          state: "roam", // roam | chase | attack | dead
          speed: 0.75 + Math.random() * 0.9,
          targetLostAt: 0,
          respawnAt: 0
        };
        enemies.push(e);
      }
    }

    spawnEnemies(4);

    // input handling
    const keys = {};
    function down(e) { keys[e.key.toLowerCase()] = true; }
    function up(e) { keys[e.key.toLowerCase()] = false; }
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    // helpers
    function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }

    // player attack cooldown
    let lastAttackAt = 0;
    const attackCooldown = 400; // ms

    // attack function (player attack)
    function playerAttack() {
      const now = performance.now();
      if (now - lastAttackAt < attackCooldown) return;
      lastAttackAt = now;

      // damage enemies within range
      enemies.forEach(e => {
        if (e.state === "dead") return;
        const d = dist(player, e);
        if (d <= player.radius + e.radius + 8) {
          e.hp -= player.attack;
          pushLog(`Hit enemy ${e.id} for ${player.attack} dmg`);
          if (e.hp <= 0) {
            e.state = "dead";
            e.respawnAt = performance.now() + 5000 + Math.random()*5000;
            pushLog(`Enemy ${e.id} died`);
          }
        }
      });
    }

    // enemy attack to player
    function enemyAttack(enemy) {
      if (!player.alive) return;
      // simple melee damage
      const dmg = 2 + Math.round(Math.random()*3);
      player.hp -= dmg;
      pushLog(`Player hit for ${dmg} dmg`);
      if (player.hp <= 0) {
        player.alive = false;
        pushLog("Player died — respawning in 3s");
        setTimeout(()=> {
          player.hp = player.maxHp;
          player.alive = true;
          player.x = canvas.width/2; player.y = canvas.height/2;
          pushLog("Player respawned");
        }, 3000);
      }
    }

    function pushLog(s) {
      setLog(prev => [s, ...prev].slice(0, 6));
    }

    // update loop
    let last = performance.now();
    function step(now) {
      if (!gameRef.current.running) return;
      const dt = Math.min(50, now - last);
      last = now;

      // movement input
      let vx = 0, vy = 0;
      if (keys.w || keys["arrowup"]) vy -= 1;
      if (keys.s || keys["arrowdown"]) vy += 1;
      if (keys.a || keys["arrowleft"]) vx -= 1;
      if (keys.d || keys["arrowright"]) vx += 1;
      const len = Math.sqrt(vx*vx + vy*vy) || 1;
      player.x += (vx/len) * player.speed * (dt/16);
      player.y += (vy/len) * player.speed * (dt/16);

      // keep in bounds
      player.x = Math.max(player.radius, Math.min(world.w - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(world.h - player.radius, player.y));

      // enemies AI
      enemies.forEach(e => {
        if (e.state === "dead") {
          // respawn timer
          if (performance.now() >= e.respawnAt) {
            e.hp = 10 + Math.round(Math.random()*15);
            e.state = "roam";
            e.x = Math.random() * world.w;
            e.y = Math.random() * world.h;
            pushLog(`Enemy ${e.id} respawned`);
          }
          return;
        }

        // distance to player
        const d = Math.hypot(player.x - e.x, player.y - e.y);

        // detection radius
        const detection = 120;

        if (d < detection && player.alive) {
          // chase or attack
          if (d <= player.radius + e.radius + 10) {
            // attack
            if (!e.lastAttackAt || performance.now() - e.lastAttackAt > 800) {
              e.lastAttackAt = performance.now();
              enemyAttack(e);
            }
            e.state = "attack";
            e.vx = 0; e.vy = 0;
          } else {
            // chase
            e.state = "chase";
            const dx = (player.x - e.x), dy = (player.y - e.y);
            const r = Math.hypot(dx, dy) || 1;
            e.vx = (dx / r) * e.speed;
            e.vy = (dy / r) * e.speed;
          }
        } else {
          // roam behavior
          if (e.state !== "roam") {
            e.state = "roam";
            e.roamUntil = performance.now() + 1000 + Math.random()*3000;
            // pick random direction
            const ang = Math.random() * Math.PI * 2;
            e.vx = Math.cos(ang) * e.speed;
            e.vy = Math.sin(ang) * e.speed;
          } else {
            // occasionally change direction
            if (!e.roamUntil || performance.now() > e.roamUntil) {
              e.roamUntil = performance.now() + 1000 + Math.random()*3000;
              const ang = Math.random() * Math.PI * 2;
              e.vx = Math.cos(ang) * e.speed;
              e.vy = Math.sin(ang) * e.speed;
            }
          }
        }

        // move and keep in bounds
        e.x += e.vx * (dt/16);
        e.y += e.vy * (dt/16);
        e.x = Math.max(e.radius, Math.min(world.w - e.radius, e.x));
        e.y = Math.max(e.radius, Math.min(world.h - e.radius, e.y));
      });

      // render
      ctx.clearRect(0,0, canvas.width, canvas.height);
      // background
      ctx.fillStyle = "#0c0f13";
      ctx.fillRect(0,0, canvas.width, canvas.height);

      // draw enemies
      enemies.forEach(e => {
        if (e.state === "dead") {
          // faint ghost circle to indicate dead
          ctx.fillStyle = "rgba(100,100,100,0.15)";
          ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
        } else {
          ctx.fillStyle = "#f55";
          ctx.beginPath(); ctx.arc(e.x, e.y, e.radius, 0, Math.PI*2); ctx.fill();
          // hp bar
          ctx.fillStyle = "#222";
          ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, e.radius*2, 5);
          ctx.fillStyle = "lime";
          const hpPct = Math.max(0, e.hp) / 30;
          ctx.fillRect(e.x - e.radius, e.y - e.radius - 8, e.radius*2 * hpPct, 5);
        }
      });

      // draw player
      if (player.alive) {
        ctx.fillStyle = "#4af";
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2); ctx.fill();
      } else {
        ctx.fillStyle = "#444";
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius, 0, Math.PI*2); ctx.fill();
      }

      // player HP bar
      ctx.fillStyle = "#222";
      ctx.fillRect(16, 16, 200, 18);
      ctx.fillStyle = "#e74c3c";
      const hpPct = Math.max(0, player.hp) / player.maxHp;
      ctx.fillRect(16, 16, 200 * hpPct, 18);
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(`HP: ${Math.max(0, Math.round(player.hp))} / ${player.maxHp}`, 18, 28);

      // info
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "12px monospace";
      ctx.fillText(`Attack: ${player.attack}  Speed: ${player.speed.toFixed(2)}`, 16, 54);

      // request next frame
      requestAnimationFrame(step);
    }

    // allow click / space to attack
    function onClick(e) {
      playerAttack();
    }
    function onKey(e) {
      if (e.key === " ") {
        playerAttack();
      }
      if (e.key === "Escape") {
        // exit
        if (typeof onExit === "function") onExit();
      }
    }
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    // playerAttack closure (moved here so functions can reference it)
    function playerAttack() {
      const now = performance.now();
      if (now - (player.lastAttackAt || 0) < 400) return;
      player.lastAttackAt = now;
      // damage close enemies
      enemies.forEach(e => {
        if (e.state === "dead") return;
        const d = Math.hypot(player.x - e.x, player.y - e.y);
        if (d <= player.radius + e.radius + 8) {
          e.hp -= player.attack + Math.round(Math.random()*2);
          pushLog(`Damaged ${e.id} (${e.hp})`);
          if (e.hp <= 0) {
            e.state = "dead"; e.respawnAt = performance.now() + 5000 + Math.random()*7000;
            pushLog(`${e.id} died`);
          }
        }
      });
    }

    function pushLog(s) {
      setLog(prev => [s, ...prev].slice(0,6));
    }

    // start the loop
    last = performance.now();
    requestAnimationFrame(step);

    // cleanup on unmount
    return () => {
      gameRef.current.running = false;
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [character, onExit]);

  if (!character) return <div style={{ padding: 20, color: "white" }}>Loading character...</div>;

  return (
    <div style={{ color: "white", padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Playing: {character.name}</h2>
        <div>
          <button onClick={() => { if (typeof onExit === "function") onExit(); }}>Exit</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <canvas ref={canvasRef} style={{ border: "2px solid #333", background: "#08090a" }} />
        <div style={{ width: 260 }}>
          <h4>Recent events</h4>
          <div style={{ minHeight: 120 }}>
            {log.map((l, i) => <div key={i} style={{ fontSize: 12 }}>{l}</div>)}
          </div>
          <div style={{ marginTop: 12 }}>
            <div>Use WASD or Arrow keys to move. Click or Space to attack.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
