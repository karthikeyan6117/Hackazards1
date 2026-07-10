'use client';

import { Endpoint, Incident } from '@/types';
import { StatusBadge } from '@/components/badges';

export interface EndpointCardProps {
  endpoint: Endpoint;
  recentIncidents: Incident[];
}

export function EndpointCard({ endpoint, recentIncidents }: EndpointCardProps) {
  const latestIncident = recentIncidents[0];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{endpoint.name}</h3>
          <p className="text-sm text-gray-500 truncate">{endpoint.url}</p>
        </div>
        <StatusBadge status={endpoint.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Uptime</p>
          <p className="text-2xl font-bold text-gray-900">{endpoint.uptime.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Latency</p>
          <p className="text-2xl font-bold text-gray-900">{endpoint.latency}ms</p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Last checked: {new Date(endpoint.lastChecked).toISOString().split('T')[1].slice(0, 8)}</p>
        {latestIncident && (
          <div className="bg-red-50 rounded p-2">
            <p className="text-sm font-medium text-red-900">{latestIncident.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}
