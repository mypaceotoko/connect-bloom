export type Message = {
  id: string;
  matchId: string;
  senderId: 'current-user' | string;
  body: string;
  createdAt: string;
};
