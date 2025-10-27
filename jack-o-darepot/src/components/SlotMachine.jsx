import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import SlotReel from "./SlotReel";
import { motion } from "framer-motion";
import { Howl } from "howler";
import "./SlotMachine.css";

const SlotMachine = forwardRef(
  (
    {
      players,
      gamesByCategory,
      curseMeter,
      increaseCurse,
      resetCurse,
      setSpinCount,
      spinning,
    },
    ref
  ) => {
    const [player, setPlayer] = useState("?");
    const [category, setCategory] = useState("?");
    const [game, setGame] = useState("?");
    const [cursed, setCursed] = useState(false);
    const [displayText, setDisplayText] = useState("");
    const [messages, setMessages] = useState([]);

    const categories = Object.keys(gamesByCategory);
    const allGames = Object.values(gamesByCategory).flat();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Load random spin messages
    useEffect(() => {
      fetch("/data/messages.json")
        .then((res) => res.json())
        .then((data) => setMessages(data.messages))
        .catch(console.error);
    }, []);

    // Spin start sound
    const spinStartSound = new Howl({
      src: ["/assets/sounds/spin.mp3"],
      volume: 0.9,
    });

    useImperativeHandle(ref, () => ({
      spin(onComplete) {
        if (!players.length || !allGames.length) return;

        spinStartSound.play();
        setDisplayText(getRandom(messages)); // 🎰 show random message
        setCursed(false);

        setSpinCount((prev) => {
          const next = prev + 1;
          localStorage.setItem("spinCount", next);
          return next;
        });

        const curseChance = Math.min(curseMeter / 2, 50);
        const isCursed = Math.random() * 100 < curseChance;
        setCursed(isCursed);

        const finalPlayer = isCursed ? "6" : getRandom(players);
        let finalGameObj, finalCategory;

        if (isCursed) {
          finalGameObj = null;
          finalCategory = "6";
        } else {
          finalGameObj = getRandom(allGames);
          finalCategory = Object.keys(gamesByCategory).find((cat) =>
            gamesByCategory[cat].some((g) => g.name === finalGameObj.name)
          );
        }

        setPlayer(finalPlayer);
        setCategory(finalCategory);
        setGame(finalGameObj?.name || "6");

        // 🕒 Wait for reels to finish
        setTimeout(() => {
          if (isCursed) {
            resetCurse();
            setDisplayText("CURSED");
          } else {
            increaseCurse();
            localStorage.setItem("curseMeter", curseMeter);
            if (finalGameObj?.text) {
              setDisplayText(finalGameObj.text); // 🪄 update only if text exists
            }
          }
          if (onComplete) onComplete(isCursed);
        }, 8100);
      },
    }));

    return (
      <div className="slot-machine-background">
        <div className="slot-machine-container" style={{ position: "relative" }}>
          {/* Arcade-style glowing text box */}
          <motion.div
            className="slot-textbox"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {displayText || "Insert coin to play..."}
          </motion.div>

          <div className="slots-wrapper">
            <SlotReel
              items={players}
              finalValue={player}
              spinTime={4000}
              spinning={spinning}
              cursed={cursed}
              pitch={1}
            />
            <SlotReel
              items={categories}
              finalValue={category}
              spinTime={6000}
              spinning={spinning}
              cursed={cursed}
              pitch={1.1}
            />
            <SlotReel
              items={allGames.map((g) => (g.name ? g.name : g))}
              finalValue={game}
              spinTime={8000}
              spinning={spinning}
              cursed={cursed}
              pitch={1.25}
            />
          </div>

          {/* Curse Bar */}
          <motion.div
            className="curse-bar"
            style={{ marginTop: "12px", width: "100%" }}
            animate={
              curseMeter > 0
                ? { boxShadow: ["0 0 10px red", "0 0 25px red", "0 0 10px red"] }
                : { boxShadow: "none" }
            }
            transition={{
              duration: 0.6,
              repeat: curseMeter > 0 ? Infinity : 0,
            }}
          >
            <div
              className="curse-fill"
              style={{ width: `${curseMeter}%` }}
            ></div>
          </motion.div>
        </div>
      </div>
    );
  }
);

export default SlotMachine;
