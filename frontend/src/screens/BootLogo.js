import React, { useEffect } from "react";

export default function BootLogo({ onContinue }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 1600); // quick logo

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#000",
      color: "#fff",
      fontFamily: "Cinzel, serif",
      letterSpacing: "8px",
      fontSize: 72,
    }}>
      Lux
    </div>
  );
}
