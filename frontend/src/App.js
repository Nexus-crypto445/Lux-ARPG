import React, { useState } from "react";

import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";

export default function App() {
  const [stage, setStage] = useState("boot");

  if (stage === "boot") {
    return <BootLogo onFinish={() => setStage("menu")} />;
  }

  if (stage === "menu") {
    return <MainMenu onStart={() => setStage("characters")} />;
  }

  if (stage === "characters") {
    return <CharacterSlots />;
  }

  return null;
}
