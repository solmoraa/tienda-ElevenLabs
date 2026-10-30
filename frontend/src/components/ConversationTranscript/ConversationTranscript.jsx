import { useEffect, useRef } from "react";
import "./ConversationTranscript.css";

export default function ConversationTranscript({ messages, compact = false }) {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  return (
    <section className={`conversation-transcript ${compact ? "conversation-transcript--compact" : ""}`} aria-label="Conversación en tiempo real">
      <div className="conversation-transcript-title">
        <span aria-hidden="true" />
        <p>Conversación en vivo</p>
      </div>

      <div className="conversation-transcript-messages" ref={scrollContainerRef} aria-live="polite" aria-relevant="additions text">
        {messages.length ? messages.map((message) => (
          <p className={`conversation-message conversation-message--${message.role}`} key={message.id}>
            {message.content}
          </p>
        )) : (
          <p className="conversation-transcript-empty">Empezá a hablar cuando quieras.</p>
        )}
      </div>
    </section>
  );
}
