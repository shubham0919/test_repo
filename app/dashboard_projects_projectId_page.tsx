'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext'; // Adjusted path
import apiClient from '../../lib/apiClient'; // Adjusted path
import { PlusCircleIcon, EyeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Token {
  id: string;
  name: string;
  type: string;
  value: string;
  project_id: string;
  created_at: string;
}

interface Version {
  id: string;
  version: string; // This is the version number/string like "1", "2"
  project_id: string;
  created_at: string;
  // changes_json is not fetched in the list view for versions
}

// Modal Component for Create Token
const CreateTokenModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onTokenCreated: () => void;
    projectId: string;
}> = ({ isOpen, onClose, onTokenCreated, projectId }) => {
  const [tokenName, setTokenName] = useState('');
  const [tokenType, setTokenType] = useState('color'); // Default type
  const [tokenValue, setTokenValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenName.trim() || !tokenValue.trim()) {
      setError('Token name and value are required.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiClient<{ id: string; name: string }>(`/projects/${projectId}/tokens`, {
        method: 'POST',
        body: { name: tokenName, type: tokenType, value: tokenValue },
        token,
      });
      setTokenName('');
      setTokenType('color');
      setTokenValue('');
      onTokenCreated(); // Callback to refresh token list (and versions)
      onClose(); // Close modal
    } catch (err: any) {
      setError(err.message || 'Failed to create token.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Add New Token</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="tokenName" value={tokenName} onChange={(e) => setTokenName(e.target.value)} className="input-class" required />
          </div>
          <div className="mb-4">
            <label htmlFor="tokenType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select id="tokenType" value={tokenType} onChange={(e) => setTokenType(e.target.value)} className="input-class">
              <option value="color">Color</option>
              <option value="spacing">Spacing</option>
              <option value="typography">Typography</option>
              <option value="fontFamily">Font Family</option>
              <option value="fontWeight">Font Weight</option>
              <option value="fontSize">Font Size</option>
              <option value="lineHeight">Line Height</option>
              <option value="letterSpacing">Letter Spacing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="tokenValue" className="block text-sm font-medium text-gray-700 mb-1">Value</label>
            <input type="text" id="tokenValue" value={tokenValue} onChange={(e) => setTokenValue(e.target.value)} className="input-class" required />
            <p className="text-xs text-gray-500 mt-1">E.g., #FF0000, 16px, "Arial"</p>
          </div>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Token'}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .input-class {
          margin-top: 0.25rem; display: block; width: 100%; padding: 0.5rem 0.75rem;
          border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: sm;
          outline: none;
        }
        .input-class:focus {
          border-color: #4F46E5; ring: 1px solid #4F46E5;
        }
        .btn-primary {
          padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white;
          background-color: #4F46E5; border-radius: 0.375rem;
        }
        .btn-primary:hover { background-color: #4338CA; }
        .btn-primary:disabled { opacity: 0.5; }
        .btn-secondary {
          padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #1F2937;
          background-color: #E5E7EB; border-radius: 0.375rem;
        }
        .btn-secondary:hover { background-color: #D1D5DB; }
      `}</style>
    </div>
  );
};


const ProjectDetailsPage = () => {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<{ id: string; name: string } | null>(null); // Basic project info
  const [tokens, setTokens] = useState<Token[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!token || !projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch project details (optional, if needed beyond name/id)
      // For now, we assume we have projectId and can derive name if needed or fetch it.
      // const projectDetails = await apiClient<any>(`/projects/${projectId}`, { token });
      // setProject(projectDetails); // If you have an endpoint for single project details

      const [tokensData, versionsData] = await Promise.all([
        apiClient<Token[]>(`/projects/${projectId}/tokens`, { token }),
        apiClient<Version[]>(`/projects/${projectId}/versions`, { token }),
      ]);
      setTokens(tokensData);
      setVersions(versionsData);
    } catch (err: any) {
      console.error("Failed to fetch project data:", err);
      setError(err.message || 'Failed to fetch project data.');
    } finally {
      setIsLoading(false);
    }
  }, [token, projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleTokenCreated = () => {
    fetchData(); // Refetch both tokens and versions as adding a token creates a new version
  };

  if (isLoading) {
    return <p className="text-gray-600 p-6">Loading project details...</p>;
  }

  if (error) {
    return <p className="text-red-500 bg-red-100 p-6 rounded-md">Error: {error}</p>;
  }

  return (
    <div className="p-1"> {/* Reduced padding for the overall page */}
      <button
        onClick={() => router.push('/dashboard_projects_page')}
        className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Projects
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-2">Project Tokens</h1>
      <p className="text-sm text-gray-500 mb-6">Project ID: {projectId}</p>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Current Tokens ({tokens.length})</h2>
            <button
            onClick={() => setIsTokenModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:shadow-md transition duration-150 ease-in-out flex items-center text-sm"
            >
            <PlusCircleIcon className="h-5 w-5 mr-1.5" />
            Add Token
            </button>
        </div>
        {tokens.length === 0 ? (
          <p className="text-gray-500">No tokens found for this project. Add one to get started!</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tokens.map(t => (
                  <tr key={t.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{t.type}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 font-mono break-all">{t.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Token Export History ({versions.length})</h2>
        {versions.length === 0 ? (
          <p className="text-gray-500">No export versions found. Each time you add/modify a token, a new version is created here.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {versions.map(v => (
                  <tr key={v.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{v.version}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(v.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <Link
                        href={`/dashboard_projects_${projectId}_versions_${v.id}_page`} // Adjusted path
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" /> View JSON
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <CreateTokenModal 
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onTokenCreated={handleTokenCreated}
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDetailsPage;
