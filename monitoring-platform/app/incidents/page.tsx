'use client';

import { Incident } from '@/types';
import Link from 'next/link';
import { backendGet } from '@/lib/backend';
import { useEffect, useState } from 'react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIncidents() {
      try {
        const data = await backendGet<Incident[]>('/api/incidents');
        setIncidents(data);
      } catch (error) {
        console.error('Failed to fetch incidents:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, []);

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved');

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading incidents...</div>
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
                      {incident.confidenceScore != null && (
                        <div className="ml-4 text-right">
                          <p className="text-sm text-gray-600">AI Confidence</p>
                          <p className="text-2xl font-bold text-blue-600">{(incident.confidenceScore * 100).toFixed(0)}%</p>
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

        {incidents.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
            <h2 className="text-xl font-semibold text-gray-900">No incidents recorded</h2>
            <p className="mt-3">Incidents will appear here when endpoints experience issues.</p>
          </div>
        )}
      </div>
    </main>
  );
}
