import React, { useState, useMemo } from 'react';
import { DesignToken } from '../App'; // Assuming DesignToken type is exported from App.tsx

interface ExportModalProps {
  tokens: DesignToken[];
  isOpen: boolean;
  onClose: () => void;
  jwt: string | null;
  projectId: string | null;
  saasUrl: string;
}

type ExportFormat = 'json' | 'css' | 'scss' | 'less' | 'tailwind'; // For local export

// Helper function to convert tokens to a specific format
const convertTokensToFormat = (tokens: DesignToken[], format: ExportFormat): string => {
  switch (format) {
    case 'json':
      const jsonObj: { [key: string]: any } = {};
      tokens.forEach(token => {
        // Simple key-value for now, can be nested later based on token names (e.g. 'color.primary')
        jsonObj[token.name.replace(/\//g, '.')] = token.value;
      });
      return JSON.stringify(jsonObj, null, 2);
    case 'css':
      return tokens
        .map(token => `--${token.name.replace(/\//g, '-')}: ${token.value};`)
        .join('\n');
    case 'scss':
      return tokens
        .map(token => `$${token.name.replace(/\//g, '-')}: ${token.value};`)
        .join('\n');
    case 'less':
        return tokens
          .map(token => `@${token.name.replace(/\//g, '-')}: ${token.value};`)
          .join('\n');
    case 'tailwind':
      // This is a simplified Tailwind output. Real Tailwind config might need more structure.
      const tailwindConfig: { theme: { extend: { [key: string]: any } } } = {
        theme: {
          extend: {
            colors: {},
            spacing: {},
            // extend more based on token types
          },
        },
      };
      tokens.forEach(token => {
        const key = token.name.replace(/\//g, '-'); // e.g. "colors-primary-500"
        if (token.type === 'color') {
          tailwindConfig.theme.extend.colors[key] = token.value;
        } else if (token.type === 'spacing') {
          tailwindConfig.theme.extend.spacing[key] = token.value;
        }
        // Add more type handling as needed
      });
      return `module.exports = ${JSON.stringify(tailwindConfig, null, 2)};`;
    default:
      return 'Format not supported';
  }
};

const ExportModal: React.FC<ExportModalProps> = ({ tokens, isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json'); // For local export
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingToSaaS, setIsSubmittingToSaaS] = useState(false);

  const outputText = useMemo(() => {
    return convertTokensToFormat(tokens, selectedFormat);
  }, [tokens, selectedFormat]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setCopySuccess('Failed to copy. Check console.');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const handleDownload = () => {
    const filenameMap = {
      json: 'design-tokens.json',
      css: 'design-tokens.css',
      scss: 'design-tokens.scss',
      less: 'design-tokens.less',
      tailwind: 'tailwind.config.js',
    };
    const filename = filenameMap[selectedFormat] || 'design-tokens.txt';
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportToSaaS = async () => {
    if (!jwt || !projectId) {
      setExportMessage({ type: 'error', text: 'JWT or Project ID is missing. Configure in plugin settings.' });
      return;
    }
    if (tokens.length === 0) {
      setExportMessage({ type: 'error', text: 'No tokens to export.' });
      return;
    }

    setIsSubmittingToSaaS(true);
    setExportMessage(null);

    // For this example, sending one token at a time.
    // The backend /api/projects/:id/tokens expects a single token object.
    // In a real scenario, you might want a batch endpoint or send one by one.
    // This will create multiple versions if you send multiple tokens one by one.
    let successCount = 0;
    let lastError = null;

    for (const token of tokens) {
        // The backend expects name, type, value. We map from DesignToken.
        const payload = {
            name: token.name,
            type: token.type,
            value: token.value, // Assuming value is already in a format backend accepts (e.g. string)
        };
        try {
            console.log(`Exporting token to SaaS: ${props.saasUrl}/api/projects/${props.projectId}/tokens`, payload);
            const response = await fetch(`${props.saasUrl}/api/projects/${props.projectId}/tokens`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${props.jwt}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
            }
            successCount++;
            // console.log('Token exported successfully to SaaS:', await response.json());
        } catch (error: any) {
            console.error('Error exporting token to SaaS:', error);
            lastError = error.message;
            // Optionally break on first error or try all:
            // setExportMessage({ type: 'error', text: `Error exporting token "${token.name}": ${error.message}` });
            // setIsSubmittingToSaaS(false);
            // return; 
        }
    }


    setIsSubmittingToSaaS(false);
    if (successCount === tokens.length) {
        setExportMessage({ type: 'success', text: `Successfully exported ${successCount} token(s) to SaaS! A new version was created.` });
    } else if (successCount > 0) {
        setExportMessage({ type: 'error', text: `Partially exported ${successCount}/${tokens.length} tokens. Last error: ${lastError}` });
    } else if (lastError) {
        setExportMessage({ type: 'error', text: `Failed to export tokens: ${lastError}` });
    } else {
        setExportMessage({ type: 'error', text: 'Failed to export tokens for an unknown reason.' });
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity flex justify-center items-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Export Design Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* SaaS Export Section */}
        <div className="mb-6 border-b pb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Cloud Export (SaaS)</h3>
          {(!jwt || !projectId) && (
            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md">
              Please configure your JWT and Project ID in the plugin settings (top right of the plugin) to enable SaaS export.
            </p>
          )}
          <button
            onClick={handleExportToSaaS}
            disabled={!jwt || !projectId || tokens.length === 0 || isSubmittingToSaaS}
            className="w-full mt-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSubmittingToSaaS ? 'Exporting to SaaS...' : `Export All ${tokens.length} Tokens to SaaS Project`}
          </button>
          {exportMessage && (
            <p className={`text-sm mt-3 p-2 rounded-md ${exportMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {exportMessage.text}
            </p>
          )}
        </div>
        
        {/* Local Export Section */}
        <h3 className="text-lg font-medium text-gray-700 mb-2">Local Export Options</h3>
        <div className="mb-4">
          <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Format for Local Export:
          </label>
          <select
            id="format-select"
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
          >
            <option value="json">JSON</option>
            <option value="css">CSS Variables</option>
            <option value="scss">SCSS Variables</option>
            <option value="less">LESS Variables</option>
            <option value="tailwind">Tailwind Config (Simplified)</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Generated Output for Local Export:
          </label>
          <textarea
            readOnly
            value={outputText}
            rows={5} // Reduced rows for local output preview
            className="mt-1 block w-full text-sm text-gray-700 bg-gray-50 border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
            aria-label="Generated token output for local export"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleCopyToClipboard}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Copy Local Output
          </button>
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Download Local File
          </button>
        </div>
        {copySuccess && <p className="text-sm text-green-600 mt-3 text-center sm:text-right">{copySuccess}</p>}
      </div>
    </div>
  );
};

export default ExportModal;
