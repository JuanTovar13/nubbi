import { pool } from '../../config/database';
import { supabase } from '../../config/supabase';
import { getRoomById } from '../rooms/room.service';
import { Message, MessageWithCreator } from './message.types';
import { getCreator } from '../../shared/utils/getCreator';

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

export const createMessageService = async (
  roomId: string,
  content: string,
  userId: string
): Promise<MessageWithCreator> => {
  await getRoomById(roomId);

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
  await getRoomById(roomId);

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
