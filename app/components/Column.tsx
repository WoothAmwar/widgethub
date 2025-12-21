'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Widget, ColumnId } from '../types';
import { WidgetWrapper } from './WidgetWrapper';

interface ColumnProps {
  id: ColumnId;
  widgets: Widget[];
  isEditing: boolean;
  blur?: number;
  onRemoveWidget: (id: string) => void;
  onUpdateWidgetPosition: (id: string, position: 'top' | 'middle' | 'bottom' | 'auto') => void;
  onUpdateWidgetHeight: (id: string, height: number) => void;
  onUpdateWidgetSettings: (id: string, settings: any) => void;
}

export function Column({ id, widgets, isEditing, blur, onRemoveWidget, onUpdateWidgetPosition, onUpdateWidgetHeight, onUpdateWidgetSettings }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  // Width classes
  const widthClass = id === 'middle' ? 'w-[50%]' : 'w-[25%]';

  // For single widget alignment
  let justifyClass = 'justify-start'; // Default top
  if (widgets.length === 1 && !widgets[0].customHeight) {
    // Only use flex alignment if no custom height is set (or maybe even if it is, but usually custom height implies filling space)
    // Actually if custom height is set, flex alignment essentially positions it if it doesn't take full height.
    const pos = widgets[0].positionPreference || 'top';
    if (pos === 'middle') justifyClass = 'justify-center';
    if (pos === 'bottom') justifyClass = 'justify-end';
  }

  // Calculate total height for validation
  const totalHeight = widgets.reduce((sum, w) => sum + (w.customHeight || 0), 0);
  const isInvalid = totalHeight > 100;

  return (
    <div
      ref={setNodeRef}
      className={`${widthClass} h-full flex flex-col ${justifyClass} transition-all p-2 ${isEditing ? 'bg-white/5 rounded-lg relative pt-16' : ''}`}
    >
      {/* Height Controls in Edit Mode */}
      {isEditing && widgets.length > 0 && (
        <div className="absolute top-0 left-0 right-0 p-2 flex flex-col items-center z-30 bg-black/50 backdrop-blur-sm rounded-t-lg">
           <div className="flex gap-2">
            {widgets.map((w, idx) => (
                <input
                    key={w.id}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="%"
                    value={w.customHeight || ''}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) onUpdateWidgetHeight(w.id, val);
                    }}
                    className={`w-12 text-center text-xs p-1 rounded ${isInvalid ? 'bg-red-500/50 text-white' : 'bg-white/10 text-white'}`}
                />
            ))}
           </div>
           {isInvalid && (
               <div className="text-red-400 text-[10px] mt-1 font-bold">
                   ! Total &gt; 100%
               </div>
           )}
        </div>
      )}

      <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
        {widgets.map((widget) => (
          <WidgetWrapper
            key={widget.id}
            widget={widget}
            totalInColumn={widgets.length}
            isEditing={isEditing}
            blur={blur}
            onRemove={onRemoveWidget}
            onUpdatePosition={onUpdateWidgetPosition}
            onUpdateSettings={onUpdateWidgetSettings}
          />
        ))}
      </SortableContext>
      
      {/* Visual cue for empty column in edit mode */}
      {widgets.length === 0 && isEditing && (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl m-2 text-white/50 text-sm">
          Drop widgets here
        </div>
      )}
    </div>
  );
}
