import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import {
  Room,
  RoomWithCreator,
} from './room.types';
import { getCreator } from '../../shared/utils/getCreator';

const broadcastRoomCreated = async (room: RoomWithCreator) => {
  const channel = supabase.channel('rooms');
  await channel.send({
    type: 'broadcast',
    event: 'room-created',
    payload: room,
  });
  supabase.removeChannel(channel);
};

const broadcastRoomDeleted = async (roomId: string) => {
  const channel = supabase.channel(`room:${roomId}`);
  await channel.send({
    type: 'broadcast',
    event: 'room-deleted',
    payload: {},
  });
  supabase.removeChannel(channel);

  const globalChannel = supabase.channel('rooms');
  await globalChannel.send({
    type: 'broadcast',
    event: 'room-deleted',
    payload: { roomId },
  });
  supabase.removeChannel(globalChannel);
};

const toRoomWithCreator = async (room: Room): Promise<RoomWithCreator> => {
  const creator = await getCreator(room.created_by);
  return {
    id: room.id,
    name: room.name,
    created_at: room.created_at,
    created_by: creator,
  };
};

export const getRoomByName = async (
  name: string
): Promise<RoomWithCreator | null> => {
  const result = await pool.query<Room>(
    'SELECT id, name, created_by, created_at FROM public.rooms WHERE name = $1',
    [name]
  );
  if (result.rows.length === 0) return null;
  return toRoomWithCreator(result.rows[0]);
};

const getRawRoomById = async (roomId: string): Promise<Room> => {
  const result = await pool.query<Room>(
    'SELECT id, name, created_by, created_at FROM public.rooms WHERE id = $1',
    [roomId]
  );

  if (result.rows.length === 0) {
    throw Boom.notFound('Room not found');
  }

  return result.rows[0];
};

export const getRoomById = async (roomId: string): Promise<RoomWithCreator> => {
  const room = await getRawRoomById(roomId);
  return toRoomWithCreator(room);
};

export const getRoomsService = async (): Promise<RoomWithCreator[]> => {
  const result = await pool.query<RoomWithCreator>(
    `SELECT r.id, r.name, r.created_at,
      json_build_object(
        'userName', COALESCE(u.raw_user_meta_data->>'userName', ''),
        'email', u.email
      ) AS created_by
    FROM public.rooms r
    JOIN auth.users u ON u.id = r.created_by
    ORDER BY r.created_at DESC`
  );
  return result.rows;
};

export const createRoomService = async (
  name: string,
  userId: string
): Promise<RoomWithCreator> => {
  const existing = await getRoomByName(name);
  if (existing) {
    throw Boom.conflict('A room with that name already exists');
  }

  const result = await pool.query<{ id: string }>(
    'INSERT INTO public.rooms (name, created_by) VALUES ($1, $2) RETURNING id',
    [name, userId]
  );

  const room = await getRoomById(result.rows[0].id);
  broadcastRoomCreated(room);
  return room;
};

export const deleteRoomService = async (
  roomId: string,
  userId: string
): Promise<void> => {
  const room = await getRawRoomById(roomId);

  if (room.created_by !== userId) {
    throw Boom.forbidden('Only the room creator can delete this room');
  }

  await pool.query('DELETE FROM public.rooms WHERE id = $1', [roomId]);
  broadcastRoomDeleted(roomId);
};

