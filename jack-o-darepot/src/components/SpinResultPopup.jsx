import { motion } from "framer-motion";

export default function SpinResultPopup({
  open,
  type, // "normal" or "cursed"
  player,
  category,
  game,
  challengeName,
  challengeText,
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        zIndex: 999,
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "#111",
          padding: "20px",
          borderRadius: "12px",
          minWidth: "300px",
          textAlign: "center",
        }}
      >
        <h2>Spin Results</h2>
        <div>🧑 Player: {player}</div>
        {type === "normal" && <div>📂 Category: {category}</div>}
        <div>🎮 Game: {game}</div>
        {type === "cursed" && (
          <>
            <div>⚡ Challenge: {challengeName}</div>
            <div style={{ fontStyle: "italic", marginTop: "5px" }}>
              {challengeText}
            </div>
          </>
        )}
        <button
          style={{
            marginTop: "15px",
            padding: "8px 16px",
            background: "crimson",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          Completed
        </button>
      </motion.div>
    </div>
  );
}
