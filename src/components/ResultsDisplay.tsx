import React, { useState, useRef, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle, ArrowRight, Layout, Accessibility, BrainCircuit, Target, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult } from '../services/geminiService';
import { cn } from '../lib/utils';

/**
 * ResultsDisplay Component
 * Visualizes the AI analysis results using charts and structured lists.
 */
interface ResultsDisplayProps {
  result: AnalysisResult;
  methodologyCount?: number;
  imageUrl?: string | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, methodologyCount = 0, imageUrl }) => {
  const [highlightedLocation, setHighlightedLocation] = useState<[number, number, number, number] | null>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform heuristic data for the Radar chart
  const chartData = result.heuristics.map(h => ({
    subject: h.name,
    A: h.score,
    fullMark: 100,
  }));

  const handleLocationClick = (location?: [number, number, number, number]) => {
    if (location) {
      setHighlightedLocation(location);
      // Scroll to image container if not in view
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Clear highlight when clicking outside or on the highlight itself
  const clearHighlight = () => setHighlightedLocation(null);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {methodologyCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 w-fit"
        >
          <BrainCircuit className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-600">
            AI 已结合 {methodologyCount} 篇自定义方法论进行深度审计
          </span>
        </motion.div>
      )}

      {/* 核心评分与设计稿预览区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：设计稿预览与高亮 */}
        <div className="lg:col-span-7 space-y-6" ref={containerRef}>
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-display font-bold text-[#1A1A1A] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              设计稿审计标注
            </h3>
            <button 
              onClick={() => setIsImageExpanded(true)}
              className="p-2 rounded-lg bg-[#F3F3F3] hover:bg-[#EBEBEB] text-[#666666] transition-all"
              title="全屏查看"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative bg-white rounded-[2.5rem] overflow-hidden border border-[#E5E5E5] shadow-sm min-h-[400px] flex items-center justify-center group">
            {imageUrl ? (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                <img 
                  ref={imageRef}
                  src={imageUrl} 
                  alt="Audit Target" 
                  className="max-w-full max-h-[700px] object-contain rounded-xl shadow-lg border border-[#E5E5E5]"
                  referrerPolicy="no-referrer"
                />
                
                {/* 坐标高亮层 */}
                <AnimatePresence>
                  {highlightedLocation && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute border-4 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] rounded-lg z-20 pointer-events-none"
                      style={{
                        top: `${highlightedLocation[0] / 10}%`,
                        left: `${highlightedLocation[1] / 10}%`,
                        height: `${(highlightedLocation[2] - highlightedLocation[0]) / 10}%`,
                        width: `${(highlightedLocation[3] - highlightedLocation[1]) / 10}%`,
                      }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full whitespace-nowrap shadow-lg">
                        问题区域
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 点击清除高亮 */}
                {highlightedLocation && (
                  <div 
                    className="absolute inset-0 z-10 cursor-crosshair" 
                    onClick={clearHighlight}
                  />
                )}
              </div>
            ) : (
              <div className="text-[#999999] font-display italic">等待设计稿数据...</div>
            )}
          </div>
          <p className="text-center text-[10px] font-bold text-[#999999] uppercase tracking-wider">提示：点击右侧报告中的问题，可在设计稿上自动定位</p>
        </div>

        {/* 右侧：总分与雷达图 */}
        <div className="lg:col-span-5 space-y-8">
          {/* 总分卡片 */}
          <div className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group border border-[#E5E5E5] shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="80"
                  className="stroke-[#F3F3F3] fill-none"
                  strokeWidth="12"
                />
                <motion.circle
                  cx="88"
                  cy="88"
                  r="80"
                  className="stroke-indigo-600 fill-none"
                  strokeWidth="12"
                  strokeDasharray="502"
                  initial={{ strokeDashoffset: 502 }}
                  animate={{ strokeDashoffset: 502 - (502 * result.overallScore) / 100 }}
                  transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-6xl font-display font-bold text-[#1A1A1A] tracking-tighter"
                >
                  {result.overallScore}
                </motion.span>
                <span className="text-[#999999] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">综合体验分</span>
              </div>
            </div>
            
            <div className="mt-6 space-y-2 relative z-10">
              <div className={cn(
                "inline-block px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                result.overallScore > 80 ? "bg-emerald-50 text-emerald-600" : 
                result.overallScore > 60 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
              )}>
                {result.overallScore > 80 ? '卓越设计' : result.overallScore > 60 ? '良好基础' : '亟待优化'}
              </div>
            </div>
          </div>

          {/* 雷达图卡片 */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#E5E5E5] shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-[#1A1A1A] flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <BrainCircuit className="w-4 h-4 text-purple-600" />
                </div>
                启发式评估
              </h3>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#E5E5E5" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#666666', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Radar
                    name="得分"
                    dataKey="A"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fill="url(#radarGradient)"
                    fillOpacity={0.6}
                  />
                  <defs>
                    <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#9333EA" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 启发式原则详细反馈 */}
      <div className="bg-white rounded-[2rem] p-8 space-y-6 border border-[#E5E5E5] shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-[#1A1A1A] flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
            </div>
            启发式原则详细反馈
          </h3>
          <span className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">Heuristic Details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.heuristics.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => handleLocationClick(h.location)}
              className={cn(
                "p-5 rounded-2xl border transition-all group cursor-pointer flex flex-col h-full",
                h.location 
                  ? "bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-200" 
                  : "bg-white border-[#E5E5E5] hover:border-indigo-200"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-[#1A1A1A]">{h.name}</span>
                <span className={cn(
                  "text-xs font-mono font-bold",
                  h.score > 80 ? "text-emerald-600" : h.score > 60 ? "text-amber-600" : "text-red-600"
                )}>
                  {h.score}
                </span>
              </div>
              <p className="text-xs text-[#666666] leading-relaxed flex-1">{h.feedback}</p>
              {h.location && (
                <div className="mt-3 pt-3 border-t border-[#E5E5E5] text-[9px] text-purple-600 font-bold uppercase flex items-center gap-1">
                  <Target className="w-2.5 h-2.5" /> 点击定位元素
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 详细洞察区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 无障碍性报告 */}
        <div className="bg-white rounded-[2rem] p-8 space-y-8 border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-[#1A1A1A] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Accessibility className="w-5 h-5 text-emerald-600" />
              </div>
              无障碍性 (A11y) 审计
            </h3>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">WCAG 2.1 Compliance</span>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-wider">发现的问题</h4>
              <div className="space-y-3">
                {result.accessibility.issues.map((issue, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => handleLocationClick(issue.location)}
                    className={cn(
                      "flex gap-4 p-4 rounded-2xl border transition-all group cursor-pointer",
                      issue.location 
                        ? "bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200" 
                        : "bg-[#F3F3F3] border-transparent opacity-80"
                    )}
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">{issue.description}</p>
                      {issue.location && (
                        <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                          <Target className="w-3 h-3" /> 点击定位
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-[#999999] uppercase tracking-wider">改进建议</h4>
              <div className="space-y-3">
                {result.accessibility.suggestions.map((sug, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + 0.1 * i }}
                    className="flex gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 group hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">{sug}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 视觉层级与行动项 */}
        <div className="bg-white rounded-[2rem] p-8 space-y-8 border border-[#E5E5E5] shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-[#1A1A1A] flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Layout className="w-5 h-5 text-indigo-600" />
              </div>
              视觉层级与视线流向
            </h3>
            <span className="text-[10px] font-bold text-[#999999] uppercase tracking-widest">Visual Hierarchy</span>
          </div>

          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-[#F3F3F3] border border-[#E5E5E5] relative group">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600 rounded-full opacity-40" />
              <p className="text-[#1A1A1A] text-sm leading-relaxed italic font-medium">
                "{result.visualHierarchy}"
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">关键优化行动清单</h4>
              <div className="grid grid-cols-1 gap-3">
                {result.keyActionItems.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + 0.1 * i }}
                    onClick={() => handleLocationClick(item.location)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all group cursor-pointer",
                      item.location
                        ? "bg-white border-[#E5E5E5] hover:border-indigo-300 hover:bg-indigo-50"
                        : "bg-[#F3F3F3] border-transparent opacity-70"
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-mono text-xs font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm text-[#1A1A1A] font-bold">{item.task}</span>
                      {item.location && (
                        <div className="text-[9px] text-indigo-600 font-bold uppercase mt-0.5 flex items-center gap-1">
                          <Target className="w-2.5 h-2.5" /> 点击定位
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#999999] ml-auto group-hover:text-indigo-600 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 全屏预览弹窗 */}
      <AnimatePresence>
        {isImageExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <button 
              onClick={() => setIsImageExpanded(false)}
              className="absolute top-8 right-8 p-3 rounded-full bg-[#F3F3F3] hover:bg-[#EBEBEB] text-[#1A1A1A] transition-all z-[110] border border-[#E5E5E5]"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative max-w-full max-h-full">
              <img 
                src={imageUrl!} 
                alt="Full Preview" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-[#E5E5E5]"
                referrerPolicy="no-referrer"
              />
              {highlightedLocation && (
                <div
                  className="absolute border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] rounded-lg pointer-events-none"
                  style={{
                    top: `${highlightedLocation[0] / 10}%`,
                    left: `${highlightedLocation[1] / 10}%`,
                    height: `${(highlightedLocation[2] - highlightedLocation[0]) / 10}%`,
                    width: `${(highlightedLocation[3] - highlightedLocation[1]) / 10}%`,
                  }}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
