'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

interface TabWidgetProps {
  blur?: number;
  isEditing?: boolean;
  isHidden?: boolean;
  settings?: {
    url?: string;
    useProxy?: boolean;
  };
  onSettingsChange?: (settings: { url?: string; useProxy?: boolean }) => void;
  fontColor?: string;
}

const DEFAULT_URL = 'https://example.com';

export default function TabWidget({ 
  blur = 0, 
  isEditing = false, 
  isHidden = false, 
  settings, 
  onSettingsChange,
  fontColor
}: TabWidgetProps) {
  const [url, setUrl] = useState(settings?.url || DEFAULT_URL);
  const [useProxy, setUseProxy] = useState(settings?.useProxy || false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Force expand in edit mode
  useEffect(() => {
    if (isEditing) {
      setIsCollapsed(false);
    }
  }, [isEditing]);

  // Sync settings
  const handleUrlChange = (urlValue: string) => {
    setUrl(urlValue);
    if (onSettingsChange) onSettingsChange({ ...settings, url: urlValue, useProxy });
  };

  const handleUseProxyChange = (proxyValue: boolean) => {
    setUseProxy(proxyValue);
    if (onSettingsChange) onSettingsChange({ ...settings, url, useProxy: proxyValue });
  };

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div 
      className={`flex flex-col w-full rounded-2xl overflow-hidden relative transition-all duration-300 ${isCollapsed ? 'h-12 bg-black/20' : 'h-full'}`}
      style={{ 
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(0, 0, 0, 0)`
      }}
    >
      {/* Collapse Toggle - Only in View Mode */}
      {!isEditing && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-2 right-2 z-50 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors text-white"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      )}

      {isCollapsed && (
        <div className="flex items-center px-4 h-12 w-full justify-between pr-10">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs opacity-60">🔗</span>
            <span className="text-xs font-medium truncate opacity-70" style={{ color: fontColor }}>
              {url.replace(/^https?:\/\//, '').split('/')[0]}
            </span>
          </div>
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 hover:bg-white/10 rounded transition-colors"
            title="Open in new tab"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} className="opacity-50" style={{ color: fontColor }} />
          </a>
        </div>
      )}

      <div className={`flex flex-col h-full w-full ${isCollapsed ? 'hidden' : ''}`}>
        {isEditing ? (
        <div className="flex flex-col h-full w-full p-4 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-60">🔗</span>
            <span className="text-sm font-medium opacity-70">Tab Widget</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs opacity-60 block">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              className={`w-full bg-white/10 rounded px-3 py-2 text-sm ${!validateUrl(url) ? 'border border-red-500' : ''}`}
            />
            {!validateUrl(url) && (
              <p className="text-xs text-red-400">Please enter a valid URL</p>
            )}
          </div>
          
          <div className="space-y-2 mt-2">
            <label className="flex items-start space-x-2 text-sm opacity-80 cursor-pointer">
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => handleUseProxyChange(e.target.checked)}
                className="mt-1 rounded bg-white/10 border-transparent focus:border-transparent focus:ring-0"
              />
              <span className="text-xs">Use Proxy (Bypasses security restrictions for unsupported sites. May break some sites.)</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full w-full relative">
          <iframe
            src={useProxy ? `/api/proxy?url=${encodeURIComponent(url)}` : url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
              background: '#1a1a1a'
            }}
            title="Tab Widget"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      )}
      </div>
    </div>
  );
}