import { useState, useRef, useEffect } from "react";
import SlotMachine from "./SlotMachine";
import CursedSlotMachine from "./CursedSlotMachine";
import { motion } from "framer-motion";
import CursedText from "./CursedText";
import "./SlotMachineHandler.css";

function SpinResultPopup({ type, player, category, game, challengeName, challengeText, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {type === "normal" && (
          <>
            <h2>Spin Result</h2>
            <p>Player: {player}</p>
            <p>Category: {category}</p>
            <p>Game: {game}</p>
          </>
        )}
        {type === "cursed" && (
          <>
            <h2>CURSED!</h2>
            <p>Player: {player}</p>
            <p>{challengeName}: {challengeText}</p>
          </>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function SlotMachineHandler({ players, gamesByCategory }) {
  // Persisted state
  const [curseMeter, setCurseMeter] = useState(() => {
    const stored = localStorage.getItem("curseMeter");
    return stored ? parseInt(stored, 10) : 0;
  });
  const [spinCount, setSpinCount] = useState(() => {
    const stored = localStorage.getItem("spinCount");
    return stored ? parseInt(stored, 10) : 0;
  });

  const [spinning, setSpinning] = useState(false);
  const [cursedTrigger, setCursedTrigger] = useState(false);
  const [isCursedMode, setIsCursedMode] = useState(false);

  const [challenges, setChallenges] = useState([]);
  const [messages, setMessages] = useState([]);

  const [popupData, setPopupData] = useState(null); // ✅ popup state

  const normalRef = useRef();
  const cursedRef = useRef();

  // Persist
  useEffect(() => localStorage.setItem("curseMeter", curseMeter), [curseMeter]);
  useEffect(() => localStorage.setItem("spinCount", spinCount), [spinCount]);

  // Load challenges/messages once
  useEffect(() => {
    fetch("/data/challenges.json")
      .then((res) => res.json())
      .then((data) => setChallenges(data.challenges))
      .catch(console.error);

    fetch("/data/messages.json")
      .then((res) => res.json())
      .then((data) => setMessages(data.messages))
      .catch(console.error);
  }, []);

  const increaseCurse = () => setCurseMeter(prev => Math.min(prev + 10, 100));
  const resetCurse = () => setCurseMeter(0);

  const startSpin = () => {
    if (!players.length || spinning) return;
    setSpinning(true);

    if (isCursedMode) {
      // Cursed spin
      cursedRef.current.spin((result) => {
        setPopupData({
          type: "cursed",
          player: result.player.name,
          challengeName: result.challengeName,
          challengeText: result.challengeText,
          onClose: () => {
            setPopupData(null);
            setIsCursedMode(false);
          }
        });
        setSpinning(false);
        setCursedTrigger(false);
      });
    } else {
      // Normal spin
      normalRef.current.spin((isCursed, result) => {
        if (isCursed) {
          setCursedTrigger(true);
          resetCurse();
          setTimeout(() => {
            setIsCursedMode(true);
            setSpinning(false);
          }, 800);
        } else {
          increaseCurse();
          setSpinCount(prev => prev + 1);
          setPopupData({
            type: "normal",
            player: result.player.name,
            category: result.category,
            game: result.game,
            onClose: () => setPopupData(null)
          });
          setSpinning(false);
        }
      });
    }
  };

  return (
    <div className="handler-container" style={{ position: "relative" }}>
      {/* CURSED overlay */}
      <CursedText trigger={cursedTrigger} />

      {/* Slot machine */}
      <motion.div
        className="slot-machine-background"
        animate={spinning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.2, repeat: spinning ? Infinity : 0 }}
      >
        {!isCursedMode ? (
          <SlotMachine
            ref={normalRef}
            players={players}
            gamesByCategory={gamesByCategory}
            curseMeter={curseMeter}
            increaseCurse={increaseCurse}
            resetCurse={resetCurse}
            spinCount={spinCount}
            setSpinCount={setSpinCount}
            spinning={spinning}
            messages={messages}
          />
        ) : (
          <CursedSlotMachine
            ref={cursedRef}
            players={players}
            gamesByCategory={gamesByCategory}
            challenges={challenges}
            messages={messages}
            spinning={spinning}
          />
        )}
      </motion.div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="spin-counter">🌀 Spins: {spinCount}</div>
        <div className="curse-meter">💀 Curse Meter: {curseMeter}%</div>
      </div>

      {/* Spin button */}
      <motion.button
        className="spin-button"
        onClick={startSpin}
        disabled={spinning || !players.length}
        animate={
          spinning
            ? { scale: [1, 1.1, 1], boxShadow: ["0 0 10px orange", "0 0 25px orange", "0 0 10px orange"] }
            : { scale: 1, boxShadow: "none" }
        }
        transition={{ duration: 0.6, repeat: spinning ? Infinity : 0 }}
      >
        {isCursedMode ? "👿 CURSED SPIN" : "🎰 SPIN"}
      </motion.button>

      {/* Spin result popup */}
      {popupData && <SpinResultPopup {...popupData} />}
    </div>
  );
}
