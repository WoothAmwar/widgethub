'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCw, ListTodo, Check } from 'lucide-react';
import { getInverseColor } from '../../utils/colors';

interface Task {
  id: string;
  content: string;
  section_name: string;
  is_completed: boolean;
}

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
  const [serverTasks, setServerTasks] = useState<Task[]>([]);
  const [localCompletedMap, setLocalCompletedMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async (forceSync = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (settings?.apiToken) params.append('token', settings.apiToken);
      if (settings?.projectId) params.append('projectId', settings.projectId);
      params.append('t', Date.now().toString());
      const res = await fetch(`/api/todoist?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data: Task[] = await res.json();
      
      setServerTasks(data);
      
      // Determine if we should sync pending updates to Todoist before refreshing
      const interval = settings?.refreshInterval || 300000;
      const timeSinceSync = Date.now() - lastSyncTime;
      const shouldSyncNow = forceSync || timeSinceSync >= interval;
      
      if (shouldSyncNow && Object.keys(pendingUpdates).length > 0) {
        // Sync all pending updates to Todoist
        const updatePromises = Object.entries(pendingUpdates).map(([taskId, isCompleted]) => {
          const token = settings?.apiToken || process.env.TODOIST_TOKEN;
          const projectId = settings?.projectId || process.env.TODOIST_PROJECT_ID;
          if (!token || !projectId) return Promise.resolve();
          
          return fetch('/api/todoist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId, isCompleted }),
          });
        });
        await Promise.all(updatePromises);
        setPendingUpdates({});
      }
      
      // Update last sync time if we synced or just fetched fresh data
      if (shouldSyncNow) {
        setLastSyncTime(Date.now());
      }
      
      // Merge server tasks with any pending local changes that weren't synced yet
      // Store completed status from server in localCompletedMap, but preserve unsynced changes
      const newLocalMap: Record<string, boolean> = { ...localCompletedMap };
      for (const task of data) {
        if (!(task.id in pendingUpdates)) {
          newLocalMap[task.id] = task.is_completed;
        }
      }
      setLocalCompletedMap(newLocalMap);
    } catch (e) {
      setError('Unable to load tasks');
    } finally {
      setLoading(false);
    }
  }, [settings, lastSyncTime, pendingUpdates, localCompletedMap]);

  useEffect(() => {
    refresh();
    const interval = settings?.refreshInterval || 300000;
    if (interval > 0) {
      const id = setInterval(() => setRefreshKey((k) => k + 1), interval);
      return () => clearInterval(id);
    }
  }, [refreshKey, settings?.refreshInterval, settings?.apiToken, settings?.projectId]);

  const toggleTask = async (taskId: string) => {
    const current = localCompletedMap[taskId] || false;
    const newValue = !current;
    
    // Update local state immediately
    setLocalCompletedMap(prev => ({ ...prev, [taskId]: newValue }));
    setPendingUpdates(prev => ({ ...prev, [taskId]: newValue }));
  };

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
          onClick={() => refresh()}
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
          <h3 className="font-bold mb-3 text-xl" style={{ color: fontColor || 'inherit' }}>ToDoist</h3>
          {(() => {
            const groups: Record<string, Task[]> = {};
            for (const t of serverTasks) {
              const sec = t.section_name || 'No Section';
              if (!groups[sec]) groups[sec] = [];
              groups[sec].push(t);
            }
            return Object.entries(groups).map(([section, tasks]) => (
              <div key={section} className="mb-4">
                <h4 className="text-xs font-bold uppercase opacity-60 mb-1">{section}</h4>
                <ul className="space-y-1">
                  {tasks.map((t) => {
                    const isCompleted = localCompletedMap[t.id] || false;
                    return (
                      <li key={t.id} className="group flex items-center gap-2 bg-white/5 p-2 rounded-lg hover:bg-white/10 transition">
                        <button
                          onClick={() => toggleTask(t.id)}
                          className="w-5 h-5 rounded border flex items-center justify-center transition flex-shrink-0"
                          style={{
                            backgroundColor: isCompleted ? (fontColor || '#22c55e') : 'transparent',
                            borderColor: fontColor || (isCompleted ? '#22c55e' : 'rgba(255,255,255,0.3)')
                          }}
                          title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {isCompleted && <Check size={12} style={{ color: fontColor ? getInverseColor(fontColor) : '#000000' }} />}
                        </button>
                        <span 
                          className={`text-sm truncate flex-1 ${isCompleted ? 'line-through opacity-30' : ''}`} 
                          style={{ color: fontColor || 'inherit' }}
                          title={t.content}
                        >
                          {t.content}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
