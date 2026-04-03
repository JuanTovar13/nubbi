import { createContext } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import type { ComponentChildren } from "preact";
import type { Room } from "../types";
import { useAxios } from "./AxiosProvider";
import { useToast } from "./ToastProvider";
import useSupabase from "../hooks/useSupabase";

interface RoomsContextType {
  rooms: Room[];
  loading: boolean;
  creating: boolean;
  deleting: string | null;
  createRoom: (name: string) => Promise<boolean>;
  deleteRoom: (roomId: string) => Promise<void>;
}

const RoomsContext = createContext<RoomsContextType>({
  rooms: [],
  loading: true,
  creating: false,
  deleting: null,
  createRoom: async () => false,
  deleteRoom: async () => {},
});

interface RoomsProviderProps {
  children: ComponentChildren;
}

export const RoomsProvider = ({ children }: RoomsProviderProps) => {
  const axios = useAxios();
  const { showToast } = useToast();
  const supabase = useSupabase();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get<Room[]>("/api/rooms");
      setRooms(data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al cargar rooms",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRooms = () => {
    const channel = supabase.channel("rooms");
    channel
      .on("broadcast", { event: "room-created" }, (payload) => {
        const room = payload.payload as Room;
        setRooms((prev) => {
          if (prev.some((r) => r.id === room.id)) return prev;
          return [room, ...prev];
        });
      })
      .on("broadcast", { event: "room-deleted" }, (payload) => {
        const { roomId } = payload.payload as { roomId: string };
        setRooms((prev) => prev.filter((r) => r.id !== roomId));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchRooms();
    const unsubscribe = subscribeToRooms();
    return () => {
      unsubscribe();
    };
  }, []);

  const createRoom = async (name: string): Promise<boolean> => {
    setCreating(true);
    try {
      const { data } = await axios.post<Room>("/api/rooms", { name });
      setRooms((prev) => {
        if (prev.some((r) => r.id === data.id)) return prev;
        return [data, ...prev];
      });
      showToast("Room creado", "success");
      return true;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al crear room",
        "error",
      );
      return false;
    } finally {
      setCreating(false);
    }
  };

  const deleteRoom = async (roomId: string) => {
    setDeleting(roomId);
    try {
      await axios.delete(`/api/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      showToast("Room eliminado", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al eliminar room",
        "error",
      );
    } finally {
      setDeleting(null);
    }
  };

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        loading,
        creating,
        deleting,
        createRoom,
        deleteRoom,
      }}
    >
      {children}
    </RoomsContext.Provider>
  );
};

export const useRooms = () => {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error("useRooms must be used within RoomsProvider");
  return ctx;
};
