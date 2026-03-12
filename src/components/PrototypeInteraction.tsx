import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Loader2, Sparkles, Download, MousePointer2, X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import Markdown from 'react-markdown';
import { generateInteractionDocs, InteractionDocsResult, generateInteractiveDemo, InteractiveDemoResult } from '../services/geminiService';
import { downloadInteractionDocsAsWord } from '../services/wordExportService';
import { cn } from '../lib/utils';

interface UploadedFile {
  id: string;
  base64: string;
  name: string;
}

export const PrototypeInteraction: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [docsResult, setDocsResult] = useState<InteractionDocsResult | null>(null);
  const [demoResult, setDemoResult] = useState<InteractiveDemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'docs' | 'demo'>('docs');
  const [currentScreenId, setCurrentScreenId] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFiles(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          base64,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    setDocsResult(null);
    setDemoResult(null);
    setError(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerate = async () => {
    if (files.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (mode === 'docs') {
        // For docs, we currently use the first image if multiple are uploaded, 
        // or we could combine them. For simplicity, let's use the first one.
        const docs = await generateInteractionDocs(files[0].base64, customPrompt);
        setDocsResult(docs);
      } else {
        const demo = await generateInteractiveDemo(files.map(f => ({ id: f.id, base64: f.base64 })));
        setDemoResult(demo);
        setCurrentScreenId(demo.initialScreenId);
      }
    } catch (err) {
      console.error(err);
      setError('生成失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = async () => {
    if (mode === 'docs' && docsResult) {
      await downloadInteractionDocsAsWord(docsResult.markdown);
    }
  };

  const currentScreen = demoResult?.screens.find(s => s.id === currentScreenId);

  return (
    <div className="space-y-12 pb-24">
      <header className="text-center max-w-[800px] mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
          <FileText className="w-3.5 h-3.5" /> 原型交互助手
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-[#1A1A1A]">
          上传原型，<span className="text-indigo-600">智能生成</span>交互方案
        </h2>
        <p className="text-[#666666] text-lg font-medium">
          AI 将深度分析您的原型图，并为您编写详尽的交互说明或生成可交互 Demo。
        </p>
      </header>

      <div className="max-w-[800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2rem] border border-[#E5E5E5] p-6 shadow-sm space-y-6">
            {/* Mode Switch */}
            <div className="flex p-1 bg-[#F3F3F3] rounded-xl">
              <button
                onClick={() => setMode('docs')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                  mode === 'docs' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#666666] hover:text-[#1A1A1A]"
                )}
              >
                <FileText className="w-4 h-4" /> 交互说明
              </button>
              <button
                onClick={() => setMode('demo')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all",
                  mode === 'demo' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#666666] hover:text-[#1A1A1A]"
                )}
              >
                <Play className="w-4 h-4" /> 交互 Demo
              </button>
            </div>

            {/* Upload Area */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#999999] uppercase tracking-wider px-1">上传原型图</label>
              <div 
                onClick={() => document.getElementById('prototype-upload')?.click()}
                className="aspect-video rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-[#F9F9F9] hover:border-indigo-300 transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center"
              >
                <input 
                  id="prototype-upload"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                />
                <Upload className="w-8 h-8 text-indigo-600 mb-2" />
                <p className="text-sm font-bold text-[#1A1A1A]">点击或拖拽上传</p>
                <p className="text-[10px] text-[#999999] mt-1">支持多张图片，AI 将识别逻辑关系</p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {files.map(file => (
                    <div key={file.id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-[#E5E5E5] group">
                      <img src={file.base64} alt={file.name} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Input */}
            {mode === 'docs' && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#999999] uppercase tracking-wider px-1">自定义提示词 (可选)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="例如：重点说明登录流程的异常处理，或要求使用特定的文档格式..."
                  className="w-full h-32 p-4 rounded-2xl border border-[#E5E5E5] bg-[#F9F9F9] text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={files.length === 0 || isAnalyzing}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                files.length === 0 || isAnalyzing 
                  ? "bg-[#F3F3F3] text-[#999999] cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  AI 正在深度分析中...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  {mode === 'docs' ? '生成交互说明' : '生成交互 Demo'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Result Panel */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2rem] border border-[#E5E5E5] shadow-sm flex flex-col min-h-[600px] overflow-hidden">
            <div className="h-14 border-b border-[#E5E5E5] px-8 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-sm font-bold text-[#1A1A1A]">
                {mode === 'docs' ? '交互说明文档' : '交互 Demo 预览'}
              </h3>
              {mode === 'docs' && docsResult && (
                <button 
                  onClick={handleDownload}
                  className="p-2 rounded-lg hover:bg-[#F3F3F3] text-[#666666] transition-colors"
                  title="下载 Word 文档"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12"
                  >
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-sm text-[#666666] font-medium">AI 正在阅读您的原型图，这可能需要几秒钟...</p>
                  </motion.div>
                ) : mode === 'docs' && docsResult ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="markdown-body prose prose-sm max-w-none text-[#1A1A1A]"
                  >
                    <Markdown>{docsResult.markdown}</Markdown>
                  </motion.div>
                ) : mode === 'demo' && demoResult && currentScreen ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center"
                  >
                    <div className="relative max-w-[320px] mx-auto rounded-[2.5rem] border-8 border-[#1A1A1A] overflow-hidden shadow-2xl bg-white">
                      <img 
                        src={currentScreen.imageBase64} 
                        alt={currentScreen.name} 
                        className="w-full h-auto select-none"
                      />
                      {currentScreen.hotspots.map((hotspot, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCurrentScreenId(hotspot.targetScreenId)}
                          className="absolute bg-indigo-500/0 hover:bg-indigo-500/20 cursor-pointer transition-colors group"
                          style={{
                            top: `${hotspot.rect[0] / 10}%`,
                            left: `${hotspot.rect[1] / 10}%`,
                            height: `${(hotspot.rect[2] - hotspot.rect[0]) / 10}%`,
                            width: `${(hotspot.rect[3] - hotspot.rect[1]) / 10}%`,
                          }}
                        >
                          <div className="absolute inset-0 border border-indigo-500/0 group-hover:border-indigo-500/50" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-4">
                      <button 
                        onClick={() => setCurrentScreenId(demoResult.initialScreenId)}
                        className="px-4 py-2 rounded-full bg-[#F3F3F3] text-xs font-bold text-[#666666] hover:bg-[#EBEBEB]"
                      >
                        重置 Demo
                      </button>
                      <p className="text-xs text-[#999999] font-medium">当前页面: {currentScreen.name}</p>
                    </div>
                  </motion.div>
                ) : error ? (
                  <div className="h-full flex items-center justify-center text-center p-8 text-red-500 font-medium">
                    {error}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                    {mode === 'docs' ? (
                      <>
                        <FileText className="w-12 h-12 text-[#999999]" />
                        <p className="text-sm text-[#999999] font-medium">上传原型图后，此处将显示生成的交互说明</p>
                      </>
                    ) : (
                      <>
                        <MousePointer2 className="w-12 h-12 text-[#999999]" />
                        <p className="text-sm text-[#999999] font-medium">上传多张原型图，AI 将为您生成可交互的预览</p>
                      </>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
