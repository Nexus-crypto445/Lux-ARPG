import React from "react";

export default function MainMenu({ onPlay }) {
  return (
    <div
      style={{
        height: "100vh",
        background: "#000",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <h1 style={{ fontSize: 60, marginBottom: 40 }}>LUX</h1>

      <button
        onClick={onPlay}
        style={{
          padding: "14px 40px",
          fontSize: 24,
          cursor: "pointer",
          background: "white",
          color: "black",
          border: "none",
          borderRadius: 8
        }}
      >
        Play
      </button>
    </div>
  );
}
