"use client";

import Link from "next/link";
import { ProjectStage } from "@/lib/types";

interface StageIndicatorProps {
  currentStage: ProjectStage;
  compact?: boolean;
  projectId?: string;
}

const STAGES = [
  { id: 1, name: 'Requirements', icon: '💬', description: 'Define your needs', path: '' },
  { id: 2, name: 'Products', icon: '📦', description: 'Select products', path: '/products' },
  { id: 3, name: 'Pricing', icon: '💰', description: 'Compare costs', path: '/pricing' },
  { id: 4, name: 'Quality', icon: '📊', description: 'Evaluate quality', path: '/quality' },
] as const;

export default function StageIndicator({ currentStage, compact = false, projectId }: StageIndicatorProps) {
  const getStageHref = (stage: typeof STAGES[number]) => {
    if (!projectId) return undefined;
    return `/project/${projectId}${stage.path}`;
  };

  const isClickable = (stageId: number) => {
    // Can click on completed stages and current stage
    return projectId && stageId <= currentStage;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STAGES.map((stage, index) => {
          const href = getStageHref(stage);
          const clickable = isClickable(stage.id);

          const circleContent = (
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform ${
                stage.id < currentStage
                  ? 'bg-green-100 text-green-600'
                  : stage.id === currentStage
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-400'
              } ${clickable ? 'cursor-pointer hover:scale-110' : ''}`}
              title={stage.name}
            >
              {stage.id < currentStage ? '✓' : stage.icon}
            </div>
          );

          return (
            <div key={stage.id} className="flex items-center">
              {clickable && href ? (
                <Link href={href}>{circleContent}</Link>
              ) : (
                circleContent
              )}
              {index < STAGES.length - 1 && (
                <div
                  className={`w-4 h-0.5 ${
                    stage.id < currentStage ? 'bg-green-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {STAGES.map((stage, index) => {
        const href = getStageHref(stage);
        const clickable = isClickable(stage.id);

        const circleContent = (
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                stage.id < currentStage
                  ? 'bg-green-100 text-green-600 ring-2 ring-green-500'
                  : stage.id === currentStage
                  ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-400'
              } ${clickable ? 'cursor-pointer hover:scale-105 hover:ring-4' : ''}`}
            >
              {stage.id < currentStage ? '✓' : stage.icon}
            </div>
            <div className="mt-2 text-center">
              <p
                className={`text-sm font-medium ${
                  stage.id === currentStage
                    ? 'text-blue-600'
                    : stage.id < currentStage
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {stage.name}
              </p>
              <p className="text-xs text-gray-400 hidden sm:block">
                {stage.id < currentStage
                  ? 'Done'
                  : stage.id === currentStage
                  ? 'Current'
                  : stage.description}
              </p>
            </div>
          </div>
        );

        return (
          <div key={stage.id} className="flex items-center flex-1">
            {/* Stage Circle */}
            {clickable && href ? (
              <Link href={href}>{circleContent}</Link>
            ) : (
              circleContent
            )}

            {/* Connector Line */}
            {index < STAGES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  stage.id < currentStage ? 'bg-green-300' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
