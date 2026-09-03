import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  createAuctionSchema,
  type CreateAuctionSchemaType,
} from '../schemas/createAuction.schema';
import { auctionsService } from '../services/auctions.service';
import type { AuctionCategory } from '../types/auctions.types';
import { getLocalizedErrorMessage } from '@/utils/errorHandler';
import { ROUTES } from '@/constants/routes.constants';

export type CreateAuctionStep = 1 | 2;

/**
 * Pure helper to calculate initial default start and end times
 * Start: now + 30 min rounded up to the nearest 30m slot
 * End: exactly 1 hour after start
 */
function getDefaultDates() {
  const now = new Date();
  const slotMs = 30 * 60 * 1000;
  const startMs = now.getTime() + 30 * 60 * 1000;
  const remainder = startMs % slotMs;
  const start = new Date(startMs + (remainder > 0 ? slotMs - remainder : 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const toLocalISOString = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return {
    startTime: toLocalISOString(start),
    endTime: toLocalISOString(end),
  };
}

export function useCreateAuction() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation('auctions');

  const [step, setStep] = useState<CreateAuctionStep>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to set error with auto-dismiss after 3.5 seconds
  const showUploadError = (message: string) => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    setUploadError(message);
    errorTimerRef.current = setTimeout(() => {
      setUploadError(null);
    }, 3500);
  };

  // Cleanup error timer on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  // Lazy memoized initial dates for defaultValues (calculated once on mount)
  const initialDates = useMemo(() => getDefaultDates(), []);

  const form = useForm<CreateAuctionSchemaType>({
    resolver: zodResolver(createAuctionSchema),
    mode: 'onTouched',
    defaultValues: {
      title: '',
      category: 'ELECTRONICS' as AuctionCategory,
      description: '',
      startingPrice: 500,
      minimumBidIncrement: 50,
      startTime: initialDates.startTime,
      endTime: initialDates.endTime,
      images: [],
    },
  });

  const {
    handleSubmit,
    trigger,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = form;

  // Targeted watch on images only to prevent full page re-render on every keystroke
  const images = watch('images') || [];

  // Step 1 Validation & Navigation
  const goToStep2 = async () => {
    const isStep1Valid = await trigger([
      'title',
      'category',
      'description',
      'startingPrice',
      'minimumBidIncrement',
      'startTime',
      'endTime',
    ]);

    if (isStep1Valid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep1 = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Image Upload Handlers with High-Speed Compression & Backend Upload Mutation
  const handleFiles = async (files: FileList | File[]) => {
    if (isUploading) return;
    setUploadError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const currentImages = form.getValues('images') || [];
    if (currentImages.length + fileArray.length > 10) {
      showUploadError(t('validation.imagesMax'));
      return;
    }

    // 1. Validate MIME types first
    for (const file of fileArray) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showUploadError(t('errors.INVALID_IMAGE_FORMAT'));
        return;
      }
    }

    setIsUploading(true);

    try {
      // 2. High-speed parallel upload via auctionsService (Direct Cloudinary CDN with compressed fallback)
      const uploadedUrls = await auctionsService.uploadBatchImages(fileArray, 'auctions');
      const latestImages = form.getValues('images') || [];
      const updated = [...latestImages, ...uploadedUrls];
      setValue('images', updated, { shouldValidate: true });
      clearErrors('images');
    } catch (err: unknown) {
      const localized = getLocalizedErrorMessage(err, t, 'auctions');
      showUploadError(localized || t('errors.GENERIC_ERROR'));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const current = form.getValues('images') || [];
    const updated = current.filter((_, idx) => idx !== indexToRemove);
    setValue('images', updated, { shouldValidate: true });
    if (updated.length === 0) {
      setError('images', { message: 'validation.imagesRequired' });
    }
  };

  const setCoverImage = (indexToCover: number) => {
    const current = form.getValues('images') || [];
    if (indexToCover <= 0 || indexToCover >= current.length) return;
    const item = current[indexToCover];
    const rest = current.filter((_, idx) => idx !== indexToCover);
    const updated = [item, ...rest];
    setValue('images', updated, { shouldValidate: true });
  };

  // Real Backend Mutation to Create Auction
  const createMutation = useMutation({
    mutationFn: async (data: CreateAuctionSchemaType) => {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        startingPrice: Number(data.startingPrice),
        minimumBidIncrement: Number(data.minimumBidIncrement),
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        images: data.images,
      };
      return await auctionsService.create(payload);
    },
    onSuccess: (newAuction) => {
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['my-auctions'] });
      navigate(ROUTES.AUCTION_DETAIL(newAuction._id));
    },
  });

  const onSubmit = handleSubmit((data) => {
    createMutation.mutate(data);
  });

  const errorMessage = createMutation.error
    ? getLocalizedErrorMessage(createMutation.error, t, 'auctions')
    : null;

  return {
    form,
    step,
    setStep,
    goToStep1,
    goToStep2,
    watchedValues: form.getValues(),
    images,
    isUploading,
    uploadError,
    handleFiles,
    removeImage,
    setCoverImage,
    onSubmit,
    isPending: createMutation.isPending,
    isSuccess: createMutation.isSuccess,
    errorMessage,
    errors,
    isValid,
  };
}
