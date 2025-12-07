import React, { useState } from "react";

import BootLogo from "./screens/boot/BootLogo";
import MainMenu from "./screens/menu/MainMenu";
import CharacterSlots from "./screens/characters/CharacterSlots";
import CharacterCreation from "./components/CharacterCreation";

function App() {
  const [screen, setScreen] = useState("boot");

  return (
    <>
      {screen === "boot" && (
        <BootLogo onDone={() => setScreen("menu")} />
      )}

      {screen === "menu" && (
        <MainMenu onPlay={() => setScreen("slots")} />
      )}

      {screen === "slots" && (
        <CharacterSlots onCreateNew={() => setScreen("create")} />
      )}

      {screen === "create" && (
        <CharacterCreation onDone={() => setScreen("slots")} />
      )}
    </>
  );
}

export default App;

