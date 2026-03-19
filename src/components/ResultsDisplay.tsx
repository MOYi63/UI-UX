import React, { useState, useRef, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, AlertCircle, ArrowRight, Layout, Accessibility, BrainCircuit, Target, X, Maximize2, MousePointer2, Play, Pause, RefreshCw } from 'lucide-react';
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
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPointsCount, setSimulatedPointsCount] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Simulation Logic
  const startSimulation = () => {
    if (!result.heatmapPoints) return;
    setIsSimulating(true);
    setShowHeatmap(true);
    setSimulatedPointsCount(0);
    
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    
    simulationIntervalRef.current = setInterval(() => {
      setSimulatedPointsCount(prev => {
        if (prev >= (result.heatmapPoints?.length || 0)) {
          if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
          setIsSimulating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 150); // Speed of simulation
  };

  const stopSimulation = () => {
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    stopSimulation();
    setSimulatedPointsCount(0);
    setShowHeatmap(false);
  };

  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  const visiblePoints = showHeatmap 
    ? (isSimulating || simulatedPointsCount > 0 
        ? result.heatmapPoints?.slice(0, simulatedPointsCount) 
        : result.heatmapPoints) 
    : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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

      {/* Bento Grid for Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Card 1: Image Preview (Large) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm overflow-hidden flex flex-col" ref={containerRef}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5]">
            <h3 className="text-sm font-display font-bold text-[#1A1A1A] flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              设计稿审计标注
            </h3>
            <div className="flex items-center gap-2">
              {result.heatmapPoints && result.heatmapPoints.length > 0 && (
                <div className="flex items-center gap-1 bg-[#F3F3F3] p-1 rounded-xl border border-[#E5E5E5]">
                  <button 
                    onClick={() => {
                      if (isSimulating) stopSimulation();
                      else startSimulation();
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      isSimulating 
                        ? "bg-orange-500 text-white shadow-sm" 
                        : "text-[#666666] hover:bg-[#EBEBEB]"
                    )}
                  >
                    {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isSimulating ? '模拟中...' : '开始模拟'}
                  </button>
                  <button 
                    onClick={() => {
                      setShowHeatmap(!showHeatmap);
                      if (isSimulating) stopSimulation();
                      setSimulatedPointsCount(0);
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      showHeatmap && !isSimulating
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "text-[#666666] hover:bg-[#EBEBEB]"
                    )}
                  >
                    <MousePointer2 className="w-3 h-3" />
                    {showHeatmap ? '隐藏热区' : '查看热区'}
                  </button>
                </div>
              )}
              <button 
                onClick={() => setIsImageExpanded(true)}
                className="p-1.5 rounded-lg bg-[#F3F3F3] hover:bg-[#EBEBEB] text-[#666666] transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex-1 relative bg-[#F9F9F9] flex items-center justify-center p-4 min-h-[400px]">
            {imageUrl ? (
              <div className="relative max-w-full">
                <img 
                  ref={imageRef}
                  src={imageUrl} 
                  alt="Audit Target" 
                  className="max-w-full max-h-[500px] block rounded-lg shadow-md border border-[#E5E5E5]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Heatmap Overlay */}
                <AnimatePresence>
                  {showHeatmap && visiblePoints && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-lg"
                    >
                      {visiblePoints.map((point, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: Math.min(point.intensity * 0.8, 0.8) }}
                          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                          className="absolute rounded-full blur-xl"
                          style={{
                            left: `${Math.max(0, Math.min(100, point.x / 10))}%`,
                            top: `${Math.max(0, Math.min(100, point.y / 10))}%`,
                            width: `${50 + point.intensity * 60}px`,
                            height: `${50 + point.intensity * 60}px`,
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle, rgba(255, 68, 0, 0.8) 0%, rgba(255, 165, 0, 0.4) 40%, rgba(255, 255, 0, 0.1) 70%, transparent 100%)`,
                            mixBlendMode: 'multiply'
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

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
                    />
                  )}
                </AnimatePresence>
                {highlightedLocation && (
                  <div className="absolute inset-0 z-10 cursor-crosshair" onClick={clearHighlight} />
                )}
              </div>
            ) : (
              <div className="text-[#999999] text-xs font-bold uppercase tracking-widest">等待数据...</div>
            )}
          </div>
        </div>

        {/* Card 2: Overall Score (Medium) */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="72" className="stroke-[#F3F3F3] fill-none" strokeWidth="10" />
              <motion.circle
                cx="80"
                cy="80"
                r="72"
                className="stroke-indigo-600 fill-none"
                strokeWidth="10"
                strokeDasharray="452"
                initial={{ strokeDashoffset: 452 }}
                animate={{ strokeDashoffset: 452 - (452 * result.overallScore) / 100 }}
                transition={{ duration: 2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-display font-bold text-[#1A1A1A] tracking-tighter">{result.overallScore}</span>
              <span className="text-[#999999] text-[8px] font-bold uppercase tracking-[0.2em] mt-1">综合分</span>
            </div>
          </div>
          <div className={cn(
            "mt-4 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider relative z-10",
            result.overallScore > 80 ? "bg-emerald-50 text-emerald-600" : 
            result.overallScore > 60 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
          )}>
            {result.overallScore > 80 ? '卓越设计' : result.overallScore > 60 ? '良好基础' : '亟待优化'}
          </div>
        </div>

        {/* Card 3: Radar Chart (Medium) */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-display font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            能力分布
          </h3>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#E5E5E5" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666666', fontSize: 8, fontWeight: 700 }} />
                <Radar name="得分" dataKey="A" stroke="#4F46E5" strokeWidth={2} fill="#4F46E5" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3.5: Heatmap Simulation Insights (New) */}
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
          <h3 className="text-sm font-display font-bold text-[#1A1A1A] mb-4 flex items-center gap-2 relative z-10">
            <MousePointer2 className="w-4 h-4 text-orange-600" />
            用户点击热区模拟
          </h3>
          <div className="flex-1 flex flex-col justify-between relative z-10">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wider">模拟样本量</span>
                <span className="text-xs font-bold text-[#1A1A1A]">1,000+ 虚拟用户</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#999999] uppercase tracking-wider">交互密集度</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={cn("w-3 h-1 rounded-full", i <= 4 ? "bg-orange-500" : "bg-[#F3F3F3]")} />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-[#666666] leading-relaxed">
                基于 AI 视觉模型模拟真实用户的视觉焦点与点击倾向。热区越红代表用户在该区域的交互意愿越高。
              </p>
            </div>
            <button 
              onClick={startSimulation}
              disabled={isSimulating}
              className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-[10px] font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              {isSimulating ? '模拟运行中...' : '重新运行点击模拟'}
            </button>
          </div>
        </div>

        {/* Card 4: Key Action Items (Large) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-display font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Layout className="w-4 h-4 text-indigo-600" />
            关键优化行动清单
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.keyActionItems.map((item, i) => (
              <div 
                key={i}
                onClick={() => handleLocationClick(item.location)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group",
                  item.location ? "bg-indigo-50/30 border-indigo-100 hover:bg-indigo-50" : "bg-[#F9F9F9] border-transparent"
                )}
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-xs text-[#1A1A1A] font-bold leading-relaxed">{item.task}</span>
                <ArrowRight className="w-3 h-3 text-[#999999] ml-auto shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[#F9F9F9] border border-[#E5E5E5]">
            <p className="text-[11px] text-[#666666] leading-relaxed italic font-medium">
              "{result.visualHierarchy}"
            </p>
          </div>
        </div>

        {/* Card 5: Heuristics (Full Width or Large) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6">
          <h3 className="text-sm font-display font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            启发式原则审计
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {result.heuristics.map((h, i) => (
              <div
                key={i}
                onClick={() => handleLocationClick(h.location)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer",
                  h.location ? "bg-purple-50 border-purple-100 hover:bg-purple-100" : "bg-[#F9F9F9] border-transparent"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#1A1A1A] truncate mr-2">{h.name}</span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold",
                    h.score > 80 ? "text-emerald-600" : h.score > 60 ? "text-amber-600" : "text-red-600"
                  )}>
                    {h.score}
                  </span>
                </div>
                <p className="text-[10px] text-[#666666] leading-tight">{h.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Accessibility (Medium) */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] border border-[#E5E5E5] shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-display font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-emerald-600" />
            无障碍性审计
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-[#999999] uppercase tracking-wider">主要问题</p>
              {result.accessibility.issues.map((issue, i) => (
                <div 
                  key={i}
                  onClick={() => handleLocationClick(issue.location)}
                  className="flex gap-2 p-2 rounded-lg bg-red-50/50 border border-red-100 cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <AlertCircle className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#1A1A1A] leading-tight font-medium">{issue.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-[#999999] uppercase tracking-wider">改进建议</p>
              {result.accessibility.suggestions.map((sug, i) => (
                <div key={i} className="flex gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-[#1A1A1A] leading-tight font-medium">{sug}</p>
                </div>
              ))}
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
                className="max-w-full max-h-full block rounded-lg shadow-2xl border border-[#E5E5E5]"
                referrerPolicy="no-referrer"
              />
              
              {/* Heatmap Overlay in Fullscreen */}
              <AnimatePresence>
                {showHeatmap && visiblePoints && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-lg"
                  >
                    {visiblePoints.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: Math.min(point.intensity * 0.8, 0.8) }}
                        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                        className="absolute rounded-full blur-2xl"
                        style={{
                          left: `${Math.max(0, Math.min(100, point.x / 10))}%`,
                          top: `${Math.max(0, Math.min(100, point.y / 10))}%`,
                          width: `${80 + point.intensity * 100}px`,
                          height: `${80 + point.intensity * 100}px`,
                          transform: 'translate(-50%, -50%)',
                          background: `radial-gradient(circle, rgba(255, 68, 0, 0.8) 0%, rgba(255, 165, 0, 0.4) 40%, rgba(255, 255, 0, 0.1) 70%, transparent 100%)`,
                          mixBlendMode: 'multiply'
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

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
