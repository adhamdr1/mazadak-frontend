/**
 * Centralized Upload Service
 * High-speed image compression and parallel direct Cloudinary CDN upload service
 * Shared across all platform modules (Auctions, Escrow/Disputes, Chat, User Profiles, Admin)
 */

import axios from 'axios';
import { executeGraphQL } from '@/services/api/graphqlClient';
import { compressImage, compressImageToFile } from '@/utils/imageCompression';

// ----------------------------------------------------
// Types
// ----------------------------------------------------

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface UploadImageResponse {
  url: string;
}

export interface UploadImageInput {
  base64Data: string;
  folder?: string;
}

// ----------------------------------------------------
// GraphQL Operations
// ----------------------------------------------------

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
// Public API Methods
// ----------------------------------------------------

export const uploadService = {
  /**
   * Get Cloudinary upload signature for direct browser uploads
   */
  getUploadSignature: async (folder = 'uploads'): Promise<UploadSignatureResponse> => {
    const data = await executeGraphQL<{ generateUploadSignature: UploadSignatureResponse }>(
      GENERATE_UPLOAD_SIGNATURE_QUERY,
      { folder }
    );
    return data.generateUploadSignature;
  },

  /**
   * Upload image via Base64 endpoint (NestJS Backend Mutation Fallback)
   */
  uploadImage: async (base64Data: string, folder = 'uploads'): Promise<UploadImageResponse> => {
    const data = await executeGraphQL<{ uploadImage: UploadImageResponse }>(UPLOAD_IMAGE_MUTATION, {
      input: { base64Data, folder },
    });
    return data.uploadImage;
  },

  /**
   * Upload a single image file: Tries direct signed Cloudinary upload first (zero backend load),
   * falling back to compressed base64 backend mutation.
   */
  uploadImageFile: async (file: File, folder = 'uploads'): Promise<string> => {
    // 1. Try Direct Cloudinary Signed Upload
    try {
      const sig = await uploadService.getUploadSignature(folder);
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
    const res = await uploadService.uploadImage(compressedBase64, folder);
    if (res?.url) {
      return res.url;
    }

    throw new Error('UPLOAD_FAILED');
  },

  /**
   * High-speed parallel batch image upload:
   * Requests signature ONCE for the entire batch and uploads in parallel directly to Cloudinary CDN
   * after instant client-side GPU compression.
   */
  uploadBatchImages: async (files: File[], folder = 'uploads'): Promise<string[]> => {
    let sig: UploadSignatureResponse | null = null;
    try {
      sig = await uploadService.getUploadSignature(folder);
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
          formData.append('timestamp', String(Math.floor(sig.timestamp)));
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

      // 3. Fallback: Fast client-side compression + Backend mutation
      try {
        const compressedBase64 = await compressImage(file, 1000, 1000, 0.75);
        const res = await uploadService.uploadImage(compressedBase64, folder);
        if (res?.url) {
          return res.url;
        }
      } catch {
        // Continue error handling
      }

      throw new Error('UPLOAD_FAILED');
    });

    return Promise.all(uploadPromises);
  },
};
