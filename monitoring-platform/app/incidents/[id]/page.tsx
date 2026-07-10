'use client';

import { Incident } from '@/types';
import Link from 'next/link';
import { use } from 'react';

const NOW = '2026-06-23T08:24:38.000Z';

const mockIncidentsData: Record<string, Incident> = {
  '1': {
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
      'Configuration drift detected in load balancer state',
      'Traffic pattern anomaly starting at 14:32 UTC',
    ],
    recommendations: [
      'Rollback to previous stable deployment',
      'Investigate load balancer configuration changes',
      'Implement automated rollback on error threshold',
      'Add configuration validation to deployment pipeline',
      'Enable continuous monitoring of load balancer health',
    ],
    timeline: [
      {
        timestamp: new Date(new Date(NOW).getTime() - 3600000).toISOString(),
        event: 'Incident detected: CDN latency spike to 5000ms',
        type: 'detection',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 3300000).toISOString(),
        event: 'Critical alert triggered for endpoint down',
        type: 'detection',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 2700000).toISOString(),
        event: 'AI investigation started - analyzing recent deployments',
        type: 'investigation',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 2400000).toISOString(),
        event: 'Root cause identified: load balancer misconfiguration',
        type: 'investigation',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 2100000).toISOString(),
        event: 'Recommended remediation steps generated',
        type: 'update',
      },
    ],
  },
  '2': {
    id: '2',
    endpointId: '3',
    title: 'Database Latency Degradation',
    description: 'Primary database experiencing elevated query times',
    severity: 'warning',
    status: 'open',
    startTime: new Date(new Date(NOW).getTime() - 7200000).toISOString(),
    rootCause: 'Long-running query blocking connection pool',
    confidenceScore: 0.92,
    evidence: [
      'Query execution time: 45s average (normal: 500ms)',
      'Connection pool saturation at 95%',
      'Specific query identified: SELECT * FROM large_table with missing index',
      'Query performance degradation started 2 hours ago',
      'No recent schema changes detected',
    ],
    recommendations: [
      'Optimize slow query - add index on filter columns',
      'Increase connection pool size from 50 to 100',
      'Implement query timeout (currently: no timeout)',
      'Add slow query monitoring to alerts',
      'Review and optimize other similar queries',
    ],
    timeline: [
      {
        timestamp: new Date(new Date(NOW).getTime() - 7200000).toISOString(),
        event: 'Latency spike detected - p95 latency 2500ms',
        type: 'detection',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 6900000).toISOString(),
        event: 'Database warning threshold exceeded',
        type: 'detection',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 6600000).toISOString(),
        event: 'AI gathering query logs and connection metrics',
        type: 'investigation',
      },
      {
        timestamp: new Date(new Date(NOW).getTime() - 6300000).toISOString(),
        event: 'Slow query identified in logs',
        type: 'investigation',
      },
    ],
  },
};

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const incident = mockIncidentsData[id];

  if (!incident) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/incidents" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Incidents
          </Link>
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Incident not found</p>
          </div>
        </div>
      </main>
    );
  }

  const statusColor = {
    open: 'bg-red-100 text-red-800',
    investigating: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  };

  const severityColor = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/incidents" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Incidents
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
              <p className="text-gray-600 mt-2">{incident.description}</p>
              <div className="flex items-center gap-4 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColor[incident.severity]}`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor[incident.status]}`}>
                  {incident.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">Started: {new Date(incident.startTime).toUTCString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Analysis Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">AI Analysis</h2>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Confidence Score</p>
                  <p className="text-3xl font-bold text-blue-600">{(incident.confidenceScore! * 100).toFixed(0)}%</p>
                </div>
              </div>

              {/* Root Cause */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Root Cause</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-gray-800 font-medium">{incident.rootCause}</p>
                </div>
              </div>

              {/* Evidence */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Supporting Evidence</h3>
                <div className="space-y-3">
                  {incident.evidence?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-green-600 font-bold mt-1">✓</span>
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Actions</h3>
                <div className="space-y-3">
                  {incident.recommendations?.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <span className="text-amber-600 font-bold mt-1">{idx + 1}</span>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Incident Timeline</h2>
              <div className="space-y-6">
                {incident.timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          event.type === 'detection'
                            ? 'bg-red-600'
                            : event.type === 'investigation'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                        }`}
                      />
                      {idx < incident.timeline.length - 1 && <div className="w-1 h-16 bg-gray-300 mt-2" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-gray-500">{new Date(event.timestamp).toUTCString()}</p>
                      <p className="text-gray-900 font-medium mt-1">{event.event}</p>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded inline-block mt-2">
                        {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-gray-900 font-medium capitalize">{incident.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Severity</p>
                  <p className="text-gray-900 font-medium capitalize">{incident.severity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-gray-900 font-medium">
                    {incident.endTime
                      ? `${Math.round(
                          (new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime()) / 60000
                        )} minutes`
                      : `${Math.round((new Date(NOW).getTime() - new Date(incident.startTime).getTime()) / 60000)} minutes ongoing`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Endpoint</p>
                  <p className="text-gray-900 font-medium">Endpoint #{incident.endpointId}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-3">
                View Full Report
              </button>
              <button className="w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                Generate Postmortem
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
