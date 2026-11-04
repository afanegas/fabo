import React from 'react';
import { CHAMPIONS } from '@shared/championship';
import { CHAMPION_COLORS } from '../../constants/championship';

const W = 300;
const H = 120;
const PAD = 8;

// Cumulative game wins of both champions over the season
export const ProgressChart: React.FC<{ progress: { fane: number; lebo: number }[] }> = ({ progress }) => {
  if (progress.length === 0) {
    return <p className="text-cabo-textDim text-sm text-center py-8">No games played yet</p>;
  }

  const points = [{ fane: 0, lebo: 0 }, ...progress];
  const maxWins = Math.max(1, ...points.map((p) => Math.max(p.fane, p.lebo)));
  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - 2 * PAD);
  const y = (wins: number) => H - PAD - (wins / maxWins) * (H - 2 * PAD);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40" preserveAspectRatio="none">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#2a2a4a" strokeWidth={1} />
        {CHAMPIONS.map(({ id }) => (
          <polyline
            key={id}
            fill="none"
            stroke={CHAMPION_COLORS[id]}
            strokeWidth={2.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            points={points.map((p, i) => `${x(i)},${y(p[id])}`).join(' ')}
          />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-cabo-textDim mt-1">
        <span>Start</span>
        <span className="flex gap-4">
          {CHAMPIONS.map(({ id, name }) => (
            <span key={id} className="flex items-center gap-1">
              <span className="w-3 h-0.5 inline-block" style={{ background: CHAMPION_COLORS[id] }} />
              {name}
            </span>
          ))}
        </span>
        <span>Game {progress.length}</span>
      </div>
    </div>
  );
};
