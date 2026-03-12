import React, { useState } from 'react';
import { Settings2, Target, Monitor, ShieldAlert, BookOpen, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { AnalysisConfig, Methodology } from '../services/geminiService';
import { cn } from '../lib/utils';

/**
 * SettingsPanel Component
 * Allows users to customize the AI analysis parameters.
 */
interface SettingsPanelProps {
  config: AnalysisConfig;
  onChange: (config: AnalysisConfig) => void;
  methodologyCount: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, onChange, methodologyCount }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('生产社交');

  // 预定义的分析关注领域
  const focusAreas = [
    '无障碍性',
    '启发式评估',
    '视觉层级',
    '字体排版',
    '色彩理论',
    '导航逻辑',
    '交互反馈',
    '信息架构',
    '文案调性',
    '情感化设计',
    '品牌一致性'
  ];

  const functionalCategories = [
    {
      name: '生产社交',
      items: ['生产流程', '唱弹幕', '发动态', '扩列小纸条', '心动对唱', '天团']
    },
    {
      name: '商业化',
      items: [
        '歌房 (自由练歌)', '歌房 (拍卖厅)', '歌房 (点歌厅)', '歌房 (PK房)', 
        '歌房 (亲密战)', '歌房 (合唱房)', '歌房 (抢麦竞赛)', '歌房 (娱乐房)', 
        '歌房 (游戏房)', '歌房 (放映厅)', '歌房 (闲聊唠嗑)', '歌房 (交友厅)',
        '直播', '财富等级', '好友亲密关系', '会员'
      ]
    }
  ];

  const platformMap = {
    web: '网页端',
    mobile: '移动端',
    desktop: '桌面端'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#E5E5E5] shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div className="flex items-center gap-3">
          <Settings2 className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-display font-bold text-[#1A1A1A]">分析设置</h2>
        </div>
        {methodologyCount > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
            <BookOpen className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              {methodologyCount} 篇方法论
            </span>
          </div>
        )}
      </div>

      {/* 核心功能选择 */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-[#999999] uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" /> 核心功能模块
        </label>
        <div className="space-y-2">
          {functionalCategories.map((cat) => (
            <div key={cat.name} className="space-y-2">
              <button
                onClick={() => setExpandedCategory(expandedCategory === cat.name ? null : cat.name)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#F3F3F3] hover:bg-[#EBEBEB] text-sm text-[#1A1A1A] transition-all border border-transparent"
              >
                <span className="font-semibold">{cat.name}</span>
                {expandedCategory === cat.name ? <ChevronDown className="w-4 h-4 text-[#999999]" /> : <ChevronRight className="w-4 h-4 text-[#999999]" />}
              </button>
              
              {expandedCategory === cat.name && (
                <div className="grid grid-cols-2 gap-2 pl-2">
                  {cat.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => onChange({ ...config, functionalCategory: item })}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs transition-all text-left font-medium",
                        config.functionalCategory === item
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                          : "bg-white text-[#666666] border border-[#E5E5E5] hover:border-indigo-200"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {config.functionalCategory && (
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
            当前选择: {config.functionalCategory}
          </div>
        )}
      </div>

      {/* 平台选择 */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-[#999999] uppercase tracking-wider">
          <Monitor className="w-3.5 h-3.5" /> 目标平台
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['web', 'mobile', 'desktop'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onChange({ ...config, platform: p })}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                config.platform === p
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-[#F3F3F3] text-[#666666] border-transparent hover:bg-[#EBEBEB]"
              )}
            >
              {platformMap[p]}
            </button>
          ))}
        </div>
      </div>

      {/* 目标受众 */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-[#999999] uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" /> 目标受众
        </label>
        <input
          type="text"
          value={config.targetAudience}
          onChange={(e) => onChange({ ...config, targetAudience: e.target.value })}
          placeholder="例如：老年人、科技爱好者"
          className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-[#999999]"
        />
      </div>

      {/* 关注领域 */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#999999] uppercase tracking-wider">关注领域</label>
        <div className="flex flex-wrap gap-1.5">
          {focusAreas.map((area) => (
            <button
              key={area}
              onClick={() => {
                const newAreas = config.focusAreas.includes(area)
                  ? config.focusAreas.filter(a => a !== area)
                  : [...config.focusAreas, area];
                onChange({ ...config, focusAreas: newAreas });
              }}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border",
                config.focusAreas.includes(area)
                  ? "bg-purple-50 text-purple-600 border-purple-200"
                  : "bg-[#F3F3F3] text-[#666666] border-transparent hover:border-[#E5E5E5]"
              )}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* 严谨度 */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-xs font-bold text-[#999999] uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> 分析严谨度
        </label>
        <div className="flex gap-2">
          {(['standard', 'critical'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChange({ ...config, strictness: s })}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all border",
                config.strictness === s
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-[#F3F3F3] text-[#666666] border-transparent hover:bg-[#EBEBEB]"
              )}
            >
              {s === 'standard' ? '标准' : '极其严格'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
