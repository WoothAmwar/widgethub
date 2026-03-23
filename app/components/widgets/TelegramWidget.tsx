'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface TelegramWidgetProps {
  blur?: number;
  isEditing?: boolean;
  isHidden?: boolean;
  settings?: {
    botUsername?: string;
    webAppUrl?: string;
    startParam?: string;
    height?: number;
  };
  onSettingsChange?: (settings: { botUsername?: string; webAppUrl?: string; startParam?: string; height?: number }) => void;
}

const DEFAULT_BOT_USERNAME = 'Oothbot';
const DEFAULT_HEIGHT = 400;

export default function TelegramWidget({ 
  blur = 0, 
  isEditing = false, 
  isHidden = false, 
  settings, 
  onSettingsChange 
}: TelegramWidgetProps) {
  const [botUsername, setBotUsername] = useState(settings?.botUsername || DEFAULT_BOT_USERNAME);
  const [webAppUrl, setWebAppUrl] = useState(settings?.webAppUrl || '');
  const [startParam, setStartParam] = useState(settings?.startParam || '');
  const [height, setHeight] = useState(settings?.height || DEFAULT_HEIGHT);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync settings
  useEffect(() => {
    if (settings?.botUsername) setBotUsername(settings.botUsername);
    if (settings?.webAppUrl !== undefined) setWebAppUrl(settings.webAppUrl || '');
    if (settings?.startParam !== undefined) setStartParam(settings.startParam || '');
    if (settings?.height) setHeight(settings.height);
  }, [settings]);

  const handleBotUsernameChange = (username: string) => {
    setBotUsername(username);
    if (onSettingsChange) onSettingsChange({ ...settings, botUsername: username });
  };

  const handleWebAppUrlChange = (url: string) => {
    setWebAppUrl(url);
    if (onSettingsChange) onSettingsChange({ ...settings, webAppUrl: url });
  };

  const handleStartParamChange = (param: string) => {
    setStartParam(param);
    if (onSettingsChange) onSettingsChange({ ...settings, startParam: param });
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (onSettingsChange) onSettingsChange({ ...settings, height: h });
  };

  // Build the iframe URL
  const buildIframeUrl = () => {
    if (webAppUrl) {
      const url = new URL(webAppUrl);
      if (startParam) {
        url.searchParams.set('start', startParam);
      }
      url.searchParams.set('tgWebAppPlatform', 'web');
      return url.toString();
    }

    let url = `https://t.me/${botUsername}`;
    if (startParam) {
      url += `?start=${encodeURIComponent(startParam)}`;
    }
    return url;
  };

  const iframeUrl = buildIframeUrl();

  const validateUsername = (username: string) => {
    const clean = username.replace('@', '');
    return /^[a-zA-Z0-9_]{5,32}$/.test(clean);
  };

  const validateWebAppUrl = (url: string) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="flex flex-col h-full w-full p-4 space-y-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-medium opacity-70">Telegram Bot</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs opacity-60 block">Bot Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-50">@</span>
              <input
                type="text"
                value={botUsername.replace('@', '')}
                onChange={(e) => handleBotUsernameChange(e.target.value)}
                className={`w-full bg-white/10 rounded px-2 py-2 pl-7 text-sm ${!validateUsername(botUsername) ? 'border border-red-500' : ''}`}
                placeholder="Oothbot"
              />
            </div>
            {!validateUsername(botUsername) && (
              <p className="text-xs text-red-400">Invalid username (5-32 chars, letters/numbers/_)</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs opacity-60 block">Web App URL (optional)</label>
            <input
              type="text"
              value={webAppUrl}
              onChange={(e) => handleWebAppUrlChange(e.target.value)}
              placeholder="https://your-domain.com/app"
              className={`w-full bg-white/10 rounded px-3 py-2 text-sm ${webAppUrl && !validateWebAppUrl(webAppUrl) ? 'border border-red-500' : ''}`}
            />
            {webAppUrl && !validateWebAppUrl(webAppUrl) && (
              <p className="text-xs text-red-400">Must be a valid HTTPS URL</p>
            )}
            <p className="text-xs opacity-40">Leave empty to use t.me embed. Web App must be registered with @BotFather.</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs opacity-60 block">Start Parameter (optional)</label>
            <input
              type="text"
              value={startParam}
              onChange={(e) => handleStartParamChange(e.target.value)}
              placeholder="e.g., widget_123"
              className="w-full bg-white/10 rounded px-3 py-2 text-sm"
            />
            <p className="text-xs opacity-40">Passed to the bot when opened</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs opacity-60 block">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || DEFAULT_HEIGHT)}
              min="200"
              max="800"
              className="w-full bg-white/10 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="pt-2 border-t border-white/10">
            <a
              href={`https://t.me/${botUsername.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
            >
              <ExternalLink size={14} />
              Open bot in Telegram
            </a>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
          <p className="text-sm opacity-80">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-3 text-xs bg-white/10 px-3 py-1 rounded-full hover:bg-white/20"
          >
            Dismiss
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full w-full relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center px-2">
          <a
            href={`https://t.me/${botUsername.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs opacity-60 hover:opacity-100 flex items-center gap-1"
          >
            <MessageCircle size={12} />
            @{botUsername.replace('@', '')}
          </a>
        </div>

        <iframe
          ref={iframeRef}
          src={iframeUrl}
          style={{
            width: '100%',
            height: `${height}px`,
            border: 'none',
            borderRadius: '12px',
            background: '#1a1a1a'
          }}
          title={`Telegram bot: ${botUsername}`}
          className="absolute top-0 left-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setError(null)}
          onError={() => setError('Failed to load Telegram widget')}
        />
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col w-full h-full rounded-2xl overflow-hidden relative transition-colors duration-300"
      style={{ 
        backdropFilter: `blur(${blur}px)`,
        backgroundColor: `rgba(0, 0, 0, 0)`
      }}
    >
      {renderContent()}
    </div>
  );
}
