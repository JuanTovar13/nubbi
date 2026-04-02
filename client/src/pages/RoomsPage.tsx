import { useState, useEffect } from "preact/hooks";
import { useNavigate } from "react-router-dom";
import { useUser } from "../providers/UserProvider";
import { useAxios } from "../providers/AxiosProvider";
import { useToast } from "../providers/ToastProvider";
import type { Room } from "../types";

export function RoomsPage() {
  const { auth, setAuth } = useUser();
  const axios = useAxios();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
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

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: Event) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const { data } = await axios.post<Room>("/api/rooms", {
        name: newRoomName.trim(),
      });
      setRooms((prev) => [data, ...prev]);
      setNewRoomName("");
      showToast("Room creado", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al crear room",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async (e: Event, roomId: string) => {
    e.stopPropagation();
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

  const isOwner = (room: Room) => room.created_by.email === auth?.user.email;

  const handleLogout = () => {
    setAuth(null);
    navigate("/login");
  };

  return (
    <div class="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        class="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "var(--color-primary-light)" }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1
            class="text-lg font-bold"
            style={{ color: "var(--color-text)", letterSpacing: "-0.02em" }}
          >
            Chat Rooms
          </h1>
        </div>

        <div class="flex items-center gap-4">
          <span
            class="text-xs font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {auth?.user.email}
          </span>
          <button
            onClick={handleLogout}
            class="text-xs font-medium cursor-pointer px-3 py-1.5 rounded-lg transition-colors"
            style={{
              color: "var(--color-danger)",
              background: "transparent",
              border: "1px solid var(--color-border)",
            }}
          >
            Salir
          </button>
        </div>
      </header>

      {/* Content */}
      <div class="max-w-2xl mx-auto px-4 py-6">
        {/* Create room form */}
        <form onSubmit={handleCreateRoom} class="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Nombre del nuevo room..."
            value={newRoomName}
            onInput={(e) =>
              setNewRoomName((e.target as HTMLInputElement).value)
            }
            class="flex-1 px-3.5 py-2.5 rounded-lg text-sm"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              color: "var(--color-text)",
            }}
          />
          <button
            type="submit"
            disabled={creating}
            class="px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-all"
            style={{
              background: creating
                ? "var(--color-text-muted)"
                : "var(--color-primary)",
              color: "white",
              border: "none",
            }}
          >
            {creating ? "..." : "Crear"}
          </button>
        </form>

        {/* Room list */}
        {loading ? (
          <div class="text-center py-16">
            <p class="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Cargando rooms...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div class="text-center py-16">
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
              No hay rooms todavia
            </p>
            <p class="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Crea el primero para empezar a chatear
            </p>
          </div>
        ) : (
          <div class="flex flex-col gap-2">
            {rooms.map((room, i) => (
              <button
                key={room.id}
                onClick={() => navigate(`/rooms/${room.id}`)}
                class="animate-slide-up flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer text-left transition-all"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  animationDelay: `${i * 40}ms`,
                  opacity: 0,
                }}
              >
                <div class="flex items-center gap-3">
                  <div
                    class="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                    style={{ background: "var(--color-primary-light)" }}
                  >
                    <span
                      class="text-sm font-bold"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {room.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold"
                      style={{ color: "var(--color-text)" }}
                    >
                      {room.name}
                    </p>
                    <p
                      class="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {room.created_by.userName || room.created_by.email}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span
                    class="text-xs tabular-nums"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {new Date(room.created_at).toLocaleDateString()}
                  </span>
                  {isOwner(room) && (
                    <button
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      disabled={deleting === room.id}
                      class="flex items-center justify-center w-7 h-7 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--color-border)",
                        color:
                          deleting === room.id
                            ? "var(--color-text-muted)"
                            : "var(--color-danger)",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
