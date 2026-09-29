'use client';

const TEMP_KUNDLI_KEY = 'myrashifal_temp_kundli';

export function saveTempKundli(kundliData) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(TEMP_KUNDLI_KEY, JSON.stringify(kundliData));
  } catch (e) {
    console.error('Failed to save temp kundli:', e);
  }
}

export function getTempKundli() {
  if (typeof window === 'undefined') return null;
  try {
    const data = sessionStorage.getItem(TEMP_KUNDLI_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearTempKundli() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(TEMP_KUNDLI_KEY);
  } catch {}
}
