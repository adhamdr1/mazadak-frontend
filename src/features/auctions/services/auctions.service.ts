/**
 * Auctions Service
 * GraphQL API calls for Auctions Module — Pure production GraphQL connected directly to NestJS Backend
 */

import axios from 'axios';
import { apiClient } from '@/services/api/apiClient';
import { compressImage, compressImageToFile } from '@/utils/imageCompression';
import type {
  Auction,
  AuctionsPage,
  PaginationInput,
  AuctionsFilterInput,
  CreateAuctionInput,
  UpdateAuctionInput,
  UploadImageResponse,
  UploadSignatureResponse,
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

// Helper to execute GraphQL queries/mutations with standard error extraction
async function executeGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await apiClient.post<{
    data?: T;
    errors?: Array<{
      message: string;
      extensions?: {
        code?: string;
        originalError?: { message?: string | string[] };
      };
    }>;
  }>('', {
    query,
    variables,
  });

  if (response.data.errors && response.data.errors.length > 0) {
    const primaryError = response.data.errors[0];
    const origMsg = primaryError.extensions?.originalError?.message;
    if (Array.isArray(origMsg) && origMsg.length > 0) {
      throw new Error(origMsg[0]);
    }
    if (typeof origMsg === 'string' && origMsg.trim().length > 0) {
      throw new Error(origMsg);
    }
    const errorCode = primaryError.extensions?.code || primaryError.message;
    throw new Error(errorCode);
  }

  if (!response.data.data) {
    throw new Error('GENERIC_ERROR');
  }

  return response.data.data;
}

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
   * Upload image via Base64 endpoint (NestJS Backend Mutation)
   */
  uploadImage: async (base64Data: string, folder = 'auctions'): Promise<UploadImageResponse> => {
    const data = await executeGraphQL<{ uploadImage: UploadImageResponse }>(UPLOAD_IMAGE_MUTATION, {
      input: { base64Data, folder },
    });
    return data.uploadImage;
  },

  /**
   * Upload an image file: Tries direct signed Cloudinary upload first (zero backend load),
   * falling back to compressed base64 backend mutation.
   */
  uploadImageFile: async (file: File, folder = 'auctions'): Promise<string> => {
    // 1. Try Direct Cloudinary Signed Upload
    try {
      const sig = await auctionsService.getUploadSignature(folder);
      if (sig && sig.signature && sig.apiKey && sig.cloudName) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.apiKey);
        formData.append('timestamp', String(sig.timestamp));
        formData.append('signature', sig.signature);
        if (sig.folder) formData.append('folder', sig.folder);

        const uploadRes = await axios.post<{ secure_url?: string; url?: string }>(
          `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
          formData
        );

        if (uploadRes.data?.secure_url || uploadRes.data?.url) {
          return (uploadRes.data.secure_url || uploadRes.data.url) as string;
        }
      }
    } catch {
      // Direct Cloudinary upload failed or not configured, fall through to backend mutation
    }

    // 2. Fallback: Compress image to crisp lightweight payload (~100KB) and send via Backend GraphQL
    const compressedBase64 = await compressImage(file, 1000, 1000, 0.75);
    const res = await auctionsService.uploadImage(compressedBase64, folder);
    if (res.url) {
      return res.url;
    }

    return compressedBase64;
  },

  /**
   * High-speed parallel batch image upload:
   * Requests signature ONCE for the entire batch and uploads in parallel directly to Cloudinary CDN
   */
  uploadBatchImages: async (files: File[], folder = 'auctions'): Promise<string[]> => {
    let sig: UploadSignatureResponse | null = null;
    try {
      sig = await auctionsService.getUploadSignature(folder);
    } catch {
      // Signature query fallback
    }

    const uploadPromises = files.map(async (rawFile) => {
      // 1. High-speed client-side GPU compression to lightweight Blob (~50KB) in ~10ms
      const file = await compressImageToFile(rawFile, 1200, 1200, 0.78);

      // 2. Try Direct Cloudinary Signed Upload if signature is valid
      if (sig && sig.signature && sig.apiKey && sig.cloudName) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('api_key', sig.apiKey);
          formData.append('timestamp', String(sig.timestamp));
          formData.append('signature', sig.signature);
          if (sig.folder) formData.append('folder', sig.folder);

          const uploadRes = await axios.post<{ secure_url?: string; url?: string }>(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
            formData
          );

          if (uploadRes.data?.secure_url || uploadRes.data?.url) {
            return (uploadRes.data.secure_url || uploadRes.data.url) as string;
          }
        } catch {
          // Fall through to compressed base64 backend mutation
        }
      }

      // 3. Fallback: Fast client-side compression + Backend mutation with graceful fallback
      try {
        const compressedBase64 = await compressImage(file, 1000, 1000, 0.75);
        const res = await auctionsService.uploadImage(compressedBase64, folder);
        if (res.url) {
          return res.url;
        }
        return compressedBase64;
      } catch {
        return await compressImage(file, 800, 800, 0.70);
      }
    });

    return await Promise.all(uploadPromises);
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

  /**
   * Fetch public user profile with real name, avatar, and rating statistics
   * @todo ستنتقل هذه الدالة إلى users.service.ts عند بناء Users Module (Module 10)
   * مُبقَّاة هنا مؤقتاً لأن Users Module لم يُبنَ بعد.
   */
  getPublicProfile: async (userId: string) => {
    const data = await executeGraphQL<{
      publicProfile: {
        id: string;
        firstName: string;
        lastName: string;
        city?: string;
        memberSince: string;
        ratingStats?: {
          averageRating: number;
          totalReviews: number;
        };
        activeAuctionsCount: number;
        completedAuctionsCount: number;
      };
    }>(
      `
        query PublicProfile($userId: ID!) {
          publicProfile(userId: $userId) {
            id
            firstName
            lastName
            city
            memberSince
            ratingStats {
              averageRating
              totalReviews
            }
            activeAuctionsCount
            completedAuctionsCount
          }
        }
      `,
      { userId }
    );
    return data.publicProfile;
  },
};
