import { useState, forwardRef, useImperativeHandle } from "react";
import SlotReel from "./SlotReel";
import "./SlotMachine.css";

const SlotMachine = forwardRef(
  (
    {
      players,
      gamesByCategory,
      curseMeter,
      increaseCurse,
      resetCurse,
      spinCount,
      setSpinCount,
    },
    ref
  ) => {
    const [player, setPlayer] = useState("???");
    const [category, setCategory] = useState("???");
    const [game, setGame] = useState("???");
    const [spinning, setSpinning] = useState(false);
    const [cursed, setCursed] = useState(false);

    const categories = Object.keys(gamesByCategory);
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Expose a method for the handler to trigger spin
    useImperativeHandle(ref, () => ({
      spin(onComplete) {
        if (!players.length || !categories.length) return;

        setSpinning(true);
        setSpinCount(spinCount + 1);

        const curseChance = Math.min(curseMeter / 2, 50);
        const isCursed = Math.random() * 100 < curseChance;
        setCursed(isCursed);

        const finalPlayer = isCursed ? "6" : getRandom(players);
        const finalCategory = isCursed ? "6" : getRandom(categories);
        const finalGame =
          isCursed || !gamesByCategory[finalCategory]
            ? "6"
            : getRandom(gamesByCategory[finalCategory]);

        console.log(
          "Final selection ->",
          finalPlayer,
          finalCategory,
          finalGame
        );

        setPlayer(finalPlayer);
        setCategory(finalCategory);
        setGame(finalGame);

        // Wait for the longest reel duration before ending spin
        const longestSpinTime = 8100; // match your last reel
        setTimeout(() => {
          setSpinning(false);

          // Only update curse AFTER spinning finishes
          isCursed ? resetCurse() : increaseCurse();

          // Notify handler spin ended
          if (onComplete) onComplete();
        }, longestSpinTime);
      },
    }));

    return (
      <div className="slot-machine-container">
        <div className="slots-wrapper">
          <SlotReel
            items={players}
            finalValue={player}
            curseMeter={curseMeter}
            spinTime={4000}
            spinning={spinning}
            cursed={cursed}
            pitch={0.9}
            increaseCurse={increaseCurse}
          />
          <SlotReel
            items={categories}
            finalValue={category}
            curseMeter={curseMeter}
            spinTime={6000}
            spinning={spinning}
            cursed={cursed}
            pitch={1.0}
            increaseCurse={increaseCurse}
          />
          <SlotReel
            items={Object.values(gamesByCategory).flat()}
            finalValue={game}
            curseMeter={curseMeter}
            spinTime={8000}
            spinning={spinning}
            cursed={cursed}
            pitch={1.1}
            increaseCurse={increaseCurse}s
          />
        </div>
      </div>
    );
  }
);

export default SlotMachine;
