// src/app/api/check-links/route.ts
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Define the structure of a link's data
export interface LinkData {
  originalUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
}

// Define the structure of the API response
export interface ApiResponse {
  links: LinkData[];
  error?: string;
}

// Helper function to check a single URL
async function checkUrl(url: string): Promise<LinkData> {
  const result: LinkData = {
    originalUrl: url,
    finalUrl: url,
    status: 0,
    statusText: 'Error',
  };

  try {
    // Use a controller to implement a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ClearOutBioLinkChecker/1.0',
      },
      redirect: 'follow', // Follow redirects to get the final URL
    });

    clearTimeout(timeoutId);

    result.finalUrl = response.url;
    result.status = response.status;
    result.statusText = response.statusText;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      result.statusText = 'Timeout';
      result.status = 408; // Request Timeout
    } else {
      result.statusText = 'Fetch Error';
    }
  }
  return result;
}

// The main POST handler for the API route
export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate the URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch (_) {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    // Fetch the HTML content of the user-provided URL
    const response = await fetch(targetUrl.href);
    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: 500 });
    }
    const html = await response.text();

    // Parse the HTML and extract links
    const $ = cheerio.load(html);
    const linkPromises: Promise<LinkData>[] = [];
    const uniqueLinks = new Set<string>();

    $('a').each((_, element) => {
      let href = $(element).attr('href');
      if (href) {
        try {
          // Resolve relative URLs to absolute URLs
          const absoluteUrl = new URL(href, targetUrl.href).href;
          uniqueLinks.add(absoluteUrl);
        } catch (e) {
          // Ignore invalid URLs
        }
      }
    });

    uniqueLinks.forEach(link => {
        linkPromises.push(checkUrl(link));
    });

    const links = await Promise.all(linkPromises);

    return NextResponse.json({ links });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
