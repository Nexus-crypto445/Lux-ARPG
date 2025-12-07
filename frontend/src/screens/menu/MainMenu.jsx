import React from "react";

export default function MainMenu({ onPlay }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <h1
        style={{
          fontSize: 70,
          marginBottom: 40,
          fontFamily: "serif",
          letterSpacing: "6px",
        }}
      >
        LUX
      </h1>

      <button
        onClick={onPlay}
        style={{
          padding: "15px 40px",
          fontSize: 24,
          background: "transparent",
          border: "2px solid white",
          color: "white",
          cursor: "pointer",
        }}
      >
        PLAY
      </button>
    </div>
  );
}
