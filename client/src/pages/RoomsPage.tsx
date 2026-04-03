import { useState } from "preact/hooks";
import { useNavigate } from "react-router-dom";

import { useUser } from "../providers/UserProvider";
import { useRooms } from "../providers/RoomsProvider";
import { RoomForm } from "../components/RoomForm/RoomForm";
import { RoomList } from "../components/RoomList/RoomList";
import type { Room } from "../types";

export const RoomsPage = () => {
  const { auth, logout } = useUser();
  const navigate = useNavigate();
  const { rooms, loading, creating, deleting, createRoom, deleteRoom } =
    useRooms();
  const [newRoomName, setNewRoomName] = useState("");

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    const success = await createRoom(newRoomName.trim());
    if (success) setNewRoomName("");
  };

  const handleLogout = () => {
    logout();
  };

  const isOwner = (room: Room) => room.created_by.email === auth?.user.email;

  return (
    <div class="min-h-screen" style={{ background: "var(--color-bg)" }}>
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

      <div class="max-w-2xl mx-auto px-4 py-6">
        <RoomForm
          value={newRoomName}
          creating={creating}
          onInput={setNewRoomName}
          onSubmit={handleCreateRoom}
        />
        <RoomList
          rooms={rooms}
          loading={loading}
          deleting={deleting}
          isOwner={isOwner}
          onRoomClick={(id) => navigate(`/rooms/${id}`)}
          onDelete={deleteRoom}
        />
      </div>
    </div>
  );
};
