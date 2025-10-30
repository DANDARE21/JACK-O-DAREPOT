import { useState, useRef, useEffect } from "react";
import SlotMachine from "./SlotMachine";
import CursedSlotMachine from "./CursedSlotMachine";
import { motion } from "framer-motion";
import CursedText from "./CursedText";
import SpinResultPopup from "./SpinResultPopup";
import "./SlotMachineHandler.css";

export default function SlotMachineHandler({ players, gamesByCategory }) {
  // Persistent state
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

  const [popupData, setPopupData] = useState(null);

  const normalRef = useRef();
  const cursedRef = useRef();

  // Persist values
  useEffect(() => {
    localStorage.setItem("curseMeter", curseMeter);
  }, [curseMeter]);
  useEffect(() => {
    localStorage.setItem("spinCount", spinCount);
  }, [spinCount]);

  // Load challenges/messages once (with logs)
  useEffect(() => {
    console.log("[Handler] fetching challenges/messages...");
    fetch("/data/challenges.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("[Handler] fetched challenges:", data);
        setChallenges(data.challenges || []);
      })
      .catch((err) => {
        console.error("[Handler] fetch challenges error:", err);
      });

    fetch("/data/messages.json")
      .then((res) => res.json())
      .then((data) => {
        console.log("[Handler] fetched messages:", data);
        setMessages(data.messages || []);
      })
      .catch((err) => {
        console.error("[Handler] fetch messages error:", err);
      });
  }, []);

  const increaseCurse = () => setCurseMeter((prev) => Math.min(prev + 10, 100));
  const resetCurse = () => setCurseMeter(0);

  // Helper: normalize name extraction from different shapes (with logs)
  const nameOf = (item, label = "item") => {
    if (item === null || item === undefined) {
      console.log(`[Handler][nameOf] ${label} is null/undefined -> "Unknown"`);
      return "Unknown";
    }
    if (typeof item === "string") {
      console.log(`[Handler][nameOf] ${label} is string ->`, item);
      return item;
    }
    if (typeof item === "number") {
      console.log(`[Handler][nameOf] ${label} is number ->`, String(item));
      return String(item);
    }
    if (typeof item === "object") {
      if ("name" in item && item.name) {
        console.log(`[Handler][nameOf] ${label}.name ->`, item.name);
        return item.name;
      }
      // Try other common fields
      if ("player" in item && typeof item.player === "string") {
        console.log(`[Handler][nameOf] ${label}.player ->`, item.player);
        return item.player;
      }
      if ("game" in item && typeof item.game === "string") {
        console.log(`[Handler][nameOf] ${label}.game ->`, item.game);
        return item.game;
      }
      console.log(`[Handler][nameOf] ${label} object has no name ->`, item);
      return "Unknown";
    }
    console.log(`[Handler][nameOf] ${label} fallback ->`, item);
    return "Unknown";
  };

  // Debug helper to pretty-print args and ref state
  const debugLogSpinArgs = (prefix, args, ref) => {
    console.log(`[Handler][${prefix}] callback args:`, args);
    try {
      console.log(`[Handler][${prefix}] ref.current:`, ref.current);
    } catch (e) {
      console.log(`[Handler][${prefix}] ref.current read error:`, e);
    }
  };

  const startSpin = () => {
    if (!players.length || spinning) {
      console.log("[Handler] startSpin blocked: players.length=", players.length, "spinning=", spinning);
      return;
    }
    console.log("[Handler] Starting spin... isCursedMode=", isCursedMode);
    setSpinning(true);

    if (isCursedMode) {
      console.log("[Handler] Invoking cursedRef.spin()");
      // Accept flexible callback signature
      cursedRef.current.spin((...args) => {
        debugLogSpinArgs("cursed", args, cursedRef);

        // normalize result object
        let result = null;
        if (args.length === 1) result = args[0];
        else if (args.length >= 2) {
          // could be (isCursed, result) or (result, extra)
          if (typeof args[0] === "boolean") result = args[1];
          else result = args[0];
        }
        console.log("[Handler] cursed spin normalized result:", result);

        const playerName = nameOf(result?.player ?? result?.playerName ?? result?.name, "player");
        const challengeName = nameOf(result?.challenge ?? result?.challengeName ?? result?.challenge?.name, "challengeName");
        const challengeText =
          (typeof result?.challenge === "object" && result.challenge?.text) ||
          result?.challengeText ||
          result?.text ||
          "No description";

        console.log("[Handler] cursed resolved ->", { playerName, challengeName, challengeText });

        setPopupData({
          type: "cursed",
          player: playerName,
          challengeName,
          challengeText,
          onClose: () => {
            console.log("[Handler] popup closed (cursed) -> switching back to normal");
            setPopupData(null);
            setIsCursedMode(false);
          },
        });

        setSpinning(false);
        setCursedTrigger(false);
      });
    } else {
      console.log("[Handler] Invoking normalRef.spin()");
      normalRef.current.spin((...args) => {
        debugLogSpinArgs("normal", args, normalRef);

        // Normalize callback signature:
        // possible signatures:
        // - (isCursed)
        // - (isCursed, result)
        // - (result)
        // - ( ) -> nothing
        let isCursed = false;
        let result = null;

        if (args.length === 0) {
          // nothing
          isCursed = false;
          result = null;
        } else if (args.length === 1) {
          if (typeof args[0] === "boolean") {
            isCursed = args[0];
            result = null;
          } else {
            isCursed = false;
            result = args[0];
          }
        } else {
          isCursed = Boolean(args[0]);
          result = args[1];
        }

        // If no result, try to fallback to lastResult stored on ref (some components use that)
        if (!result) {
          try {
            result = normalRef.current?.lastResult ?? null;
            console.log("[Handler] fallback result from normalRef.current.lastResult:", result);
          } catch (e) {
            console.log("[Handler] error reading normalRef.current.lastResult:", e);
          }
        }

        console.log("[Handler] normalized normal spin -> isCursed:", isCursed, "result:", result);

        if (isCursed) {
          console.log("[Handler] Normal spin reported CURSED.");
          setCursedTrigger(true);
          resetCurse();
          setTimeout(() => {
            setIsCursedMode(true);
            setSpinning(false);
          }, 800);
          return;
        }

        // Extract names safely
        const playerName = nameOf(result?.player ?? result?.playerName ?? result?.name, "player");
        const categoryName = nameOf(result?.category ?? result?.categoryName ?? result?.category?.name, "category");
        const gameName = nameOf(result?.game ?? result?.gameName ?? result?.game?.name ?? result?.name, "game");

        console.log("[Handler] normal resolved ->", { playerName, categoryName, gameName });

        // Update curse and spin count BEFORE popup
        increaseCurse();
        setSpinCount((prev) => prev + 1);

        setPopupData({
          type: "normal",
          player: playerName,
          category: categoryName,
          game: gameName,
          onClose: () => {
            console.log("[Handler] popup closed (normal)");
            setPopupData(null);
          },
        });

        setSpinning(false);
      });
    }
  };

  return (
    <div className="handler-container" style={{ position: "relative" }}>
      {/* Cursed overlay */}
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

      {/* Popup */}
      {popupData && <SpinResultPopup {...popupData} />}
    </div>
  );
}
