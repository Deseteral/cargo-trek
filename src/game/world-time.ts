import { GameState } from 'ludum-dare-54/game/game-state';

export function formattedCalendarTime(): string {
  let t = GameState.time;
  const day = (t / (60 * 24)) | 0;
  t -= day * (60 * 24);
  const hour = ((t / 60) | 0);
  t -= hour * 60;
  const minute = t | 0;

  return `Day ${day}, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

export function formattedDurationTime(timeDiff: number): string {
  let t = timeDiff;
  const day = (t / (60 * 24)) | 0;
  t -= day * (60 * 24);
  const hour = ((t / 60) | 0);
  t -= hour * 60;
  const minute = t | 0;

  return `${day} days, ${hour.toString().padStart(2, '0')}h ${minute.toString().padStart(2, '0')}m`;
}
