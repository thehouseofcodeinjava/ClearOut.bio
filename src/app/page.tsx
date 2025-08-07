// src/app/page.tsx
'use client';

import { useState } from 'react';
import type { LinkData } from './api/check-links/route';

// Define the structure for the API response, including potential errors
interface ApiResponse {
  links?: LinkData[];
  error?: string;
}

export default function HomePage() {
  // State management
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>('Enter a URL to scan for broken links.');

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setMessage('Scanning... this may take a moment.');

    try {
      const response = await fetch('/api/check-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'An unexpected error occurred.');
      }

      if (data.links) {
        setResults(data.links);
        const brokenCount = data.links.filter(l => l.status >= 400).length;
        if (data.links.length === 0) {
          setMessage('No links found on this page.');
        } else if (brokenCount > 0) {
          setMessage(`Scan complete. Found ${brokenCount} broken link(s).`);
        } else {
          setMessage('Scan complete. No broken links found! ✨');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check links. Please ensure the URL is correct and accessible.');
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get a status label based on the HTTP status code
  const getStatusLabel = (status: number) => {
    if (status === 0) return <span className="text-gray-500">? Error</span>;
    if (status >= 200 && status < 300) return <span className="text-green-500">✅ OK</span>;
    if (status >= 300 && status < 400) return <span className="text-yellow-500">⚠️ Redirect</span>;
    if (status >= 400) return <span className="text-red-500">❌ Broken</span>;
    return <span className="text-gray-500">? Unknown</span>;
  };

  // Function to handle exporting clean links as an HTML block
  const handleExport = () => {
    const cleanLinks = results.filter(link => link.status >= 200 && link.status < 300);
    const htmlContent = cleanLinks.map(link => `  <a href="${link.finalUrl}" target="_blank" rel="noopener noreferrer">${link.originalUrl}</a>`).join('\n');
    const blob = new Blob([`<div>\n${htmlContent}\n</div>`], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'clean_links.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">ClearOut.bio</h1>
          <p className="text-lg text-gray-600 mt-2">Clean up your Linktree or bio page by finding and removing broken links.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your bio page URL to scan:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://linktr.ee/yourname"
                required
                className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Scanning...' : 'Clean Your Bio Page'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          {error && <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">{error}</div>}
          {message && !error && <div className="bg-gray-100 text-gray-600 p-4 rounded-md text-center">{message}</div>}

          {results.length > 0 && (
            <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Scan Results</h2>
                <button
                  onClick={handleExport}
                  className="bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
                >
                  Export Clean Links
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Link</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((link, index) => (
                      <tr key={index} className={link.status >= 400 ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 truncate" title={link.originalUrl}>{link.originalUrl}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={link.finalUrl}>{link.finalUrl}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{getStatusLabel(link.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center p-4 mt-8 text-gray-500 text-sm">
        <p>Built with ❤️ by Jules</p>
        <p className="mt-1">
          <a href="#" className="underline">Privacy Policy</a>
        </p>
      </footer>
    </div>
  );
}
