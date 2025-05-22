'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/authContext'; // Adjusted path
import apiClient from '../../../lib/apiClient'; // Adjusted path
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface VersionDetails {
  id: string;
  version: string;
  project_id: string;
  created_at: string;
  changes_json: any; // This will be the JSON object/array of tokens
}

const VersionDetailsPage = () => {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const versionId = params.versionId as string;

  const [versionDetails, setVersionDetails] = useState<VersionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersionDetails = useCallback(async () => {
    if (!token || !projectId || !versionId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<VersionDetails>(`/projects/${projectId}/versions/${versionId}`, { token });
      setVersionDetails(data);
    } catch (err: any) {
      console.error("Failed to fetch version details:", err);
      setError(err.message || 'Failed to fetch version details.');
    } finally {
      setIsLoading(false);
    }
  }, [token, projectId, versionId]);

  useEffect(() => {
    fetchVersionDetails();
  }, [fetchVersionDetails]);

  if (isLoading) {
    return <p className="text-gray-600 p-6">Loading version details...</p>;
  }

  if (error) {
    return <p className="text-red-500 bg-red-100 p-6 rounded-md">Error: {error}</p>;
  }

  if (!versionDetails) {
    return <p className="text-gray-600 p-6">Version not found.</p>;
  }

  return (
    <div className="p-1"> {/* Reduced padding for the overall page */}
      <button
        onClick={() => router.push(`/dashboard_projects_${projectId}_page`)} // Adjusted path
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Project Details
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Token Version Details
      </h1>
      <p className="text-sm text-gray-500 mb-1">Project ID: {versionDetails.project_id}</p>
      <p className="text-sm text-gray-500 mb-1">Version Number: {versionDetails.version}</p>
      <p className="text-sm text-gray-500 mb-6">Exported At: {new Date(versionDetails.created_at).toLocaleString()}</p>
      

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Tokens Snapshot (JSON)</h2>
        <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto text-sm">
          {JSON.stringify(versionDetails.changes_json, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default VersionDetailsPage;
