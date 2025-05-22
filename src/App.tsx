import React, { useState, useEffect, useCallback } from 'react';

// Define a basic structure for design tokens
export interface DesignToken {
  id: string;
  name: string;
  type: 'color' | 'spacing' | 'typography' | 'fontFamily' | 'fontWeight' | 'fontSize' | 'lineHeight' | 'letterSpacing' | 'other';
  value: any; // Can be string for colors, number for spacing, or object for typography
  figmaVariable?: any; // To store original Figma variable if needed
}

// Mock function to simulate fetching Figma local variables
// In a real Figma plugin, this would use `figma.getLocalVariablesAsync()` and related APIs
const mockGetLocalVariables = async (): Promise<DesignToken[]> => {
  console.log("UI: Requesting local variables from Figma plugin code...");
  // Send a message to the plugin's main code (code.ts)
  parent.postMessage({ pluginMessage: { type: 'get-local-variables' } }, '*');

  // For now, return a promise that will be resolved when the plugin code sends back the variables
  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.pluginMessage?.type === 'local-variables') {
        console.log("UI: Received local variables from Figma plugin code:", event.data.pluginMessage.data);
        window.removeEventListener('message', handleMessage);
        resolve(event.data.pluginMessage.data as DesignToken[]);
      }
    };
    window.addEventListener('message', handleMessage);
  });
};

// Import actual components
import TokenTable from './components/TokenTable';
import ExportModal from './components/ExportModal';

