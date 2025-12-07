import React, { useState } from "react";
import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("boot");

  if (currentScreen === "boot") {
    return <BootLogo onFinish={() => setCurrentScreen("menu")} />;
  }

  if (currentScreen === "menu") {
    return <MainMenu onPlay={() => setCurrentScreen("characters")} />;
  }

  return <CharacterSlots />;
}

