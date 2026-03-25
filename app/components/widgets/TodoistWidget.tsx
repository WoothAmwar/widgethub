'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getInverseColor } from '../../utils/colors';

interface Task {
  id: string;
  content: string;
  description: string;
  due: string | null;
  priority: number;
  order: number;
}

interface Category {
  label: string;
  sectionId: string;
  taskCount: number;
  tasks: Task[];
}

interface TodoistWidgetProps {
  blur?: number;
  settings?: {
    refreshInterval?: number; // minutes
    [key: string]: any;
  };
  onSettingsChange?: (settings: any) => void;
  fontColor?: string;
}

export default function TodoistWidget({ blur = 0, settings, onSettingsChange, fontColor }: TodoistWidgetProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/todoist');
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setCategories(data.categories || []);
      setLastUpdated(data.lastUpdated);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // Auto-refresh based on settings
    const interval = (settings?.refreshInterval || 15) * 60 * 1000; // default 15 min
    if (interval > 0) {
      const id = setInterval(() => fetchTasks(), interval);
      return () => clearInterval(id);
    }
  }, [fetchTasks, settings?.refreshInterval]);

  const handleRefresh = () => {
    fetchTasks(true);
  };

  // Color utility
  const inverseColor = fontColor ? getInverseColor(fontColor) : '#000000';
  const bgLight = 'rgba(255,255,255,0.05)';
  const borderColor = fontColor ? `${fontColor}33` : 'rgba(255,255,255,0.1)';

  return (
    <div
      className="flex flex-col h-full w-full rounded-2xl overflow-hidden transition-colors duration-300 relative"
      style={{
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(0, 0, 0, 0)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor, backgroundColor: bgLight }}
      >
        <span className="font-bold text-sm" style={{ color: fontColor }}>
          Todoist
        </span>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] opacity-50 hidden sm:inline-block">
              {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-1 rounded hover:bg-white/10 transition"
            style={{ color: fontColor }}
            title="Refresh"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar">
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center h-full opacity-50">
            <RefreshCw className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-xs text-red-400">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button
              onClick={handleRefresh}
              className="underline"
              style={{ color: fontColor }}
            >
              Retry
            </button>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs opacity-50">
            No tasks
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.sectionId} className="flex flex-col">
              <div
                className="flex items-center justify-between px-2 py-1 text-[11px] uppercase font-bold tracking-wide mb-1"
                style={{ color: fontColor, opacity: 0.7 }}
              >
                <span>{cat.label}</span>
                <span className="opacity-50">{cat.taskCount}</span>
              </div>
              {cat.tasks.length === 0 ? (
                <div
                  className="text-xs italic opacity-30 px-2 py-1"
                  style={{ color: fontColor }}
                >
                  None
                </div>
              ) : (
                <div className="space-y-1">
                  {cat.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="group p-2 rounded-lg transition hover:bg-white/10"
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      title={task.description || task.content}
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            backgroundColor: cat.label === 'Done' ? '#22c55e' : cat.label === 'Waiting' ? '#f59e0b' : cat.label === 'Agent Queue' ? '#3b82f6' : fontColor || '#ffffff',
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm break-words leading-relaxed"
                            style={{
                              color: cat.label === 'Done' ? 'rgba(255,255,255,0.5)' : fontColor,
                              textDecoration: cat.label === 'Done' ? 'line-through' : 'none',
                            }}
                          >
                            {task.content}
                          </p>
                          {task.due && (
                            <p className="text-[10px] opacity-50 mt-0.5">
                              Due: {new Date(task.due).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
