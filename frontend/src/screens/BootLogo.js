import React, { useEffect } from "react";

export default function BootLogo({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div style={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "black",
      color: "white",
      fontSize: "64px",
      fontWeight: "bold",
      fontFamily: "'Cinzel', serif",
      letterSpacing: "6px",
    }}>
      Lux
    </div>
  );
}
