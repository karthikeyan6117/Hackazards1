'use client';

import { Endpoint } from '@/types';
import { StatusBadge } from '@/components/badges';
import Link from 'next/link';

import { useEffect, useState } from 'react';

export default function StatusPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('http://localhost:8000/api/status');
        if (res.ok) {
          const data = await res.json();
          setEndpoints(data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 60000); // 60 seconds
    return () => clearInterval(intervalId);
  }, []);

  const upCount = endpoints.filter((e) => e.status === 'up').length;
  const downCount = endpoints.filter((e) => e.status === 'down').length;
  const degradedCount = endpoints.filter((e) => e.status === 'degraded').length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading system status...</div>
      </main>
    );
  }



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
            <p className="text-3xl font-bold text-gray-900 mt-2">{endpoints.length}</p>
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
          {endpoints.map((endpoint) => (
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
          <p className="text-sm">Last updated: {lastUpdated.toUTCString()}</p>
          <p className="text-sm">Updates every 60 seconds</p>
        </div>
      </div>
    </main>
  );
}
