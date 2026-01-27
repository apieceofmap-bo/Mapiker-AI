'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import {
  getScoreColor,
  getScoreLabel,
  getScoreLevel,
  ScoreLevel,
  METRIC_TOOLTIPS,
} from '@/lib/qualityDimensions';

// =============================================================================
// Metric Tooltip Component
// =============================================================================

interface MetricWithTooltipProps {
  label: string;
  tooltipKey?: string;
  tooltip?: string;
}

export function MetricWithTooltip({ label, tooltipKey, tooltip }: MetricWithTooltipProps) {
  const tooltipText = tooltip || (tooltipKey ? METRIC_TOOLTIPS[tooltipKey] : null);

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-[#37352f]">{label}</span>
      {tooltipText && (
        <div className="group relative">
          <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-[#9b9a97] hover:text-[#37352f] cursor-help transition-colors" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20 w-64">
            <div className="bg-[#37352f] text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
              {tooltipText}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#37352f]" />
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Score Display Component
// =============================================================================

interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ScoreDisplay({
  score,
  label,
  size = 'md',
  showLabel = true,
}: ScoreDisplayProps) {
  const color = getScoreColor(score);
  const levelLabel = getScoreLabel(score);

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-3xl font-bold',
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`${dotSizes[size]} rounded-full`}
        style={{ backgroundColor: color }}
      />
      <span className={sizeClasses[size]} style={{ color }}>
        {score.toFixed(1)}
      </span>
      {showLabel && (
        <span className="text-sm text-[#787774]">
          {label || levelLabel}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Score Bar Component
// =============================================================================

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  showValue?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export function ScoreBar({
  score,
  maxScore = 100,
  showValue = true,
  height = 'md',
}: ScoreBarProps) {
  const color = getScoreColor(score);
  const percentage = (score / maxScore) * 100;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-[#e9e9e7] rounded-full ${heightClasses[height]}`}>
        <motion.div
          className={`${heightClasses[height]} rounded-full`}
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between mt-1 text-xs text-[#9b9a97]">
          <span>0</span>
          <span style={{ color }}>{score.toFixed(1)}</span>
          <span>{maxScore}</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Dimension Score Card Component
// =============================================================================

interface DimensionScoreCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  scores?: { label: string; value: number }[];
  statistics?: { label: string; value: string | number }[];
  statisticsOnly?: boolean;
  statisticsOnlyMessage?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DimensionScoreCard({
  title,
  description,
  icon,
  scores,
  statistics,
  statisticsOnly = false,
  statisticsOnlyMessage,
  children,
  className = '',
}: DimensionScoreCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-lg border border-[#e9e9e7] p-4 hover:border-[#d3d3d0] transition-colors ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-[#0f7b6c]/10 flex items-center justify-center text-[#0f7b6c]">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-[#37352f]">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-[#787774] mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Statistics Only Notice */}
      {statisticsOnly && statisticsOnlyMessage && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#f7f6f3] rounded-lg">
          <svg
            className="w-4 h-4 text-[#9b9a97]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm text-[#787774]">
            {statisticsOnlyMessage}
          </span>
        </div>
      )}

      {/* Scores */}
      {scores && scores.length > 0 && !statisticsOnly && (
        <div className="space-y-4 mb-4">
          {scores.map((score, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-[#37352f]">
                  {score.label}
                </span>
                <ScoreDisplay score={score.value} size="sm" />
              </div>
              <ScoreBar score={score.value} height="sm" showValue={false} />
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      {statistics && statistics.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-[#f7f6f3] rounded-lg"
            >
              <div className="text-xs text-[#9b9a97]">
                {stat.label}
              </div>
              <div className="text-sm font-semibold text-[#37352f]">
                {typeof stat.value === 'number'
                  ? stat.value.toLocaleString()
                  : stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Content */}
      {children}
    </motion.div>
  );
}

// =============================================================================
// Comparison Score Row Component
// =============================================================================

interface ComparisonScoreRowProps {
  label: string;
  projectAScore: number;
  projectBScore: number;
  projectAName?: string;
  projectBName?: string;
}

export function ComparisonScoreRow({
  label,
  projectAScore,
  projectBScore,
  projectAName = 'Project A',
  projectBName = 'Project B',
}: ComparisonScoreRowProps) {
  const colorA = getScoreColor(projectAScore);
  const colorB = getScoreColor(projectBScore);

  return (
    <div className="py-3 border-b border-[#e9e9e7] last:border-0">
      <div className="text-sm text-[#37352f] mb-2">
        {label}
      </div>
      <div className="flex items-center gap-4">
        {/* Project A */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#9b9a97]">{projectAName}</span>
            <span className="font-semibold" style={{ color: colorA }}>
              {projectAScore.toFixed(1)}
            </span>
          </div>
          <ScoreBar score={projectAScore} height="sm" showValue={false} />
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#e9e9e7]" />

        {/* Project B */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#9b9a97]">{projectBName}</span>
            <span className="font-semibold" style={{ color: colorB }}>
              {projectBScore.toFixed(1)}
            </span>
          </div>
          <ScoreBar score={projectBScore} height="sm" showValue={false} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Score Legend Component
// =============================================================================

export function ScoreLegend() {
  const levels: ScoreLevel[] = ['excellent', 'good', 'fair', 'poor'];
  const ranges = ['90-100', '75-89', '60-74', '0-59'];

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      {levels.map((level, index) => (
        <div key={level} className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: getScoreColor(level === 'excellent' ? 95 : level === 'good' ? 80 : level === 'fair' ? 65 : 40) }}
          />
          <span className="text-[#787774]">
            {getScoreLabel(level === 'excellent' ? 95 : level === 'good' ? 80 : level === 'fair' ? 65 : 40)} ({ranges[index]})
          </span>
        </div>
      ))}
    </div>
  );
}

export default DimensionScoreCard;
