import React from 'react';
import { GameSettings } from '@shared/types';

interface GameSettingsPanelProps {
  settings: GameSettings;
  canEdit: boolean;
  onChange: (changes: Partial<GameSettings>) => void;
}

const OPTIONS: { key: keyof GameSettings; label: string; description: string }[] = [
  {
    key: 'snapEnabled',
    label: '⚡ Snap',
    description: 'After each discard, everyone has a few seconds to throw a matching card onto the pile.',
  },
];

// Settings for the next game, chosen in the waiting room
export const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({ settings, canEdit, onChange }) => (
  <div className="space-y-2 text-left">
    <p className="text-sm font-display text-cabo-textDim text-center">Game settings</p>
    {OPTIONS.map(({ key, label, description }) => {
      const on = settings[key];
      return (
        <button
          key={key}
          type="button"
          role="switch"
          aria-checked={on}
          disabled={!canEdit}
          onClick={() => onChange({ [key]: !on })}
          className={`w-full flex items-center gap-3 bg-cabo-surface/50 rounded-lg px-4 py-3 border transition-colors
            ${on ? 'border-cabo-accent/50' : 'border-cabo-border'}
            ${canEdit ? 'cursor-pointer hover:border-cabo-accent/70' : 'cursor-default'}`}
        >
          <div className="flex-1 text-left">
            <p className="font-display text-sm font-semibold text-cabo-text">{label}</p>
            <p className="text-xs text-cabo-textDim leading-snug">{description}</p>
          </div>
          <span
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${on ? 'bg-cabo-accent' : 'bg-cabo-border'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`}
            />
          </span>
        </button>
      );
    })}
    {!canEdit && <p className="text-xs text-cabo-textDim text-center">Only the host can change these.</p>}
  </div>
);
