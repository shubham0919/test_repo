import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Ensure TailwindCSS is imported here
import { AuthProvider } from '../lib/authContext'; // Will create this next

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Design Token SaaS',
  description: 'Manage and export your design tokens.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
