'use client';

import { Alert } from '@/types';
import { useState } from 'react';
import Link from 'next/link';

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'email',
    enabled: true,
    target: 'team@example.com',
    conditions: {
      severity: 'critical',
      incidentType: ['outage', 'performance'],
    },
  },
  {
    id: '2',
    type: 'slack',
    enabled: true,
    target: '#incidents',
    conditions: {
      severity: 'all',
      incidentType: ['all'],
    },
  },
  {
    id: '3',
    type: 'discord',
    enabled: false,
    target: 'Monitoring Channel',
    conditions: {
      severity: 'warning',
      incidentType: ['degradation'],
    },
  },
];

export default function SettingsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Alert Configuration</h1>
              <p className="text-gray-500 mt-1">Manage how you receive incident notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Notification Channels */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Channels</h2>
              <div className="space-y-6">
                {alerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">{alert.type}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              alert.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {alert.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-2">Target: {alert.target}</p>
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Alert Conditions:</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Severity: {alert.conditions.severity.charAt(0).toUpperCase() + alert.conditions.severity.slice(1)}</span>
                            <span>•</span>
                            <span>
                              Types: {alert.conditions.incidentType.includes('all') ? 'All' : alert.conditions.incidentType.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alert.enabled}
                            onChange={() => toggleAlert(alert.id)}
                            className="w-5 h-5 text-blue-600 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">Enable</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Channel Button */}
              <button className="mt-8 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + Add Notification Channel
              </button>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Settings</h2>
              <div className="space-y-6">
                {/* Alert Delay */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Alert Delay</label>
                  <p className="text-sm text-gray-600 mb-2">Wait before sending alerts for new incidents</p>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Immediate (no delay)</option>
                    <option>30 seconds</option>
                    <option>1 minute</option>
                    <option>5 minutes</option>
                  </select>
                </div>

                {/* Quiet Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quiet Hours</label>
                  <p className="text-sm text-gray-600 mb-2">Do not send alerts during these hours</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <input type="time" defaultValue="22:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <input type="time" defaultValue="08:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* Escalation */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Critical Incident Escalation</label>
                  <p className="text-sm text-gray-600 mb-2">Automatically escalate critical incidents after X minutes</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      defaultValue="15"
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    <span className="text-gray-600">minutes</span>
                  </div>
                </div>

                {/* Alert Aggregation */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Aggregate multiple alerts into single notification</span>
                  </label>
                </div>
              </div>

              <button className="mt-8 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Save Settings
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Channels */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Channels</h3>
              <div className="space-y-3">
                {alerts
                  .filter((a) => a.enabled)
                  .map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">{alert.type}</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </div>
                  ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {alerts.filter((a) => a.enabled).length} of {alerts.length} channels active
              </p>
            </div>

            {/* Integration Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <span className="text-xs text-gray-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-700">Slack</span>
                  </div>
                  <span className="text-xs text-gray-500">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-700">Discord</span>
                  </div>
                  <span className="text-xs text-gray-500">Disconnected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
