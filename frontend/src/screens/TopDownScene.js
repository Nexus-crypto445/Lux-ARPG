import React, { useRef, useEffect, useState } from "react";

/*
TopDownScene.js
- Props:
  - character: { name, stats: { agility, vitality, intelligence, ... }, ... }
  - onExit(): function called when the player exits
- Self-contained tile map, enemies, HUD, input, and simple combat.
*/

const TILE = 48; // tile size in pixels
const MAP_W = 32;
const MAP_H = 20;

// simple map generator: 0 = floor, 1 = wall
function makeMap() {
  const map = Array.from({ length: MAP_H }, () =>
    Array.from({ length: MAP_W }, () => 0)
  );

  // border walls
  for (let x = 0; x < MAP_W; x++) {
    map[0][x] = 1;
    map[MAP_H - 1][x] = 1;
  }
  for (let y = 0; y < MAP_H; y++) {
    map[y][0] = 1;
    map[y][MAP_W - 1] = 1;
  }

  // random obstacles
  for (let i = 0; i < 90; i++) {
    const rx = Math.floor(Math.random() * (MAP_W - 4)) + 2;
    const ry = Math.floor(Math.random() * (MAP_H - 4)) + 2;
    map[ry][rx] = 1;
    // make a small block sometimes
    if (Math.random() > 0.7) {
      map[Math.max(1, ry - 1)][rx] = 1;
      map[ry][Math.max(1, rx - 1)] = 1;
    }
  }

  return map;
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export default function TopDownScene({ character = {}, onExit = () => {} }) {
  const canvasRef = useRef(null);
  const [map] = useState(() => makeMap());
  const [player, setPlayer] = useState(() => ({
    x: TILE * 5 + TILE / 2,
    y: TILE * 5 + TILE / 2,
    radius: 12,
    hp: 100 + (character.stats?.vitality ?? 0) * 5,
    maxHp: 100 + (character.stats?.vitality ?? 0) * 5,
    stamina: 100,
    maxStamina: 100,
    facing: 0,
    attackCooldown: 0,
  }));

  // simple enemy
  const [enemies, setEnemies] = useState(() => {
    const arr = [];
    for (let i = 0; i < 2; i++) {
      arr.push({
        id: i + 1,
        x: TILE * (10 + i * 4) + TILE / 2,
        y: TILE * (8 + i * 2) + TILE / 2,
        hp: 30,
        radius: 12,
        speed: 0.8,
        state: "idle"
      });
    }
    return arr;
  });

  const keys = useRef({});
  const mouse = useRef({ x: 0, y: 0, down: false });
  const lastTime = useRef(0);
  const camera = useRef({ x: 0, y: 0, w: 800, h: 600 });

  // derive speeds
  const baseSpeed = 1.6 + (character.stats?.agility ?? 0) * 0.06;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // input
    function onKey(e) {
      keys.current[e.key.toLowerCase()] = e.type === "keydown";
    }
    function onMouse(e) {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left + camera.current.x;
      mouse.current.y = e.clientY - rect.top + camera.current.y;
    }
    function onMouseDown(e) {
      mouse.current.down = true;
      onMouse(e);
    }
    function onMouseUp() {
      mouse.current.down = false;
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // game loop
    function step(ts) {
      if (!lastTime.current) lastTime.current = ts;
      const dt = Math.min(40, ts - lastTime.current) / 16.6667; // normalize to ~60fps frame units
      lastTime.current = ts;

      update(dt);
      render(ctx);

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, player, enemies]);

  // update function (mutates refs/state carefully)
  function update(dt) {
    // copy player to mutate
    const p = { ...player };

    // movement input
    let vx = 0;
    let vy = 0;
    if (keys.current["w"] || keys.current["arrowup"]) vy -= 1;
    if (keys.current["s"] || keys.current["arrowdown"]) vy += 1;
    if (keys.current["a"] || keys.current["arrowleft"]) vx -= 1;
    if (keys.current["d"] || keys.current["arrowright"]) vx += 1;

    // sprint (shift) consumes stamina
    const sprinting = keys.current["shift"] && p.stamina > 4;
    let speed = baseSpeed * (sprinting ? 1.9 : 1.0);

    // normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    // apply movement
    let nx = p.x + vx * speed * dt * TILE * 0.25;
    let ny = p.y + vy * speed * dt * TILE * 0.25;

    // collision with map
    if (!tileIsSolidAt(nx, p.y)) p.x = nx;
    if (!tileIsSolidAt(p.x, ny)) p.y = ny;

    // stamina regen/usage
    if (sprinting && (vx !== 0 || vy !== 0)) {
      p.stamina = clamp(p.stamina - 18 * dt, 0, p.maxStamina);
    } else {
      p.stamina = clamp(p.stamina + 10 * dt, 0, p.maxStamina);
    }

    // attack handling
    if (p.attackCooldown > 0) p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    if (mouse.current.down && p.attackCooldown === 0) {
      // perform attack: simple hit circle in front of player
      p.attackCooldown = 18; // cooldown ~18 "dt" units (~300ms)
      // damage to enemies within radius
      const attackRange = 28 + p.radius;
      const ax = mouse.current.x;
      const ay = mouse.current.y;
      setEnemies((prev) => {
        return prev.map((en) => {
          const dx = en.x - p.x;
          const dy = en.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d <= attackRange) {
            // enemy hit
            return { ...en, hp: en.hp - (5 + Math.floor((character.stats?.strength ?? 0) / 2)) };
          }
          return en;
        }).filter(e => e.hp > 0);
      });
    }

    // update facing
    if (vx !== 0 || vy !== 0) p.facing = Math.atan2(vy, vx);

    // update camera to follow
    camera.current.x = p.x - camera.current.w / 2;
    camera.current.y = p.y - camera.current.h / 2;

    // clamp camera
    camera.current.x = clamp(camera.current.x, 0, MAP_W * TILE - camera.current.w);
    camera.current.y = clamp(camera.current.y, 0, MAP_H * TILE - camera.current.h);

    // update enemies AI (chase if player near)
    setEnemies((prev) => {
      const newEnemies = prev.map((en) => {
        const dx = player.x - en.x;
        const dy = player.y - en.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 220) {
          // chase
          const nx = en.x + (dx / dist) * en.speed * dt * TILE * 0.2;
          const ny = en.y + (dy / dist) * en.speed * dt * TILE * 0.2;
          // collision simple
          if (!tileIsSolidAt(nx, en.y)) en.x = nx;
          if (!tileIsSolidAt(en.x, ny)) en.y = ny;
          // if close enough, damage player a bit
          if (dist < 22) {
            p.hp = clamp(p.hp - 6 * dt, 0, p.maxHp);
          }
        } else {
          // idle wander (small)
          if (Math.random() < 0.01) {
            en.x += (Math.random() - 0.5) * 3;
            en.y += (Math.random() - 0.5) * 3;
          }
        }
        return en;
      });
      // remove dead enemies already handled by attack logic
      return newEnemies.filter(e => e.hp > 0);
    });

    // update player into state
    setPlayer(p);
  }

  function tileIsSolidAt(px, py) {
    const col = Math.floor(px / TILE);
    const row = Math.floor(py / TILE);
    if (row < 0 || col < 0 || row >= MAP_H || col >= MAP_W) return true;
    return map[row][col] === 1;
  }

  // drawing
  function render(ctx) {
    const canvas = ctx.canvas;
    // canvas size
    const W = canvas.width = Math.min(window.innerWidth, 1024);
    const H = canvas.height = Math.min(window.innerHeight, 720);
    camera.current.w = W;
    camera.current.h = H;

    // clear
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, W, H);

    // draw tiles
    const startCol = Math.floor(camera.current.x / TILE);
    const startRow = Math.floor(camera.current.y / TILE);
    const cols = Math.ceil(W / TILE) + 1;
    const rows = Math.ceil(H / TILE) + 1;

    for (let r = startRow; r < startRow + rows; r++) {
      for (let c = startCol; c < startCol + cols; c++) {
        const sx = (c * TILE) - camera.current.x;
        const sy = (r * TILE) - camera.current.y;
        if (r < 0 || c < 0 || r >= MAP_H || c >= MAP_W) {
          ctx.fillStyle = "#222";
          ctx.fillRect(sx, sy, TILE, TILE);
          continue;
        }
        const t = map[r][c];
        if (t === 1) {
          ctx.fillStyle = "#334455";
          ctx.fillRect(sx, sy, TILE, TILE);
          // wall detail
          ctx.fillStyle = "#25313a";
          ctx.fillRect(sx + 6, sy + 6, TILE - 12, TILE - 12);
        } else {
          // floor
          ctx.fillStyle = "#1f2b2b";
          ctx.fillRect(sx, sy, TILE, TILE);
        }
      }
    }

    // draw enemies
    enemies.forEach((en) => {
      const ex = en.x - camera.current.x;
      const ey = en.y - camera.current.y;
      ctx.beginPath();
      ctx.fillStyle = "#b04f4f";
      ctx.arc(ex, ey, en.radius, 0, Math.PI * 2);
      ctx.fill();
      // hp bar
      ctx.fillStyle = "#222";
      ctx.fillRect(ex - 16, ey - en.radius - 10, 32, 6);
      ctx.fillStyle = "#f55";
      const hpPct = Math.max(0, Math.min(1, en.hp / 30));
      ctx.fillRect(ex - 16, ey - en.radius - 10, 32 * hpPct, 6);
    });

    // draw player
    const px = player.x - camera.current.x;
    const py = player.y - camera.current.y;
    ctx.beginPath();
    ctx.fillStyle = "#8ee";
    ctx.arc(px, py, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // draw player facing indicator
    ctx.strokeStyle = "#0ff";
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(player.facing) * (player.radius + 18), py + Math.sin(player.facing) * (player.radius + 18));
    ctx.stroke();

    // HUD (fixed to screen)
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(12, 12, 250, 68);

    // name
    ctx.fillStyle = "#fff";
    ctx.font = "16px sans-serif";
    ctx.fillText(character.name || "Unnamed", 22, 34);

    // HP bar
    const hpW = 200;
    const hpPct = player.hp / player.maxHp;
    ctx.fillStyle = "#222";
    ctx.fillRect(22, 40, hpW, 12);
    ctx.fillStyle = "#f55";
    ctx.fillRect(22, 40, hpW * hpPct, 12);

    // Stamina bar
    const stPct = player.stamina / player.maxStamina;
    ctx.fillStyle = "#222";
    ctx.fillRect(22, 56, hpW, 8);
    ctx.fillStyle = "#f5d65c";
    ctx.fillRect(22, 56, hpW * stPct, 8);

    // mini instructions
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "12px sans-serif";
    ctx.fillText("WASD / Arrows to move • Hold SHIFT to sprint • Click to attack • Esc to exit", 22, H - 18);
  }

  // keyboard exit (Esc)
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onExit]);

  return (
    <div style={{ width: "100%", height: "100%", background: "#000" }}>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          margin: "0 auto",
          background: "#000",
          border: "0",
          width: "100%",
          maxWidth: 1024,
          height: "calc(100vh - 0px)",
        }}
      />
      {/* simple overlay controls for mobile hint */}
      <div style={{ position: "fixed", left: 12, bottom: 12, color: "white", fontSize: 12 }}>
        HP: {Math.floor(player.hp)} / {player.maxHp} • Stamina: {Math.floor(player.stamina)}
      </div>
    </div>
  );
}
