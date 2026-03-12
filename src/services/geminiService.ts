import { GoogleGenAI, Type } from "@google/genai";

/**
 * Gemini AI Service for UI/UX Analysis
 * Uses the latest Gemini 3 Flash model for high-speed vision analysis.
 */

// Initialize the Gemini AI client
// Note: process.env.GEMINI_API_KEY is automatically injected by the platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Configuration for the design analysis
 */
export interface Methodology {
  id: string;
  name: string;
  content: string;
}

export interface AnalysisConfig {
  targetAudience: string;
  focusAreas: string[];
  platform: 'mobile' | 'desktop' | 'web';
  strictness: 'standard' | 'critical';
  functionalCategory?: string;
}

/**
 * Structured output from the AI analysis
 */
export interface AnalysisResult {
  overallScore: number;
  heuristics: {
    name: string;
    score: number;
    feedback: string;
    location?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  }[];
  accessibility: {
    issues: {
      description: string;
      location?: [number, number, number, number];
    }[];
    suggestions: string[];
  };
  visualHierarchy: string;
  keyActionItems: {
    task: string;
    location?: [number, number, number, number];
  }[];
}

/**
 * Analyzes a UI design image using Gemini AI
 * @param imageBase64 - The base64 encoded image string
 * @param config - User-defined analysis parameters
 * @param customMethodologies - Optional custom methodology documents to inform the analysis
 * @returns A structured analysis result object
 */
export async function analyzeDesign(
  imageBase64: string,
  config: AnalysisConfig,
  customMethodologies: Methodology[] = []
): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const methodologyContext = customMethodologies.length > 0 
    ? `
    以下是用户提供的额外可用性测试方法论和参考文档，请在分析时优先参考并结合这些内容：
    ${customMethodologies.map(m => `--- 文档名称: ${m.name} ---\n${m.content}`).join('\n\n')}
    `
    : '';

    const functionalContext = config.functionalCategory 
      ? `- 当前审计的功能模块：${config.functionalCategory}（请基于该功能的业务逻辑、用户预期和行业最佳实践进行专项分析）`
      : '';

  // 为 AI 专家角色构建深度优化的提示词
  const prompt = `
    你是一名拥有 15 年经验的世界级资深 UI/UX 设计总监和人机交互专家。请对提供的设计稿进行极其专业、严谨且具有前瞻性的深度审计。
    
    ${methodologyContext}

    分析上下文：
    - 目标平台：${config.platform}（请结合该平台的原生交互规范，如 iOS 的触觉反馈逻辑或 Web 的响应式原则）
    - 目标受众：${config.targetAudience}（请分析该群体的认知负荷、视觉偏好和操作习惯）
    ${functionalContext}
    - 核心关注点：${config.focusAreas.join(', ')}
    - 审计严谨度：${config.strictness === 'critical' ? '极其严苛（像素级审查）' : '专业标准'}
    
    请从以下维度进行多层次评估：
    1. **可用性启发式原则深度审计**：
       - 系统状态可见性、现实世界匹配、用户控制与自由、一致性与标准。
    
    2. **无障碍性 (A11y) 专项检查**：
       - 检查色彩对比度、点击区域大小、字体易读性。
    
    3. **视觉层级与认知负荷**：
       - 扫描路径分析、CTA 突出程度、间距使用。
    
    4. **专项领域分析**（基于用户选择的关注点）：
       - 交互反馈：按钮点击态、加载状态、反馈及时性。
       - 信息架构：导航深度、分类逻辑、搜索易用性。
       - 文案调性：用词一致性、品牌语气、引导语清晰度。
       - 情感化设计：微交互、插画风格、惊喜感。
       - 品牌一致性：Logo 使用、品牌色应用、视觉符号统一性。
    
    **空间定位指令 (重要)：**
    - 在识别问题或建议时，必须提供精确的 **location** 坐标。
    - 坐标格式为 [ymin, xmin, ymax, xmax]，取值范围 [0, 1000]，代表相对于图像高度和宽度的百分比。
    - **请务必仔细对齐图像像素，确保标注框准确覆盖相关 UI 元素。**
    - 如果问题涉及整个页面，可不提供坐标或提供 [0, 0, 1000, 1000]。
    
    输出要求：
    - 必须返回结构化的 JSON。
    - **overallScore**: 综合评分 (0-100)。
    - **heuristics**: 包含至少 5 个维度的详细评估（名称、分数、深度反馈）。如果反馈涉及具体 UI 元素，请提供准确的 **location**。
    - **accessibility**: 
      - **issues**: 包含具体问题描述和对应的准确 **location**。
      - **suggestions**: 改进建议。
    - **visualHierarchy**: 一段专业的视线流向分析和层级评价。
    - **keyActionItems**: 至少 4 条具有高度可操作性的改进建议，包含任务描述 **task** 和对应的准确 **location**。
    
    **所有文本内容必须使用中文，语气应专业、权威且富有洞察力。**
  `;

  // Call Gemini API with the image and prompt
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBase64.split(',')[1] // Extract raw base64 data
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      // Define the schema to ensure consistent JSON output
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER, description: "Score from 0 to 100" },
          heuristics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING },
                location: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "[ymin, xmin, ymax, xmax]" }
              },
              required: ["name", "score", "feedback"]
            }
          },
          accessibility: {
            type: Type.OBJECT,
            properties: {
              issues: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    location: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                  },
                  required: ["description"]
                } 
              },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["issues", "suggestions"]
          },
          visualHierarchy: { type: Type.STRING },
          keyActionItems: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                location: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              },
              required: ["task"]
            } 
          }
        },
        required: ["overallScore", "heuristics", "accessibility", "visualHierarchy", "keyActionItems"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate analysis");
  }

  // Parse and return the structured JSON
  return JSON.parse(response.text);
}

