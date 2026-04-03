import { pool } from '../../config/database';
import { Creator } from '../types/creator';

export const getCreator = async (userId: string): Promise<Creator> => {
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
