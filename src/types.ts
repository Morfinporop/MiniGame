export interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  score: number;
  ready: boolean;
}

export interface ChainItem {
  type: 'write' | 'draw';
  content: string;
  authorId: string;
  authorName: string;
}

export interface Room {
  code: string;
  hostId: string;
  phase: 'lobby' | 'write' | 'draw' | 'reveal' | 'finished';
  round: number;
  totalRounds: number;
  roundTime: number;
  players: Player[];
  revealIndex: number;
  revealChainIndex: number;
  submittedIds: string[];
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export interface RevealItem {
  chainOwner: Player;
  chainIndex: number;
  chainLength: number;
  totalChains: number;
  currentChain: number;
  item: ChainItem | null;
}
