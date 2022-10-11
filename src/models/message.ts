export interface Message {
  id?: number;
  userId: number;
  friendId: number;
  message: string;
  updated_at: string | number;
  created_at: string | number;
}
