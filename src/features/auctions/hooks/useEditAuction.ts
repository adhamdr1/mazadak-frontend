import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  updateAuctionSchema,
  type UpdateAuctionSchemaType,
} from '../schemas/updateAuction.schema';
import { auctionsService } from '../services/auctions.service';
import type { Auction, AuctionCategory } from '../types/auctions.types';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes.constants';
import { useAuth } from '@/hooks/useAuth';

export function useEditAuction(auction: Auction | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('auctions');
  const { user } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showUploadError = (message: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    setUploadError(message);
    errorTimerRef.current = setTimeout(() => {
      setUploadError(null);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const toLocalISOString = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const form = useForm<UpdateAuctionSchemaType>({
    resolver: zodResolver(updateAuctionSchema),
    mode: 'onTouched',
    defaultValues: {
      title: auction?.title || '',
      category: (auction?.category as AuctionCategory) || 'ELECTRONICS',
      description: auction?.description || '',
      startTime: toLocalISOString(auction?.startTime),
      endTime: toLocalISOString(auction?.endTime),
      images: auction?.images || [],
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors, isValid, isDirty },
  } = form;

  // Sync form when auction data loads
  useEffect(() => {
    if (auction) {
      reset({
        title: auction.title,
        category: auction.category,
        description: auction.description,
        startTime: toLocalISOString(auction.startTime),
        endTime: toLocalISOString(auction.endTime),
        images: auction.images || [],
      });
    }
  }, [auction, reset]);

  const watchedValues = watch();
  const images = watchedValues.images || [];

  // Image Management Actions
  const handleImageFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const currentImages = watchedValues.images || [];
      const remainingSlots = 10 - currentImages.length;

      if (remainingSlots <= 0) {
        showUploadError(t('validation.imagesMax'));
        return;
      }

      const filesToUpload = fileArray.slice(0, remainingSlots);

      // Validate file formats
      const invalidFiles = filesToUpload.filter(
        (f) => !['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
      );
      if (invalidFiles.length > 0) {
        showUploadError(t('errors.INVALID_IMAGE_FORMAT'));
        return;
      }

      // Validate size (< 5MB)
      const oversizedFiles = filesToUpload.filter((f) => f.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        showUploadError(t('errors.IMAGE_SIZE_EXCEEDS_LIMIT'));
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const uploadedUrls = await auctionsService.uploadBatchImages(filesToUpload, 'auctions');
        const updatedImages = [...currentImages, ...uploadedUrls];
        setValue('images', updatedImages, { shouldValidate: true, shouldDirty: true });
        clearErrors('images');
      } catch {
        showUploadError(t('errors.UPLOAD_FAILED'));
      } finally {
        setIsUploading(false);
      }
    },
    [watchedValues.images, setValue, clearErrors, t]
  );

  const handleRemoveImage = useCallback(
    (indexToRemove: number) => {
      const currentImages = watchedValues.images || [];
      const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
      setValue('images', updated, { shouldValidate: true, shouldDirty: true });
      if (updated.length === 0) {
        setError('images', { message: 'validation.imagesRequired' });
      }
    },
    [watchedValues.images, setValue, setError]
  );

  const handleSetCover = useCallback(
    (indexToMakeCover: number) => {
      const currentImages = [...(watchedValues.images || [])];
      if (indexToMakeCover === 0 || indexToMakeCover >= currentImages.length) return;
      const [chosenCover] = currentImages.splice(indexToMakeCover, 1);
      currentImages.unshift(chosenCover);
      setValue('images', currentImages, { shouldValidate: true, shouldDirty: true });
    },
    [watchedValues.images, setValue]
  );

  // Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateAuctionSchemaType) => {
      if (!auction?._id) throw new Error('NO_ID');

      const payload: {
        title: string;
        description: string;
        category: typeof data.category;
        images: string[];
        startTime?: string;
        endTime?: string;
      } = {
        title: data.title,
        description: data.description,
        category: data.category,
        images: data.images,
      };

      // Only send startTime if changed from original to avoid AUCTION_START_TIME_TOO_SOON on nearing auctions
      const originalStartMs = auction.startTime ? new Date(auction.startTime).getTime() : 0;
      const newStartMs = data.startTime ? new Date(data.startTime).getTime() : 0;
      if (newStartMs && Math.abs(newStartMs - originalStartMs) > 1000) {
        payload.startTime = new Date(data.startTime).toISOString();
      }

      // Only send endTime if changed from original
      const originalEndMs = auction.endTime ? new Date(auction.endTime).getTime() : 0;
      const newEndMs = data.endTime ? new Date(data.endTime).getTime() : 0;
      if (newEndMs && Math.abs(newEndMs - originalEndMs) > 1000) {
        payload.endTime = new Date(data.endTime).toISOString();
      }

      return auctionsService.update(auction._id, payload);
    },
    onSuccess: (updatedAuction) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['auction', auction?._id] });
      navigate(ROUTES.AUCTION_DETAIL(updatedAuction._id));
    },
  });

  const onSubmit = handleSubmit((data) => {
    updateMutation.mutate(data);
  });

  // Check locking conditions
  const isSeller = Boolean(user && auction && user._id === auction.sellerId);
  const isPending = auction?.status === 'PENDING';
  const isLocked = Boolean(auction && (!isSeller || !isPending));

  const errorMessage = updateMutation.error
    ? getLocalizedErrorMessage(updateMutation.error, t, 'auctions')
    : null;

  return {
    form,
    errors,
    isValid,
    isDirty,
    isUploading,
    uploadError,
    images,
    watchedValues,
    setValue,
    handleImageFiles,
    handleRemoveImage,
    handleSetCover,
    onSubmit,
    isSubmitting: updateMutation.isPending,
    error: errorMessage,
    isSeller,
    isPending,
    isLocked,
  };
}

export type UseEditAuctionReturn = ReturnType<typeof useEditAuction>;
