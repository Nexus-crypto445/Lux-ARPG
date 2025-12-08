import React, { useState } from "react";
import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";
import TopDownScene from "./topdown/TopDownScene";

export default function App() {
  const [screen, setScreen] = useState("boot"); // boot -> menu -> slots -> create -> game
  const [selectedChar, setSelectedChar] = useState(null);

  if (screen === "boot") {
    return <BootLogo onContinue={() => setScreen("menu")} />;
  }

  if (screen === "menu") {
    return <MainMenu onPlay={() => setScreen("slots")} />;
  }

  if (screen === "slots") {
    return (
      <CharacterSlots
        onCreate={() => setScreen("create")}
        onCharacterSelected={(char) => {
          setSelectedChar(char);
          setScreen("game");
        }}
      />
    );
  }

  if (screen === "create") {
    return (
      <CharacterCreation
        onSaved={() => setScreen("slots")}
        onCancel={() => setScreen("slots")}
      />
    );
  }

  if (screen === "game") {
    return (
      <TopDownScene
        character={selectedChar}
        onExit={() => setScreen("slots")}
      />
    );
  }

  return null;
}
