import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, FileText } from 'lucide-react';
import { AnalysisResult } from '../services/geminiService';
import { downloadAnalysisAsWord, ExportOptions } from '../services/wordExportService';
import { cn } from '../lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
  imageBase64?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, result, imageBase64 }) => {
  const [options, setOptions] = useState<ExportOptions>({
    includeHeuristics: true,
    includeAccessibility: true,
    includeVisualHierarchy: true,
    includeActionItems: true,
    includeHeatmap: true,
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadAnalysisAsWord(result, options, imageBase64);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key: keyof ExportOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    const allSelected = Object.values(options).every(Boolean);
    setOptions({
      includeHeuristics: !allSelected,
      includeAccessibility: !allSelected,
      includeVisualHierarchy: !allSelected,
      includeActionItems: !allSelected,
      includeHeatmap: !allSelected,
    });
  };

  const optionItems = [
    { key: 'includeHeuristics', label: '启发式原则评估', desc: '包含 10 项可用性原则的详细得分与反馈' },
    { key: 'includeAccessibility', label: '无障碍性审计', desc: '包含 WCAG 合规性检查、问题及改进建议' },
    { key: 'includeVisualHierarchy', label: '视觉层级分析', desc: '包含视线流向与视觉重点的深度解读' },
    { key: 'includeActionItems', label: '关键优化清单', desc: '包含可落地的具体改进步骤' },
    { key: 'includeHeatmap', label: '点击热区模拟', desc: '包含基于 AI 模拟的用户点击分布图' },
  ] as const;

  const allSelected = Object.values(options).every(Boolean);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
          >
            <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5E5E5] shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-[#1A1A1A]">自定义导出</h3>
                    <p className="text-[#666666] text-xs font-medium">选择您想要包含在 Word 报告中的内容</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#F3F3F3] text-[#999999] hover:text-[#1A1A1A] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-end mb-4">
                <button 
                  onClick={toggleAll}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
                >
                  {allSelected ? '取消全选' : '全选内容'}
                </button>
              </div>

              <div className="space-y-4 mb-10">
                {optionItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => toggleOption(item.key)}
                    className={cn(
                      "w-full flex items-start gap-4 p-4 rounded-2xl border transition-all text-left group",
                      options[item.key]
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-[#F9F9F9] border-[#E5E5E5] hover:border-indigo-100 shadow-sm"
                    )}
                  >
                    <div className={cn(
                      "mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                      options[item.key]
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white border-[#E5E5E5] group-hover:border-[#D1D1D1]"
                    )}>
                      {options[item.key] && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </div>
                    <div>
                      <div className={cn(
                        "text-sm font-bold transition-colors",
                        options[item.key] ? "text-[#1A1A1A]" : "text-[#999999]"
                      )}>
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#666666] mt-0.5 leading-relaxed font-medium">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-[#F3F3F3] hover:bg-[#EBEBEB] border border-[#E5E5E5] text-[#666666] text-sm font-bold transition-all"
                >
                  取消
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting || !Object.values(options).some(Boolean)}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                >
                  {isExporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      正在生成...
                    </>
                  ) : (
                    '确认导出'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
