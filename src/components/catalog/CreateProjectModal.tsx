"use client";

import { useState } from "react";
import { CatalogProduct } from "@/lib/api";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: CatalogProduct[];
  onCreateProject: (projectName: string, description?: string) => Promise<void>;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  selectedProducts,
  onCreateProject,
}: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onCreateProject(projectName.trim(), description.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
      setIsCreating(false);
    }
  };

  const groupedByProvider = selectedProducts.reduce((acc, product) => {
    if (!acc[product.provider]) acc[product.provider] = [];
    acc[product.provider].push(product);
    return acc;
  }, {} as Record<string, CatalogProduct[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7]">
          <h2 className="text-lg font-semibold text-[#37352f]">Create Project</h2>
          <p className="text-sm text-[#787774] mt-1">
            Create a project with {selectedProducts.length} selected products
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-[#37352f] mb-1">
                Project Name <span className="text-[#e03e3e]">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Food Delivery App"
                className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] text-sm"
                autoFocus
              />
            </div>

            {/* Description (optional) */}
            <div>
              <label className="block text-sm font-medium text-[#37352f] mb-1">
                Description <span className="text-[#9b9a97]">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your project..."
                rows={2}
                className="w-full px-3 py-2 border border-[#e9e9e7] rounded-md focus:outline-none focus:ring-2 focus:ring-[#37352f]/20 focus:border-[#37352f] text-sm resize-none"
              />
            </div>

            {/* Selected Products Summary */}
            <div>
              <label className="block text-sm font-medium text-[#37352f] mb-2">
                Selected Products
              </label>
              <div className="space-y-3">
                {Object.entries(groupedByProvider).map(([provider, products]) => (
                  <div key={provider} className="p-3 bg-[#f7f6f3] rounded-md">
                    <div className="text-xs font-medium text-[#787774] mb-2">{provider}</div>
                    <div className="space-y-1">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center gap-2 text-sm text-[#37352f]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#37352f]" />
                          {product.product_name}
                          <span className="text-xs text-[#9b9a97]">({product.sub_category})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-[rgba(224,62,62,0.08)] border border-[rgba(224,62,62,0.2)] rounded-md">
                <p className="text-sm text-[#e03e3e]">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e9e9e7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-[#787774] hover:text-[#37352f] hover:bg-[#f7f6f3] rounded-md transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !projectName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#37352f] hover:bg-[#2f2d28] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
