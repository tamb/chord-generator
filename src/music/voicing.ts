export function applyVoicing(notes: readonly number[], voicing: number): number[] {
  if (voicing === 0 || notes.length <= 1) {
    return [...notes];
  }

  const result = [...notes].sort((left, right) => left - right);
  let remaining = voicing;

  while (remaining > 0 && result.length > 1) {
    const lowest = result.shift()!;
    result.push(lowest + 12);
    remaining -= 1;
  }

  while (remaining < 0 && result.length > 1) {
    const highest = result.pop()!;
    result.unshift(highest - 12);
    remaining += 1;
  }

  return result;
}

export function clampVoicing(voicing: number, noteCount: number): number {
  if (noteCount <= 1) {
    return 0;
  }

  const maxShift = noteCount - 1;
  return Math.min(maxShift, Math.max(-maxShift, voicing));
}

export function stepVoicing(current: number, delta: number, noteCount: number): number {
  return clampVoicing(current + delta, noteCount);
}