function App() {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  
  const [storedJwt, setStoredJwt] = useState<string | null>(null);
  const [inputJwt, setInputJwt] = useState<string>('');
  const [jwtError, setJwtError] = useState<string>('');
  const [jwtSuccess, setJwtSuccess] = useState<string>('');

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectIdInput, setProjectIdInput] = useState<string>('');
  const [projectError, setProjectError] = useState<string>('');
  const [projectSuccess, setProjectSuccess] = useState<string>('');

  const SAAS_URL = 'http://localhost:3000'; // Replace with your actual SaaS URL

  // Load JWT and Project ID from figma.clientStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const jwt = await parent.postMessageWithResult({ pluginMessage: { type: 'get-storage', key: 'jwtToken' } }, '*');
        if (jwt) {
          setStoredJwt(jwt as string);
          setInputJwt(jwt as string); // Pre-fill input if JWT exists
          setJwtSuccess('JWT loaded from storage.');
        }
        const projId = await parent.postMessageWithResult({ pluginMessage: { type: 'get-storage', key: 'selectedProjectId' } }, '*');
        if (projId) {
          setSelectedProjectId(projId as string);
          setProjectIdInput(projId as string);
          setProjectSuccess('Project ID loaded from storage.');
        }
      } catch (e) {
        console.error('Error loading from figma.clientStorage:', e);
        setJwtError('Could not load JWT from storage.');
        setProjectError('Could not load Project ID from storage.');
      }
    };
    loadStoredData();
  }, []);

  const handleSaveJwt = async () => {
    if (!inputJwt.trim()) {
      setJwtError('Please paste a JWT.');
      setJwtSuccess('');
      return;
    }
    try {
      await parent.postMessageWithResult({ pluginMessage: { type: 'set-storage', key: 'jwtToken', value: inputJwt } }, '*');
      setStoredJwt(inputJwt);
      setJwtSuccess('JWT saved successfully!');
      setJwtError('');
    } catch (e) {
      console.error('Error saving JWT to figma.clientStorage:', e);
      setJwtError('Failed to save JWT. See console for details.');
      setJwtSuccess('');
    }
  };
  
  const handleClearJwt = async () => {
    try {
      await parent.postMessageWithResult({ pluginMessage: { type: 'delete-storage', key: 'jwtToken' } }, '*');
      setStoredJwt(null);
      setInputJwt('');
      setJwtSuccess('JWT cleared successfully!');
      setJwtError('');
    } catch (e) {
      console.error('Error clearing JWT from figma.clientStorage:', e);
      setJwtError('Failed to clear JWT. See console for details.');
      setJwtSuccess('');
    }
  };

  const handleSaveProjectId = async () => {
    if (!projectIdInput.trim()) {
      setProjectError('Please enter a Project ID.');
      setProjectSuccess('');
      return;
    }
    try {
      await parent.postMessageWithResult({ pluginMessage: { type: 'set-storage', key: 'selectedProjectId', value: projectIdInput } }, '*');
      setSelectedProjectId(projectIdInput);
      setProjectSuccess('Project ID saved successfully!');
      setProjectError('');
    } catch (e) {
      console.error('Error saving Project ID to figma.clientStorage:', e);
      setProjectError('Failed to save Project ID. See console for details.');
      setProjectSuccess('');
    }
  };
  
  const handleClearProjectId = async () => {
    try {
      await parent.postMessageWithResult({ pluginMessage: { type: 'delete-storage', key: 'selectedProjectId' } }, '*');
      setSelectedProjectId('');
      setProjectIdInput('');
      setProjectSuccess('Project ID cleared successfully!');
      setProjectError('');
    } catch (e) {
      console.error('Error clearing Project ID from figma.clientStorage:', e);
      setProjectError('Failed to clear Project ID. See console for details.');
      setProjectSuccess('');
    }
  };


  const fetchTokens = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTokens = await mockGetLocalVariables();
      setTokens(fetchedTokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
      // Display error to user if necessary
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // In a real plugin, you might listen for messages from the plugin code, e.g., when variables change
  useEffect(() => {
    const handleFigmaMessages = (event: MessageEvent) => {
      const { pluginMessage } = event.data;
      if (pluginMessage) {
        if (pluginMessage.type === 'variables-updated') {
          console.log("UI: Received 'variables-updated' message from Figma. Refreshing tokens.");
          fetchTokens(); // Re-fetch tokens if Figma notifies of an update
        }
      }
    };

    window.addEventListener('message', handleFigmaMessages);
    return () => window.removeEventListener('message', handleFigmaMessages);
  }, [fetchTokens]);

  const handleEditToken = (token: DesignToken) => {
    // setEditingToken(token);
    // Logic for editing token (e.g., open a different modal or inline editing)
    console.log("Editing token (not implemented):", token);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Design Token Exporter</h1>
          <p className="text-sm text-gray-600">View and export your Figma local design tokens.</p>
        </div>
        {/* Login/Settings Area */}
        <div className="bg-gray-50 p-3 rounded-lg shadow text-xs w-1/3">
          <h3 className="font-semibold mb-1 text-gray-700">Plugin Settings</h3>
          {!storedJwt ? (
            <button
              onClick={() => parent.postMessage({ pluginMessage: { type: 'open-url', url: `${SAAS_URL}/login_page` } }, '*')}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-2 rounded text-xs mb-2"
            >
              Login with SaaS
            </button>
          ) : (
             <p className="text-green-600 text-xs mb-1">Logged in with SaaS.</p>
          )}
          <label htmlFor="jwtInput" className="block text-gray-600 mb-0.5">Paste JWT here:</label>
          <textarea
            id="jwtInput"
            value={inputJwt}
            onChange={(e) => setInputJwt(e.target.value)}
            placeholder="Paste JWT from SaaS callback page"
            rows={2}
            className="w-full border border-gray-300 rounded p-1 text-xs mb-1"
          />
          {jwtError && <p className="text-red-500 text-xs mb-1">{jwtError}</p>}
          {jwtSuccess && <p className="text-green-500 text-xs mb-1">{jwtSuccess}</p>}
          <div className="flex space-x-1 mb-2">
            <button onClick={handleSaveJwt} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs">Save JWT</button>
            <button onClick={handleClearJwt} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-1 px-2 rounded text-xs">Clear JWT</button>
          </div>
          
          <label htmlFor="projectIdInput" className="block text-gray-600 mb-0.5">SaaS Project ID:</label>
          <input
            type="text"
            id="projectIdInput"
            value={projectIdInput}
            onChange={(e) => setProjectIdInput(e.target.value)}
            placeholder="Enter Project ID from SaaS"
            className="w-full border border-gray-300 rounded p-1 text-xs mb-1"
          />
          {projectError && <p className="text-red-500 text-xs mb-1">{projectError}</p>}
          {projectSuccess && <p className="text-green-500 text-xs mb-1">{projectSuccess}</p>}
           <div className="flex space-x-1">
            <button onClick={handleSaveProjectId} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-xs">Save Project ID</button>
            <button onClick={handleClearProjectId} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-1 px-2 rounded text-xs">Clear Project ID</button>
          </div>
        </div>
      </header>

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={fetchTokens}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Tokens'}
        </button>
        <div>
          <button
            onClick={() => {
              if (!storedJwt || !selectedProjectId) {
                alert("Please save your JWT and Project ID first in settings.");
                return;
              }
              // Conceptual: Call sync to GitHub endpoint
              parent.postMessage({ pluginMessage: { 
                type: 'api-call', 
                endpoint: `${SAAS_URL}/api/sync`, // This is a conceptual endpoint for now
                method: 'POST',
                token: storedJwt,
                body: { projectId: selectedProjectId } 
              }}, '*');
              alert("Sync to GitHub initiated (conceptual). Check SaaS dashboard.");
            }}
            disabled={!storedJwt || !selectedProjectId}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 mr-2"
          >
            Sync to GitHub (SaaS)
          </button>
          <button
            onClick={() => setIsExportModalOpen(true)}
            disabled={tokens.length === 0 || !storedJwt || !selectedProjectId}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            Export Tokens
          </button>
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-500">Loading tokens...</p>}
      {!isLoading && <TokenTable tokens={tokens} onEditToken={handleEditToken} isLoading={isLoading} />}

      <ExportModal
        tokens={tokens}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        jwt={storedJwt}
        projectId={selectedProjectId}
        saasUrl={SAAS_URL}
      />

      {/* Future: Edit Token Modal */}
      {/* {editingToken && ( ...modal UI for editing... )} */}
    </div>
  );
}

export default App;
