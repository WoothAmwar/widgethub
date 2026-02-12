import React from 'react';

export const GuideModal = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-lg w-full shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/80"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                
                <h2 className="text-3xl font-bold text-white tracking-tight">Welcome to WidgetHub</h2>
                
                <p className="text-zinc-400 text-lg leading-relaxed">
                    Seems like the dashboard is currently empty. Get started by customizing your space.
                </p>

                <div className="grid gap-4 text-left bg-white/5 p-6 rounded-xl border border-white/5">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-white/10 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Edit Mode</h3>
                            <p className="text-sm text-zinc-500">Click the <span className="text-white bg-white/10 px-1 rounded text-xs">Edit</span> button below to add widgets.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-white/10 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Add Widgets</h3>
                            <p className="text-sm text-zinc-500">Choose from a variety of widgets like Time, Weather, Spotify, and more.</p>
                        </div>
                    </div>

                     <div className="flex items-start gap-3">
                        <div className="mt-1 p-1 bg-white/10 rounded">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                        </div>
                        <div>
                            <h3 className="text-white font-medium">Drag & Drop</h3>
                            <p className="text-sm text-zinc-500">Rearrange your layout exactly how you want it in edit mode.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
