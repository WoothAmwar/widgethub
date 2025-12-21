'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Widget, ColumnId, AppState, WidgetType } from './types';
import { Column } from './components/Column';
import { Controls } from './components/Controls';
import { WidgetWrapper } from './components/WidgetWrapper';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_STATE: AppState = {
  columns: {
    left: [],
    middle: [],
    right: [],
  },
  background: {
    activeType: 'solid',
    imageValue: '',
    colorValue: '#1a1a1a', // Default dark bg
  },
  isEditing: false,
};

export default function Home() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('widgethub-config');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('widgethub-config', JSON.stringify(state));
    }
  }, [state, mounted]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const findContainer = (id: string): ColumnId | undefined => {
    if (id in state.columns) {
      return id as ColumnId;
    }
    return (Object.keys(state.columns) as ColumnId[]).find((key) =>
      state.columns[key].find((w) => w.id === id)
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const overId = over?.id;

    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(overId as string) || (overId as ColumnId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Check limits before moving
    if (state.columns[overContainer].length >= 3) {
      // Allow if we are swapping? For now simple restrict
      // Actually DragOver is for temporary visual, we should allow it to "float" potentially
      // But let's restrict the drop.
      return; 
    }

    setState((prev) => {
      const activeItems = prev.columns[activeContainer];
      const overItems = prev.columns[overContainer];
      const activeIndex = activeItems.findIndex((i) => i.id === active.id);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      let newIndex;
      if (overId in prev.columns) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        columns: {
          ...prev.columns,
          [activeContainer]: [
            ...prev.columns[activeContainer].filter((item) => item.id !== active.id),
          ],
          [overContainer]: [
            ...prev.columns[overContainer].slice(0, newIndex),
            activeItems[activeIndex],
            ...prev.columns[overContainer].slice(newIndex, overItems.length),
          ],
        },
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over?.id as string) || (over?.id as ColumnId);

    if (
      activeContainer &&
      overContainer &&
      (activeContainer !== overContainer || (over && active.id !== over.id))
    ) {
       // Check constraints again for final drop
       if (activeContainer !== overContainer && state.columns[overContainer].length > 3) {
           // Revert? (Complex to revert here without prev state ref, mostly rely on logic preventing the move)
           // If we already moved in dragOver, we might have 4 items. We need to trim or prevent.
           // Ideally we prevent in DragOver. A better way is:
           // If destination has >= 3, don't allow move.
       }

      const activeIndex = state.columns[activeContainer].findIndex((w) => w.id === active.id);
      const overIndex = state.columns[overContainer].findIndex((w) => w.id === over?.id);

      if (activeIndex !== overIndex || activeContainer !== overContainer) {
        setState((prev) => {
             // Logic repeated from dragOver mostly for sorting within same container
             if (activeContainer === overContainer) {
                 return {
                    ...prev,
                    columns: {
                        ...prev.columns,
                        [activeContainer]: arrayMove(prev.columns[activeContainer], activeIndex, overIndex)
                    }
                 };
             }
             return prev; // Already handled cross-container in DragOver
        });
      }
    }
    setActiveId(null);
  };

  // Constraint check helper for DragOver
  // (Simplified: we let dnd-kit handle the visuals, but we could add custom collision detection)

  const addWidget = (type: WidgetType) => {
    // Find column with space
    const targetCol = (['left', 'middle', 'right'] as ColumnId[]).find(id => state.columns[id].length < 3);
    if (!targetCol) {
        alert('All columns are full (max 3 per column). Remove a widget first.');
        return;
    }

    const newWidget: Widget = {
        id: generateId(),
        type,
        settings: {}
    };

    setState(prev => ({
        ...prev,
        columns: {
            ...prev.columns,
            [targetCol]: [...prev.columns[targetCol], newWidget]
        }
    }));
  };

  const removeWidget = (id: string) => {
      const colId = findContainer(id);
      if (!colId) return;
      setState(prev => ({
          ...prev,
          columns: {
              ...prev.columns,
              [colId]: prev.columns[colId].filter(w => w.id !== id)
          }
      }));
  };

  const updateWidgetPosition = (id: string, position: 'top' | 'middle' | 'bottom' | 'auto') => {
      const colId = findContainer(id);
      if (!colId) return;
      
      setState(prev => ({
          ...prev,
          columns: {
              ...prev.columns,
              [colId]: prev.columns[colId].map(w => w.id === id ? { ...w, positionPreference: position } : w)
          }
      }));
  };

  const updateWidgetHeight = (id: string, height: number) => {
      const colId = findContainer(id);
      if (!colId) return;
      
      setState(prev => ({
          ...prev,
          columns: {
              ...prev.columns,
              [colId]: prev.columns[colId].map(w => w.id === id ? { ...w, customHeight: height } : w)
          }
      }));
  };

  const updateWidgetSettings = (id: string, settings: any) => {
      const colId = findContainer(id);
      if (!colId) return;

      setState(prev => ({
          ...prev,
          columns: {
             ...prev.columns,
             [colId]: prev.columns[colId].map(w => w.id === id ? { ...w, settings: { ...w.settings, ...settings } } : w)
          }
      }));
  };

  const updateBackground = (updates: Partial<AppState['background']>) => {
      setState(prev => ({ 
          ...prev, 
          background: { 
              ...prev.background, 
              ...updates 
          } 
      }));
  };

  const updateBlur = (value: number) => {
      setState(prev => ({ ...prev, blur: value }));
  };

  const exportConfig = () => {
      const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'widgethub-config.json';
      a.click();
      URL.revokeObjectURL(url);
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const config = JSON.parse(event.target?.result as string);
              // Basic validation could be improved
              if (config.columns && config.background) {
                  setState(config);
              }
          } catch (error) {
              console.error('Invalid config file', error);
          }
      };
      reader.readAsText(file);
  };

  const activeWidget = activeId ? (Object.values(state.columns).flat().find(w => w.id === activeId)) : null;

  // Check validity
  const checkValidity = () => {
      for (const col of Object.values(state.columns)) {
          const total = col.reduce((sum, w) => sum + (w.customHeight || 0), 0);
          if (total > 100) return false;
      }
      return true;
  };
  const isValid = checkValidity();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <main 
        className="h-screen w-full flex overflow-hidden transition-all duration-500 bg-cover bg-center"
        style={{ 
            backgroundImage: state.background.activeType === 'image' && state.background.imageValue ? `url(${state.background.imageValue})` : undefined,
            backgroundColor: state.background.activeType === 'solid' ? state.background.colorValue : undefined
        }}
      >
        {!mounted ? null : (
            <>
                <Column 
                    id="left" 
                    widgets={state.columns.left} 
                    isEditing={state.isEditing} 
                    blur={state.blur !== undefined ? state.blur : 10}
                    onRemoveWidget={removeWidget} 
                    onUpdateWidgetPosition={updateWidgetPosition}
                    onUpdateWidgetHeight={updateWidgetHeight}
                    onUpdateWidgetSettings={updateWidgetSettings}
                />
                <Column 
                    id="middle" 
                    widgets={state.columns.middle} 
                    isEditing={state.isEditing} 
                    blur={state.blur !== undefined ? state.blur : 10}
                    onRemoveWidget={removeWidget} 
                    onUpdateWidgetPosition={updateWidgetPosition}
                    onUpdateWidgetHeight={updateWidgetHeight}
                    onUpdateWidgetSettings={updateWidgetSettings}
                />
                <Column 
                    id="right" 
                    widgets={state.columns.right} 
                    isEditing={state.isEditing} 
                    blur={state.blur !== undefined ? state.blur : 10}
                    onRemoveWidget={removeWidget} 
                    onUpdateWidgetPosition={updateWidgetPosition}
                    onUpdateWidgetHeight={updateWidgetHeight}
                    onUpdateWidgetSettings={updateWidgetSettings}
                />
            </>
        )}

        <DragOverlay>
            {activeWidget ? (
               <div className="opacity-80">
                   <WidgetWrapper 
                     widget={activeWidget} 
                     totalInColumn={1} 
                     isEditing={true} 
                     blur={state.blur !== undefined ? state.blur : 10}
                     onRemove={() => {}} 
                     onUpdatePosition={() => {}} 
                     onUpdateSettings={() => {}}
                   /> 
               </div>
            ) : null}
        </DragOverlay>

        <Controls 
            isEditing={state.isEditing} 
            disableEdit={!isValid}
            onToggleEdit={() => setState(prev => ({ ...prev, isEditing: !prev.isEditing }))}
            onAddWidget={addWidget}
            onExport={exportConfig}
            onImport={importConfig}
            onUpdateBackground={updateBackground}
            background={state.background}
            onUpdateBlur={updateBlur}
            blur={state.blur !== undefined ? state.blur : 10}
        />

      </main>
    </DndContext>
  );
}
