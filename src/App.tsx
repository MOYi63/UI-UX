import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  LayoutPanelLeft, 
  Github, 
  Info, 
  Plus, 
  ChevronRight, 
  Bell, 
  LayoutGrid,
  FileText, 
  BookOpen, 
  BarChart3, 
  PlayCircle,
  MousePointer2
} from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultsDisplay } from './components/ResultsDisplay';
import { analyzeDesign, AnalysisConfig, AnalysisResult, Methodology } from './services/geminiService';
import { ExportModal } from './components/ExportModal';
import { MethodologyManager } from './components/MethodologyManager';
import { CompetitiveAnalysis } from './components/CompetitiveAnalysis';
import { MotionImplementation } from './components/MotionImplementation';
import { PrototypeInteraction } from './components/PrototypeInteraction';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'methodology' | 'competitive' | 'motion-implementation' | 'prototype-interaction'>('home');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [lastUploadedImage, setLastUploadedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [config, setConfig] = useState<AnalysisConfig>({
    targetAudience: '普通用户',
    focusAreas: ['无障碍性', '启发式评估'],
    platform: 'web',
    strictness: 'standard',
    functionalCategory: '生产流程'
  });

  const handleUpload = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      setLastUploadedImage(imageBase64);
      const analysis = await analyzeDesign(imageBase64, config, methodologies);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('分析设计失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const navItems = [
    { id: 'home', label: '设计审计', icon: LayoutPanelLeft },
    { id: 'competitive', label: '竞品分析', icon: BarChart3 },
    { id: 'methodology', label: '分析方法', icon: BookOpen },
    { id: 'motion-implementation', label: '动效实现', icon: PlayCircle },
    { id: 'prototype-interaction', label: '交互说明', icon: MousePointer2 },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-[#F9F9F9] overflow-hidden">
      {/* Top Header & Navigation */}
      <header className="h-16 border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-display font-bold text-[#1A1A1A]">LuminaUX</span>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all",
                  activeTab === item.id 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F3F3F3]"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F3F3F3] border border-[#E5E5E5] text-[10px] font-bold text-[#666666]">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            1,300
          </div>
          <Bell className="w-4 h-4 text-[#666666] cursor-pointer hover:text-[#1A1A1A]" />
          <div className="w-8 h-8 rounded-full bg-pink-200 border border-[#E5E5E5] cursor-pointer" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-12"
              >
                {/* Hero Section */}
                <div className="text-center space-y-6 pt-8 pb-4">
                  <h1 className="text-4xl font-display font-bold text-[#1A1A1A]">
                    我能为您做些什么？
                  </h1>
                  
                  <div className="max-w-[800px] mx-auto relative">
                    <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-4 focus-within:border-indigo-500/50 transition-all">
                      <div className="text-left text-[#999999] text-sm mb-4">
                        上传您的设计稿或提问任何问题...
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 hover:bg-[#F3F3F3] rounded-lg cursor-pointer transition-colors">
                            <Plus className="w-4 h-4 text-[#666666]" />
                          </div>
                          <div className="p-2 hover:bg-[#F3F3F3] rounded-lg cursor-pointer transition-colors">
                            <LayoutGrid className="w-4 h-4 text-[#666666]" />
                          </div>
                          <div className="p-2 hover:bg-[#F3F3F3] rounded-lg cursor-pointer transition-colors">
                            <Sparkles className="w-4 h-4 text-[#666666]" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Github className="w-4 h-4 text-[#666666] cursor-pointer" />
                          <div className="w-8 h-8 rounded-full bg-[#F3F3F3] flex items-center justify-center cursor-pointer">
                            <ChevronRight className="w-4 h-4 text-[#999999]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-[800px] mx-auto">
                    {[
                      { icon: FileText, label: '分析可用性' },
                      { icon: LayoutGrid, label: '检查无障碍' },
                      { icon: BarChart3, label: '竞品对比' },
                      { icon: PlayCircle, label: '动效还原' }
                    ].map((item, i) => (
                      <button key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E5E5E5] text-xs font-bold text-[#666666] hover:bg-[#F3F3F3] transition-all shadow-sm">
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <aside className="lg:col-span-4 space-y-6">
                    <SettingsPanel 
                      config={config} 
                      onChange={setConfig} 
                      methodologyCount={methodologies.length}
                    />
                    
                    <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm">
                      <div className="flex gap-4">
                        <div className="p-2 rounded-lg bg-indigo-50 shrink-0 h-fit">
                          <Info className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-[#1A1A1A]">审计方法论</h4>
                          <p className="text-xs text-[#666666] leading-relaxed font-medium">
                            我们的 AI 专家模型融合了尼尔森启发式原则、WCAG 2.1 标准以及现代设计趋势。
                          </p>
                        </div>
                      </div>
                    </div>
                  </aside>

                  <section className="lg:col-span-8 space-y-8">
                    <UploadZone onUpload={handleUpload} isAnalyzing={isAnalyzing} />

                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-3 font-bold"
                        >
                          <LayoutPanelLeft className="w-4 h-4" />
                          <p>{error}</p>
                        </motion.div>
                      )}

                      {result && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                            <h2 className="text-xl font-display font-bold text-[#1A1A1A]">审计报告</h2>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => window.print()}
                                className="px-3 py-1.5 rounded-lg bg-[#F3F3F3] text-[10px] font-bold text-[#666666] hover:bg-[#EBEBEB] transition-all"
                              >
                                PDF
                              </button>
                              <button 
                                onClick={() => setIsExportModalOpen(true)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-[10px] font-bold text-white hover:bg-indigo-700 transition-all"
                              >
                                Word
                              </button>
                            </div>
                          </div>
                          <ResultsDisplay 
                            result={result} 
                            methodologyCount={methodologies.length}
                            imageUrl={lastUploadedImage}
                          />
                          <ExportModal 
                            isOpen={isExportModalOpen} 
                            onClose={() => setIsExportModalOpen(false)} 
                            result={result}
                            imageBase64={lastUploadedImage || undefined}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                </div>
              </motion.div>
            ) : activeTab === 'methodology' ? (
              <motion.div
                key="methodology"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MethodologyManager 
                  methodologies={methodologies} 
                  onUpdate={setMethodologies} 
                />
              </motion.div>
            ) : activeTab === 'competitive' ? (
              <motion.div
                key="competitive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CompetitiveAnalysis />
              </motion.div>
            ) : activeTab === 'motion-implementation' ? (
              <motion.div
                key="motion-implementation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MotionImplementation />
              </motion.div>
            ) : (
              <motion.div
                key="prototype-interaction"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PrototypeInteraction />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Footer Info */}
      <footer className="h-10 border-t border-[#E5E5E5] bg-white flex items-center justify-between px-8 shrink-0 text-[10px] text-[#999999] font-medium">
        <div className="flex items-center gap-4">
          <span className="hover:text-[#1A1A1A] cursor-pointer">隐私政策</span>
          <span className="hover:text-[#1A1A1A] cursor-pointer">服务条款</span>
        </div>
        <div>© 2026 LuminaUX AI</div>
      </footer>
    </div>
  );
}
