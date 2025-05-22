'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/authContext'; // Adjusted path
import apiClient from '../../lib/apiClient'; // Adjusted path
import Link from 'next/link';
import { PlusCircleIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'; // Using Heroicons

interface Project {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

// Modal Component for Create Project
const CreateProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onProjectCreated: () => void }> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setError('Project name is required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiClient<{ id: string; name: string }>('/projects', {
        method: 'POST',
        body: { name: projectName },
        token,
      });
      setProjectName('');
      onProjectCreated(); // Callback to refresh project list
      onClose(); // Close modal
    } catch (err: any) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const ProjectsPage = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<Project[]>('/projects', { token });
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch projects.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      await apiClient(`/projects/${projectId}`, { method: 'DELETE', token });
      // Refresh project list
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
    } catch (err: any) {
      setError(`Failed to delete project: ${err.message}`);
    }
  };

  if (isLoading && projects.length === 0) { // Show loading only on initial load
    return <p className="text-gray-600">Loading projects...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" />
          Create Project
        </button>
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}

      {projects.length === 0 && !isLoading ? (
        <div className="text-center py-10 bg-white shadow rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition-shadow duration-200 ease-in-out flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{project.name}</h2>
                <p className="text-sm text-gray-500 mb-1">ID: {project.id}</p>
                <p className="text-sm text-gray-500 mb-4">Created: {new Date(project.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <Link
                  href={`/dashboard_projects_${project.id}_page`} // Adjusted path
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors"
                  title="View Project Details"
                >
                  <EyeIcon className="h-6 w-6" />
                </Link>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                  title="Delete Project"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects} // Refresh list after creation
      />
    </div>
  );
};

export default ProjectsPage;
