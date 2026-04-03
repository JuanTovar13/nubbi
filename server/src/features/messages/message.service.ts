import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import { MessageWithCreator } from './message.types';

const broadcastMessage = async (
  roomId: string,
  message: MessageWithCreator
) => {
  const channel = supabase.channel(`room:${roomId}`);
  await channel.httpSend('new-message', message);
  supabase.removeChannel(channel);
};

export const createMessageService = async (
  roomId: string,
  content: string,
  userId: string
): Promise<MessageWithCreator> => {
  const result = await pool.query<MessageWithCreator>(
    `WITH inserted AS (
      INSERT INTO public.messages (content, room_id, created_by)
      VALUES ($1, $2, $3)
      RETURNING id, content, room_id, created_by, created_at
    )
    SELECT i.id, i.content, i.room_id, i.created_at,
      json_build_object(
        'userName', COALESCE(u.raw_user_meta_data->>'userName', ''),
        'email', u.email
      ) AS created_by
    FROM inserted i
    JOIN auth.users u ON u.id = i.created_by`,
    [content, roomId, userId]
  );

  const message = result.rows[0];
  broadcastMessage(roomId, message);

  return message;
};

export const getMessagesService = async (
  roomId: string
): Promise<MessageWithCreator[]> => {
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
