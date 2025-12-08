import React, { useEffect } from "react";

export default function BootLogo({ onContinue }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2000); // 2 seconds logo

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div style={{
      background: "black",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      color: "white",
      fontSize: "5rem",
      fontFamily: "serif",
      letterSpacing: "10px"
    }}>
      Lux
    </div>
  );
}
