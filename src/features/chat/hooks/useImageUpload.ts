/**
 * useImageUpload Hook
 * Uploads images for chat messages with direct Cloudinary signed upload and Base64 fallback
 * 
 * REFACTORED: Added AbortController support for cancelling in-flight uploads
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { uploadService } from '@/services/api/upload.service';

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any in-flight upload on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsUploading(false);
      setProgress(0);
      setError(null);
    }
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    // Cancel any previous in-flight upload
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsUploading(true);
    setProgress(10);
    setError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('INVALID_FILE_TYPE');
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('FILE_TOO_LARGE');
      }

      // Check if cancelled before starting upload
      if (controller.signal.aborted) {
        throw new Error('UPLOAD_CANCELLED');
      }

      setProgress(40);
      const url = await uploadService.uploadImageFile(file, 'chat');

      // Check if cancelled after upload completes
      if (controller.signal.aborted) {
        throw new Error('UPLOAD_CANCELLED');
      }

      if (isMountedRef.current) {
        setProgress(100);
        setIsUploading(false);
        abortControllerRef.current = null;
      }
      return url;
    } catch (err) {
      if (isMountedRef.current) {
        setIsUploading(false);
        setProgress(0);
        abortControllerRef.current = null;

        // Don't set error for deliberate cancellations
        if (err instanceof Error && err.message === 'UPLOAD_CANCELLED') {
          return '';
        }

        const errorMsg = err instanceof Error ? err.message : 'UPLOAD_FAILED';
        setError(errorMsg);
      }
      throw err;
    }
  }, []);

  const resetUploadState = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadImage,
    cancelUpload,
    isUploading,
    progress,
    error,
    resetUploadState,
  };
}
