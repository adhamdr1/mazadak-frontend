/**
 * ChatInputBar Component
 * Pixel-perfect WhatsApp-style input bar with multi-line auto-expansion,
 * horizontal send arrow (strictly pointing in reading direction),
 * aligned bottom utility row, 0ms instant text clear, and AbortController image handling.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  SendHorizontal,
  Paperclip,
  Smile,
  X,
  Loader2,
  Edit2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { EmojiPanel } from './EmojiPanel';
import { useImageUpload } from '../hooks/useImageUpload';
import type { ChatMessageType } from '../types/chat.types';

export interface SelectedImageAttachment {
  file: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
}

export interface ChatInputBarProps {
  auctionId: string;
  onSendMessage: (
    content?: string | null,
    type?: ChatMessageType,
    mediaUrls?: string[] | null
  ) => Promise<void> | void;
  isSending?: boolean;
  editingMessage?: { id: string; content: string } | null;
  onSaveEdit?: (messageId: string, newContent: string) => Promise<void> | void;
  onCancelEdit?: () => void;
  className?: string;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  auctionId,
  onSendMessage,
  editingMessage = null,
  onSaveEdit,
  onCancelEdit,
  className,
}) => {
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language?.startsWith('ar');

  const [text, setText] = useState(() => {
    try {
      return sessionStorage.getItem(`mazadak_chat_draft_${auctionId}`) || '';
    } catch {
      return '';
    }
  });

  const [selectedImage, setSelectedImage] = useState<SelectedImageAttachment | null>(null);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { uploadImage, cancelUpload, isUploading, progress, resetUploadState } = useImageUpload();

  // Helper to adjust textarea height smoothly up to 240px
  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 240)}px`;
    }
  }, []);

  // Load draft when auctionId changes
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem(`mazadak_chat_draft_${auctionId}`) || '';
      setText(savedDraft);
    } catch {
      // Ignore storage errors
    }
  }, [auctionId]);

  // Save draft whenever text changes
  const updateDraftText = useCallback(
    (newText: string) => {
      setText(newText);
      try {
        if (newText.trim()) {
          sessionStorage.setItem(`mazadak_chat_draft_${auctionId}`, newText);
        } else {
          sessionStorage.removeItem(`mazadak_chat_draft_${auctionId}`);
        }
      } catch {
        // Ignore storage errors
      }
    },
    [auctionId]
  );

  // Handler to cleanly cancel edit, wipe text/draft, and reset textarea height
  const handleCancelEdit = useCallback(() => {
    if (onCancelEdit) onCancelEdit();
    updateDraftText('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
    }
  }, [onCancelEdit, updateDraftText]);

  // Populate input and expand height when entering edit mode
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.content);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          adjustHeight();
        }
      });
    }
  }, [editingMessage, adjustHeight]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDraftText(e.target.value);
    adjustHeight();
  };

  const handleEmojiSelect = (emoji: string) => {
    const updated = text + emoji;
    updateDraftText(updated);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        adjustHeight();
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image
    if (!file.type.startsWith('image/')) return;

    const previewUrl = URL.createObjectURL(file);
    const sizeInKB = Math.round(file.size / 1024);
    const sizeFormatted =
      sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

    setSelectedImage({
      file,
      previewUrl,
      name: file.name,
      sizeFormatted,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Immediate cancel for image
  const handleRemoveSelectedImage = () => {
    if (isUploading) {
      cancelUpload();
    }
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    resetUploadState();
  };

  /**
   * 0ms Instant Submit:
   * Clears input immediately and restores textarea to single row.
   */
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !selectedImage) || isUploading) return;

    // 1. Edit Message Flow
    if (editingMessage && onSaveEdit) {
      const msgId = editingMessage.id;
      if (onCancelEdit) onCancelEdit();
      updateDraftText('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
      }
      onSaveEdit(msgId, trimmed);
      return;
    }

    // 2. Image Upload Flow
    if (selectedImage) {
      const imageFile = selectedImage.file;
      const currentCaption = trimmed;
      updateDraftText('');
      if (textareaRef.current) {
        textareaRef.current.value = '';
        textareaRef.current.style.height = 'auto';
      }

      try {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          onSendMessage(currentCaption || null, 'IMAGE', [uploadedUrl]);
        }
      } catch {
        // Upload error handled in hook
      } finally {
        handleRemoveSelectedImage();
      }
      return;
    }

    // 3. Standard Text Message Flow (0ms instant clear)
    updateDraftText('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
    onSendMessage(trimmed, 'TEXT', null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = Boolean(text.trim() || selectedImage) && !isUploading;

  return (
    <div
      className={cn(
        'relative bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 p-3 space-y-2',
        className
      )}
    >
      {/* Active Edit Banner with clean non-italic text & symmetric quotes */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-600 dark:text-amber-400 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-medium truncate min-w-0">
            <Edit2 className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <span className="font-bold text-slate-900 dark:text-white shrink-0 not-italic">
              {t('input.editingLabel', 'تعديل الرسالة')}:
            </span>
            <span
              dir="auto"
              className="truncate text-slate-700 dark:text-slate-300 max-w-xs font-normal not-italic"
            >
              &quot;{editingMessage.content}&quot;
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="p-1 hover:bg-amber-500/20 rounded-xl transition-colors shrink-0 cursor-pointer text-slate-400 hover:text-slate-700 dark:hover:text-white"
            title={t('input.cancelEdit', 'إلغاء التعديل')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Image Attachment Preview Card */}
      {selectedImage && (
        <div className="relative flex items-center gap-2.5 p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-150">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-900/10 shrink-0">
            <img
              src={selectedImage.previewUrl}
              alt={selectedImage.name}
              className="w-full h-full object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {selectedImage.name}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isUploading
                ? `${t('message.uploadingImage', 'جار الرفع...')} (${progress}%)`
                : selectedImage.sizeFormatted}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRemoveSelectedImage}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors shrink-0 cursor-pointer"
            title={t('actions.cancel', 'إلغاء الصورة')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main WhatsApp-Style Input Row */}
      <div className="flex items-end gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />

        {/* Unified Input Capsule: Attachment + Emoji + Textarea */}
        <div className="flex-1 min-w-0 flex items-end bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-transparent focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all p-1">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer mb-0.5"
            title={t('input.attachImage', 'إرفاق صورة')}
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setIsEmojiOpen((prev) => !prev)}
            className={cn(
              'w-9 h-9 flex items-center justify-center rounded-xl transition-colors shrink-0 cursor-pointer mb-0.5',
              isEmojiOpen
                ? 'bg-amber-500/20 text-amber-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700'
            )}
            title={t('input.openEmoji', 'الرموز التعبيرية')}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Area (Expands upwards smoothly up to 240px) */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedImage
                ? t('input.imageCaptionPlaceholder', 'أضف تعليقاً على الصورة...')
                : t('input.placeholder', 'اكتب رسالة...')
            }
            className="flex-1 min-w-0 py-2 px-2.5 bg-transparent text-sm text-slate-900 dark:text-white resize-none focus:outline-none max-h-60 custom-scrollbar placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Circular Send Button with Horizontal Arrow */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!canSubmit}
          className={cn(
            'w-11 h-11 rounded-full transition-all duration-150 flex items-center justify-center shrink-0 shadow-md select-none',
            canSubmit
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 active:scale-95 cursor-pointer shadow-amber-500/25'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 opacity-50 cursor-default'
          )}
          title={t('input.sendLabel', 'إرسال')}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizontal
              className={cn(
                'w-5 h-5 transition-transform',
                isRTL ? 'rotate-180' : ''
              )}
            />
          )}
        </button>
      </div>

      {/* Emoji Picker Popover */}
      {isEmojiOpen && (
        <div className="absolute bottom-16 z-40 ltr:left-3 ltr:right-auto rtl:right-3 rtl:left-auto">
          <EmojiPanel
            onSelect={handleEmojiSelect}
            onClose={() => setIsEmojiOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatInputBar;
