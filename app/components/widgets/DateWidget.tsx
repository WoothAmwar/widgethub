'use client';

import { useState, useEffect } from 'react';

interface DateWidgetProps {
    blur?: number;
}

export default function DateWidget({ blur = 0 }: DateWidgetProps) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
        className="flex flex-col items-center justify-center h-full w-full rounded-2xl text-white  transition-colors duration-300"
        style={{ 
            backdropFilter: `blur(${blur}px)`,
            backgroundColor: `rgba(0, 0, 0, 0)`
        }}  
    >
      <div className="text-md text-white-100 font-medium">
        {date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}
