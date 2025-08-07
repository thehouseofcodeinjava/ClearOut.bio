'use client';
import { useState } from 'react';
import type { LinkData } from './api/check-links/route';
import { Analytics } from '@vercel/analytics/react';

interface ApiResponse {
  links?: LinkData[];
  error?: string;
}

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<LinkData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>('Enter a URL to scan for broken links.');

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

  const getStatusLabel = (status: number) => {
    if (status === 0) return <span className="text-yellow-400">? Error</span>;
    if (status >= 200 && status < 300) return <span className="text-green-400">✅ OK</span>;
    if (status >= 300 && status < 400) return <span className="text-blue-400">Redirect</span>;
    if (status >= 400) return <span className="text-red-400">❌ Broken</span>;
    return <span className="text-gray-400">? Unknown</span>;
  };

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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Get started by editing&nbsp;
          <code className="font-mono font-bold">src/app/page.tsx</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{' '}
          </a>
        </div>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]">
        <h1 className="text-4xl md:text-5xl font-bold text-center">ClearOut.bio</h1>
      </div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <div className="bg-white/5 p-6 rounded-lg shadow-lg backdrop-blur-lg">
          <form onSubmit={handleSubmit}>
            <label htmlFor="url-input" className="block text-sm font-medium mb-2">
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
                className="flex-grow p-3 border border-zinc-700 bg-zinc-800/50 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
              >
                {isLoading ? 'Scanning...' : 'Clean Your Bio Page'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          {error && <div className="bg-red-900/20 text-red-300 p-4 rounded-md text-center">{error}</div>}
          {message && !error && <div className="bg-zinc-800/30 text-zinc-300 p-4 rounded-md text-center">{message}</div>}

          {results.length > 0 && (
            <div className="mt-6 bg-white/5 p-6 rounded-lg shadow-lg backdrop-blur-lg">
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
                <table className="min-w-full divide-y divide-zinc-700">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Original Link</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Final URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-700">
                    {results.map((link, index) => (
                      <tr key={index} className={link.status >= 400 ? 'bg-red-900/20' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm truncate" title={link.originalUrl}>{link.originalUrl}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 truncate" title={link.finalUrl}>{link.finalUrl}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{getStatusLabel(link.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Analytics />
    </main>
  );
}
