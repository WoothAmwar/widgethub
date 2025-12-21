'use client';

import { useState, useEffect } from 'react';

interface YoutubeWidgetProps {
  blur?: number;
  settings?: {
      embedId?: string;
  };
  onSettingsChange?: (settings: { embedId?: string }) => void;
}

export default function YoutubeWidget({ blur = 0, settings, onSettingsChange }: YoutubeWidgetProps) {
  const [url, setUrl] = useState('');
  const [embedId, setEmbedId] = useState('');

  useEffect(() => {
    if (settings?.embedId) {
        setEmbedId(settings.embedId);
    }
  }, [settings?.embedId]);

  const updateEmbedId = (id: string) => {
      setEmbedId(id);
      if (onSettingsChange) {
          onSettingsChange({ embedId: id });
      }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (videoId) {
      updateEmbedId(videoId);
      setUrl('');
    }
  };

  const extractVideoId = (input: string) => {
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    if (input.includes("custom")) {
      regExp = /^.*\/custom-youtube\/([^/?#]+).*$/   
      const match = input.match(regExp);
      return (match && match[1].length === 11) ? match[1] : null; 
    }
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div 
        className="flex flex-col h-full w-full rounded-2xl text-white shadow-lg overflow-hidden relative group bg-black/30"
        style={{ backdropFilter: `blur(${blur}px)` }}
    >
      {!embedId ? ( 
        <div className="flex flex-col items-center justify-center h-full p-4">
          <form onSubmit={handleUpdate} className="flex gap-2 w-full">
            <input 
              type="text" 
              placeholder="Paste YouTube or Custom Youtube URL" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-white/10 rounded px-3 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="bg-red-600 px-3 py-2 rounded text-sm font-bold">Load</button>
          </form>
        </div>
      ) : (
        <>
            <div className="flex-1 w-full h-full relative">
                <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${embedId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-2xl"
                />
                
                {/* Reset Button overlay */}
                <button 
                    onClick={() => updateEmbedId('')} 
                    className="absolute top-2 right-2 bg-black/60 p-1 rounded text-xs opacity-0 group-hover:opacity-100 transition z-10"
                >
                    Change Video
                </button>
            </div>
        </>
      )}
    </div>
  );
}
