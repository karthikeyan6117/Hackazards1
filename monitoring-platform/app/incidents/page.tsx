'use client';

import { Incident } from '@/types';
import Link from 'next/link';

const NOW = '2026-06-23T08:24:38.000Z';

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
  {
    id: '3',
    endpointId: '2',
    title: 'API Response Timeout',
    description: 'Multiple requests timing out on /api/users endpoint',
    severity: 'warning',
    status: 'resolved',
    startTime: new Date(new Date(NOW).getTime() - 86400000).toISOString(),
    endTime: new Date(new Date(NOW).getTime() - 82800000).toISOString(),
    rootCause: 'Memory leak in connection handler',
    confidenceScore: 0.85,
    evidence: ['Memory usage increased over time', 'Restarting service resolved the issue'],
    recommendations: ['Review connection handler implementation', 'Add memory monitoring alerts'],
    timeline: [
      {
        timestamp: new Date(new Date(NOW).getTime() - 86400000).toISOString(),
        event: 'Timeouts detected',
        type: 'detection',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 83600000).toISOString(),
        event: 'Root cause identified',
        type: 'investigation',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 82800000).toISOString(),
        event: 'Issue resolved',
        type: 'resolution',
      },
    ],
  },
];

export default function IncidentsPage() {
  const activeIncidents = mockIncidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = mockIncidents.filter((i) => i.status === 'resolved');

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
              <h1 className="text-3xl font-bold text-gray-900">Incident History</h1>
              <p className="text-gray-500 mt-1">View all incidents with AI-generated root cause analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Active Incidents ({activeIncidents.length})</h2>
            <div className="space-y-4">
              {activeIncidents.map((incident) => (
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
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              incident.status === 'open'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {incident.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(incident.startTime).toUTCString()}
                          </span>
                        </div>
                      </div>
                      {incident.rootCause && (
                        <div className="ml-4 text-right">
                          <p className="text-sm text-gray-600">AI Confidence</p>
                          <p className="text-2xl font-bold text-blue-600">{(incident.confidenceScore! * 100).toFixed(0)}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Resolved Incidents */}
        {resolvedIncidents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resolved ({resolvedIncidents.length})</h2>
            <div className="space-y-4">
              {resolvedIncidents.map((incident) => (
                <Link key={incident.id} href={`/incidents/${incident.id}`}>
                  <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                        <p className="text-gray-600 mt-1">{incident.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            RESOLVED
                          </span>
                          <span className="text-sm text-gray-500">
                            Resolved: {incident.endTime ? new Date(incident.endTime).toUTCString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {incident.rootCause && (
                        <div className="ml-4 text-right">
                          <p className="text-sm text-gray-600">Root Cause Found</p>
                          <p className="text-sm font-semibold text-gray-700 truncate max-w-xs">{incident.rootCause}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
