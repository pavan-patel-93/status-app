import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import AuthProvider from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Statify',
  description: 'Monitor your services status in real-time',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}