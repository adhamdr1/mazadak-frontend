/**
 * Chat Module Exports
 */

// Pages
export { MessagesPage, default as MessagesPageDefault } from './pages/MessagesPage';

// Components
export { default as AuctionChatDrawer } from './components/AuctionChatDrawer';
export { ChatMessageBubble } from './components/ChatMessageBubble';
export { ChatInputBar } from './components/ChatInputBar';
export { EmojiPanel } from './components/EmojiPanel';
export { MessageReactions } from './components/MessageReactions';
export { ChatRoomCard } from './components/ChatRoomCard';
export { ChatRoomsSkeleton } from './components/ChatRoomsSkeleton';
export { DateSeparator } from './components/DateSeparator';

// Hooks
export { useChatMessages } from './hooks/useChatMessages';
export { useChatActions } from './hooks/useChatActions';
export { useChatSubscriptions } from './hooks/useChatSubscriptions';
export { useImageUpload } from './hooks/useImageUpload';
export { useMyRooms } from './hooks/useMyRooms';
export { useUnreadChatRoomsCount } from './hooks/useUnreadChatRoomsCount';

// Services
export { chatService } from './services/chat.service';

// Types
export type {
  ChatMessageData,
  ChatMessageType,
  ChatReactionData,
  ChatReadStateData,
  ChatMessagesConnectionData,
  ChatReadStateUpdatedPayload,
  SendMessageInput,
  PendingMessage,
  MessageStatus,
  ChatRoomData,
  ChatRoomsPageData,
  ChatRoomAuction,
  ChatRoomUpdatedPayload,
} from './types/chat.types';
