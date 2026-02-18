'use client';

const PROFILES_KEY = 'myrashifal_profiles';
const KUNDLI_KEY = 'myrashifal_kundli';
const PURCHASES_KEY = 'myrashifal_purchases';
const REPORTS_KEY = 'myrashifal_reports';

function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

// Profiles are now scoped per user ID — only logged-in users can save/load profiles
function profileKey(userId) {
  return `${PROFILES_KEY}_${userId}`;
}

export function saveProfile(profile, userId) {
  if (!userId) return; // Anonymous users cannot save profiles
  const profiles = getProfiles(userId);
  const existing = profiles.findIndex((p) => p.name === profile.name);
  if (existing >= 0) {
    profiles[existing] = { ...profile, updatedAt: Date.now() };
  } else {
    profiles.push({ ...profile, createdAt: Date.now() });
  }
  safeSet(profileKey(userId), profiles);
}

export function getProfiles(userId) {
  if (!userId) return [];
  return safeGet(profileKey(userId)) || [];
}

export function deleteProfile(name, userId) {
  if (!userId) return;
  const profiles = getProfiles(userId).filter((p) => p.name !== name);
  safeSet(profileKey(userId), profiles);
}

// Remove old shared profiles from localStorage
export function clearOldProfilesCache() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILES_KEY);
  } catch {}
}

export function saveKundli(kundliData) {
  // No-op: kundli is now stored per-user in MongoDB for logged-in users,
  // and kept in React state only for anonymous users (no persistence).
}

export function getKundli() {
  // No-op: kundli is loaded from MongoDB for logged-in users.
  return null;
}

// Remove stale kundli data from localStorage (shared across all accounts)
export function clearOldKundliCache() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KUNDLI_KEY);
  } catch {}
}

export function savePurchase(reportType, paymentId) {
  const purchases = safeGet(PURCHASES_KEY) || {};
  purchases[reportType] = { paymentId, purchasedAt: Date.now() };
  safeSet(PURCHASES_KEY, purchases);
}

export function hasPurchased(reportType) {
  const purchases = safeGet(PURCHASES_KEY) || {};
  return !!purchases[reportType];
}

export function getAllPurchases() {
  return safeGet(PURCHASES_KEY) || {};
}

export function saveReport(reportType, reportData) {
  const reports = safeGet(REPORTS_KEY) || {};
  reports[reportType] = { data: reportData, generatedAt: Date.now() };
  safeSet(REPORTS_KEY, reports);
}

export function getReport(reportType) {
  const reports = safeGet(REPORTS_KEY) || {};
  return reports[reportType]?.data || null;
}

export function getAllReports() {
  return safeGet(REPORTS_KEY) || {};
}
