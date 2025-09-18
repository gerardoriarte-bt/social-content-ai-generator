import React, { useState } from 'react';

export const ApiDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async (endpoint: string) => {
    setLoading(true);
    setDebugInfo(null);
    
    try {
      const response = await fetch(endpoint);
      const text = await response.text();
      
      let jsonData;
      try {
        jsonData = JSON.parse(text);
      } catch {
        jsonData = { error: 'Invalid JSON', rawText: text };
      }
      
      setDebugInfo({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: jsonData,
        rawText: text
      });
    } catch (error) {
      setDebugInfo({
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <h3 className="text-lg font-semibold mb-3">API Debugger</h3>
      
      <div className="space-y-2 mb-4">
        <button
          onClick={() => testApi('/api/health')}
          disabled={loading}
          className="w-full px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-400"
        >
          Test Health
        </button>
        <button
          onClick={() => testApi('/api/companies')}
          disabled={loading}
          className="w-full px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
        >
          Test Companies
        </button>
        <button
          onClick={() => testApi('/api/test')}
          disabled={loading}
          className="w-full px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:bg-gray-400"
        >
          Test Route
        </button>
      </div>

      {loading && (
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm">Testing...</p>
        </div>
      )}

      {debugInfo && (
        <div className="text-xs">
          <h4 className="font-semibold mb-2">Response:</h4>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
