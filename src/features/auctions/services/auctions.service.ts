/**
 * Auctions Service
 * GraphQL API calls for Auctions Module — Pure production GraphQL connected directly to NestJS Backend
 */

import { executeGraphQL } from '@/services/api/graphqlClient';
import { subscribeToSubscription } from '@/services/websocket/socketClient';
import { uploadService } from '@/services/api/upload.service';
import { authStorage } from '@/utils/storage.utils';
import type {
  Auction,
  AuctionsPage,
  PaginationInput,
  AuctionsFilterInput,
  CreateAuctionInput,
  UpdateAuctionInput,
  AuctionStatusChangedPayload,
} from '../types/auctions.types';

// ----------------------------------------------------
// GraphQL Fragments & Operations
// ----------------------------------------------------

const AUCTION_FIELDS_FRAGMENT = `
  fragment AuctionFields on Auction {
    _id
    sellerId
    title
    description
    images
    category
    startingPrice
    minimumBidIncrement
    currentPrice
    status
    startTime
    endTime
    winnerId
    isFinalized
    adminActionReason
    createdAt
    updatedAt
  }
`;

const AUCTIONS_QUERY = `
  ${AUCTION_FIELDS_FRAGMENT}
  query Auctions($input: PaginationInput!, $filter: AuctionsFilterInput) {
    auctions(input: $input, filter: $filter) {
      items {
        ...AuctionFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

const AUCTION_BY_ID_QUERY = `
  ${AUCTION_FIELDS_FRAGMENT}
  query Auction($id: ID!) {
    auction(id: $id) {
      ...AuctionFields
    }
  }
