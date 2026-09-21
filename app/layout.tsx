import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'FresherJobs | Curated Job Board',
  description: 'Curated, admin-driven job listings for emerging talent.',
  icons: { icon: '/freshers-job-board-logo.png', apple: '/freshers-job-board-logo.png' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
