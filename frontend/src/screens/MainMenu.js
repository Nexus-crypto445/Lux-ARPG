import React from "react";

export default function MainMenu({ onPlay }) {
  return (
    <div style={{
      height: "100vh",
      background: "black",
      color: "white",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <h1 style={{ fontSize: "4rem", marginBottom: 40 }}>Lux</h1>

      <button
        onClick={onPlay}
        style={{
          padding: "12px 28px",
          fontSize: "1.5rem",
          cursor: "pointer",
          borderRadius: 8,
          border: "2px solid white",
          background: "transparent",
          color: "white"
        }}
      >
        Play
      </button>
    </div>
  );
}
