'use client';

import { Endpoint } from '@/types';
import { StatusBadge } from '@/components/badges';
import Link from 'next/link';

const NOW = '2026-06-23T08:24:38.000Z';

const mockEndpoints: Endpoint[] = [
  {
    id: '1',
    name: 'API Server - Production',
    url: 'https://api.example.com/health',
    status: 'up',
    uptime: 99.9,
    lastChecked: NOW,
    latency: 120,
  },
  {
    id: '2',
    name: 'Web Application',
    url: 'https://app.example.com',
    status: 'up',
    uptime: 99.8,
    lastChecked: NOW,
    latency: 145,
  },
  {
    id: '3',
    name: 'Database Primary',
    url: 'https://db-primary.internal/health',
    status: 'degraded',
    uptime: 98.5,
    lastChecked: NOW,
    latency: 250,
  },
  {
    id: '4',
    name: 'CDN Edge Server',
    url: 'https://cdn.example.com/status',
    status: 'down',
    uptime: 97.2,
    lastChecked: NOW,
    latency: 0,
  },
  {
    id: '5',
    name: 'Auth Service',
    url: 'https://auth.example.com/health',
    status: 'up',
    uptime: 99.95,
    lastChecked: NOW,
    latency: 89,
  },
  {
    id: '6',
    name: 'Webhook Service',
    url: 'https://webhooks.example.com/status',
    status: 'up',
    uptime: 99.7,
    lastChecked: NOW,
    latency: 167,
  },
  {
    id: '7',
    name: 'Search Engine',
    url: 'https://search.example.com/health',
    status: 'up',
    uptime: 99.8,
    lastChecked: NOW,
    latency: 234,
  },
  {
    id: '8',
    name: 'Cache Layer',
    url: 'https://cache.example.com/ping',
    status: 'up',
    uptime: 99.99,
    lastChecked: NOW,
    latency: 23,
  },
];

const upCount = mockEndpoints.filter((e) => e.status === 'up').length;
const downCount = mockEndpoints.filter((e) => e.status === 'down').length;
const degradedCount = mockEndpoints.filter((e) => e.status === 'degraded').length;

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-500 mt-1">Public status page for all monitored services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Total Services</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{mockEndpoints.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Operational</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{upCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Degraded</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{degradedCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide">Down</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{downCount}</p>
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {mockEndpoints.map((endpoint) => (
            <div key={endpoint.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{endpoint.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 truncate">{endpoint.url}</p>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Latency</p>
                    <p className="text-lg font-bold text-gray-900">{endpoint.latency}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase">Uptime</p>
                    <p className="text-lg font-bold text-gray-900">{endpoint.uptime.toFixed(2)}%</p>
                  </div>
                  <StatusBadge status={endpoint.status} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">Last updated: {new Date(NOW).toUTCString()}</p>
          <p className="text-sm">Updates every 60 seconds</p>
        </div>
      </div>
    </main>
  );
}
