import React, { useState } from "react";
import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";
import TopDownScene from "./screens/TopDownScene";

export default function App() {
  const [screen, setScreen] = useState("boot");
  const [selectedChar, setSelectedChar] = useState(null);

  if (screen === "boot")
    return <BootLogo onContinue={() => setScreen("menu")} />;

  if (screen === "menu")
    return <MainMenu onPlay={() => setScreen("slots")} />;

  if (screen === "slots")
    return (
      <CharacterSlots
        onCharacterSelected={(char) => {
          setSelectedChar(char);
          setScreen("game");
        }}
      />
    );

  if (screen === "game")
    return (
      <TopDownScene
        character={selectedChar}
        onExit={() => setScreen("slots")}
      />
    );

  return null;
}
