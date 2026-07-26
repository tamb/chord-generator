/** Returns whether a loaded history snapshot should replace in-memory state. */
export function shouldApplyLoadedHistory(alreadyHydrated: boolean, cancelled: boolean): boolean {
  return !alreadyHydrated && !cancelled;
}
