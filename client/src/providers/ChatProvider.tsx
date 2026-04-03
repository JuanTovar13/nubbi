import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { Message, Room } from "../types";
import useSupabase from "../hooks/useSupabase";
import { useNavigate, useParams } from "react-router-dom";
import { useAxios } from "./AxiosProvider";
import { useToast } from "./ToastProvider";

interface ChatContextType {
  messages: Message[];
  room: Room | null;
  loading: boolean;
  sending: boolean;
  sendMessage: (content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  room: null,
  loading: true,
  sending: false,
  sendMessage: async () => {},
});

interface ChatProviderProps {
  children: ComponentChildren;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { id: roomId } = useParams<{ id: string }>();

  const axios = useAxios();
  const { showToast } = useToast();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomRes, messagesRes] = await Promise.all([
        axios.get<Room>(`/api/rooms/${roomId}`),
        axios.get<Message[]>(`/api/rooms/${roomId}/messages`),
      ]);
      setRoom(roomRes.data);
      setMessages(messagesRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al cargar chat",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const { data } = await axios.post<Message>(`/api/rooms/${roomId}/messages`, {
        content: content.trim(),
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data];
      });
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al enviar mensaje",
        "error",
      );
      throw err;
    } finally {
      setSending(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase.channel(`room:${roomId}`);

    channel
      .on("broadcast", { event: "new-message" }, (payload) => {
        const message = payload.payload as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      })
      .on("broadcast", { event: "room-deleted" }, () => {
        showToast("Este room ha sido eliminado", "error");
        navigate("/rooms");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return (
    <ChatContext.Provider
      value={{ messages, loading, sending, room, sendMessage }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
