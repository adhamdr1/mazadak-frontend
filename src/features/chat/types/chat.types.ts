/**
 * Chat Module TypeScript Definitions
 * 100% strictly aligned with `.agents/schema.gql` and `.agents/BACKEND_CONTRACT.md`
 */

export type ChatMessageType = 'TEXT' | 'IMAGE';

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface ChatReactionData {
  emoji: string;
  userId: string;
}

export interface ChatMessageData {
  _id: string;
  clientMessageId: string;
  auctionId: string;
  senderId: string;
  senderName: string;
  type: ChatMessageType;
  content: string | null;
  mediaUrls: string[] | null;
  reactions: ChatReactionData[];
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string; // ISO 8601 DateTime
}

/**
 * Optimistic Pending Message for WhatsApp-like instant UI feedback
 */
export interface PendingMessage extends ChatMessageData {
  _status: MessageStatus;
  _localId: string;
  errorMessage?: string;
}

export interface ChatReadStateData {
  _id: string;
  auctionId: string;
  userId: string;
  lastReadMessageId: string | null;
  lastReadAt: string | null;
}

export interface ChatMessagesConnectionData {
  items: ChatMessageData[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface ChatReadStateUpdatedPayload {
  auctionId: string;
  userId: string;
  lastReadMessageId: string | null;
  lastReadAt: string | null;
}

export interface SendMessageInput {
  auctionId: string;
  content?: string | null;
  type?: ChatMessageType;
  mediaUrls?: string[] | null;
  clientMessageId: string;
}

// ----------------------------------------------------
// Chat Room & Inbox Types (for Batch 2 & General Use)
// ----------------------------------------------------

export interface ChatRoomAuction {
  _id: string;
  title: string;
  images: string[];
  status: string;
  sellerId: string;
  winnerId: string | null;
  currentPrice: string;
}

export interface ChatRoomData {
  auctionId: string;
  lastMessageAt: string | null;
  unreadCount: number;
  auction: ChatRoomAuction;
  lastMessage: ChatMessageData | null;
}

export interface ChatRoomsPageData {
  items: ChatRoomData[];
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}
