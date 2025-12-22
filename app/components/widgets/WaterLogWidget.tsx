import { useState, useEffect, useRef } from 'react';
import { GlassWater, Droplet, Plus, Smartphone, Monitor, Layout } from 'lucide-react';

interface WaterLogEntry {
    amount: number;
    timestamp: string; // ISO string
    timeDisplay: string; // HH:MM format
}

interface WaterLogWidgetProps {
    settings?: any;
    onSettingsChange: (settings: any) => void;
    blur?: number;
    isEditing: boolean;
}

export default function WaterLogWidget({ settings, onSettingsChange, blur, isEditing }: WaterLogWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [measuredMode, setMeasuredMode] = useState<'vertical' | 'side' | 'horizontal'>('vertical');
    
    // State
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [goalInput, setGoalInput] = useState(settings?.goal?.toString() || '2000');
    
    // Settings
    const goal = settings?.goal || 2000;
    const current = settings?.current || 0;
    const history: WaterLogEntry[] = settings?.history || [];
    const layoutPreference = settings?.layoutPreference || 'auto'; // 'auto' | 'vertical' | 'horizontal'

    // determine actual layout mode based on preference
    const layoutMode = layoutPreference === 'auto' ? measuredMode : (
        layoutPreference === 'horizontal' ? 'horizontal' : 'vertical' 
        // Note: 'vertical' preference forces vertical stack. 
        // If we want side-by-side support in manual, we'd need more options or logic. 
        // For now, let's map 'vertical' preference to standard vertical behavior (which might include side logic if we kept it separate from measured).
        // Actually, if user forces 'Vertical', they probably want the Cup.
        // If I force 'vertical', I should arguably still check width/height for side-by-side variant if I want to be smart, 
        // but user asked for "Horizontal or Vertical".
        // Let's simplified: 
        // Preference 'vertical' -> Forces the vertical cup view.
        // Preference 'horizontal' -> Forces the horizontal bar view.
        // The 'side' mode is a variation of vertical cup. We can let 'vertical' preference allow 'side' if space is tight? 
        // No, let's strictly toggle. If 'vertical' is chosen, we show vertical cup. 
        // But if height is small, vertical cup clips. 
        // User said "toggle... vertical or horizontal".
        // Let's assume 'vertical' preference maps to 'measuredMode' logic but locking out 'horizontal', 
        // OR just forces the view.
        // Let's implementation: Preference overrides measured classification.
    );

    // Resize Observer for Layout
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            const { height } = entry.contentRect;

            if (height < 180) {
                setMeasuredMode('horizontal');
            } else if (height < 300) { 
                 setMeasuredMode('side');
            } else {
                 setMeasuredMode('vertical');
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);
    
    // Check for day reset
    useEffect(() => {
        const today = new Date().toLocaleDateString();
        if (settings?.lastResetDate && settings.lastResetDate !== today) {
             onSettingsChange({
                 ...settings,
                 current: 0,
                 history: [],
                 lastResetDate: today,
                 goal: goal 
             });
        } else if (!settings?.lastResetDate) {
             onSettingsChange({
                 ...settings,
                 lastResetDate: today
             });
        }
    }, [settings?.lastResetDate]);

    const addWater = (amount: number) => {
        const now = new Date();
        const newEntry: WaterLogEntry = {
            amount,
            timestamp: now.toISOString(),
            timeDisplay: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const newCurrent = (current || 0) + amount;
        
        onSettingsChange({
            ...settings,
            current: newCurrent,
            history: [...(history || []), newEntry],
            lastResetDate: new Date().toLocaleDateString()
        });
        
        setShowCustomInput(false);
        setCustomAmount('');
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGoalInput(e.target.value);
    };

    const saveGoal = () => {
        let newGoal = parseInt(goalInput);
        if (isNaN(newGoal) || newGoal <= 0) newGoal = 2000;
        
        if (newGoal !== goal) {
            onSettingsChange({
                ...settings,
                goal: newGoal
            });
        }
    };
    
    const toggleLayoutPreference = () => {
        const next = layoutPreference === 'auto' ? 'vertical' : (layoutPreference === 'vertical' ? 'horizontal' : 'auto');
        onSettingsChange({ ...settings, layoutPreference: next });
    };

    useEffect(() => {
        setGoalInput(goal.toString());
    }, [goal]);

    const fillPercentage = Math.min((current / goal) * 100, 100);

    // --- Components ---

    const Controls = () => (
        <div className={`flex gap-2 ${layoutMode === 'horizontal' ? 'flex-col justify-center' : (layoutMode === 'side' ? 'flex-col justify-center' : 'justify-center w-full mt-2')}`}>
             <button 
                onClick={() => addWater(250)}
                className={`flex flex-col items-center justify-center bg-blue-500/10 hover:bg-blue-500/30 border border-blue-500/20 hover:border-blue-500/50 rounded-xl group transition-all
                    ${layoutMode === 'horizontal' ? 'w-8 h-8' : (layoutMode === 'side' ? 'w-10 h-10' : 'w-12 h-12')}
                `}
                title="Add 250mL"
            >
                <div className="relative">
                    <GlassWater size={layoutMode === 'horizontal' ? 14 : 18} className="text-blue-300 group-hover:text-blue-200" />
                     {layoutMode !== 'horizontal' && (
                        <div className="absolute -top-1 -right-1.5 bg-blue-600 rounded-full w-3 h-3 flex items-center justify-center">
                            <Plus size={8} className="text-white" />
                        </div>
                     )}
                </div>
            </button>

            <button 
                onClick={() => setShowCustomInput(true)}
                className={`flex flex-col items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/20 hover:border-cyan-500/50 rounded-xl group transition-all
                   ${layoutMode === 'horizontal' ? 'w-8 h-8' : (layoutMode === 'side' ? 'w-10 h-10' : 'w-12 h-12')}
                `}
                title="Add Custom"
            >
                <div className="relative">
                    <Droplet size={layoutMode === 'horizontal' ? 14 : 18} className="text-cyan-300 group-hover:text-cyan-200" />
                    {layoutMode !== 'horizontal' && (
                         <div className="absolute -top-1 -right-1.5 bg-cyan-600 rounded-full w-3 h-3 flex items-center justify-center">
                            <Plus size={8} className="text-white" />
                         </div>
                    )}
                </div>
            </button>
        </div>
    );

    const GoalDisplay = () => (
        <div className={`flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full z-[30] border border-white/5
            ${layoutMode === 'horizontal' ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg' : ''}
            ${layoutMode === 'vertical' ? 'mb-2' : ''}
        `}>
            <span className="text-blue-400 font-bold text-xs">{current}</span>
            <span className="text-white/40 text-[10px]">/</span>
            {isEditing ? (
                    <div className="flex items-center gap-1">
                    <input 
                        type="number" 
                        value={goalInput} 
                        onChange={handleGoalChange}
                        onBlur={saveGoal}
                        onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                        className="w-10 bg-white/10 border border-white/20 rounded px-1 text-white text-[10px] text-center focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[9px] text-white/50">mL</span>
                    </div>
            ) : (
                <span className="text-white/70 text-[11px]">{goal} mL</span>
            )}
        </div>
    );

    return (
        <div ref={containerRef} className="w-full h-full p-2 relative overflow-hidden flex" style={{ backdropFilter: `blur(${blur || 0}px)` }}>
            
            {/* Editing Controls - Layout Toggle */}
            {isEditing && (
                <button 
                    onClick={toggleLayoutPreference}
                    className="absolute top-2 left-2 z-[40] p-1.5 bg-black/40 hover:bg-black/60 text-white/70 hover:text-white rounded-lg border border-white/10 transition-colors"
                    title={`Layout: ${layoutPreference.charAt(0).toUpperCase() + layoutPreference.slice(1)}`}
                >
                    {layoutPreference === 'vertical' ? <Smartphone size={12} /> : 
                     layoutPreference === 'horizontal' ? <Monitor size={12} /> : 
                     <Layout size={12} />}
                </button>
            )}

            {/* Modal Overlay */}
            {showCustomInput && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCustomInput(false)}>
                    <div className="bg-zinc-900 border border-white/20 rounded-xl p-4 flex flex-col gap-3 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <h4 className="text-white text-sm font-semibold text-center">Add Water Drank</h4>
                        <div className="flex gap-2">
                             <input 
                                type="number" 
                                autoFocus
                                placeholder="Amt (mL)"
                                className="w-24 bg-white/10 border border-white/10 rounded-lg p-2 text-white text-sm outline-none text-center focus:border-blue-500"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addWater(parseInt(customAmount) || 0);
                                    if (e.key === 'Escape') setShowCustomInput(false);
                                }}
                            />
                            <button 
                                onClick={() => addWater(parseInt(customAmount) || 0)}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Layouts */}
            
            {/* Horizontal Layout */}
            {layoutMode === 'horizontal' && (
                <div className="flex w-full h-full items-center gap-3 relative">
                     {/* Text Absolute Center */}
                     <GoalDisplay />

                     {/* Controls Left */}
                     <div className="flex flex-col gap-1 items-center justify-center shrink-0 w-8">
                         <Controls />
                     </div>

                     {/* Horizontal Bar Cup */}
                     <div className="flex-1 h-12 relative">
                         {/* Bar Container */}
                         <div className="relative w-full h-full border-2 border-white/20 rounded-xl overflow-hidden bg-white/5">
                            <div 
                                className="absolute top-0 left-0 h-full bg-blue-500/50 transition-all duration-700 ease-in-out"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <div className="absolute top-0 right-0 h-full w-[2px] bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-blue-600/60"></div>
                            </div>
                            
                             {/* History Markers */}
                             {history.map((entry, idx) => {
                                 const cumulative = history.slice(0, idx + 1).reduce((acc, curr) => acc + curr.amount, 0);
                                 if (cumulative <= 0) return null;
                                 const pct = Math.min((cumulative / goal) * 100, 100);
                                 return (
                                     <div 
                                        key={idx}
                                        className="absolute h-full border-r border-white/40 border-dashed top-0 pointer-events-none"
                                        style={{ left: `${pct}%` }}
                                     />
                                 );
                             })}
                         </div>
                         
                         {/* Labels */}
                         {history.map((entry, idx) => {
                             const cumulative = history.slice(0, idx + 1).reduce((acc, curr) => acc + curr.amount, 0);
                             if (cumulative <= 0) return null;
                             const pct = Math.min((cumulative / goal) * 100, 100);
                             const isTop = idx % 2 === 0;
                             
                             return (
                                <div 
                                    key={idx}
                                    className={`absolute text-[7px] text-white/70 whitespace-nowrap transform -translate-x-1/2 flex flex-col items-center ${isTop ? '-top-4' : '-bottom-4'}`}
                                    style={{ left: `${pct}%` }}
                                >
                                    <span>{entry.timeDisplay}</span>
                                </div>
                             )
                         })}
                     </div>
                </div>
            )}

            {/* Vertical & Side-by-Side */}
            {layoutMode !== 'horizontal' && (
                <div className={`flex w-full h-full items-center ${layoutMode === 'side' ? 'flex-row gap-3 justify-center' : 'flex-col'}`}>
                    
                    {/* Header for Vertical */}
                    {layoutMode === 'vertical' && (
                         <div className="w-full flex justify-center mb-2">
                             <GoalDisplay />
                         </div>
                    )}
                    
                    {/* Cup container */}
                    <div className={`relative flex justify-center items-end ${layoutMode === 'side' ? 'h-[90%]' : 'w-full flex-1'}`}>
                        <div className={`relative border-b-4 border-l-4 border-r-4 border-white/20 rounded-b-2xl overflow-hidden bg-white/5 backdrop-blur-sm transition-all duration-300
                            ${layoutMode === 'side' ? 'w-20 h-full' : 'w-24 h-full'}
                        `}>
                             {/* Water */}
                            <div 
                                className="absolute bottom-0 left-0 w-full bg-blue-500/50 transition-all duration-700 ease-in-out"
                                style={{ height: `${fillPercentage}%` }}
                            >   
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-400/20 to-blue-600/60"></div>
                            </div>
                            
                            {/* History Lines */}
                            {history.map((entry, idx) => {
                                const cumulative = history.slice(0, idx + 1).reduce((acc, curr) => acc + curr.amount, 0);
                                if (cumulative <= 0) return null;
                                const pct = Math.min((cumulative / goal) * 100, 100);
                                return (
                                    <div key={idx} className="absolute w-full border-t border-white/30 border-dashed pointer-events-none" style={{ bottom: `${pct}%` }} />
                                );
                            })}
                        </div>
                        
                        {/* Labels for Vertical/Side Cup - FONT SIZE CHANGE HERE */}
                        {history.map((entry, idx) => {
                             const cumulative = history.slice(0, idx + 1).reduce((acc, curr) => acc + curr.amount, 0);
                             if (cumulative <= 0) return null;
                             const pct = Math.min((cumulative / goal) * 100, 100);
                             
                             // Side mode: Always left. Vertical: Alternating.
                             const isLeft = layoutMode === 'side' ? true : idx % 2 === 0;
                             
                             return (
                                <div 
                                    key={idx}
                                    className={`absolute text-[9px] text-white/60 whitespace-nowrap transition-all duration-500`}
                                    style={{ 
                                        bottom: `${pct}%`, 
                                        [isLeft ? 'right' : 'left']: '50%',
                                        transform: `translate(${isLeft ? '-50px' : '50px'}, 50%)`
                                    }}
                                >
                                    <span className={isLeft ? "mr-1" : "ml-1"}>{entry.timeDisplay}</span>
                                </div>
                             );
                        })}
                        
                    </div>

                    {/* Middle Column for Side Mode: GoalDisplay */}
                    {layoutMode === 'side' && (
                        <div className="flex flex-col justify-center items-center">
                            <GoalDisplay />
                        </div>
                    )}

                    {/* Controls */}
                    <div className={`${layoutMode === 'side' ? 'flex flex-col justify-center' : ''}`}>
                         <Controls />
                    </div>
                </div>
            )}

        </div>
    );
}
