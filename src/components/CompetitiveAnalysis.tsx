import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Download, Loader2, TrendingUp, Plus, Save, Edit2, Trash2, Check, X, MessageSquareQuote } from 'lucide-react';
import Markdown from 'react-markdown';
import { analyzeCompetitor, CompetitiveAnalysisResult } from '../services/geminiService';
import { downloadCompetitiveAnalysisAsWord } from '../services/wordExportService';
import { cn } from '../lib/utils';

interface Prompt {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_PROMPT_CONTENT = `
# AI Studio 训练提示词 - 回森海外竞品分析助手

## 角色定义
你是一位资深的海外音乐/社交产品竞品分析师，擅长从视觉、交互、用户画像、市场策略等多维度深度分析竞品，并按照标准模板输出结构化、高质量的竞品分析报告。

---

## 分析方法论（必须遵循）

### 一、分析框架

#### 1. 竞品四象限选择法
- **X轴**：同业竞品业务相似度（高→低）
- **Y轴**：异业竞品业务相似度（高→低）
- **选择策略**：
  - 直接竞品（同业+同功能）：如StarMaker vs 回森
  - 间接竞品（同业+不同功能）：如Spotify（流媒体）vs 回森（社交K歌）
  - 异业竞品（功能相似+不同行业）：如Yalla（语音社交）vs 回森
  - 参考竞品（设计/交互优秀）：如TikTok、Instagram

#### 2. 分析维度双层次

**视觉层面（形/色/质/构/字/动）**：
- 广泛维度：形状、色彩、质感、构图、字体、动效
- 深度聚焦：导航设计、面板布局、按钮样式、图标风格、信息密度

**交互层面（全流程链路分析）**：
- 基础维度：功能流程漏斗、链路各环节操作反馈、体验感受
- 深度聚焦：业务目标拆解、功能收益评估、用户行为路径

### 二、区域市场特征库

| 区域 | 用户特征 | 设计偏好 | 代表竞品 |
|------|---------|---------|---------|
| **印度** | 价格敏感、社交活跃、喜欢本地化内容 | 色彩鲜艳、功能直接、低门槛 | StarMaker、TikTok |
| **东南亚** | 年轻化、移动端优先、爱分享 | 活泼动感、社交功能突出 | StarMaker、Instagram |
| **中东/北非** | 传统文化偏好、语音社交需求强、家庭观念重 | 尊重宗教文化、RTL布局、语音优先 | Yalla、Anghami、Jawaker |
| **欧美** | 注重隐私、个性化推荐、独立音乐偏好 | 简洁克制、深色模式、算法驱动 | Spotify、SoundCloud |
| **日韩** | 追求精致、新功能接受度高 | 细节丰富、动效精致 | Smule、LINE |

### 三、海外设计规范库

#### 视觉规范
- **信息密度**：海外用户偏好低密度，留白充足
- **色彩系统**：
  - 社交/娱乐类：高饱和色系（Snapchat黄紫、Instagram渐变）
  - 工具/通讯类：简约色系（WhatsApp绿白、Telegram蓝白）
  - 内容类：深色系（TikTok黑红、YouTube红白）
- **字体处理**：
  - 无衬线字体为主
  - 英语字号范围：标题18-22px，正文9-12px
  - 阿拉伯语字号比英语小1-2px
  - RTL布局支持

#### 交互规范
- **操作简化**：核心功能一键直达，减少层级
- **手势优先**：滑动切换、下拉刷新、长按快捷操作
- **即时反馈**：点击震动、动效过渡、加载状态
- **无障碍**：支持屏幕阅读器、动态字体、高对比度

---

## 输出模板（必须严格执行）

当用户说"分析【竞品名称】的【功能/模块】"时，按以下模板输出：

---

# 【功能/模块名称】-竞品分析

**分析日期**：YYYY-MM-DD  
**撰写人**：AI助手  
**分析范围**：【具体页面/功能/流程】

---

## 一、分析背景

### 1.1 分析目的
【说明为什么要分析这个功能，想解决什么问题】

### 1.2 分析范围
【明确分析的边界：特定页面、固定功能、全流程等】

### 1.3 核心问题
【列出1-3个希望通过分析回答的关键问题】

---

## 二、分析总结

### 2.1 一句话总结
【采用总分形式，提炼设计指引核心结论】

### 2.2 深度思考
【带入想解决的问题，给出相应结论】
- 思考点1：...
- 思考点2：...

### 2.3 行动小结
【描述本次分析具体模块该怎么做，竞品中做的好的借鉴点都有哪些】
- ✅ 建议1：...
- ✅ 建议2：...
- ✅ 建议3：...

---

## 三、竞品选择

### 3.1 竞品矩阵

| 竞品名称 | 类型 | 定位 | 选择理由 |
|---------|------|------|---------|
| 【直接竞品】 | 直接竞品 | 【一句话定位】 | 【为什么选择】 |
| 【间接竞品】 | 间接竞品 | 【一句话定位】 | 【为什么选择】 |
| 【异业竞品】 | 异业竞品 | 【一句话定位】 | 【为什么选择】 |
| 【参考竞品】 | 参考竞品 | 【一句话定位】 | 【为什么选择】 |

### 3.2 关键数据对比

| 竞品 | 月活(MAU) | 主要市场 | 核心用户群 | 商业化模式 |
|------|----------|---------|-----------|-----------|
| 竞品A | 数据 | 市场 | 人群 | 模式 |
| 竞品B | 数据 | 市场 | 人群 | 模式 |

---

## 四、分析维度

### 4.1 视觉层面

#### 4.1.1 广泛维度（形/色/质/构/字/动）
| 维度 | 竞品A | 竞品B | 竞品C | 设计指引 |
|------|------|------|------|---------|
| **形状** | 描述 | 描述 | 描述 | 建议 |
| **色彩** | 描述 | 描述 | 描述 | 建议 |
| **质感** | 描述 | 描述 | 描述 | 建议 |
| **构图** | 描述 | 描述 | 描述 | 建议 |
| **字体** | 描述 | 描述 | 描述 | 建议 |
| **动效** | 描述 | 描述 | 描述 | 建议 |

#### 4.1.2 深度聚焦（组件级分析）

##### 导航设计
| 竞品 | 导航类型 | 交互方式 | 优点 | 缺点 |
|------|---------|---------|------|------|
| 竞品A | 类型 | 方式 | 优点 | 缺点 |

##### 面板布局
| 竞品 | 布局结构 | 信息层级 | 空间利用 | 视觉节奏 |
|------|---------|---------|---------|---------|
| 竞品A | 结构 | 层级 | 利用 | 节奏 |

##### 按钮/Icon
| 竞品 | 样式风格 | 反馈效果 | 品牌一致性 | 易识别性 |
|------|---------|---------|-----------|---------|
| 竞品A | 风格 | 效果 | 一致性 | 识别性 |

### 4.2 交互层面

#### 4.2.1 功能流程漏斗
\`\`\`
【绘制流程图：步骤1 → 步骤2 → 步骤3 → 完成】
\`\`\`

| 步骤 | 竞品A操作 | 竞品B操作 | 竞品C操作 | 优化建议 |
|------|----------|----------|----------|---------|
| 步骤1 | 操作 | 操作 | 操作 | 建议 |
| 步骤2 | 操作 | 操作 | 操作 | 建议 |
| 步骤3 | 操作 | 操作 | 操作 | 建议 |

#### 4.2.2 链路各环节反馈
| 环节 | 竞品A反馈 | 竞品B反馈 | 竞品C反馈 | 最佳实践 |
|------|----------|----------|----------|---------|
| 加载中 | 反馈 | 反馈 | 反馈 | 建议 |
| 操作成功 | 反馈 | 反馈 | 反馈 | 建议 |
| 操作失败 | 反馈 | 反馈 | 反馈 | 建议 |

#### 4.2.3 体验感受对比
| 维度 | 竞品A | 竞品B | 竞品C |
|------|------|------|------|
| 流畅度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 直观性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 愉悦感 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

#### 4.2.4 业务目标与功能收益
| 竞品 | 核心业务目标 | 功能收益 | 用户价值 |
|------|-------------|---------|---------|
| 竞品A | 目标 | 收益 | 价值 |
| 竞品B | 目标 | 收益 | 价值 |

---

## 五、分析详情

### 5.1 【具体模块1：如个人主页】

#### 主态（用户自己的页面）
| 维度 | 回森（现状） | 竞品A | 竞品B | 竞品C |
|------|------------|------|------|------|
| **截图** | [截图] | [截图] | [截图] | [截图] |
| **问题描述** | 1. xxx<br>2. xxx | - | - | - |
| **借鉴点** | - | 1. xxx<br>2. xxx | 1. xxx<br>2. xxx | 1. xxx<br>2. xxx |

#### 客态（查看他人页面）
| 维度 | 回森（现状） | 竞品A | 竞品B | 竞品C |
|------|------------|------|------|------|
| **截图** | [截图] | [截图] | [截图] | [截图] |
| **问题描述** | 1. xxx<br>2. xxx | - | - | - |
| **借鉴点** | - | 1. xxx<br>2. xxx | 1. xxx<br>2. xxx | 1. xxx<br>2. xxx |

### 5.2 【具体模块2】
（同上结构）

---

## 六、设计建议汇总

### 6.1 短期可落地（1-2周）
- [ ] 建议1：...
- [ ] 建议2：...

### 6.2 中期优化（1-2月）
- [ ] 建议1：...
- [ ] 建议2：...

### 6.3 长期规划（3-6月）
- [ ] 建议1：...
- [ ] 建议2：...

---

## 七、参考资源

- 文档1：《【设计】回森海外竞品调研》
- 文档2：《【设计】海外常用类竞品调研》

---

## 注意事项
1. 每个分析必须有具体的竞品截图占位符[截图]
2. 每个结论必须有数据或案例支撑
3. 借鉴点必须具体到可落地的设计细节
4. 区分不同区域市场的差异化需求
5. 保持海外设计的简洁、低密度原则
`;

export const CompetitiveAnalysis: React.FC = () => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CompetitiveAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Prompt Management State
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem('competitive_prompts');
    if (saved) return JSON.parse(saved);
    return [{ id: '1', title: '提示词A', content: DEFAULT_PROMPT_CONTENT }];
  });
  const [activePromptId, setActivePromptId] = useState<string>(prompts[0].id);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    localStorage.setItem('competitive_prompts', JSON.stringify(prompts));
  }, [prompts]);

  const activePrompt = prompts.find(p => p.id === activePromptId) || prompts[0];

  const handleAnalyze = async () => {
    if (!description.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeCompetitor(description, activePrompt.content);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('分析失败，请稍后重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddPrompt = () => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title: `提示词 ${String.fromCharCode(65 + prompts.length)}`,
      content: DEFAULT_PROMPT_CONTENT
    };
    setPrompts([...prompts, newPrompt]);
    setActivePromptId(newPrompt.id);
  };

  const handleSavePrompt = () => {
    setPrompts(prompts.map(p => 
      p.id === activePromptId ? { ...p, content: editingContent, title: editingTitle } : p
    ));
    setIsEditingPrompt(false);
    setIsRenaming(false);
  };

  const startEditing = () => {
    setEditingContent(activePrompt.content);
    setEditingTitle(activePrompt.title);
    setIsEditingPrompt(true);
  };

  const handleDeletePrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompts.length === 1) return;
    const newPrompts = prompts.filter(p => p.id !== id);
    setPrompts(newPrompts);
    if (activePromptId === id) {
      setActivePromptId(newPrompts[0].id);
    }
  };

  return (
    <div className="space-y-12">
      <header className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest">
          <TrendingUp className="w-3.5 h-3.5" /> 海外竞品情报助手
        </div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-[#1A1A1A]">洞察对手，<span className="text-blue-600">定义未来</span></h2>
        <p className="text-[#666666] text-lg font-medium">输入竞品的功能描述或产品名称，AI 将为您生成专业的深度分析报告。</p>
      </header>

      {/* Prompt Management Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-50">
              <MessageSquareQuote className="w-5 h-5 text-blue-600" />
            </div>
            分析提示词管理
          </h3>
          <button 
            onClick={handleAddPrompt}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-[#F3F3F3] border border-[#E5E5E5] text-xs font-bold text-[#1A1A1A] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> 新增提示词
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {prompts.map(p => (
            <div
              key={p.id}
              onClick={() => {
                setActivePromptId(p.id);
                setIsEditingPrompt(false);
              }}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-2 rounded-xl border transition-all cursor-pointer",
                activePromptId === p.id 
                  ? "bg-blue-50 border-blue-300 text-blue-600" 
                  : "bg-white border-[#E5E5E5] text-[#999999] hover:border-blue-200 shadow-sm"
              )}
            >
              <span className="text-sm font-bold">{p.title}</span>
              {activePromptId === p.id && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsRenaming(true);
                    startEditing();
                  }}
                  className="p-1 rounded hover:bg-blue-100 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
              {prompts.length > 1 && (
                <button 
                  onClick={(e) => handleDeletePrompt(p.id, e)}
                  className="p-1 rounded hover:bg-red-50 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#E5E5E5] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isRenaming ? (
                <div className="flex items-center gap-2">
                  <input 
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="bg-[#F3F3F3] border border-blue-300 rounded px-2 py-1 text-sm text-[#1A1A1A] focus:outline-none font-bold"
                    autoFocus
                  />
                  <button onClick={handleSavePrompt} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setIsRenaming(false)} className="p-1 text-red-600 hover:bg-red-50 rounded"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <h4 className="text-[#1A1A1A] font-bold flex items-center gap-2">
                  {activePrompt.title}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase font-bold tracking-widest">当前使用</span>
                </h4>
              )}
            </div>
            {!isEditingPrompt ? (
              <button 
                onClick={startEditing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 text-xs text-blue-600 transition-all font-bold"
              >
                <Edit2 className="w-3.5 h-3.5" /> 编辑提示词内容
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingPrompt(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#F3F3F3] hover:bg-[#EBEBEB] text-xs font-bold text-[#666666] transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={handleSavePrompt}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs text-emerald-600 transition-all font-bold"
                >
                  <Save className="w-3.5 h-3.5" /> 保存修改
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            {isEditingPrompt ? (
              <textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="w-full h-64 bg-[#F3F3F3] border border-[#E5E5E5] rounded-xl p-4 text-sm text-[#1A1A1A] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              />
            ) : (
              <div className="w-full h-40 bg-[#F9F9F9] border border-[#E5E5E5] rounded-xl p-4 text-xs text-[#999999] font-mono overflow-y-auto mask-fade-bottom">
                {activePrompt.content}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-[#E5E5E5] relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-3xl rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-[#999999] uppercase tracking-widest flex items-center gap-2">
                <Search className="w-4 h-4" /> 竞品功能或产品描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="例如：分析 TikTok 在短视频播放功能的竞品表现..."
                className="w-full h-40 bg-[#F3F3F3] border border-[#E5E5E5] rounded-2xl p-6 text-[#1A1A1A] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none font-medium"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !description.trim()}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all",
                isAnalyzing 
                  ? "bg-[#F3F3F3] text-[#999999] cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/10 active:scale-[0.98]"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  AI 正在深度拆解中...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  开始深度分析
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-6 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-center font-bold"
          >
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto space-y-10"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E5E5E5] pb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-display font-bold text-[#1A1A1A]">分析报告</h3>
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider">回森海外竞品分析</span>
                </div>
                <p className="text-[#666666] font-medium">基于资深海外音乐/社交产品分析师模型生成</p>
              </div>
              <button
                onClick={() => downloadCompetitiveAnalysisAsWord(result)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-[#F3F3F3] border border-[#E5E5E5] text-[#1A1A1A] transition-all font-bold shrink-0 shadow-sm"
              >
                <Download className="w-4 h-4" />
                导出 Word 报告
              </button>
            </div>

            <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#E5E5E5] shadow-sm">
              <div className="markdown-body prose max-w-none prose-headings:font-display prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-[#E5E5E5] prose-h2:pb-2 prose-h2:mt-12 prose-h3:text-xl prose-table:border prose-table:border-[#E5E5E5] prose-th:bg-[#F3F3F3] prose-th:p-4 prose-td:p-4 prose-td:border prose-td:border-[#E5E5E5] text-[#1A1A1A]">
                <Markdown>{result.markdown}</Markdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
