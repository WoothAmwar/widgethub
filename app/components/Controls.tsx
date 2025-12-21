import { useState } from 'react';
import { Edit2, Check, Download, Upload, Plus, Image as ImageIcon } from 'lucide-react';
import { WidgetType } from '../types';

interface ControlsProps {
  isEditing: boolean;
  disableEdit?: boolean;
  onToggleEdit: () => void;
  onAddWidget: (type: WidgetType) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateBlur: (value: number) => void;
  blur: number;
}

export function Controls({ isEditing, disableEdit, onToggleEdit, onAddWidget, onExport, onImport, onUpdateBlur, blur }: ControlsProps) {
  const [showBgModal, setShowBgModal] = useState(false);
  const [bgInput, setBgInput] = useState('');

  const handleBgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if (bgInput) onUpdateBackground(bgInput);
    setShowBgModal(false);
    setBgInput('');
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
      </div>

      {/* Background Modal */}
      {showBgModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowBgModal(false)}>
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
             <h3 className="text-white text-lg font-semibold mb-4">Set Background Image</h3>
             <form onSubmit={handleBgSubmit} className="flex flex-col gap-4">
               <input 
                 type="text" 
                 placeholder="Image URL" 
                 value={bgInput} 
                 onChange={e => setBgInput(e.target.value)}
                 className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-white/30"
                 autoFocus
               />
               <button type="submit" className="bg-white text-black font-bold py-2 rounded-lg hover:bg-gray-200 transition">
                 Set Background
               </button>
             </form>
          </div>
        </div>
      )}
    </>
  );
}
