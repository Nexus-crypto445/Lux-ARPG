import React, { useEffect } from "react";
import "./boot.css";

export default function BootLogo({ onContinue }) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 2200);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="boot-container">
      <h1 className="boot-text">L U X</h1>
    </div>
  );
}