/**
 * Generates motion implementation code from a motion file
 * @param fileBase64 - The base64 encoded motion file (GIF, PNG sequence, or AE JSON)
 * @param language - The target programming language
 * @param mimeType - The MIME type of the uploaded file
 * @returns The generated code as a string
 */
export async function generateMotionCode(
  fileBase64: string,
  language: 'cpp' | 'java' | 'python' | 'css',
  mimeType: string
): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const languageContext = {
    cpp: "C++ (using a high-performance graphics library like Skia, Qt, or a custom OpenGL/Vulkan engine)",
    java: "Java (using Android Canvas, Custom Views, or a library like Lottie-Android)",
    python: "Python (using PySide6/PyQt, Manim, or a game engine like Pygame)",
    css: "CSS/Tailwind (using @keyframes, CSS variables, and standard web animations)"
  };

  const prompt = `
    你是一名顶尖的动效开发专家和图形学工程师，精通计算机图形学、物理引擎和动效数学建模。
    你的任务是：**像素级还原**提供的动效文件（GIF、WebP、PNG 序列、AE 导出 JSON 或 After Effects 项目文件 .aep），并将其逻辑转换为极其精确的 ${languageContext[language]} 原生实现代码。

    ### 核心审计与还原要求 (精度优先)：
    1. **时序深度分析 (Temporal Analysis)**：
       - 必须精确识别动效的总时长、帧率 (FPS) 以及每个关键动作的起始和结束时间戳。
       - 识别是否存在交叠动画 (Overlapping Actions) 或跟随动作 (Follow Through)。

    2. **数学建模与缓动曲线 (Easing Precision)**：
       - **必须** 提取具体的 **三次贝塞尔曲线 (Cubic Bezier)** 参数 (如 [0.42, 0, 0.58, 1])，这是还原动效灵魂的关键。
       - 如果动效具有物理感（如回弹、重力、惯性），请实现基于 **弹簧物理 (Spring Physics)** 的算法（提供质量 mass、刚度 stiffness、阻尼 damping 的具体数值）。

    3. **属性变换矩阵 (Transformation Matrix)**：
       - 精确提取位移 (Translation)、缩放 (Scale)、旋转 (Rotation) 和透明度 (Opacity) 的数值变化序列。
       - 识别变换中心点 (Anchor Point) 的位置，这对于旋转和缩放的准确性至关重要。

    4. **图层与合成逻辑**：
       - 分析图层的层级关系、遮罩 (Masks)、路径动画 (Path Animation) 以及混合模式 (Blending Modes)。

    ### 代码实现规范：
    - **高性能架构**：代码应包含一个主循环或基于硬件定时器的更新机制。
    - **参数化设计**：将关键的动效参数（时长、曲线参数、物理系数）定义为常量或配置项，方便微调。
    - **完整性**：代码必须包含完整的类结构、必要的数学辅助函数（如贝塞尔插值函数）以及渲染调用逻辑。
    - **注释说明**：在代码中详细注释 AI 是如何推导出这些动效参数的，解释数学模型的选择依据。

    ### 文件格式特殊处理：
    - **JSON (Lottie)**：深度解析其图层 (layers)、关键帧 (ks)、缓动数据 (i/o)、路径 (p/s/r) 等核心字段，将其逻辑硬编码为原生代码实现。
    - **AEP (After Effects Project)**：分析项目中的合成 (Compositions)、图层属性和关键帧数据。如果文件是二进制格式，请尝试根据文件结构特征提取动效逻辑。
    - **GIF/WebP/PNG 序列**：通过视觉分析识别每一帧的变化，反推关键帧和缓动曲线。

    输出要求：
    - 直接输出代码块，不要包含 Markdown 以外的解释文字。
    - 代码中应包含一个名为 \`MotionImplementation\` 的类或主要函数。
    - **所有注释必须使用中文，且必须体现出对动效细节的深度洞察。**
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || "application/octet-stream",
              data: fileBase64.split(',')[1]
            }
          }
        ]
      }
    ]
  });

  return response.text || "// 无法生成代码，请检查文件格式。";
}

/**
 * Generates a competitive analysis report
 * @param featureDescription - Description of the competitor's feature
 * @returns A structured competitive analysis result
 */
export interface CompetitiveAnalysisResult {
  markdown: string;
}

export async function analyzeCompetitor(featureDescription: string, customSystemInstruction?: string): Promise<CompetitiveAnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `分析【${featureDescription}】`,
    config: {
      systemInstruction: customSystemInstruction || `
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

