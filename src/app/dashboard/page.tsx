"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";
import { Project } from "@/lib/types";
import ProjectList from "@/components/dashboard/ProjectList";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        setProjects(data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [authLoading, user]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name: newName, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev =>
        prev.map(p =>
          p.id === projectId ? { ...p, name: newName, updated_at: new Date().toISOString() } : p
        )
      );
    } catch (err) {
      console.error('Error renaming project:', err);
      throw err;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 mt-1">
            Manage your map product recommendations
          </p>
        </div>
        <Link
          href="/project/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span className="text-lg">+</span>
          New Project
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Project List */}
      <ProjectList
        projects={projects}
        onDeleteProject={handleDeleteProject}
        onRenameProject={handleRenameProject}
      />
    </div>
  );
}
