'use client';

interface SpacerWidgetProps {
  isEditing?: boolean;
}

export default function SpacerWidget({ isEditing }: SpacerWidgetProps) {
  return (
    <div className={`h-full w-full rounded-2xl transition-colors ${isEditing ? 'border-2 border-dashed border-white/10 hover:border-white/30' : ''}`}>
    </div>
  );
}
