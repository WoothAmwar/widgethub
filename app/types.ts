export type WidgetType = 'time' | 'todo' | 'youtube' | 'pomodoro' | 'weather' | 'spacer';

export interface Widget {
    id: string;
    type: WidgetType;
    positionPreference?: 'top' | 'middle' | 'bottom' | 'auto'; // Only used if it's the only widget in the column
    customHeight?: number; // Percentage
    settings?: Record<string, any>;
}

export type ColumnId = 'left' | 'middle' | 'right';

export interface AppState {
    columns: {
        [key in ColumnId]: Widget[];
    };
    background: {
        type: 'solid' | 'image';
        value: string; // Hex code or URL
    };
    blur?: number; // 0-100
    isEditing: boolean;
}
