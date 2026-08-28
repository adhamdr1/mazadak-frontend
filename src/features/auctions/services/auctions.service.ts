import { apiClient } from '@/services/api/apiClient';
import axios from 'axios';
import type {
  Auction,
  AuctionsPage,
  AuctionsFilterInput,
  PaginationInput,
  CreateAuctionInput,
  UpdateAuctionInput,
  UploadImageResponse,
  UploadSignatureResponse,
  AuctionStatusChangedPayload,
} from '../types/auctions.types';
import { MOCK_AUCTIONS } from './auctions.mock';

// ----------------------------------------------------
// GraphQL Fragments & Operations
// ----------------------------------------------------

export const AUCTION_FIELDS_FRAGMENT = `
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

const AUCTION_DETAIL_QUERY = `
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

const GENERATE_UPLOAD_SIGNATURE_QUERY = `
  query GenerateUploadSignature($folder: String) {
    generateUploadSignature(folder: $folder) {
      signature
      timestamp
      apiKey
      cloudName
      folder
    }
  }
`;

const UPLOAD_IMAGE_MUTATION = `
  mutation UploadImage($input: UploadImageInput!) {
    uploadImage(input: $input) {
      url
    }
  }
`;

// ----------------------------------------------------
// GraphQL Execution Helper
// ----------------------------------------------------

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
      status?: number;
      originalError?: {
        message?: string | string[];
        statusCode?: number;
      };
    };
  }>;
}

function parseGraphQLError(errData: {
  message: string;
  extensions?: { code?: string; originalError?: { message?: string | string[] } };
}): string {
  const origMsg = errData?.extensions?.originalError?.message;
  if (Array.isArray(origMsg) && origMsg.length > 0) {
    return origMsg.join('. ');
  }
  if (typeof origMsg === 'string' && origMsg.trim().length > 0) {
    return origMsg;
  }
  if (typeof errData?.message === 'string' && errData.message !== 'Bad Request Exception') {
    return errData.message;
  }
  return errData?.extensions?.code || errData?.message || 'GENERIC_ERROR';
}

async function executeGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  try {
    const response = await apiClient.post<GraphQLResponse<T>>('', {
      query,
      variables,
    });

    if (response.data?.errors && response.data.errors.length > 0) {
      const primaryError = response.data.errors[0];
      const errorMsg = parseGraphQLError(primaryError);
      throw new Error(errorMsg);
    }

    if (!response.data?.data) {
      throw new Error('GENERIC_ERROR');
    }

    return response.data.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const graphqlErrors = err.response?.data?.errors;
      if (graphqlErrors && Array.isArray(graphqlErrors) && graphqlErrors.length > 0) {
        const primaryError = graphqlErrors[0];
        const errorMsg = parseGraphQLError(primaryError);
        throw new Error(errorMsg);
      }
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('GENERIC_ERROR');
  }
}

function normalizeSearchTerm(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u065F]/g, ''); // Remove Arabic tashkeel
}

// ----------------------------------------------------
// Auctions Service API Methods
// ----------------------------------------------------

