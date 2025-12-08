import React from "react";

export default function MainMenu({ onPlay }) {
  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#000",
      color: "#fff",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ fontSize: 64, marginBottom: 32 }}>Lux</h1>

      <button
        onClick={onPlay}
        style={{
          padding: "14px 28px",
          fontSize: 20,
          cursor: "pointer",
          border: "2px solid white",
          background: "transparent",
          color: "white",
          borderRadius: 8
        }}
      >
        Play
      </button>
    </div>
  );
}
