'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Widget } from '../types';
import { GripVertical, X, Settings } from 'lucide-react';
import TimeWidget from './widgets/TimeWidget';
import TodoWidget from './widgets/TodoWidget';
import YoutubeWidget from './widgets/YoutubeWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import WeatherWidget from './widgets/WeatherWidget';
import SpacerWidget from './widgets/SpacerWidget';

interface WidgetWrapperProps {
    widget: Widget;
    totalInColumn: number;
    isEditing: boolean;
    blur?: number;
    onRemove: (id: string) => void;
    onUpdatePosition: (id: string, position: 'top' | 'middle' | 'bottom' | 'auto') => void;
    onUpdateSettings: (id: string, settings: any) => void;
}

// Helper function to determine height based on total widgets in column
const getTotalHeight = (totalInColumn: number) => {
    if (totalInColumn === 1) return '100%';
    if (totalInColumn === 2) return '50%';
    if (totalInColumn === 3) return '33.33%';
    return 'auto'; // Default or for more than 3
};

export function WidgetWrapper({
  widget,
  totalInColumn,
  isEditing,
  blur,
  onRemove,
  onUpdatePosition,
  onUpdateSettings
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: widget.id, data: { widget } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    height: widget.customHeight ? `${widget.customHeight}%` : getTotalHeight(totalInColumn),
    zIndex: isDragging ? 100 : 'auto',
  };

  // Common props for widgets
  const widgetProps: any = {
      settings: widget.settings,
      onSettingsChange: (newSettings: any) => onUpdateSettings(widget.id, newSettings),
      blur
  };

  // Content for the widget
  const renderContent = () => {
    switch (widget.type) {
      case 'time': return <TimeWidget {...widgetProps} />;
      case 'todo': return <TodoWidget {...widgetProps} />;
      case 'youtube': return <YoutubeWidget {...widgetProps} />;
      case 'pomodoro': return <PomodoroWidget {...widgetProps} />;
      case 'weather': return <WeatherWidget {...widgetProps} />;
      case 'spacer': return <SpacerWidget isEditing={isEditing} />;
      default: return null;
    }
  };

  if (widget.type === 'spacer') {
       return (
            <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="w-full relative group p-2">
                 {renderContent()}
                 {isEditing && (
                    <button 
                        onClick={() => onRemove(widget.id)}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition shadow-lg z-50"
                        onPointerDown={e => e.stopPropagation()} 
                    >
                        <X size={12} />
                    </button>
                 )}
            </div>
       )
    }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`w-full transition-all duration-300 relative flex flex-col p-2 ${isDragging ? 'opacity-50' : ''}`}
      {...attributes} 
    >
      <div className={`relative w-full h-full group ${isEditing ? 'border-2 border-dashed border-white/30 rounded-xl' : ''}`}>
        
        {/* Widget Content */}
        {renderContent()}

        {/* Edit Controls */}
        {isEditing && (
          <div className="absolute top-2 right-2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
             <div {...listeners} className="p-1 bg-black/50 rounded-md cursor-grab active:cursor-grabbing text-white">
                <GripVertical size={16} />
             </div>
             <button onClick={() => onRemove(widget.id)} className="p-1 bg-red-500/80 rounded-md text-white hover:bg-red-600">
                <X size={16} />
             </button>
             {/* Position toggles for single widget */}
             {/* {totalInColumn === 1 && (
               <div className="flex flex-col gap-1 absolute right-8 top-0 bg-black/80 p-1 rounded">
                  <button onClick={() => onUpdatePosition(widget.id, 'top')} className={`text-xs p-1 ${widget.positionPreference === 'top' ? 'text-blue-400' : 'text-white'}`}>Top</button>
                  <button onClick={() => onUpdatePosition(widget.id, 'middle')} className={`text-xs p-1 ${widget.positionPreference === 'middle' ? 'text-blue-400' : 'text-white'}`}>Mid</button>
                  <button onClick={() => onUpdatePosition(widget.id, 'bottom')} className={`text-xs p-1 ${widget.positionPreference === 'bottom' ? 'text-blue-400' : 'text-white'}`}>Bot</button>
               </div>
             )} */}
          </div>
        )}
      </div>
    </div>
  );
}
