import React, { useEffect } from "react";
import "./boot.css"; // optional

export default function BootLogo({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "90px",
          color: "white",
          fontFamily: "serif",
          letterSpacing: "10px",
        }}
      >
        LUX
      </h1>
    </div>
  );
}
