import { useState, forwardRef, useImperativeHandle } from "react";
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

    const categories = Object.keys(gamesByCategory);
    const allGames = Object.values(gamesByCategory).flat();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Preload spin sound
    const spinStartSound = new Howl({
      src: ["/assets/sounds/spin.mp3"],
      volume: 0.9,
    });

    // Persist spinCount in localStorage
    useImperativeHandle(ref, () => ({
      spin(onComplete) {
        if (!players.length || !allGames.length) return;

        spinStartSound.play();
        setSpinCount((prev) => {
          const next = prev + 1;
          localStorage.setItem("spinCount", next);
          return next;
        });
        setCursed(false);

        const curseChance = Math.min(curseMeter / 2, 50);
        const isCursed = Math.random() * 100 < curseChance;
        setCursed(isCursed);

        const finalPlayer = isCursed ? "6" : getRandom(players);
        let finalGame, finalCategory;

        if (isCursed) {
          finalGame = "6";
          finalCategory = "6";
        } else {
          finalGame = getRandom(allGames);
          finalCategory = Object.keys(gamesByCategory).find((cat) =>
            gamesByCategory[cat].includes(finalGame)
          );
        }

        console.log(
          "🎰 Spin triggered ->",
          "Player:",
          finalPlayer,
          "Category:",
          finalCategory,
          "Game:",
          finalGame,
          "Cursed:",
          isCursed
        );

        setPlayer(finalPlayer);
        setCategory(finalCategory);
        setGame(finalGame);

        // Finish
        setTimeout(() => {
          isCursed ? resetCurse() : increaseCurse();
          localStorage.setItem("curseMeter", curseMeter); // save the updated curseMeter
          console.log("🎯 Spin finished.");
          if (onComplete) onComplete(isCursed);
        }, 8100);
      },
    }));

    return (
      <div className="slot-machine-background">
        <div
          className="slot-machine-container"
          style={{ position: "relative" }}
        >
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
              items={allGames}
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
                ? {
                    boxShadow: ["0 0 10px red", "0 0 25px red", "0 0 10px red"],
                  }
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
