import { useState, useRef, useEffect } from "react";
import SlotMachine from "./SlotMachine";
import { motion } from "framer-motion";
import CursedText from "./CursedText";
import "./SlotMachineHandler.css";

export default function SlotMachineHandler({ players, gamesByCategory }) {
  // ✅ Load persisted values once
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

  const slotRef = useRef();

  // ✅ Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem("curseMeter", curseMeter);
  }, [curseMeter]);

  useEffect(() => {
    localStorage.setItem("spinCount", spinCount);
  }, [spinCount]);

  const increaseCurse = () => setCurseMeter((prev) => Math.min(prev + 10, 100));
  const resetCurse = () => setCurseMeter(0);

  const startSpin = () => {
    if (!players.length) return;
    setSpinning(true);

    if (slotRef.current) {
      slotRef.current.spin((isCursed) => {
        // ✅ Only trigger CURSED! if spin was cursed
        if (isCursed) {
          setCursedTrigger(true);
          resetCurse(); // cursed = reset meter
        } else {
          increaseCurse(); // not cursed = increase meter
        }

        // ✅ Always increment spin counter
        setSpinCount((prev) => prev + 1);

        setSpinning(false);
      });
    }
  };

  return (
    <div className="handler-container" style={{ position: "relative" }}>
      {/* CURSED! overlay */}
      <CursedText trigger={cursedTrigger} />

      {/* Slot machine container with background and shake */}
      <motion.div
        className="slot-machine-background"
        animate={spinning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.2, repeat: spinning ? Infinity : 0 }}
      >
        <SlotMachine
          ref={slotRef}
          players={players}
          gamesByCategory={gamesByCategory}
          curseMeter={curseMeter}
          increaseCurse={increaseCurse}
          resetCurse={resetCurse}
          spinCount={spinCount}
          setSpinCount={setSpinCount}
          spinning={spinning}
        />
      </motion.div>

      {/* Spin count and curse meter display */}
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
        SPIN
      </motion.button>
    </div>
  );
}
