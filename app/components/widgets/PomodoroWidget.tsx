'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Monitor, Coffee } from 'lucide-react';

interface PomodoroWidgetProps {
    blur?: number;
}

export default function PomodoroWidget({ blur = 0 }: PomodoroWidgetProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isAnimedoro, setIsAnimedoro] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (isAnimedoro) {
       setTimeLeft(mode === 'work' ? 40 * 60 : 20 * 60);
    } else {
       setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
    }
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    if (isAnimedoro) {
        setTimeLeft(newMode === 'work' ? 40 * 60 : 20 * 60);
    } else {
        setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
    }
  };

  const toggleAnimedoro = () => {
      const newAnimedoro = !isAnimedoro;
      setIsAnimedoro(newAnimedoro);
      setIsActive(false);
      // Reset times based on new mode
      if (newAnimedoro) {
          // Animedoro defaults
          setTimeLeft(mode === 'work' ? 40 * 60 : 20 * 60);
      } else {
          // Pomodoro defaults
          setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
      }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
        className="flex flex-col items-center justify-center h-full w-full rounded-2xl p-4 text-white shadow-lg relative overflow-hidden bg-black/30"
        style={{ backdropFilter: `blur(${blur}px)` }}
    >
      {/* Animedoro Toggle */}
      <div className="absolute top-2 right-2">
          <button 
            onClick={toggleAnimedoro}
            className={`text-[10px] px-2 py-1 rounded-full border transition ${isAnimedoro ? 'bg-pink-500/20 border-pink-500 text-pink-200' : 'bg-white/10 border-white/20 text-white/50'}`}
            title="Toggle Animedoro (40m/20m)"
          >
              {isAnimedoro ? 'ANIME' : 'POMO'}
          </button>
      </div>

      <div className="flex gap-2 mb-4 bg-white/10 p-1 rounded-lg">
        <button 
          onClick={() => switchMode('work')}
          className={`px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1 ${mode === 'work' ? 'bg-red-500 text-white' : 'text-white/50 hover:text-white'}`}
        >
          <Monitor size={14} /> Work
        </button>
        <button 
          onClick={() => switchMode('break')}
          className={`px-3 py-1 rounded text-sm font-medium transition flex items-center gap-1 ${mode === 'break' ? 'bg-green-500 text-white' : 'text-white/50 hover:text-white'}`}
        >
          <Coffee size={14} /> Break
        </button>
      </div>

      <div className="text-6xl font-mono font-bold mb-6 tabular-nums tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      
      {/* {isAnimedoro && <span className="text-xs text-yellow-200 mt-2 font-semibold tracking-wider">ANIMEDORO ACTIVE</span>} */}

    </div>
  );
}
