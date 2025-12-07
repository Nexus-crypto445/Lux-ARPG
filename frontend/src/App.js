import React, { useState } from "react";
import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";

export default function App() {
  const [phase, setPhase] = useState("boot"); // boot → menu → slots

  if (phase === "boot") return <BootLogo onContinue={() => setPhase("menu")} />;
  if (phase === "menu") return <MainMenu onPlay={() => setPhase("slots")} />;
  return <CharacterSlots />;
}
