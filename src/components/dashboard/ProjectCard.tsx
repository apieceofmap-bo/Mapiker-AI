"use client";

import { useState } from "react";
import Link from "next/link";
import { Project } from "@/lib/types";
import StageIndicator from "./StageIndicator";

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  onRename?: (projectId: string, newName: string) => Promise<void>;
  compareMode?: boolean;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (projectId: string) => void;
  canSelectMore?: boolean;
}

const STATUS_STYLES = {
  draft: { bg: 'bg-[#f7f6f3]', text: 'text-[#787774]', label: 'Draft' },
  in_progress: { bg: 'bg-[rgba(46,170,220,0.15)]', text: 'text-[#2eaadc]', label: 'In Progress' },
  completed: { bg: 'bg-[rgba(15,123,108,0.15)]', text: 'text-[#0f7b6c]', label: 'Completed' },
  quote_requested: { bg: 'bg-[rgba(155,89,182,0.15)]', text: 'text-[#9b59b6]', label: 'Quote Requested' },
};

export default function ProjectCard({
  project,
  onDelete,
  onRename,
  compareMode = false,
  isSelectedForCompare = false,
  onToggleCompare,
  canSelectMore = true,
}: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [isSaving, setIsSaving] = useState(false);

  const status = STATUS_STYLES[project.status];
  const formattedDate = new Date(project.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getProjectUrl = () => {
    switch (project.current_stage) {
      case 1:
        return `/project/${project.id}`;
      case 2:
        return `/project/${project.id}/products`;
      case 3:
        return `/project/${project.id}/pricing`;
      case 4:
        return `/project/${project.id}/quality`;
      default:
        return `/project/${project.id}`;
    }
  };

  const handleSaveRename = async () => {
    if (!onRename || editName.trim() === project.name) {
      setIsEditing(false);
      setEditName(project.name);
      return;
    }

    setIsSaving(true);
    try {
      await onRename(project.id, editName.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to rename project:", error);
      setEditName(project.name);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditName(project.name);
    }
  };

  const handleCardClick = () => {
    if (compareMode && onToggleCompare && (isSelectedForCompare || canSelectMore)) {
      onToggleCompare(project.id);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg border p-5 transition-colors ${
        compareMode
          ? isSelectedForCompare
            ? 'border-[#37352f] ring-2 ring-[#37352f] cursor-pointer'
            : canSelectMore
            ? 'border-[#e9e9e7] hover:border-[#d3d3d0] cursor-pointer'
            : 'border-[#e9e9e7] opacity-50 cursor-not-allowed'
          : 'border-[#e9e9e7] hover:bg-[#f7f6f3]'
      }`}
      onClick={compareMode ? handleCardClick : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        {/* Compare Mode Checkbox */}
        {compareMode && (
          <div className="mr-3 flex-shrink-0">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isSelectedForCompare
                  ? 'bg-[#37352f] border-[#37352f]'
                  : 'border-[#d3d3d0]'
              }`}
            >
              {isSelectedForCompare && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                autoFocus
                disabled={isSaving}
                className="text-base font-semibold text-[#37352f] border border-[#d3d3d0] rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#37352f]"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h3 className="text-base font-semibold text-[#37352f] truncate">{project.name}</h3>
              {onRename && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#9b9a97] hover:text-[#37352f] transition-opacity"
                  title="Rename project"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <p className="text-sm text-[#787774] mt-1 truncate">
            {project.use_case_description || project.use_case}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} ml-2 flex-shrink-0`}
        >
          {status.label}
        </span>
      </div>

      {/* Stage Progress */}
      <div className="mb-3">
        <StageIndicator currentStage={project.current_stage} compact />
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-3 text-xs text-[#9b9a97] mb-4">
        <span className="flex items-center gap-1">
          <span>📍</span>
          {project.region}
        </span>
        <span className="flex items-center gap-1">
          <span>📅</span>
          {formattedDate}
        </span>
        {project.required_features.length > 0 && (
          <span className="flex items-center gap-1">
            <span>✨</span>
            {project.required_features.length} features
          </span>
        )}
      </div>

      {/* Actions */}
      {!compareMode && (
        <div className="flex items-center gap-2 pt-3 border-t border-[#e9e9e7]">
          <Link
            href={getProjectUrl()}
            className="flex-1 py-2 px-4 bg-[#37352f] hover:bg-[#2f2d28] text-white text-center text-sm font-medium rounded-md transition-colors"
          >
            Continue
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              className="py-2 px-3 text-[#e03e3e] hover:bg-[rgba(224,62,62,0.08)] text-sm font-medium rounded-md transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
