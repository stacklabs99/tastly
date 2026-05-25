export function isTrialExpired(trialEndsAt: string | null | undefined): boolean {
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() < Date.now();
}

export function getTrialDaysLeft(trialEndsAt: string | null | undefined): number | null {
  if (!trialEndsAt) return null;
  return Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 864e5);
}

export function shouldSendTrialWarning(
  trialEndsAt: string | null | undefined,
  trialWarningSentAt: string | null | undefined,
): boolean {
  if (!trialEndsAt) return false;
  const daysLeft = getTrialDaysLeft(trialEndsAt);
  if (daysLeft === null || daysLeft <= 0 || daysLeft > 3) return false;
  if (!trialWarningSentAt) return true;
  // Re-send only if last warning was sent before the 4-day warning window opened
  const windowStart = new Date(new Date(trialEndsAt).getTime() - 4 * 864e5);
  return new Date(trialWarningSentAt).getTime() < windowStart.getTime();
}
