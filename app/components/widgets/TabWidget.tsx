'use client';

import { useState } from 'react';

interface TabWidgetProps {
  blur?: number;
  isEditing?: boolean;
  isHidden?: boolean;
  settings?: {
    url?: string;
    useProxy?: boolean;
  };
  onSettingsChange?: (settings: { url?: string; useProxy?: boolean }) => void;
}

const DEFAULT_URL = 'https://example.com';

export default function TabWidget({ 
  blur = 0, 
  isEditing = false, 
  isHidden = false, 
  settings, 
  onSettingsChange 
}: TabWidgetProps) {
  const [url, setUrl] = useState(settings?.url || DEFAULT_URL);
  const [useProxy, setUseProxy] = useState(settings?.useProxy || false);

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
      className="flex flex-col w-full h-full rounded-2xl overflow-hidden relative transition-colors duration-300"
      style={{ 
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(0, 0, 0, 0)`
      }}
    >
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
  );
}