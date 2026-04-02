import { useState, useEffect, useRef } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/UserProvider";
import type { Message } from "../types";
import { useRoom } from "../providers/RoomProvider";

function MessageList({
  messages,
  isOwnMessage,
  messagesEndRef,
}: Readonly<{
  messages: Message[];
  isOwnMessage: (msg: Message) => boolean;
  messagesEndRef: preact.RefObject<HTMLDivElement>;
}>) {
  if (messages.length === 0) {
    return (
      <div class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <div
            class="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "var(--color-primary-light)" }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p
            class="text-sm font-medium mb-1"
            style={{ color: "var(--color-text)" }}
          >
            Sin mensajes
          </p>
          <p class="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Envia el primer mensaje
          </p>
        </div>
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-3 py-4">
      {messages.map((msg, i) => {
        const own = isOwnMessage(msg);
        return (
          <div
            key={msg.id}
            class={`max-w-[75%] animate-slide-up ${own ? "self-end" : "self-start"}`}
            style={{ animationDelay: `${i * 20}ms`, opacity: 0 }}
          >
            <div
              class="rounded-2xl px-4 py-2.5"
              style={{
                background: own
                  ? "var(--color-own-bubble)"
                  : "var(--color-other-bubble)",
                color: own
                  ? "var(--color-own-bubble-text)"
                  : "var(--color-other-bubble-text)",
                boxShadow: own ? "none" : "0 1px 3px var(--color-shadow)",
                borderBottomRightRadius: own ? "6px" : "16px",
                borderBottomLeftRadius: own ? "16px" : "6px",
              }}
            >
              {!own && (
                <p
                  class="text-xs font-semibold mb-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  {msg.created_by.userName || msg.created_by.email}
                </p>
              )}
              <p class="text-sm leading-relaxed">{msg.content}</p>
            </div>
            <p
              class={`text-xs mt-1 px-1 ${own ? "text-right" : ""}`}
              style={{ color: "var(--color-text-muted)" }}
            >
              {new Date(msg.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

export function ChatPage() {
  const navigate = useNavigate();
  const { auth } = useUser();
  const { messages, loading, room, sending, sendMessage } = useRoom();

  const [content, setContent] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: Event) => {
    e.preventDefault();
    try {
      await sendMessage(content);
      setContent("");
    } catch (error) {
      console.log(error);
    }
  };

  const isOwnMessage = (message: Message) =>
    message.created_by.email === auth?.user.email;

  return (
    <div
      class="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Header */}
      <header
        class="shrink-0 px-6 py-3.5 flex items-center gap-4"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <button
          onClick={() => navigate("/rooms")}
          class="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors"
          style={{
            background: "var(--color-primary-light)",
            border: "none",
            color: "var(--color-primary)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
            style={{ background: "var(--color-primary-light)" }}
          >
            <span
              class="text-xs font-bold"
              style={{ color: "var(--color-primary)" }}
            >
              {room?.name?.charAt(0).toUpperCase() ?? "?"}
            </span>
          </div>
          <div>
            <h1
              class="text-sm font-bold"
              style={{ color: "var(--color-text)", letterSpacing: "-0.01em" }}
            >
              {room?.name ?? "Cargando..."}
            </h1>
            {room && (
              <p class="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Creado por {room.created_by.userName || room.created_by.email}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div class="flex-1 overflow-y-auto px-6 min-h-0">
        <div
          class="max-w-3xl mx-auto w-full flex flex-col"
          style={{ minHeight: "100%" }}
        >
          {loading ? (
            <div class="flex-1 flex items-center justify-center">
              <p class="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Cargando mensajes...
              </p>
            </div>
          ) : (
            <MessageList
              messages={messages}
              isOwnMessage={isOwnMessage}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>
      </div>

      {/* Input area */}
      <div
        class="shrink-0 px-6 py-4"
        style={{
          background: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <form onSubmit={handleSend} class="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={content}
            onInput={(e) => setContent((e.target as HTMLInputElement).value)}
            class="flex-1 px-4 py-2.5 rounded-xl text-sm"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-bg)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="submit"
            disabled={sending}
            class="px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center"
            style={{
              background: sending
                ? "var(--color-text-muted)"
                : "var(--color-primary)",
              color: "white",
              border: "none",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
