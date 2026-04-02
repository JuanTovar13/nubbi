import Boom from '@hapi/boom';
import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import {
  Message,
  MessageWithCreator,
  Room,
  Creator,
  RoomWithCreator,
} from './room.types';

const broadcastMessage = async (
  roomId: string,
  message: MessageWithCreator
) => {
  const channel = supabase.channel(`room:${roomId}`);
  await channel.send({
    type: 'broadcast',
    event: 'new-message',
    payload: message,
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
};

const getCreator = async (userId: string): Promise<Creator> => {
  const result = await pool.query<{
    email: string;
    raw_user_meta_data: { userName?: string };
  }>('SELECT email, raw_user_meta_data FROM auth.users WHERE id = $1', [
    userId,
  ]);

  const user = result.rows[0];
  return {
    userName: user.raw_user_meta_data?.userName ?? '',
    email: user.email,
  };
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

  return getRoomById(result.rows[0].id);
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

export const createMessageService = async (
  roomId: string,
  content: string,
  userId: string
): Promise<MessageWithCreator> => {
  await getRawRoomById(roomId);

  const result = await pool.query<Message>(
    'INSERT INTO public.messages (content, room_id, created_by) VALUES ($1, $2, $3) RETURNING id, content, room_id, created_by, created_at',
    [content, roomId, userId]
  );

  const creator = await getCreator(userId);
  const message = result.rows[0];

  const messageCreated: MessageWithCreator = {
    id: message.id,
    content: message.content,
    room_id: message.room_id,
    created_at: message.created_at,
    created_by: creator,
  };

  broadcastMessage(roomId, messageCreated);

  return messageCreated;
};

export const getMessagesService = async (
  roomId: string
): Promise<MessageWithCreator[]> => {
  await getRawRoomById(roomId);

  const result = await pool.query<MessageWithCreator>(
    `SELECT m.id, m.content, m.room_id, m.created_at,
      json_build_object(
        'userName', COALESCE(u.raw_user_meta_data->>'userName', ''),
        'email', u.email
      ) AS created_by
    FROM public.messages m
    JOIN auth.users u ON u.id = m.created_by
    WHERE m.room_id = $1
    ORDER BY m.created_at ASC`,
    [roomId]
  );
  return result.rows;
};
