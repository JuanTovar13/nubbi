import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { AuthData, Message, Room } from "../types";
import {
  getStoredAuth,
  setStoredAuth,
  removeStoredAuth,
} from "../utils/storage";
import useSupabase from "../hooks/useSupabase";
import { useNavigate, useParams } from "react-router-dom";
import { useAxios } from "./AxiosProvider";
import { useToast } from "./ToastProvider";

interface RoomContextType {
  messages: Message[];
  room: Room | null;
  loading: boolean;
  sending: boolean;
  sendMessage: (content: string) => Promise<void>;
}

const RoomContext = createContext<RoomContextType>({
  messages: [],
  room: null,
  loading: true,
  sending: false,
  sendMessage: async () => {},
});

interface RoomProviderProps {
  children: ComponentChildren;
}
export function RoomProvider({ children }: RoomProviderProps) {
  const { id: roomId } = useParams<{ id: string }>();

  const axios = useAxios();
  const { showToast } = useToast();
  const supabase = useSupabase();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);

  const fetchRoom = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Room>(`/api/rooms/${roomId}`);
      setRoom(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al cargar room",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get<Message[]>(
        `/api/rooms/${roomId}/messages`,
      );
      setMessages(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al cargar mensajes",
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
      await axios.post(`/api/rooms/${roomId}/messages`, {
        content: content.trim(),
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
    fetchRoom();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return (
    <RoomContext.Provider
      value={{ messages, loading, sending, room, sendMessage }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
}
