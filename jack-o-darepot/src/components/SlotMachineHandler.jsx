import { useState, useRef } from "react";
import SlotMachine from "./SlotMachine";
import { motion } from "framer-motion";
import "./SlotMachineHandler.css";

export default function SlotMachineHandler({ players, gamesByCategory }) {
  const [curseMeter, setCurseMeter] = useState(0);
  const [spinCount, setSpinCount] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const slotRef = useRef();

  const increaseCurse = () => setCurseMeter((prev) => Math.min(prev + 10, 100));
  const resetCurse = () => setCurseMeter(0);

  const startSpin = () => {
    if (!players.length) return;
    setSpinning(true);
    setSpinCount((prev) => prev + 1);

    if (slotRef.current) slotRef.current.spin();

    // Stop shaking after longest reel duration (matches SlotMachine)
    setTimeout(() => setSpinning(false), 8100);
  };

  return (
    <div className="handler-container">
    
      {/* Curse bar */}
      <motion.div
        className="curse-bar"
        animate={
          curseMeter > 0
            ? { boxShadow: ["0 0 10px red", "0 0 25px red", "0 0 10px red"] }
            : { boxShadow: "none" }
        }
        transition={{ duration: 0.6, repeat: curseMeter > 0 ? Infinity : 0 }}
      >
        <div
          className="curse-fill"
          style={{ width: `${curseMeter}%` }}
        ></div>
      </motion.div>

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
        />
      </motion.div>

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
