'use client';

import { Alert, NotificationSettings } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { backendGet, backendPut, backendPost, backendDelete } from '@/lib/backend';

const getAlertKey = (alert: Alert) =>
  alert.id ?? `${alert.type}-${alert.target}-${alert.conditions.severity}-${alert.conditions.incidentType.join(',')}`;

const normalizeChannel = (channel: Partial<Alert> & { name?: Alert['type']; enabled: boolean; target: string; conditions?: Alert['conditions'] }): Alert => {
  const type = channel.type ?? channel.name ?? 'email';
  const id = channel.id ?? `${type}-${channel.target}`;

  return {
    id,
    type,
    enabled: channel.enabled,
    target: channel.target,
    conditions: channel.conditions ?? {
      severity: 'all',
      incidentType: ['all'],
    },
  };
};

const defaultMuteStart = '22:00';
const defaultMuteEnd = '08:00';

const INCIDENT_TYPES = ['outage', 'performance', 'degradation', 'security', 'maintenance'];

interface ModalForm {
  type: 'email' | 'slack' | 'discord';
  target: string;
  severity: 'critical' | 'warning' | 'all';
  incidentType: string[];
  enabled: boolean;
}

const emptyForm: ModalForm = {
  type: 'email',
  target: '',
  severity: 'all',
  incidentType: ['all'],
  enabled: true,
};

