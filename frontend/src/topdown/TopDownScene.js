import React, { useEffect, useRef } from "react";
import { worldMap } from "./worldMap";

export default function TopDownScene({ character }) {
  const canvasRef = useRef(null);
  const tileSize = 40;

  useEffect(() => {

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let x = 300;
    let y = 300;
    const moveSpeed = 2 + character.stats.agility * 0.2;

    const keys = {};
    window.addEventListener("keydown", e => keys[e.key] = true);
    window.addEventListener("keyup", e => keys[e.key] = false);

    function drawMap() {
      for (let row = 0; row < worldMap.length; row++) {
        for (let col = 0; col < worldMap[row].length; col++) {
          const tile = worldMap[row][col];

          if (tile === 1) {
            ctx.fillStyle = "#444"; // wall
          } else if (tile === 2) {
            ctx.fillStyle = "#2e8b57"; // grass
          } else if (tile === 3) {
            ctx.fillStyle = "#1e90ff"; // water
          } else {
            ctx.fillStyle = "#777"; // ground
          }

          ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
        }
      }
    }

    function checkCollision(nx, ny) {
      const col = Math.floor(nx / tileSize);
      const row = Math.floor(ny / tileSize);

      if (worldMap[row] && worldMap[row][col] === 1) return true;
      return false;
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawMap();

      let nx = x;
      let ny = y;

      if (keys["w"] || keys["ArrowUp"]) ny -= moveSpeed;
      if (keys["s"] || keys["ArrowDown"]) ny += moveSpeed;
      if (keys["a"] || keys["ArrowLeft"]) nx -= moveSpeed;
      if (keys["d"] || keys["ArrowRight"]) nx += moveSpeed;

      // Prevent moving into walls
      if (!checkCollision(nx, y)) x = nx;
      if (!checkCollision(x, ny)) y = ny;

      // Draw player
      ctx.fillStyle = "cyan";
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(loop);
    }

    loop();
  }, [character]);

  return (
    <div style={{ textAlign: "center" }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        style={{ border: "2px solid white", background: "#111" }}
      />
    </div>
  );
}

