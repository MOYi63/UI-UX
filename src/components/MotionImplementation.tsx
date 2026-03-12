import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileCode, Play, Code2, Cpu, Coffee, Terminal, Check, Copy, Loader2, Video, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import { generateMotionCode } from '../services/geminiService';

type Language = 'cpp' | 'java' | 'python' | 'css';

export const MotionImplementation: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('cpp');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setGeneratedCode(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setIsGenerating(true);
    setGeneratedCode(null);

    try {
      // Convert file to base64 for Gemini
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const code = await generateMotionCode(base64, language, file.type);
        setGeneratedCode(code);
        setIsGenerating(false);
      };
    } catch (error) {
      console.error('Failed to generate motion code:', error);
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const languages = [
    { id: 'cpp', name: 'C++', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'java', name: 'Java', icon: Coffee, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { id: 'python', name: 'Python', icon: Terminal, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { id: 'css', name: 'CSS', icon: Palette, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];

  return (
    <div className="space-y-10">
      <header className="text-center max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest"
        >
          <Play className="w-3.5 h-3.5" /> 动效实现专家
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-display font-bold text-[#1A1A1A] tracking-tight">
          从动效到 <span className="text-indigo-600">原生代码</span>
        </h1>
        <p className="text-lg text-[#666666] leading-relaxed font-medium">
          上传 AE 项目 (.aep)、导出 JSON、GIF、WebP 或 PNG 序列，AI 将为您生成高性能的原生动效实现代码。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：上传与预览 */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 space-y-6 border border-[#E5E5E5] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Upload className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-display font-bold text-[#1A1A1A]">上传动效文件</h3>
            </div>

            <label className={cn(
              "relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all overflow-hidden group",
              file ? "border-indigo-300 bg-indigo-50/30" : "border-[#E5E5E5] bg-[#F9F9F9] hover:bg-white hover:border-indigo-300"
            )}>
              <input type="file" className="hidden" onChange={handleFileChange} accept=".gif,.png,.jpg,.jpeg,.json,.webp,.aep" />
              
              {previewUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  {file?.type.includes('image') || file?.type.includes('gif') ? (
                    <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Video className="w-16 h-16 text-indigo-600" />
                      <span className="text-sm text-[#1A1A1A] font-bold">{file?.name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-indigo-600 text-sm font-bold">点击更换文件</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="mb-2 text-sm text-[#1A1A1A]">
                    <span className="font-bold text-indigo-600">点击上传</span> 或拖拽文件
                  </p>
                  <p className="text-[10px] font-bold text-[#999999] uppercase tracking-wider">支持 AEP, JSON, GIF, WebP, PNG 序列</p>
                </div>
              )}
            </label>

            <div className="space-y-4 pt-4">
              <label className="text-xs font-bold text-[#999999] uppercase tracking-widest flex items-center gap-2">
                <Code2 className="w-4 h-4" /> 选择目标语言
              </label>
              <div className="grid grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id as Language)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                      language === lang.id
                        ? "bg-indigo-50 border-indigo-300 text-indigo-600"
                        : "bg-white border-[#E5E5E5] text-[#999999] hover:border-indigo-200"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", lang.id === language ? lang.bg : "bg-[#F3F3F3]")}>
                      <lang.icon className={cn("w-5 h-5", lang.id === language ? lang.color : "text-[#999999]")} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!file || isGenerating}
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在解析动效逻辑...
                </>
              ) : (
                <>
                  <FileCode className="w-5 h-5" />
                  生成动效代码
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧：代码输出 */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] h-full flex flex-col overflow-hidden border border-[#E5E5E5] shadow-sm">
            <div className="px-8 py-6 border-b border-[#E5E5E5] flex items-center justify-between bg-[#F9F9F9]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50">
                  <Code2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-display font-bold text-[#1A1A1A]">实现代码</h3>
              </div>
              {generatedCode && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E5E5E5] hover:bg-[#F3F3F3] text-xs font-bold text-[#1A1A1A] transition-all shadow-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制代码
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 p-8 bg-white relative">
              <AnimatePresence mode="wait">
                {generatedCode ? (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full"
                  >
                    <pre className="font-mono text-sm text-[#1A1A1A] leading-relaxed overflow-auto max-h-[600px] scrollbar-hide p-6 bg-[#F3F3F3] rounded-2xl border border-[#E5E5E5]">
                      <code>{generatedCode}</code>
                    </pre>
                  </motion.div>
                ) : isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center space-y-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full border-4 border-indigo-50 border-t-indigo-600 animate-spin" />
                      <Play className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[#1A1A1A] font-bold">正在深度学习动效曲线</p>
                      <p className="text-[#999999] text-xs font-medium">AI 正在分析关键帧、缓动函数与图层关系</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-20 h-20 rounded-[2rem] bg-[#F3F3F3] flex items-center justify-center mb-2">
                      <Code2 className="w-10 h-10 text-[#999999]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#1A1A1A] font-bold">暂无生成代码</p>
                      <p className="text-[#666666] text-xs max-w-[240px] font-medium">上传动效文件并选择目标语言后，点击生成按钮开始</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
