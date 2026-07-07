export interface Endpoint {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  uptime: number;
  lastChecked: string;
  latency: number;
}

export interface Incident {
  id: string;
  endpointId: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'open' | 'investigating' | 'resolved';
  startTime: string;
  endTime?: string;
  rootCause?: string;
  confidenceScore?: number;
  evidence?: string[];
  recommendations?: string[];
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  type: 'detection' | 'investigation' | 'resolution' | 'update';
}

export interface Alert {
  id: string;
  type: 'email' | 'slack' | 'discord';
  enabled: boolean;
  target: string;
  conditions: {
    severity: 'critical' | 'warning' | 'all';
    incidentType: string[];
  };
}

export interface DashboardMetrics {
  totalEndpoints: number;
  activeIncidents: number;
  upEndpoints: number;
  downEndpoints: number;
  avgLatency: number;
  uptimePercentage: number;
}

export interface Report {
  id: string;
  incidentId: string;
  title: string;
  summary: string;
  rootCause: string;
  confidenceScore: number;
  evidence: string[];
  recommendations: string[];
  generatedAt: string;
}
