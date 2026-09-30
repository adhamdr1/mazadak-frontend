/**
 * Chat Service
 * GraphQL API calls & WebSocket Subscriptions for Chat Module
 * Pure production GraphQL connected directly to NestJS Backend
 */

import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import type {
  ChatMessageData,
  ChatReadStateData,
  ChatMessagesConnectionData,
  ChatReadStateUpdatedPayload,
  SendMessageInput,
  ChatRoomsPageData,
  ChatRoomUpdatedPayload,
} from '../types/chat.types';

// ----------------------------------------------------
// GraphQL Fragments & Operations
// ----------------------------------------------------

const CHAT_MESSAGE_FIELDS_FRAGMENT = `
  fragment ChatMessageFields on ChatMessage {
    _id
    clientMessageId
    auctionId
    senderId
    senderName
    type
    content
    mediaUrls
    reactions {
      emoji
      userId
    }
    isEdited
    isDeleted
    createdAt
  }
`;

const CHAT_MESSAGES_QUERY = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  query GetChatMessages($auctionId: ID!, $limit: Float, $cursor: String) {
    chatMessages(auctionId: $auctionId, limit: $limit, cursor: $cursor) {
      items {
        ...ChatMessageFields
      }
      hasNextPage
      endCursor
    }
  }
`;

const CHAT_READ_STATE_QUERY = `
  query GetChatReadState($auctionId: ID!) {
    chatReadState(auctionId: $auctionId) {
      _id
      auctionId
      userId
      lastReadMessageId
      lastReadAt
    }
  }
`;

const CHAT_READ_STATES_QUERY = `
  query GetChatReadStates($auctionId: ID!) {
    chatReadStates(auctionId: $auctionId) {
      _id
      auctionId
      userId
      lastReadMessageId
      lastReadAt
    }
  }
`;

const SEND_MESSAGE_MUTATION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  mutation SendMessage($input: CreateChatMessageInput!) {
    sendMessage(input: $input) {
      ...ChatMessageFields
    }
  }
`;

const EDIT_MESSAGE_MUTATION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  mutation EditMessage($messageId: ID!, $newContent: String!) {
    editMessage(messageId: $messageId, newContent: $newContent) {
      ...ChatMessageFields
    }
  }
`;

const DELETE_MESSAGE_MUTATION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      ...ChatMessageFields
    }
  }
`;

const REACT_TO_MESSAGE_MUTATION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  mutation ReactToMessage($messageId: ID!, $emoji: String) {
    reactToMessage(messageId: $messageId, emoji: $emoji) {
      ...ChatMessageFields
    }
  }
`;

const MARK_CHAT_AS_READ_MUTATION = `
  mutation MarkChatAsRead($auctionId: ID!, $lastReadMessageId: ID!) {
    markChatAsRead(auctionId: $auctionId, lastReadMessageId: $lastReadMessageId)
  }
`;

const MY_CHAT_ROOMS_QUERY = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  query MyChatRooms($pagination: PaginationInput) {
    myChatRooms(pagination: $pagination) {
      total
      totalPages
      hasNextPage
      items {
        auctionId
        lastMessageAt
        unreadCount
        auction {
          _id
          title
          images
          status
          sellerId
          winnerId
          currentPrice
        }
        lastMessage {
          ...ChatMessageFields
        }
      }
    }
  }
`;

export const ON_MESSAGE_SENT_SUBSCRIPTION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  subscription OnMessageSent($auctionId: ID!) {
    messageSent(auctionId: $auctionId) {
      ...ChatMessageFields
    }
  }
`;

export const ON_MESSAGE_UPDATED_SUBSCRIPTION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  subscription OnMessageUpdated($auctionId: ID!) {
    messageUpdated(auctionId: $auctionId) {
      ...ChatMessageFields
    }
  }
`;

export const ON_CHAT_READ_STATUS_UPDATED_SUBSCRIPTION = `
  subscription OnChatReadStatusUpdated($auctionId: ID!) {
    chatReadStatusUpdated(auctionId: $auctionId) {
      auctionId
      userId
      lastReadMessageId
      lastReadAt
    }
  }
`;

export const ON_MY_CHAT_ROOM_UPDATED_SUBSCRIPTION = `
  ${CHAT_MESSAGE_FIELDS_FRAGMENT}
  subscription OnMyChatRoomUpdated {
    myChatRoomUpdated {
      auctionId
      unreadCount
      totalUnreadRooms
      lastMessageAt
      lastMessage {
        ...ChatMessageFields
      }
    }
  }
`;

// ----------------------------------------------------
// Chat Service Methods
// ----------------------------------------------------

