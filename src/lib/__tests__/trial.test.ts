import { describe, it, expect, vi, afterEach } from "vitest";
import { isTrialExpired, getTrialDaysLeft, shouldSendTrialWarning } from "@/lib/trial";

const DAY = 864e5;
const now = new Date("2025-06-01T12:00:00Z").getTime();

afterEach(() => vi.useRealTimers());

function useFixedDate() {
  vi.useFakeTimers({ now });
}

// ── isTrialExpired ─────────────────────────────────────────────────────────────

describe("isTrialExpired", () => {
  it("returns false for null", () => {
    expect(isTrialExpired(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isTrialExpired(undefined)).toBe(false);
  });

  it("returns false when trial ends in the future", () => {
    useFixedDate();
    expect(isTrialExpired(new Date(now + DAY).toISOString())).toBe(false);
  });

  it("returns true when trial ended yesterday", () => {
    useFixedDate();
    expect(isTrialExpired(new Date(now - DAY).toISOString())).toBe(true);
  });

  it("returns true when trial ended 1ms ago", () => {
    useFixedDate();
    expect(isTrialExpired(new Date(now - 1).toISOString())).toBe(true);
  });
});

// ── getTrialDaysLeft ───────────────────────────────────────────────────────────

describe("getTrialDaysLeft", () => {
  it("returns null for null input", () => {
    expect(getTrialDaysLeft(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getTrialDaysLeft(undefined)).toBeNull();
  });

  it("returns 1 when trial ends in less than 24h", () => {
    useFixedDate();
    expect(getTrialDaysLeft(new Date(now + DAY - 1000).toISOString())).toBe(1);
  });

  it("returns 3 when trial ends in exactly 3 days", () => {
    useFixedDate();
    expect(getTrialDaysLeft(new Date(now + 3 * DAY).toISOString())).toBe(3);
  });

  it("returns negative when trial has already expired", () => {
    useFixedDate();
    const daysLeft = getTrialDaysLeft(new Date(now - 2 * DAY).toISOString());
    expect(daysLeft).toBeLessThan(0);
  });
});

// ── shouldSendTrialWarning ────────────────────────────────────────────────────

describe("shouldSendTrialWarning", () => {
  it("returns false when trialEndsAt is null", () => {
    expect(shouldSendTrialWarning(null, null)).toBe(false);
  });

  it("returns false when trial has more than 3 days left", () => {
    useFixedDate();
    expect(shouldSendTrialWarning(new Date(now + 4 * DAY).toISOString(), null)).toBe(false);
  });

  it("returns false when trial is already expired", () => {
    useFixedDate();
    expect(shouldSendTrialWarning(new Date(now - DAY).toISOString(), null)).toBe(false);
  });

  it("returns true when trial has 3 days left and no warning sent yet", () => {
    useFixedDate();
    expect(shouldSendTrialWarning(new Date(now + 3 * DAY).toISOString(), null)).toBe(true);
  });

  it("returns true when trial has 1 day left and no warning sent yet", () => {
    useFixedDate();
    expect(shouldSendTrialWarning(new Date(now + DAY).toISOString(), null)).toBe(true);
  });

  it("returns false when warning was already sent within the 4-day window", () => {
    useFixedDate();
    const trialEndsAt = new Date(now + 3 * DAY).toISOString();
    // Warning sent 2 hours ago (well within the window)
    const trialWarningSentAt = new Date(now - 2 * 3600_000).toISOString();
    expect(shouldSendTrialWarning(trialEndsAt, trialWarningSentAt)).toBe(false);
  });

  it("returns true when warning was sent before the 4-day window opened (stale)", () => {
    useFixedDate();
    const trialEndsAt = new Date(now + 3 * DAY).toISOString();
    // Warning was sent 5 days before expiry (before the window)
    const trialWarningSentAt = new Date(now - 2 * DAY).toISOString();
    expect(shouldSendTrialWarning(trialEndsAt, trialWarningSentAt)).toBe(true);
  });

  it("returns true for exactly 3 days left with undefined warningSentAt", () => {
    useFixedDate();
    expect(shouldSendTrialWarning(new Date(now + 3 * DAY).toISOString(), undefined)).toBe(true);
  });
});
