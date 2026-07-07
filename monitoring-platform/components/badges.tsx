'use client';

export interface StatusBadgeProps {
  status: 'up' | 'down' | 'degraded';
  text?: string;
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const statusColors = {
    up: 'bg-green-100 text-green-800 border-green-300',
    down: 'bg-red-100 text-red-800 border-red-300',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  const statusDots = {
    up: 'bg-green-500',
    down: 'bg-red-500',
    degraded: 'bg-yellow-500',
  };

  const displayText = text || (status === 'up' ? 'Operational' : status === 'down' ? 'Down' : 'Degraded');

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${statusColors[status]}`}
    >
      <span className={`w-2 h-2 rounded-full ${statusDots[status]} animate-pulse`} />
      {displayText}
    </span>
  );
}

export interface SeverityBadgeProps {
  severity: 'critical' | 'warning' | 'info';
  text?: string;
}

export function SeverityBadge({ severity, text }: SeverityBadgeProps) {
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-orange-100 text-orange-800 border-orange-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const displayText = text || severity.charAt(0).toUpperCase() + severity.slice(1);

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${severityColors[severity]}`}>
      {displayText}
    </span>
  );
}
