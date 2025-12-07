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
      color: "white",
      fontFamily: "Cinzel, serif"
    }}>
      <h1 style={{ fontSize: "80px", marginBottom: "40px" }}>Lux</h1>

      <button
        onClick={onPlay}
        style={{
          padding: "20px 60px",
          fontSize: "28px",
          cursor: "pointer",
          background: "transparent",
          color: "white",
          border: "2px solid white",
          borderRadius: "10px"
        }}
      >
        Play
      </button>
    </div>
  );
}
