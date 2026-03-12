import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Trash2, Plus, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Methodology } from '../services/geminiService';
import { cn } from '../lib/utils';
import mammoth from 'mammoth';

interface MethodologyManagerProps {
  methodologies: Methodology[];
  onUpdate: (methodologies: Methodology[]) => void;
}

export const MethodologyManager: React.FC<MethodologyManagerProps> = ({ methodologies, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    setError(null);

    const newMethodologies: Methodology[] = [];

    for (const file of Array.from(files)) {
      // Support .txt, .md, .json, .docx
      if (!file.name.match(/\.(txt|md|json|docx)$/i)) {
        setError('目前支持 .txt, .md, .json, .docx 格式的文档。');
        continue;
      }

      try {
        let content = '';
        if (file.name.toLowerCase().endsWith('.docx')) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
        } else {
          content = await file.text();
        }

        newMethodologies.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: content.slice(0, 10000), // Limit content size for prompt efficiency
        });
      } catch (err) {
        console.error('Error reading file:', err);
        setError(`读取文件 ${file.name} 失败。`);
      }
    }

    onUpdate([...methodologies, ...newMethodologies]);
  };

  const removeMethodology = (id: string) => {
    onUpdate(methodologies.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-[#1A1A1A]">方法论知识库</h2>
          <p className="text-[#666666] text-sm mt-1">上传您的可用性测试标准或设计规范，AI 将学习并应用于审计过程。</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          上传新文档
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
          multiple
          accept=".txt,.md,.json,.docx"
        />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 上传区域 */}
        <div className="lg:col-span-4 space-y-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload(e.dataTransfer.files); }}
            className={cn(
              "relative aspect-square rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center group cursor-pointer",
              isDragging 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-[#E5E5E5] bg-white hover:border-indigo-300 hover:bg-indigo-50/30 shadow-sm"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="p-5 rounded-3xl bg-indigo-50 text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
              <Upload className="w-10 h-10" />
            </div>
            <h4 className="text-[#1A1A1A] font-bold mb-2">拖拽或点击上传</h4>
            <p className="text-[#999999] text-[10px] font-bold uppercase tracking-wider leading-relaxed">
              支持 .txt, .md, .json, .docx<br />
              单文件建议不超过 10,000 字
            </p>
          </div>

          <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-amber-900">为什么上传文档？</h5>
                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                  通过上传特定的可用性测试方法论，AI 可以更精准地遵循您的团队标准进行审计。例如：特定的对比度要求、品牌特有的交互组件规范等。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 文档列表 */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="popLayout">
            {methodologies.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full min-h-[400px] rounded-[2.5rem] border border-[#E5E5E5] bg-white flex flex-col items-center justify-center p-12 text-center shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-[#F3F3F3] flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-[#999999]" />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">暂无已学习的文档</h3>
                <p className="text-[#666666] text-sm max-w-sm">
                  上传您的第一个方法论文档，开启定制化的 AI 审计体验。
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methodologies.map((doc) => (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl p-5 border border-[#E5E5E5] hover:border-indigo-300 transition-all group shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="max-w-[150px]">
                          <h5 className="text-sm font-bold text-[#1A1A1A] truncate" title={doc.name}>
                            {doc.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">已加载</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMethodology(doc.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-[#999999] hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F3F3F3] border border-[#E5E5E5]">
                      <p className="text-[11px] text-[#666666] line-clamp-3 leading-relaxed font-medium">
                        {doc.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
