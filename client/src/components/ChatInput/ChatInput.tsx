import { useState } from "preact/hooks";
import { EmojiPicker } from "../EmojiPicker/EmojiPicker";

interface ChatInputProps {
  sending: boolean;
  onSend: (content: string) => Promise<void>;
}

export const ChatInput = ({ sending, onSend }: Readonly<ChatInputProps>) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    try {
      await onSend(content);
      setContent("");
    } catch {
      // handled by parent
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
  };

  return (
    <div
      class="shrink-0 px-6 py-4"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <form onSubmit={handleSubmit} class="max-w-3xl mx-auto flex gap-2">
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
        <EmojiPicker onSelect={handleEmojiSelect} />
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
  );
};
