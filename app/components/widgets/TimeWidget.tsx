'use client';

import { useState, useEffect } from 'react';

interface TimeWidgetProps {
    blur?: number;
}

export default function TimeWidget({ blur = 0 }: TimeWidgetProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
        className="flex flex-col items-center justify-center h-full w-full rounded-2xl text-white shadow-lg bg-black/30"
        style={{ backdropFilter: `blur(${blur}px)` }}
    >
      <div className="text-5xl font-bold tracking-tight">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-lg text-white/70 mt-2 font-medium">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
