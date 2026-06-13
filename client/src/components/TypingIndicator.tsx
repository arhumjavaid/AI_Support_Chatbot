// ----------------------------------------------------------------------------
// The "bot is typing…" indicator — three animated dots in a bot-style bubble.
// Shown while we wait for the backend to return a reply.
// ----------------------------------------------------------------------------

export function TypingIndicator() {
  return (
    <div className="bubble-row from-bot">
      <div className="bubble bubble-bot typing">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}
