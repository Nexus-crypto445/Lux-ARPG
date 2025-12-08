// src/App.js

import React, { useState } from "react";
import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";

export default function App() {
  const [screen, setScreen] = useState("boot");

  if (screen === "boot") return <BootLogo onFinish={() => setScreen("menu")} />;
  if (screen === "menu") return <MainMenu onPlay={() => setScreen("slots")} />;
  if (screen === "slots") return <CharacterSlots />;

  return null;
}