`;

const MY_AUCTIONS_QUERY = `
  ${AUCTION_FIELDS_FRAGMENT}
  query MyAuctions($input: PaginationInput!, $filter: AuctionsFilterInput) {
    myAuctions(input: $input, filter: $filter) {
      items {
        ...AuctionFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

const MY_WON_AUCTIONS_QUERY = `
  ${AUCTION_FIELDS_FRAGMENT}
  query MyWonAuctions($input: PaginationInput!, $filter: AuctionsFilterInput) {
    myWonAuctions(input: $input, filter: $filter) {
      items {
        ...AuctionFields
      }
      total
      totalPages
      hasNextPage
    }
  }
`;

const CREATE_AUCTION_MUTATION = `
  ${AUCTION_FIELDS_FRAGMENT}
  mutation CreateAuction($input: CreateAuctionInput!) {
    createAuction(input: $input) {
      ...AuctionFields
    }
  }
`;

const UPDATE_AUCTION_MUTATION = `
  ${AUCTION_FIELDS_FRAGMENT}
  mutation UpdateAuction($id: ID!, $input: UpdateAuctionInput!) {
    updateAuction(id: $id, input: $input) {
      ...AuctionFields
    }
  }
`;

const CANCEL_AUCTION_MUTATION = `
  mutation CancelAuction($id: ID!) {
    cancelAuction(id: $id)
  }
`;

// ----------------------------------------------------
// Public API Methods
// ----------------------------------------------------

export const auctionsService = {
  /**
   * Fetch paginated list of auctions with filtering and sorting
   */
  getAll: async (
    input: PaginationInput = { page: 1, limit: 12 },
    filter: AuctionsFilterInput = {}
  ): Promise<AuctionsPage> => {
    const data = await executeGraphQL<{ auctions: AuctionsPage }>(AUCTIONS_QUERY, {
      input,
      filter,
    });
    return data.auctions;
  },

  /**
   * Fetch single auction by its unique ID
   */
  getById: async (id: string): Promise<Auction> => {
    const data = await executeGraphQL<{ auction: Auction }>(AUCTION_BY_ID_QUERY, { id });
    return data.auction;
  },

  /**
   * Fetch current user's created auctions (with optional status filter)
   */
  getMyAuctions: async (
    input: PaginationInput = { page: 1, limit: 12 },
    filter?: AuctionsFilterInput
  ): Promise<AuctionsPage> => {
    const data = await executeGraphQL<{ myAuctions: AuctionsPage }>(MY_AUCTIONS_QUERY, {
      input,
      filter: filter || null,
    });
    return data.myAuctions;
  },

  /**
   * Fetch auctions that the current user has won
   */
  getMyWonAuctions: async (
    input: PaginationInput = { page: 1, limit: 12 },
    filter?: AuctionsFilterInput
  ): Promise<AuctionsPage> => {
    const data = await executeGraphQL<{ myWonAuctions: AuctionsPage }>(MY_WON_AUCTIONS_QUERY, {
      input,
      filter: filter || null,
    });
    return data.myWonAuctions;
  },

  /**
   * Fetch consolidated auction statistics in a single unified GraphQL query (1 network request)
   */
  getMyAuctionsStats: async (): Promise<{
    totalCreated: number;
    activeCreated: number;
    pendingCreated: number;
    totalWon: number;
  }> => {
    const data = await executeGraphQL<{
      allCreated: { total: number };
      activeCreated: { total: number };
      pendingCreated: { total: number };
      allWon: { total: number };
    }>(`
      query MyAuctionsStats {
        allCreated: myAuctions(input: { page: 1, limit: 1 }) {
          total
        }
        activeCreated: myAuctions(input: { page: 1, limit: 1 }, filter: { status: ACTIVE }) {
          total
        }
        pendingCreated: myAuctions(input: { page: 1, limit: 1 }, filter: { status: PENDING }) {
          total
        }
        allWon: myWonAuctions(input: { page: 1, limit: 1 }) {
          total
        }
      }
    `);

    return {
      totalCreated: data.allCreated?.total ?? 0,
      activeCreated: data.activeCreated?.total ?? 0,
      pendingCreated: data.pendingCreated?.total ?? 0,
      totalWon: data.allWon?.total ?? 0,
    };
  },

  /**
   * Create a new auction
   */
  create: async (input: CreateAuctionInput): Promise<Auction> => {
    const data = await executeGraphQL<{ createAuction: Auction }>(CREATE_AUCTION_MUTATION, {
      input,
    });
    return data.createAuction;
  },

  /**
   * Update an existing PENDING auction
   */
  update: async (id: string, input: UpdateAuctionInput): Promise<Auction> => {
    const data = await executeGraphQL<{ updateAuction: Auction }>(UPDATE_AUCTION_MUTATION, {
      id,
      input,
    });
    return data.updateAuction;
  },

  /**
   * Cancel an existing PENDING auction without bids
   */
  cancel: async (id: string): Promise<boolean> => {
    const data = await executeGraphQL<{ cancelAuction: boolean }>(CANCEL_AUCTION_MUTATION, { id });
    return data.cancelAuction;
  },

  /**
   * Get Cloudinary upload signature for direct browser uploads
  /**
   * Get Cloudinary upload signature for direct browser uploads (Delegated to centralized uploadService)
   */
  getUploadSignature: (folder = 'auctions') => uploadService.getUploadSignature(folder),

  /**
   * Upload image via Base64 endpoint (Delegated to centralized uploadService)
   */
  uploadImage: (base64Data: string, folder = 'auctions') => uploadService.uploadImage(base64Data, folder),

  /**
   * Upload single image file (Delegated to centralized uploadService)
   */
  uploadImageFile: (file: File, folder = 'auctions') => uploadService.uploadImageFile(file, folder),

  /**
   * High-speed parallel batch image upload (Delegated to centralized uploadService)
   */
  uploadBatchImages: (files: File[], folder = 'auctions') => uploadService.uploadBatchImages(files, folder),

  /**
   * Subscribe to live auction status changes via WebSocket (GraphQL Subscriptions)
   */
  subscribeToStatusChanges: (
    auctionId: string,
    callback: (payload: AuctionStatusChangedPayload) => void
  ): (() => void) => {
    // 1. GraphQL WebSocket Subscription
    const unsubscribeWs = subscribeToSubscription<{ auctionStatusChanged: AuctionStatusChangedPayload }>(
      {
        query: `
          ${AUCTION_FIELDS_FRAGMENT}
          subscription AuctionStatusChanged($auctionId: ID!) {
            auctionStatusChanged(auctionId: $auctionId) {
              auction {
                ...AuctionFields
              }
            }
          }
        `,
        variables: { auctionId },
      },
      {
        next: (data) => {
          if (data.auctionStatusChanged?.auction) {
            callback(data.auctionStatusChanged);
          }
        },
        error: (err) => {
          console.warn(`WebSocket subscription error for auction ${auctionId}:`, err);
        },
      },
      authStorage.getAccessToken()
    );

    // 2. Local Custom Event listener for in-app instant optimistic updates
    const handleCustomStatusChange = (event: Event) => {
      const customEv = event as CustomEvent<AuctionStatusChangedPayload>;
      if (customEv.detail && customEv.detail.auction._id === auctionId) {
        callback(customEv.detail);
      }
    };

    window.addEventListener('mazadak:auction_status_changed', handleCustomStatusChange);

    return () => {
      unsubscribeWs();
      window.removeEventListener('mazadak:auction_status_changed', handleCustomStatusChange);
    };
  },

  /**
   * Subscribe to global live auction creation events via WebSocket (GraphQL Subscriptions)
   */
  subscribeToAuctionCreated: (
    callback: (auction: Auction) => void
  ): (() => void) => {
    // 1. GraphQL WebSocket Subscription
    const unsubscribeWs = subscribeToSubscription<{ auctionCreated: Auction }>(
      {
        query: `
          ${AUCTION_FIELDS_FRAGMENT}
          subscription AuctionCreated {
            auctionCreated {
              ...AuctionFields
            }
          }
        `,
      },
      {
        next: (data) => {
          if (data.auctionCreated) {
            callback(data.auctionCreated);
          }
        },
        error: (err) => {
          console.warn('WebSocket subscription error for auctionCreated:', err);
        },
      },
      authStorage.getAccessToken()
    );

    // 2. Local Custom Event listener for in-app instant updates across tabs/actions
    const handleCustomAuctionCreated = (event: Event) => {
      const customEv = event as CustomEvent<Auction>;
      if (customEv.detail) {
        callback(customEv.detail);
      }
    };

    window.addEventListener('mazadak:auction_created', handleCustomAuctionCreated);

    return () => {
      unsubscribeWs();
      window.removeEventListener('mazadak:auction_created', handleCustomAuctionCreated);
    };
  },
};
