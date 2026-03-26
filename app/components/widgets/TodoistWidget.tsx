'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, ListTodo } from 'lucide-react';

interface TodoistWidgetProps {
  blur?: number;
  isEditing?: boolean;
  isHidden?: boolean;
  settings?: {
    refreshInterval?: number;
    apiToken?: string;
    projectId?: string;
  };
  onSettingsChange?: (settings: { refreshInterval?: number; apiToken?: string; projectId?: string }) => void;
  fontColor?: string;
}

export default function TodoistWidget({
  blur = 0,
  isEditing = false,
  isHidden = false,
  settings,
  onSettingsChange,
  fontColor,
}: TodoistWidgetProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (settings?.apiToken) params.append('token', settings.apiToken);
      if (settings?.projectId) params.append('projectId', settings.projectId);
      params.append('t', Date.now().toString());
      const res = await fetch(`/api/todoist?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      setError('Unable to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = settings?.refreshInterval || 300000;
    if (interval > 0) {
      const id = setInterval(() => setRefreshKey((k) => k + 1), interval);
      return () => clearInterval(id);
    }
  }, [refreshKey, settings?.refreshInterval, settings?.apiToken, settings?.projectId]);

  if (isEditing) {
    return (
      <div className="flex flex-col h-full w-full p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <ListTodo className="w-6 h-6 text-blue-400" />
          <span className="text-sm font-medium opacity-70">Todoist Widget</span>
        </div>
        <p className="text-sm opacity-60">
          Displays tasks from your Todoist project by section.
        </p>
        <div className="space-y-2">
          <label className="text-xs opacity-60 block">API Token</label>
          <input
            type="password"
            value={settings?.apiToken || ''}
            onChange={(e) => onSettingsChange?.({ ...(settings || {}), apiToken: e.target.value })}
            placeholder="your-todoist-api-token"
            className="w-full bg-white/10 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs opacity-60 block">Project ID</label>
          <input
            type="text"
            value={settings?.projectId || ''}
            onChange={(e) => onSettingsChange?.({ ...(settings || {}), projectId: e.target.value })}
            placeholder="your-project-id"
            className="w-full bg-white/10 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs opacity-60 block">Refresh interval (seconds)</label>
          <input
            type="number"
            value={settings?.refreshInterval || 300}
            onChange={(e) => onSettingsChange?.({ ...(settings || {}), refreshInterval: parseInt(e.target.value) || 300 })}
            min="60"
            className="w-full bg-white/10 rounded px-3 py-2 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full rounded-2xl overflow-hidden relative"
      style={{ backdropFilter: `blur(${blur}px)` }}
    >
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={refresh}
          disabled={loading}
          className="p-1 bg-black/50 rounded-full hover:bg-white/20 text-white/70"
          title="Refresh"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-red-400">
          <p>{error}</p>
        </div>
      )}

      {!error && (
        <div className="p-3 overflow-y-auto h-full">
          {(() => {
            const groups: Record<string, any[]> = {};
            for (const t of tasks) {
              const sec = t.section_name || 'No Section';
              if (!groups[sec]) groups[sec] = [];
              groups[sec].push(t);
            }
            return Object.entries(groups).map(([section, ts]) => (
              <div key={section} className="mb-4">
                <h4 className="text-xs font-bold uppercase opacity-60 mb-1">{section}</h4>
                <ul className="space-y-1">
                  {ts.map((t) => (
                    <li key={t.id} className="text-sm truncate" title={t.content}>
                      {t.content}
                    </li>
                  ))}
                </ul>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
