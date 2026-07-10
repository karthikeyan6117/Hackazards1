import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monitoring Platform - AI-Powered Incident Intelligence",
  description: "Monitor endpoints, detect incidents, and get AI-generated root cause analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Navigation */}
        <nav className="bg-gray-900 text-white sticky top-0 z-50 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">⚙️</span>
                Monitoring Platform
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/" className="hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/incidents" className="hover:text-blue-400 transition-colors">
                  Incidents
                </Link>
                <Link href="/status" className="hover:text-blue-400 transition-colors">
                  Status Page
                </Link>
                <Link href="/settings" className="hover:text-blue-400 transition-colors">
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 border-t border-gray-800 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/status" className="hover:text-white transition-colors">
                      Status
                    </Link>
                  </li>
                  <li>
                    <Link href="/incidents" className="hover:text-white transition-colors">
                      Incidents
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Features</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Monitoring</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">AI Analysis</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Alerts</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">About</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Blog</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
                  </li>
                  <li>
                    <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm">
              <p>&copy; 2024 Monitoring Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
