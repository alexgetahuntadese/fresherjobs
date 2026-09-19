import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'FresherJobs',
  description: 'Curated, admin-driven job listings for emerging talent.',
  icons: { icon: '/fresherjobs-logo.jpg', apple: '/fresherjobs-logo.jpg' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
