import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, Loader2, Sparkles, Download, MousePointer2, X, Play } from 'lucide-react';
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
    <div className="space-y-8 pb-24">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Welcome & Header */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> AI 交互专家
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-[#1A1A1A] leading-tight">
              上传原型，<span className="text-indigo-600">智能生成</span><br />全方位交互方案
            </h2>
            <p className="text-[#666666] text-sm font-medium max-w-[500px]">
              AI 将深度分析您的原型图，并为您编写详尽的交互说明或生成可交互 Demo。
            </p>
          </div>
        </div>

        {/* Card 2: Mode Selection */}
        <div className="lg:col-span-4 bg-[#1A1A1A] p-8 rounded-[2.5rem] shadow-lg flex flex-col justify-between text-white">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">选择生成模式</h3>
            <div className="flex p-1 bg-white/10 rounded-xl">
              <button
                onClick={() => setMode('docs')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  mode === 'docs' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-white/60 hover:text-white"
                )}
              >
                <FileText className="w-3.5 h-3.5" /> 交互说明
              </button>
              <button
                onClick={() => setMode('demo')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all",
                  mode === 'demo' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-white/60 hover:text-white"
                )}
              >
                <Play className="w-3.5 h-3.5" /> 交互 Demo
              </button>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-white/60 leading-relaxed">
              {mode === 'docs' 
                ? "生成包含逻辑流、异常处理、手势说明的专业交互文档。" 
                : "生成可点击跳转的低保定交互原型，用于快速验证逻辑。"}
            </p>
          </div>
        </div>

        {/* Card 3: Upload Zone */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[#999999] uppercase tracking-wider px-1">上传原型图</h3>
          <div 
            onClick={() => document.getElementById('prototype-upload')?.click()}
            className="flex-1 min-h-[160px] rounded-2xl border-2 border-dashed border-[#E5E5E5] bg-[#F9F9F9] hover:border-indigo-300 transition-all flex flex-col items-center justify-center cursor-pointer p-4 text-center group"
          >
            <input 
              id="prototype-upload"
              type="file" 
              className="hidden" 
              accept="image/*"
              multiple
              onChange={handleFiles}
            />
            <div className="p-3 rounded-full bg-indigo-50 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-bold text-[#1A1A1A] mt-3">点击或拖拽上传</p>
            <p className="text-[10px] text-[#999999] mt-1">支持多张图片</p>
          </div>

          {/* File List (Compact) */}
          {files.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {files.map(file => (
                <div key={file.id} className="relative shrink-0 w-12 h-16 rounded-lg overflow-hidden border border-[#E5E5E5] group">
                  <img src={file.base64} alt={file.name} className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Custom Prompt */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[2.5rem] border border-[#E5E5E5] shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[#999999] uppercase tracking-wider px-1">自定义提示词</h3>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="例如：重点说明登录流程的异常处理，或要求使用特定的文档格式..."
            className="flex-1 w-full p-4 rounded-2xl border border-[#E5E5E5] bg-[#F9F9F9] text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none font-medium"
          />
        </div>

        {/* Card 5: Action & Tips */}
        <div className="lg:col-span-3 space-y-4">
          <button
            onClick={handleGenerate}
            disabled={files.length === 0 || isAnalyzing}
            className={cn(
              "w-full h-24 rounded-[2rem] font-bold text-lg flex flex-col items-center justify-center gap-1 transition-all",
              files.length === 0 || isAnalyzing 
                ? "bg-[#F3F3F3] text-[#999999] cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
            )}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs">分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span className="text-xs">立即生成</span>
              </>
            )}
          </button>
          
          <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <MousePointer2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-800">小贴士</span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
              上传多张带有序号的原型图，AI 能更准确地识别页面间的跳转逻辑。
            </p>
          </div>
        </div>

        {/* Card 6: Main Result (Comprehensive Display) */}
        <div className="lg:col-span-12 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm flex flex-col min-h-[600px] overflow-hidden">
          <div className="h-16 border-b border-[#E5E5E5] px-8 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-display font-bold text-[#1A1A1A]">
                {mode === 'docs' ? '交互说明文档' : '交互 Demo 预览'}
              </h3>
            </div>
            {mode === 'docs' && docsResult && (
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F3F3F3] hover:bg-[#EBEBEB] text-xs font-bold text-[#666666] transition-all"
              >
                <Download className="w-4 h-4" /> 导出 Word
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#F9F9F9]/50">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-6 py-24"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-display font-bold text-[#1A1A1A]">AI 正在深度解析</p>
                    <p className="text-sm text-[#666666] font-medium max-w-[300px]">正在识别页面元素、手势逻辑与跳转关系，请稍候...</p>
                  </div>
                </motion.div>
              ) : mode === 'docs' && docsResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-[#E5E5E5] shadow-sm markdown-body prose prose-sm max-w-none text-[#1A1A1A]">
                    <Markdown>{docsResult.markdown}</Markdown>
                  </div>
                </motion.div>
              ) : mode === 'demo' && demoResult && currentScreen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center"
                >
                  <div className="relative max-w-[320px] mx-auto rounded-[3rem] border-[12px] border-[#1A1A1A] overflow-hidden shadow-2xl bg-white ring-1 ring-white/20">
                    <img 
                      src={currentScreen.imageBase64} 
                      alt={currentScreen.name} 
                      className="w-full h-auto select-none"
                    />
                    {currentScreen.hotspots.map((hotspot, idx) => (
                      <div
                        key={idx}
                        onClick={() => setCurrentScreenId(hotspot.targetScreenId)}
                        className="absolute bg-indigo-500/0 hover:bg-indigo-500/10 cursor-pointer transition-colors group"
                        style={{
                          top: `${hotspot.rect[0] / 10}%`,
                          left: `${hotspot.rect[1] / 10}%`,
                          height: `${(hotspot.rect[2] - hotspot.rect[0]) / 10}%`,
                          width: `${(hotspot.rect[3] - hotspot.rect[1]) / 10}%`,
                        }}
                      >
                        <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/30 rounded-sm" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-6">
                    <button 
                      onClick={() => setCurrentScreenId(demoResult.initialScreenId)}
                      className="px-6 py-2.5 rounded-full bg-[#1A1A1A] text-xs font-bold text-white hover:bg-indigo-600 transition-all shadow-lg shadow-black/10"
                    >
                      重置 Demo
                    </button>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">当前页面</span>
                      <span className="text-sm font-bold text-[#1A1A1A]">{currentScreen.name}</span>
                    </div>
                  </div>
                </motion.div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                  <p className="text-red-500 font-bold">{error}</p>
                  <button onClick={handleGenerate} className="text-xs font-bold text-indigo-600 hover:underline">重试</button>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6 opacity-40">
                  <div className="p-6 rounded-full bg-[#F3F3F3]">
                    {mode === 'docs' ? <FileText className="w-12 h-12 text-[#999999]" /> : <MousePointer2 className="w-12 h-12 text-[#999999]" />}
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-display font-bold text-[#1A1A1A]">等待生成</p>
                    <p className="text-sm text-[#999999] font-medium max-w-[300px]">
                      {mode === 'docs' 
                        ? "上传原型图后，此处将显示生成的详尽交互说明文档。" 
                        : "上传多张原型图，AI 将为您生成可交互的预览原型。"}
                    </p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
