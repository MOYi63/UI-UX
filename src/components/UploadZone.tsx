import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

/**
 * UploadZone Component
 * Handles file selection and drag-and-drop for design drafts.
 * Provides immediate visual feedback and preview.
 */
interface UploadZoneProps {
  onUpload: (base64: string) => void;
  isAnalyzing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isAnalyzing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Processes the selected file and converts it to base64
   */
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onUpload(base64);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handles drop event
   */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => !preview && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer transition-all duration-500",
          "rounded-[2rem] border-2 border-dashed",
          isDragging ? "border-indigo-500 bg-indigo-50 scale-[1.01]" : "border-[#E5E5E5] bg-white hover:border-indigo-300",
          preview ? "border-none p-0" : "p-12 shadow-sm"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          accept="image/*"
        />

        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Upload className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold text-[#1A1A1A]">拖放您的设计稿</h3>
                <p className="text-[#666666] mt-2 text-sm">支持 PNG, JPG 或 WebP。最大 10MB。</p>
              </div>
              <div className="px-6 py-2 rounded-full bg-[#F3F3F3] border border-[#E5E5E5] text-xs font-bold text-[#666666] group-hover:bg-[#EBEBEB] transition-colors">
                从电脑选择文件
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[2rem] overflow-hidden aspect-video bg-[#F3F3F3] border border-[#E5E5E5]"
            >
              <img
                src={preview}
                alt="预览"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreview(null);
                }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 text-[#1A1A1A] hover:bg-red-50 hover:text-red-600 transition-colors backdrop-blur-md border border-[#E5E5E5]"
              >
                <X className="w-4 h-4" />
              </button>

              {isAnalyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 border-2 border-indigo-100 border-t-indigo-600 rounded-full"
                    />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 animate-pulse" />
                  </div>
                  <p className="mt-4 text-indigo-600 text-sm font-bold tracking-wide animate-pulse">
                    AI 正在深度分析您的设计...
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
