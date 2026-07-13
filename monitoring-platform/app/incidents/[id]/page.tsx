'use client';

import { Incident } from '@/types';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { backendGet, backendPost } from '@/lib/backend';

const inlineTokens = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-gray-100 text-sm text-slate-900 px-1 py-0.5 rounded">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const parseMarkdown = (markdown: string) => {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const blocks: Array<any> = [];
  let paragraphLines: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listItems: string[] = [];
  let codeBlock: string[] = [];
  let codeLang = '';
  let tableHeader: string[] | null = null;
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      blocks.push({ type: listType, items: [...listItems] });
      listItems = [];
      listType = null;
    }
  };

  const flushTable = () => {
    if (tableHeader && tableRows.length > 0) {
      blocks.push({ type: 'table', header: tableHeader, rows: [...tableRows] });
      tableHeader = null;
      tableRows = [];
    }
  };

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (line.startsWith('```')) {
      if (codeBlock.length > 0) {
        blocks.push({ type: 'code', code: codeBlock.join('\n'), lang: codeLang });
        codeBlock = [];
        codeLang = '';
      } else {
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (codeBlock.length > 0 || codeLang !== '') {
      codeBlock.push(raw);
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);
    const tableSepMatch = line.match(/^\|?\s*[:-]+[\|:\s-]*$/);
    const tableLineMatch = line.match(/\|/g);

    if (headingMatch) {
      flushParagraph();
      flushList();
      flushTable();
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }

    if (tableHeader && tableSepMatch) {
      continue;
    }

    if (tableHeader && line.includes('|')) {
      const row = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
      if (row.length > 0) {
        tableRows.push(row);
        continue;
      }
    }

    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].match(/^\|?\s*[:-]+[\|:\s-]*$/)) {
      flushParagraph();
      flushList();
      tableHeader = line
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0);
      i += 1;
      continue;
    }

    if (ulMatch) {
      flushParagraph();
      flushTable();
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(ulMatch[1]);
      continue;
    }

    if (olMatch) {
      flushParagraph();
      flushTable();
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(olMatch[1]);
      continue;
    }

    if (line === '') {
      flushParagraph();
      flushList();
      flushTable();
      continue;
    }

    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushTable();
  return blocks;
};

const renderMarkdownBlocks = (markdown: string) => {
  return parseMarkdown(markdown).map((block, index) => {
    switch (block.type) {
      case 'heading':
        if (block.level === 1) {
          return (
            <h1 key={index} className="text-2xl font-bold text-slate-900 mt-6 mb-4">
              {inlineTokens(block.text)}
            </h1>
          );
        }
        if (block.level === 2) {
          return (
            <h2 key={index} className="text-xl font-semibold text-slate-900 mt-6 mb-3">
              {inlineTokens(block.text)}
            </h2>
          );
        }
        return (
          <h3 key={index} className="text-lg font-semibold text-slate-900 mt-6 mb-3">
            {inlineTokens(block.text)}
          </h3>
        );
      case 'paragraph':
        return (
          <p key={index} className="text-gray-700 leading-7">
            {inlineTokens(block.text)}
          </p>
        );
      case 'ul':
        return (
          <ul key={index} className="list-disc list-inside space-y-2 text-gray-700">
            {block.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex}>{inlineTokens(item)}</li>
            ))}
          </ul>
        );
      case 'ol':
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 text-gray-700">
            {block.items.map((item: string, itemIndex: number) => (
              <li key={itemIndex}>{inlineTokens(item)}</li>
            ))}
          </ol>
        );
      case 'code':
        return (
          <pre key={index} className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{block.code}</code>
          </pre>
        );
      case 'table':
        return (
          <div key={index} className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  {block.header.map((cell: string, cellIndex: number) => (
                    <th key={cellIndex} className="border border-slate-300 bg-slate-100 px-3 py-2 text-left text-sm font-semibold text-slate-900">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="border border-slate-300 px-3 py-2 text-sm text-slate-700">
                        {inlineTokens(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  });
};

const ReportModal = ({ markdown, onClose }: { markdown: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 overflow-auto bg-black/40 px-4 py-8">
    <div className="mx-auto w-full max-w-5xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Generated Postmortem</h2>
          <p className="text-sm text-slate-500">Rendered from the AI postmortem markdown.</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          type="button"
        >
          Close
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-6 space-y-6">
        {renderMarkdownBlocks(markdown)}
      </div>
    </div>
  </div>
);

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncident() {
      try {
        const data = await backendGet<Incident>(`/api/incidents/${id}`);
        setIncident(data);
      } catch (error) {
        console.error('Failed to fetch incident:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchIncident();
  }, [id]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading incident...</div>
      </main>
    );
  }

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

  const showReport = () => {
    if (!reportMarkdown) {
      setToastMessage('No report has been generated yet.');
      return;
    }
    setReportOpen(true);
  };

  const mapIncidentToRequest = (incident: Incident) => {
    const nowMs = Date.now();
    const durationMs = incident.endTime
      ? Math.max(0, new Date(incident.endTime).getTime() - new Date(incident.startTime).getTime())
      : Math.max(1000, Math.round(nowMs - new Date(incident.startTime).getTime()));

    return {
      incident_id: incident.id,
      endpoint: `Endpoint #${incident.endpointId}`,
      status_code:
        incident.severity === 'critical'
          ? 500
          : incident.severity === 'warning'
          ? 503
          : 400,
      latency: durationMs,
      error_message: incident.rootCause ?? incident.description ?? incident.title,
      logs: incident.timeline.map((event) => `${event.timestamp} - ${event.event}`),
      recent_incidents: incident.evidence ?? [],
      deployment_info: incident.rootCause?.includes('deployment') ? incident.rootCause : undefined,
      system_metrics: {
        confidence_score: incident.confidenceScore ?? 0,
        timeline_events: incident.timeline.length,
      },
      service_name: incident.title,
      environment: 'production',
      timestamp: incident.startTime,
    };
  };

  const generatePostmortem = async () => {
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);
    setToastMessage(null);

    try {
      const payload = mapIncidentToRequest(incident);
      const data = await backendPost<{ markdown: string }>('/api/ai/postmortem', payload);
      if (typeof data.markdown === 'string') {
        setReportMarkdown(data.markdown);
        setReportOpen(true);
      } else {
        setToastMessage('Unable to generate postmortem.');
      }
    } catch (error) {
      setToastMessage('Unable to generate postmortem.');
    } finally {
      setIsGenerating(false);
    }
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
                  <p className="text-3xl font-bold text-blue-600">{incident.confidenceScore != null ? `${(incident.confidenceScore * 100).toFixed(0)}%` : 'N/A'}</p>
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
                      : `${Math.round((Date.now() - new Date(incident.startTime).getTime()) / 60000)} minutes ongoing`}
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
              <button
                type="button"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-3 disabled:cursor-not-allowed disabled:bg-blue-400"
                onClick={showReport}
              >
                View Full Report
              </button>
              <button
                type="button"
                className="w-full bg-gray-200 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={generatePostmortem}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Generating...
                  </span>
                ) : (
                  'Generate Postmortem'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {reportOpen && reportMarkdown ? <ReportModal markdown={reportMarkdown} onClose={() => setReportOpen(false)} /> : null}
      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-5 py-3 text-sm text-white shadow-lg shadow-slate-900/10">
          {toastMessage}
        </div>
      ) : null}
    </main>
  );
}