export default function SettingsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertDelay, setAlertDelay] = useState(30);
  const [quietStart, setQuietStart] = useState(defaultMuteStart);
  const [quietEnd, setQuietEnd] = useState(defaultMuteEnd);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ModalForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ModalForm, string>>>({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    try {
      const settings = await backendGet<NotificationSettings>('/api/notifications/settings');
      setAlerts(settings.channels.map((channel) => normalizeChannel(channel)));
      setAlertDelay(settings.alert_delay_seconds);

      if (settings.mute_hours.length > 0) {
        const [start, end] = settings.mute_hours[0].split('-');
        setQuietStart(start ?? defaultMuteStart);
        setQuietEnd(end ?? defaultMuteEnd);
      }
    } catch {
      setError('Unable to load notification settings from backend.');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setLoading(true);
      setError(null);
      await loadChannels();
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [loadChannels]);

  const toggleAlert = async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert || !id) return;

    try {
      await backendDelete(`/api/notifications/${id}`);
      setAlerts((current) => current.filter((a) => a.id !== id));
    } catch {
      setAlerts((current) => current.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
    }
  };

  const deleteChannel = async (id: string) => {
    if (!id) return;
    try {
      await backendDelete(`/api/notifications/${id}`);
      setAlerts((current) => current.filter((a) => a.id !== id));
    } catch {
      setError('Failed to delete channel.');
    }
  };

  const saveSettings = async () => {
    setError(null);
    setSaving(true);
    setSavedMessage(null);

    try {
      const payload: NotificationSettings = {
        channels: alerts,
        alert_delay_seconds: alertDelay,
        mute_hours: [`${quietStart}-${quietEnd}`],
      };
      const updated = await backendPut<NotificationSettings>('/api/notifications/settings', payload);
      setAlerts(updated.channels.map((ch) => normalizeChannel(ch)));
      setAlertDelay(updated.alert_delay_seconds);
      setSavedMessage('Settings saved successfully.');
    } catch {
      setError('Unable to save notification settings to backend.');
    } finally {
      setSaving(false);
    }
  };

  const openModal = () => {
    setForm(emptyForm);
    setFormErrors({});
    setCreateError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCreateError(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ModalForm, string>> = {};

    if (!form.target.trim()) {
      errors.target = 'Target is required.';
    } else if (form.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.target)) {
      errors.target = 'Enter a valid email address.';
    } else if (form.type === 'slack' && !form.target.startsWith('#') && !form.target.startsWith('@')) {
      errors.target = 'Slack target should start with # or @.';
    }

    if (form.severity !== 'all' && form.severity !== 'critical' && form.severity !== 'warning') {
      errors.severity = 'Select a valid severity.';
    }

    if (form.incidentType.length === 0) {
      errors.incidentType = 'Select at least one incident type.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setCreating(true);
    setCreateError(null);

    try {
      const created = await backendPost<Alert>('/api/notifications', {
        type: form.type,
        target: form.target.trim(),
        enabled: form.enabled,
        conditions: {
          severity: form.severity,
          incidentType: form.incidentType,
        },
      });
      setAlerts((current) => [...current, normalizeChannel(created)]);
      setModalOpen(false);
      setSavedMessage('Channel added successfully.');
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create channel.');
    } finally {
      setCreating(false);
    }
  };

  const activeChannelTypes = alerts.filter((a) => a.enabled).map((a) => a.type);
  const hasType = (type: string) => activeChannelTypes.includes(type as Alert['type']);

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

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading channels...</p>
                </div>
              )}

              {!loading && alerts.length === 0 && (
                <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No notification channels configured.</p>
                  <p className="text-sm text-gray-400 mt-1">Click the button below to add your first channel.</p>
                </div>
              )}

              {!loading && alerts.length > 0 && (
                <div className="space-y-6">
                  {alerts.map((alert) => (
                    <div key={getAlertKey(alert)} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
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
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alert.enabled}
                              onChange={() => toggleAlert(getAlertKey(alert))}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Enable</span>
                          </label>
                          {alert.id && (
                            <button
                              onClick={() => deleteChannel(alert.id!)}
                              className="text-xs text-red-500 hover:text-red-700 mt-1"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Channel Button */}
              <button
                onClick={openModal}
                className="mt-8 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
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
                  <select
                    value={alertDelay}
                    onChange={(event) => setAlertDelay(Number(event.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Immediate (no delay)</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </div>

                {/* Quiet Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Quiet Hours</label>
                  <p className="text-sm text-gray-600 mb-2">Do not send alerts during these hours</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={quietStart}
                        onChange={(event) => setQuietStart(event.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">End Time</label>
                      <input
                        type="time"
                        value={quietEnd}
                        onChange={(event) => setQuietEnd(event.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
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
                      value={15}
                      readOnly
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
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

              <button
                className="mt-8 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-60"
                type="button"
                onClick={saveSettings}
                disabled={loading || saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
              {savedMessage && <p className="mt-4 text-sm text-green-600">{savedMessage}</p>}
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
                    <div key={getAlertKey(alert)} className="flex items-center justify-between">
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
                {(['email', 'slack', 'discord'] as const).map((type) => {
                  const active = hasType(type);
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        <span className="text-sm font-medium text-gray-700 capitalize">{type}</span>
                      </div>
                      <span className={`text-xs ${active ? 'text-green-600' : 'text-gray-400'}`}>
                        {active ? 'Connected' : 'Not configured'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Channel Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Notification Channel</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>

            <div className="space-y-5">
              {/* Channel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ModalForm['type'] }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="email">Email</option>
                  <option value="slack">Slack</option>
                  <option value="discord">Discord</option>
                </select>
              </div>

              {/* Target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <input
                  type="text"
                  value={form.target}
                  onChange={(e) => setForm((f) => ({ ...f, target: e.target.value }))}
                  placeholder={
                    form.type === 'email' ? 'ops@example.com' :
                    form.type === 'slack' ? '#channel-name' :
                    'webhook-url or channel-name'
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.target ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {formErrors.target && <p className="mt-1 text-xs text-red-500">{formErrors.target}</p>}
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as ModalForm['severity'] }))}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.severity ? 'border-red-400' : 'border-gray-300'
                  }`}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical Only</option>
                  <option value="warning">Warning Only</option>
                </select>
                {formErrors.severity && <p className="mt-1 text-xs text-red-500">{formErrors.severity}</p>}
              </div>

              {/* Incident Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incident Types</label>
                <div className="flex flex-wrap gap-2">
                  {INCIDENT_TYPES.map((it) => {
                    const selected = form.incidentType.includes(it);
                    return (
                      <button
                        key={it}
                        type="button"
                        onClick={() => {
                          setForm((f) => {
                            const hasAll = f.incidentType.includes('all');
                            let next: string[];
                            if (it === 'all') {
                              next = ['all'];
                            } else if (hasAll) {
                              next = [it];
                            } else if (selected) {
                              next = f.incidentType.filter((t) => t !== it);
                              if (next.length === 0) next = ['all'];
                            } else {
                              next = [...f.incidentType, it];
                            }
                            return { ...f, incidentType: next };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {it === 'all' ? 'All' : it.charAt(0).toUpperCase() + it.slice(1)}
                      </button>
                    );
                  })}
                </div>
                {formErrors.incidentType && <p className="mt-1 text-xs text-red-500">{formErrors.incidentType}</p>}
              </div>

              {/* Enable Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable this channel</span>
                </label>
              </div>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{createError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create Channel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
