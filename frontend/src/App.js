import React, { useState } from "react";
import BootLogo from "./screens/BootLogo";
import MainMenu from "./screens/MainMenu";
import CharacterSlots from "./screens/CharacterSlots";
import TopDownScene from "./topdown/TopDownScene";

export default function App() {
  const [screen, setScreen] = useState("boot");

  const goToMenu = () => setScreen("menu");
  const goToSlots = () => setScreen("characters");
  const goToGame = (character) => setScreen({ game: character });

  if (screen === "boot") return <BootLogo onFinish={goToMenu} />;
  if (screen === "menu") return <MainMenu onPlay={goToSlots} />;
  if (screen === "characters")
    return <CharacterSlots onPlayCharacter={goToGame} />;

  if (typeof screen === "object" && screen.game) {
    return <TopDownScene character={screen.game} />;
  }

  return null;
}