export const chatService = {
  /**
   * Fetch chat messages with Cursor/Keyset pagination
   */
  getChatMessages: async (
    auctionId: string,
    limit = 20,
    cursor?: string
  ): Promise<ChatMessagesConnectionData> => {
    const data = await executeGraphQL<{ chatMessages: ChatMessagesConnectionData }>(
      CHAT_MESSAGES_QUERY,
      { auctionId, limit, cursor: cursor || null }
    );
    return data.chatMessages;
  },

  /**
   * Fetch read state for current user
   */
  getChatReadState: async (auctionId: string): Promise<ChatReadStateData | null> => {
    const data = await executeGraphQL<{ chatReadState: ChatReadStateData | null }>(
      CHAT_READ_STATE_QUERY,
      { auctionId }
    );
    return data.chatReadState;
  },

  /**
   * Fetch read states for all participants in the auction room (solves F5 reload checkmarks)
   */
  getChatReadStates: async (auctionId: string): Promise<ChatReadStateData[]> => {
    const data = await executeGraphQL<{ chatReadStates: ChatReadStateData[] }>(
      CHAT_READ_STATES_QUERY,
      { auctionId }
    );
    return data.chatReadStates || [];
  },

  /**
   * Send a new chat message
   */
  sendMessage: async (input: SendMessageInput): Promise<ChatMessageData> => {
    const inputPayload: Record<string, unknown> = {
      auctionId: input.auctionId,
      clientMessageId: input.clientMessageId,
      type: input.type || 'TEXT',
    };

    if (input.content !== undefined && input.content !== null && input.content !== '') {
      inputPayload.content = input.content;
    }

    if (Array.isArray(input.mediaUrls) && input.mediaUrls.length > 0) {
      inputPayload.mediaUrls = input.mediaUrls;
    }

    const data = await executeGraphQL<{ sendMessage: ChatMessageData }>(
      SEND_MESSAGE_MUTATION,
      { input: inputPayload }
    );
    return data.sendMessage;
  },

  /**
   * Edit an existing message (allowed within 15 minutes by owner)
   */
  editMessage: async (messageId: string, newContent: string): Promise<ChatMessageData> => {
    const data = await executeGraphQL<{ editMessage: ChatMessageData }>(
      EDIT_MESSAGE_MUTATION,
      { messageId, newContent }
    );
    return data.editMessage;
  },

  /**
   * Delete a message (soft delete: sets isDeleted = true, content = null)
   */
  deleteMessage: async (messageId: string): Promise<ChatMessageData> => {
    const data = await executeGraphQL<{ deleteMessage: ChatMessageData }>(
      DELETE_MESSAGE_MUTATION,
      { messageId }
    );
    return data.deleteMessage;
  },

  /**
   * Add, change, or remove a reaction. Pass emoji = null to remove reaction.
   */
  reactToMessage: async (messageId: string, emoji: string | null): Promise<ChatMessageData> => {
    const data = await executeGraphQL<{ reactToMessage: ChatMessageData }>(
      REACT_TO_MESSAGE_MUTATION,
      { messageId, emoji: emoji || null }
    );
    return data.reactToMessage;
  },

  /**
   * Mark chat messages up to lastReadMessageId as read
   */
  markChatAsRead: async (auctionId: string, lastReadMessageId: string): Promise<boolean> => {
    const data = await executeGraphQL<{ markChatAsRead: boolean }>(
      MARK_CHAT_AS_READ_MUTATION,
      { auctionId, lastReadMessageId }
    );
    return !!data.markChatAsRead;
  },

  /**
   * Fetch all chat rooms for current user (Zero N+1, production-ready)
   */
  getMyChatRooms: async (page = 1, limit = 15): Promise<ChatRoomsPageData> => {
    const data = await executeGraphQL<{ myChatRooms: ChatRoomsPageData }>(
      MY_CHAT_ROOMS_QUERY,
      { pagination: { page, limit } }
    );
    return data.myChatRooms;
  },

  // ----------------------------------------------------
  // Subscriptions
  // ----------------------------------------------------

  /**
   * Subscribe to new incoming messages for an auction
   */
  subscribeToMessageSent: (
    auctionId: string,
    handlers: {
      next: (data: { messageSent: ChatMessageData }) => void;
      error?: (err: unknown) => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ messageSent: ChatMessageData }>(
      {
        query: ON_MESSAGE_SENT_SUBSCRIPTION,
        variables: { auctionId },
      },
      handlers,
      token
    );
  },

  /**
   * Subscribe to message updates (edits, deletes, reactions)
   */
  subscribeToMessageUpdated: (
    auctionId: string,
    handlers: {
      next: (data: { messageUpdated: ChatMessageData }) => void;
      error?: (err: unknown) => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ messageUpdated: ChatMessageData }>(
      {
        query: ON_MESSAGE_UPDATED_SUBSCRIPTION,
        variables: { auctionId },
      },
      handlers,
      token
    );
  },

  /**
   * Subscribe to read status changes for an auction
   */
  subscribeToReadStatus: (
    auctionId: string,
    handlers: {
      next: (data: { chatReadStatusUpdated: ChatReadStateUpdatedPayload }) => void;
      error?: (err: unknown) => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ chatReadStatusUpdated: ChatReadStateUpdatedPayload }>(
      {
        query: ON_CHAT_READ_STATUS_UPDATED_SUBSCRIPTION,
        variables: { auctionId },
      },
      handlers,
      token
    );

  },
  /**
   * Subscribe to user-level chat room updates across the whole platform (Navbar badge & Inbox)
   */
  subscribeToMyChatRoomUpdated: (
    handlers: {
      next: (data: { myChatRoomUpdated: ChatRoomUpdatedPayload }) => void;
      error?: (err: unknown) => void;
    },
    token?: string | null
  ): (() => void) => {
    return subscribeToSubscription<{ myChatRoomUpdated: ChatRoomUpdatedPayload }>(
      {
        query: ON_MY_CHAT_ROOM_UPDATED_SUBSCRIPTION,
      },
      handlers,
      token
    );
  },
};
