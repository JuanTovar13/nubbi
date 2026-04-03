import { useState, useRef, useEffect } from "preact/hooks";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onSelect }: Readonly<EmojiPickerProps>) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div class="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        class="flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-colors"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </button>

      {open && (
        <div class="absolute bottom-12 right-0 z-20">
          <Picker
            data={data}
            onEmojiSelect={(emoji: { native: string }) => {
              onSelect(emoji.native);
              setOpen(false);
            }}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
          />
        </div>
      )}
    </div>
  );
};