**分析日期**：${new Date().toISOString().split('T')[0]}  
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
      `,
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate competitive analysis");
  }

  return { markdown: response.text };
}

/**
 * Generates interaction documentation for a prototype image
 * @param imageBase64 - The base64 encoded prototype image
 * @returns A structured interaction documentation result
 */
export interface InteractionDocsResult {
  markdown: string;
}

export async function generateInteractionDocs(imageBase64: string, customPrompt?: string): Promise<InteractionDocsResult> {
  const model = "gemini-3-flash-preview";
  
  const systemPrompt = `
    你是一名资深的产品经理和交互设计师。请分析提供的原型图，并为其编写详细的交互说明文档。
    
    文档应包含以下内容：
    1. **页面概览**：简述页面的核心功能和目标。
    2. **核心交互逻辑**：描述页面上的主要操作流程。
    3. **组件级说明**：
       - 按钮、输入框、列表等元素的交互行为（点击、滑动、长按等）。
       - 状态变化（正常、悬停、点击、禁用、加载中等）。
       - 页面跳转逻辑。
    4. **异常情况处理**：如网络错误、空状态、输入验证失败等。
    5. **动效建议**：为了提升体验，建议添加哪些微动效。
    
    请使用专业的行业术语，并以结构化的 Markdown 格式输出。
  `;

  const finalPrompt = customPrompt ? `${systemPrompt}\n\n用户额外要求：${customPrompt}` : systemPrompt;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: finalPrompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageBase64.split(',')[1]
            }
          }
        ]
      }
    ]
  });

  if (!response.text) {
    throw new Error("Failed to generate interaction documentation");
  }

  return { markdown: response.text };
}

/**
 * Generates an interactive demo structure from multiple prototype images
 */
export interface InteractiveDemoResult {
  screens: {
    id: string;
    name: string;
    imageBase64: string;
    hotspots: {
      id: string;
      rect: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
      targetScreenId: string;
      action: string;
    }[];
  }[];
  initialScreenId: string;
}

export async function generateInteractiveDemo(images: { id: string, base64: string }[]): Promise<InteractiveDemoResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    你是一名资深交互原型工程师。我提供了多张原型图，请分析它们之间的逻辑关系，并生成一个可交互的 Demo 结构。
    
    请识别每张图中的可点击区域（Hotspots），并指定点击后的跳转目标。
    
    输出要求：
    1. 返回 JSON 格式。
    2. **screens**: 包含所有页面的数组。
       - **id**: 页面的唯一标识（请使用我提供的 ID）。
       - **name**: 页面名称。
       - **hotspots**: 页面内的交互热区。
         - **rect**: 热区坐标 [ymin, xmin, ymax, xmax]，取值范围 [0, 1000]。
         - **targetScreenId**: 点击后跳转的页面 ID。
         - **action**: 交互动作描述。
    3. **initialScreenId**: 初始显示的页面 ID。
    
    请确保逻辑连贯，热区坐标准确。
  `;

  const contents = [
    { text: prompt },
    ...images.map(img => ({
      inlineData: {
        mimeType: "image/png",
        data: img.base64.split(',')[1]
      }
    }))
  ];

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: contents }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          screens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                hotspots: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      rect: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      targetScreenId: { type: Type.STRING },
                      action: { type: Type.STRING }
                    },
                    required: ["rect", "targetScreenId"]
                  }
                }
              },
              required: ["id", "name", "hotspots"]
            }
          },
          initialScreenId: { type: Type.STRING }
        },
        required: ["screens", "initialScreenId"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate interactive demo");
  }

  const result = JSON.parse(response.text);
  
  // Attach the original base64 images back to the result
  result.screens = result.screens.map((screen: any) => {
    const original = images.find(img => img.id === screen.id);
    return {
      ...screen,
      imageBase64: original ? original.base64 : ""
    };
  });

  return result;
}
