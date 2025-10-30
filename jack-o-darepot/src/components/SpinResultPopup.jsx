import React from "react";
import "./SpinResultPopup.css";

export default function SpinResultPopup({
  type,
  player,
  category,
  game,
  challengeName,
  challengeText,
  onClose,
}) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        {type === "normal" && (
          <>
            <h2>🎰 Spin Result</h2>
            <p><strong>Player:</strong> {player}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Game:</strong> {game}</p>
          </>
        )}

        {type === "cursed" && (
          <>
            <h2>👿 CURSED!</h2>
            <p><strong>Player:</strong> {player}</p>
            <p><strong>{challengeName}</strong>: {challengeText}</p>
          </>
        )}

        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
