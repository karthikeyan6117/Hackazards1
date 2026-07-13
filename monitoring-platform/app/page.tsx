'use client';

import { DashboardMetrics, Endpoint, Incident } from '@/types';
import { EndpointCard } from '@/components/endpoint-card';
import Link from 'next/link';
import { backendGet } from '@/lib/backend';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [metricsData, endpointsData, incidentsData] = await Promise.all([
          backendGet<DashboardMetrics>('/api/dashboard'),
          backendGet<Endpoint[]>('/api/endpoints'),
          backendGet<Incident[]>('/api/incidents'),
        ]);

        setMetrics(metricsData);
        setEndpoints(endpointsData);
        setIncidents(incidentsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Optional: Set up polling
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading || !metrics) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Monitor your endpoints and incidents in real-time</p>
            </div>
            <Link
              href="/settings"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Configure Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Endpoints</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.totalEndpoints}</p>
          </div>

          {/* Uptime Percentage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Overall Uptime</p>
            <div className="flex items-end gap-4 mt-2">
              <p className="text-4xl font-bold text-green-600">{metrics.uptimePercentage}%</p>
              <p className="text-sm text-gray-500 pb-1">Last 24 hours</p>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Incidents</p>
            <div className="flex items-end gap-4 mt-2">
              <p className="text-4xl font-bold text-red-600">{metrics.activeIncidents}</p>
              <Link href="/incidents" className="text-sm text-blue-600 hover:underline pb-1">
                View All
              </Link>
            </div>
          </div>

          {/* Up Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Operational</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{metrics.upEndpoints}</p>
          </div>

          {/* Down Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Down</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{metrics.downEndpoints}</p>
          </div>

          {/* Average Latency */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Latency</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{metrics.avgLatency}ms</p>
          </div>
        </div>

        {/* Recent Incidents Section */}
        {incidents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Active Incidents</h2>
              <Link href="/incidents" className="text-blue-600 hover:underline text-sm font-medium">
                View All Incidents →
              </Link>
            </div>
            <div className="space-y-4">
              {incidents.slice(0, 5).map((incident) => (
                <Link key={incident.id} href={`/incidents/${incident.id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                        <p className="text-gray-600 mt-1">{incident.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              incident.severity === 'critical'
                                ? 'bg-red-100 text-red-800'
                                : incident.severity === 'warning'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            Started: {new Date(incident.startTime).toUTCString()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        {incident.rootCause && (
                          <div>
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className="text-2xl font-bold text-blue-600">{(incident.confidenceScore! * 100).toFixed(0)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Endpoints Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Monitored Endpoints</h2>
            <Link href="/status" className="text-blue-600 hover:underline text-sm font-medium">
              View Status Page →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endpoints.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} recentIncidents={incidents.filter((i) => i.endpointId === endpoint.id)} />

            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
