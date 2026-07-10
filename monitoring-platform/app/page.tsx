'use client';

import { DashboardMetrics, Endpoint, Incident } from '@/types';
import { EndpointCard } from '@/components/endpoint-card';
import Link from 'next/link';

// Fixed timestamp to avoid hydration mismatch
const NOW = '2026-06-23T08:24:38.000Z';

// Mock data for demonstration
const mockMetrics: DashboardMetrics = {
  totalEndpoints: 8,
  activeIncidents: 2,
  upEndpoints: 6,
  downEndpoints: 1,
  avgLatency: 142,
  uptimePercentage: 99.2,
};

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
];

const mockIncidents: Incident[] = [
  {
    id: '1',
    endpointId: '4',
    title: 'CDN Edge Server Outage',
    description: 'CDN server in US-WEST region experiencing connectivity issues',
    severity: 'critical',
    status: 'investigating',
    startTime: new Date(new Date(NOW).getTime() - 3600000).toISOString(),
    rootCause: 'Load balancer misconfiguration detected in recent deployment',
    confidenceScore: 0.87,
    evidence: [
      'High CPU utilization on edge nodes',
      'Recent deployment at 2024-06-23 14:30 UTC',
      'Correlated with increase in 502 errors',
    ],
    recommendations: [
      'Rollback to previous stable deployment',
      'Investigate load balancer configuration changes',
      'Implement automated rollback on error threshold',
    ],
    timeline: [
      {
        timestamp: new Date(new Date(NOW).getTime() - 3600000).toISOString(),
        event: 'Incident detected: CDN latency spike',
        type: 'detection',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 2700000).toISOString(),
        event: 'AI investigation started',
        type: 'investigation',
      },
    ],
  },
  {
    id: '2',
    endpointId: '3',
    title: 'Database Latency Degradation',
    description: 'Primary database experiencing elevated query times',
    severity: 'warning',
    status: 'open',
    startTime: new Date(new Date(NOW).getTime() - 7200000).toISOString(),
    rootCause: 'Long-running query blocking connection pool',
    confidenceScore: 0.92,
    evidence: ['Query execution time: 45s average', 'Connection pool saturation at 95%'],
    recommendations: ['Optimize slow query', 'Increase connection pool size', 'Implement query timeout'],
    timeline: [
      {
        timestamp: new Date(new Date(NOW).getTime() - 7200000).toISOString(),
        event: 'Latency spike detected',
        type: 'detection',
      },
    ],
  },
];

export default function DashboardPage() {
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
            <p className="text-4xl font-bold text-gray-900 mt-2">{mockMetrics.totalEndpoints}</p>
          </div>

          {/* Uptime Percentage */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Overall Uptime</p>
            <div className="flex items-end gap-4 mt-2">
              <p className="text-4xl font-bold text-green-600">{mockMetrics.uptimePercentage}%</p>
              <p className="text-sm text-gray-500 pb-1">Last 30 days</p>
            </div>
          </div>

          {/* Active Incidents */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Incidents</p>
            <div className="flex items-end gap-4 mt-2">
              <p className="text-4xl font-bold text-red-600">{mockMetrics.activeIncidents}</p>
              <Link href="/incidents" className="text-sm text-blue-600 hover:underline pb-1">
                View All
              </Link>
            </div>
          </div>

          {/* Up Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Operational</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{mockMetrics.upEndpoints}</p>
          </div>

          {/* Down Endpoints */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Down</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{mockMetrics.downEndpoints}</p>
          </div>

          {/* Average Latency */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Latency</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{mockMetrics.avgLatency}ms</p>
          </div>
        </div>

        {/* Recent Incidents Section */}
        {mockIncidents.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Active Incidents</h2>
              <Link href="/incidents" className="text-blue-600 hover:underline text-sm font-medium">
                View All Incidents →
              </Link>
            </div>
            <div className="space-y-4">
              {mockIncidents.map((incident) => (
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
            {mockEndpoints.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} recentIncidents={mockIncidents.filter((i) => i.endpointId === endpoint.id)} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
