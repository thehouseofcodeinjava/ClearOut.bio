
import type { Metadata } from 'next';
import './globals.css'; 

export const metadata: Metadata = {
  title: 'ClearOut.bio | Clean Your Bio Page',
  description: 'Scan your Linktree or bio page to find and remove broken links.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