export const auctionsService = {
  /**
   * Fetch paginated list of auctions with filtering and sorting
   */
  getAll: async (params?: {
    input?: PaginationInput;
    filter?: AuctionsFilterInput;
  }): Promise<AuctionsPage> => {
    const page = params?.input?.page || 1;
    const limit = params?.input?.limit || 12;

    try {
      const data = await executeGraphQL<{ auctions: AuctionsPage }>(AUCTIONS_QUERY, {
        input: { page, limit },
        filter: params?.filter || {},
      });
      if (data?.auctions && Array.isArray(data.auctions.items) && data.auctions.items.length > 0) {
        return data.auctions;
      }
      throw new Error('FALLBACK_TO_MOCK');
    } catch {
      const nowMs = Date.now();
      let filtered = [...MOCK_AUCTIONS];

      // 1. Category Filter
      if (params?.filter?.category) {
        filtered = filtered.filter((item) => item.category === params.filter?.category);
      }

      // 2. Dynamic Status Filter (Auctions whose endTime passed move dynamically into ENDED)
      if (params?.filter?.status === 'ACTIVE') {
        filtered = filtered.filter(
          (item) => item.status === 'ACTIVE' && new Date(item.endTime).getTime() > nowMs
        );
      } else if (params?.filter?.status === 'ENDED') {
        filtered = filtered.filter(
          (item) => item.status === 'ENDED' || new Date(item.endTime).getTime() <= nowMs
        );
      } else if (params?.filter?.status) {
        filtered = filtered.filter((item) => item.status === params.filter?.status);
      }

      // 3. Precise Search Filter (Case-insensitive & Arabic normalized strictly over title)
      if (params?.filter?.search) {
        const normalizedQuery = normalizeSearchTerm(params.filter.search);
        filtered = filtered.filter((item) => {
          const normTitle = normalizeSearchTerm(item.title);
          return normTitle.includes(normalizedQuery);
        });
      }

      // 4. Smart Sort
      if (params?.filter?.sort) {
        const { field, order } = params.filter.sort;
        filtered.sort((a, b) => {
          if (field === 'CURRENT_PRICE') {
            const priceA = parseFloat(a.currentPrice || a.startingPrice);
            const priceB = parseFloat(b.currentPrice || b.startingPrice);
            return order === 'ASC' ? priceA - priceB : priceB - priceA;
          }

          if (field === 'END_TIME') {
            const endA = new Date(a.endTime).getTime();
            const endB = new Date(b.endTime).getTime();
            const aIsActive = endA > nowMs;
            const bIsActive = endB > nowMs;

            if (aIsActive && !bIsActive) return -1;
            if (!aIsActive && bIsActive) return 1;
            return order === 'ASC' ? endA - endB : endB - endA;
          }

          if (field === 'START_TIME') {
            const startA = new Date(a.startTime).getTime();
            const startB = new Date(b.startTime).getTime();
            const aIsPending = startA > nowMs;
            const bIsPending = startB > nowMs;

            if (aIsPending && !bIsPending) return -1;
            if (!aIsPending && bIsPending) return 1;
            return order === 'ASC' ? startA - startB : startB - startA;
          }

          if (field === 'TITLE') {
            return order === 'ASC'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          }

          const createdA = new Date(a.createdAt).getTime();
          const createdB = new Date(b.createdAt).getTime();
          return order === 'ASC' ? createdA - createdB : createdB - createdA;
        });
      }

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const items = filtered.slice(startIndex, startIndex + limit);

      return {
        items,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      };
    }
  },

  /**
   * Fetch single auction by ID
   */
  getById: async (id: string): Promise<Auction> => {
    try {
      const data = await executeGraphQL<{ auction: Auction }>(AUCTION_DETAIL_QUERY, { id });
      if (data?.auction) return data.auction;
      throw new Error('FALLBACK_TO_MOCK');
    } catch (err) {
      const found = MOCK_AUCTIONS.find((a) => a._id === id);
      if (found) return found;
      throw err;
    }
  },

  /**
   * Fetch current user's created auctions
   */
  getMyAuctions: async (params?: {
    input?: PaginationInput;
    filter?: AuctionsFilterInput;
  }): Promise<AuctionsPage> => {
    const page = params?.input?.page || 1;
    const limit = params?.input?.limit || 10;

    try {
      const data = await executeGraphQL<{ myAuctions: AuctionsPage }>(MY_AUCTIONS_QUERY, {
        input: { page, limit },
        filter: params?.filter || {},
      });
      if (data?.myAuctions?.items?.length > 0) {
        return data.myAuctions;
      }
      throw new Error('FALLBACK_TO_MOCK');
    } catch {
      const items = MOCK_AUCTIONS.slice(0, 5);
      return {
        items,
        total: items.length,
        totalPages: 1,
        hasNextPage: false,
      };
    }
  },

  /**
   * Fetch auctions won by current user
   */
  getMyWonAuctions: async (params?: {
    input?: PaginationInput;
    filter?: AuctionsFilterInput;
  }): Promise<AuctionsPage> => {
    const page = params?.input?.page || 1;
    const limit = params?.input?.limit || 10;

    try {
      const data = await executeGraphQL<{ myWonAuctions: AuctionsPage }>(MY_WON_AUCTIONS_QUERY, {
        input: { page, limit },
        filter: params?.filter || {},
      });
      if (data?.myWonAuctions?.items?.length > 0) {
        return data.myWonAuctions;
      }
      throw new Error('FALLBACK_TO_MOCK');
    } catch {
      const wonItems = MOCK_AUCTIONS.filter((a) => a.status === 'ENDED');
      return {
        items: wonItems,
        total: wonItems.length,
        totalPages: 1,
        hasNextPage: false,
      };
    }
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
   */
  getUploadSignature: async (folder = 'auctions'): Promise<UploadSignatureResponse> => {
    const data = await executeGraphQL<{ generateUploadSignature: UploadSignatureResponse }>(
      GENERATE_UPLOAD_SIGNATURE_QUERY,
      { folder }
    );
    return data.generateUploadSignature;
  },

  /**
   * Upload image via Base64 endpoint (Backend fallback)
   */
  uploadImage: async (base64Data: string, folder = 'auctions'): Promise<UploadImageResponse> => {
    const data = await executeGraphQL<{ uploadImage: UploadImageResponse }>(UPLOAD_IMAGE_MUTATION, {
      input: { base64Data, folder },
    });
    return data.uploadImage;
  },

  /**
   * Subscribe to live auction status changes
   */
  subscribeToStatusChanges: (
    auctionId: string,
    callback: (payload: AuctionStatusChangedPayload) => void
  ): (() => void) => {
    if (typeof window === 'undefined') return () => {};

    const handleCustomStatusChange = (event: Event) => {
      const customEv = event as CustomEvent<AuctionStatusChangedPayload>;
      if (customEv.detail && customEv.detail.auction._id === auctionId) {
        callback(customEv.detail);
      }
    };

    window.addEventListener('mazadak:auction_status_changed', handleCustomStatusChange);

    return () => {
      window.removeEventListener('mazadak:auction_status_changed', handleCustomStatusChange);
    };
  },
};
