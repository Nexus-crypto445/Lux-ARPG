import React from "react";

export default function MainMenu({ onStart }) {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ fontSize: "48px", marginBottom: "40px" }}>Lux</h1>

      <button
        onClick={onStart}
        style={{
          padding: "14px 32px",
          fontSize: "20px",
          border: "2px solid white",
          background: "transparent",
          color: "white",
          cursor: "pointer",
        }}
      >
        Play
      </button>
    </div>
  );
}
