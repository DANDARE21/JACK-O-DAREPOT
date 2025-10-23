import { useState, useEffect } from "react";
import SlotMachineHandler from "./components/SlotMachineHandler";
import "./App.css";

export default function App() {
  const [players, setPlayers] = useState([]);
  const [gamesByCategory, setGamesByCategory] = useState({});

  // Persistent variables using localStorage
  const [totalSpins, setTotalSpins] = useState(() => {
    const stored = localStorage.getItem("totalSpins");
    return stored ? parseInt(stored, 10) : 0;
  });

  const [curseMeter, setCurseMeter] = useState(() => {
    const stored = localStorage.getItem("curseMeter");
    return stored ? parseFloat(stored) : 0;
  });

  // Update localStorage when values change
  useEffect(() => {
    localStorage.setItem("totalSpins", totalSpins.toString());
  }, [totalSpins]);

  useEffect(() => {
    localStorage.setItem("curseMeter", curseMeter.toString());
  }, [curseMeter]);

  // Load JSON data
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
      <SlotMachineHandler
        players={players}
        gamesByCategory={gamesByCategory}
        totalSpins={totalSpins}
        setTotalSpins={setTotalSpins}
        curseMeter={curseMeter}
        setCurseMeter={setCurseMeter}
      />
      {/* Settings button placeholder (to be implemented later) */}
      {/* <SettingsButton /> */}
    </div>
  );
}
