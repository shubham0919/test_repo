import React from 'react';
import { DesignToken } from '../App'; // Assuming DesignToken type is exported from App.tsx

interface TokenTableProps {
  tokens: DesignToken[];
  onEditToken: (token: DesignToken) => void; // Placeholder for edit functionality
  isLoading: boolean;
}

const TokenTable: React.FC<TokenTableProps> = ({ tokens, onEditToken, isLoading }) => {
  if (isLoading) {
    return <p className="text-center text-gray-500 py-8">Loading tokens...</p>;
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-gray-700">No Tokens Found</h3>
        <p className="text-sm text-gray-500 mt-2">
          Ensure you have local variables defined in your Figma file.
          Try clicking "Refresh Tokens".
        </p>
      </div>
    );
  }

  const renderValue = (value: any) => {
    if (typeof value === 'object' && value !== null) {
      // Basic display for object values (e.g., typography)
      return (
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return String(value);
  };

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Value
            </th>
            {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th> */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tokens.map((token) => (
            <tr key={token.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{token.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{token.type}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 break-all">
                {renderValue(token.value)}
              </td>
              {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEditToken(token)}
                  className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  aria-label={`Edit token ${token.name}`}
                >
                  Edit (Not Implemented)
                </button>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;
