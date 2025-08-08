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
  const [message, setMessage] = useState<string | null>(
    'Enter a URL to scan for broken links.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults([]);
    setMessage('Scanning the cosmos for broken links...');

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
          setMessage('The cosmos is silent. No links found on this page.');
        } else if (brokenCount > 0) {
          setMessage(
            `Scan complete. Found ${brokenCount} broken link(s) in the void.`
          );
        } else {
          setMessage(
            'Cosmic scan complete. All links are stable and shining bright! ✨'
          );
        }
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to check links. Please ensure the URL is correct and accessible.'
      );
      setMessage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: number) => {
    if (status === 0)
      return <span className="text-yellow-400">? Error</span>;
    if (status >= 200 && status < 300)
      return <span className="text-green-400">✅ OK</span>;
    if (status >= 300 && status < 400)
      return <span className="text-blue-400">🌀 Redirect</span>;
    if (status >= 400)
      return <span className="text-red-400">❌ Broken</span>;
    return <span className="text-gray-400">? Unknown</span>;
  };

  const handleExport = () => {
    const cleanLinks = results.filter(
      link => link.status >= 200 && link.status < 300
    );
    const htmlContent = cleanLinks
      .map(
        link =>
          `  <a href="${link.finalUrl}" target="_blank" rel="noopener noreferrer">${link.originalUrl}</a>`
      )
      .join('\n');
    const blob = new Blob([`<div>\n${htmlContent}\n</div>`], {
      type: 'text/html',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'clean_links.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-glow">
          ClearOut.bio
        </h1>
        <p className="text-lg text-gray-300 mt-2">
          Cleaning the cosmic pathways of your bio page.
        </p>
      </header>

      <div className="max-w-2xl glass-card p-8 glow-on-hover">
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="url-input"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Enter your bio page URL to scan:
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://linktr.ee/yourname"
              required
              className="flex-grow p-3 bg-transparent border border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Scanning...' : 'Cleanse Links'}
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-4xl mt-12">
        {error && (
          <div className="bg-red-900/50 text-red-300 p-4 rounded-md text-center">
            {error}
          </div>
        )}
        {message && !error && (
          <div className="bg-gray-800/50 text-gray-300 p-4 rounded-md text-center">
            {message}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 glass-card p-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-glow">Scan Results</h2>
              <button onClick={handleExport} className="btn-primary">
                Export Clean Links
              </button>
            </div>
            <div className="space-y-4">
              {results.map((link, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex justify-between items-center transition ${
                    link.status >= 400
                      ? 'bg-red-900/30'
                      : 'bg-gray-800/30'
                  }`}
                >
                  <div>
                    <p
                      className="font-bold truncate"
                      title={link.originalUrl}
                    >
                      {link.originalUrl}
                    </p>
                    <p
                      className="text-sm text-gray-400 truncate"
                      title={link.finalUrl}
                    >
                      {link.finalUrl}
                    </p>
                  </div>
                  <div className="text-lg font-medium">
                    {getStatusLabel(link.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center p-4 mt-12 text-gray-500 text-sm">
        <p>Forged in the cosmos by Jules</p>
        <p className="mt-1">
          <a href="#" className="underline">
            Cosmic Privacy Policy
          </a>
        </p>
      </footer>
      <Analytics />
    </main>
  );
}
