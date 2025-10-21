import { useState, useEffect } from "react";
import SlotMachineHandler from "./components/SlotMachineHandler";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [gamesByCategory, setGamesByCategory] = useState({});

  useEffect(() => {
    fetch("/data/players.json")
      .then((res) => res.json())
      .then(setPlayers)
      .catch(console.error);

    fetch("/data/games.json")
      .then((res) => res.json())
      .then(setGamesByCategory)
      .catch(console.error);
  }, []);

  return (
    <div className="app-container">
      <h1>JACK'O DAREPOT</h1>
      <SlotMachineHandler players={players} gamesByCategory={gamesByCategory} />
    </div>
  );
}
