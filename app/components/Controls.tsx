import { useState, useEffect } from 'react';
import { Edit2, Check, Download, Upload, Plus, Image as ImageIcon, Maximize, Minimize } from 'lucide-react';
import { WidgetType, AppState } from '../types';

interface ControlsProps {
  isEditing: boolean;
  disableEdit?: boolean;
  onToggleEdit: () => void;
  onAddWidget: (type: WidgetType) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateBlur: (value: number) => void;
  blur: number;
  onUpdateBackground: (updates: Partial<AppState['background']>) => void;
  background: AppState['background'];
}

export function Controls({ isEditing, disableEdit, onToggleEdit, onAddWidget, onExport, onImport, onUpdateBlur, blur, onUpdateBackground, background }: ControlsProps) {
  const [showBgModal, setShowBgModal] = useState(false);
  const [imageUrl, setImageUrl] = useState(background.imageValue);
  const [colorValue, setColorValue] = useState(background.colorValue);
  const [activeType, setActiveType] = useState<'solid' | 'image'>(background.activeType);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync local state when prop updates or modal opens
  useEffect(() => {
    if (showBgModal) {
        setImageUrl(background.imageValue);
        setColorValue(background.colorValue);
        setActiveType(background.activeType);
    }
  }, [showBgModal, background]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleBgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBackground({ activeType, imageValue: imageUrl, colorValue });
    setShowBgModal(false);
  };

  const isValidColor = (color: string) => {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  };

  return (
    <>
      {/* Blur Control (Bottom Left) */}
      {isEditing && (
        <div className="fixed bottom-6 left-6 z-50 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col gap-1 w-64">
            <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white uppercase font-bold tracking-wider">Effect Blur</span>
                <span className="text-white text-xs">{blur}px</span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="40" 
                value={blur} 
                onChange={(e) => onUpdateBlur(parseInt(e.target.value))}
                className="w-full accent-green-500 cursor-pointer"
            />
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        {isEditing && (
          <div className="flex gap-2 items-center animate-in slide-in-from-right-5 fade-in duration-300">
             
             {/* Settings */}
             <div className="bg-black/80 backdrop-blur-md p-2 rounded-xl flex gap-2 border border-white/10">
                <button onClick={() => setShowBgModal(true)} className="p-2 rounded-full hover:bg-white/10 text-white" title="Change Background">
                   <ImageIcon size={20} />
                </button>
                <label className="cursor-pointer p-2 rounded-full hover:bg-white/10 text-white" title="Import Config">
                   <Upload size={20} />
                   <input type="file" onChange={onImport} className="hidden" accept=".json" />
                </label>
                <button onClick={onExport} className="p-2 rounded-full hover:bg-white/10 text-white" title="Export Config">
                   <Download size={20} />
                </button>
             </div>

             {/* Add Widgets */}
             <div className="bg-black/80 backdrop-blur-md p-2 rounded-xl flex gap-2 border border-white/10">
                <button onClick={() => onAddWidget('time')} className="text-xs text-white bg-white/10 p-2 rounded hover:bg-white/20">Time</button>
                <button onClick={() => onAddWidget('todo')} className="text-xs text-white bg-white/10 p-2 rounded hover:bg-white/20">Todo</button>
                <button onClick={() => onAddWidget('youtube')} className="text-xs text-white bg-white/10 p-2 rounded hover:bg-white/20">YouTube</button>
                <button onClick={() => onAddWidget('pomodoro')} className="text-xs text-white bg-white/10 p-2 rounded hover:bg-white/20">Pomodoro</button>
                <button onClick={() => onAddWidget('weather')} className="text-xs text-white bg-white/10 p-2 rounded hover:bg-white/20">Weather</button>
                <button onClick={() => onAddWidget('spacer')} className="text-xs text-white bg-white/10 p-2 rounded hover:bg-white/20">Spacer</button>
             </div>

          </div>
        )}

        <button
          onClick={onToggleEdit}
          disabled={disableEdit}
          className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${disableEdit ? 'bg-gray-500 cursor-not-allowed opacity-50' : isEditing ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 hover:bg-white/20 backdrop-blur-md'}`}
        >
          {isEditing ? <Check className="text-white" size={24} /> : <Edit2 className="text-white" size={24} />}
        </button>

        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-4 rounded-full shadow-lg transition-all transform hover:scale-105 bg-white/10 hover:bg-white/20 backdrop-blur-md"
        >
           {isFullscreen ? (
             <Minimize className="text-white" size={24} />
           ) : (
             <Maximize className="text-white" size={24} />
           )}
        </button>
      </div>

      {/* Background Modal */}
      {showBgModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowBgModal(false)}>
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
             <h3 className="text-white text-lg font-semibold mb-6">Background Settings</h3>
             <form onSubmit={handleBgSubmit} className="flex flex-col gap-6">
               
               {/* Toggle Type */}
               <div className="flex bg-black/30 p-1 rounded-lg">
                   <button 
                    type="button" 
                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${activeType === 'solid' ? 'bg-white/20 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setActiveType('solid')}
                   >
                    Solid Color
                   </button>
                   <button 
                    type="button"
                    className={`flex-1 py-1.5 text-sm rounded-md transition-all ${activeType === 'image' ? 'bg-white/20 text-white font-medium shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                    onClick={() => setActiveType('image')}
                   >
                    Image URL
                   </button>
               </div>

               {/* Inputs */}
               <div className="flex flex-col gap-4">
                  <div>
                      <label className="text-xs text-zinc-500 uppercase font-bold mb-1.5 block">Solid Color (Hex)</label>
                      <div className="relative">
                          {/* Color Preview */}
                          <div 
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border border-white/20 shadow-sm transition-colors"
                            style={{ backgroundColor: isValidColor(colorValue) ? colorValue : 'transparent' }} 
                          />
                          <input 
                              type="text" 
                              placeholder="#000000" 
                              value={colorValue} 
                              onChange={e => setColorValue(e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-zinc-600"
                          />
                      </div>
                  </div>

                  <div>
                      <label className="text-xs text-zinc-500 uppercase font-bold mb-1.5 block">Image URL</label>
                      <input 
                          type="text" 
                          placeholder="https://example.com/image.jpg" 
                          value={imageUrl} 
                          onChange={e => setImageUrl(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-white/30 placeholder:text-zinc-600"
                      />
                  </div>
               </div>

               <div className="flex justify-end gap-2 mt-2">
                 <button type="button" onClick={() => setShowBgModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition">Cancel</button>
                 <button type="submit" className="bg-white text-black font-bold py-2 px-6 text-sm rounded-lg hover:bg-gray-200 transition">
                   Save Changes
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
}
