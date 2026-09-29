'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getProfiles, saveProfile, clearOldProfilesCache } from '@/lib/storage';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllCities } from '@/lib/cities';

const ALL_CITIES = getAllCities();

export default function BirthForm({ onSubmit, loading, label, compact }) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [form, setForm] = useState({
    name: '',
    dob: '',
    tob: '',
    pob: '',
    gender: 'Male',
  });
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [profiles, setProfiles] = useState([]);

  // City autocomplete state
  const [cityQuery, setCityQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    clearOldProfilesCache();
    if (userId) {
      setProfiles(getProfiles(userId));
    }
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities on query change
  useEffect(() => {
    if (!cityQuery || cityQuery.length < 1) {
      setFilteredCities([]);
      return;
    }
    const q = cityQuery.toLowerCase();
    // Deduplicate by coordinates (some cities have alternate names)
    const seen = new Set();
    const matches = ALL_CITIES.filter((c) => {
      const key = `${c.lat}_${c.lon}`;
      if (seen.has(key)) return false;
      const match = c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q);
      if (match) seen.add(key);
      return match;
    }).slice(0, 8); // Show max 8 suggestions
    setFilteredCities(matches);
    setHighlightIndex(-1);
  }, [cityQuery]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCityInputChange = (e) => {
    const val = e.target.value;
    setCityQuery(val);
    setForm((prev) => ({ ...prev, pob: val }));
    setShowDropdown(true);
  };

  const handleCitySelect = (city) => {
    const display = `${city.name}, ${city.state}`;
    setCityQuery(display);
    setForm((prev) => ({ ...prev, pob: display }));
    setShowDropdown(false);
  };

  const handleCityKeyDown = (e) => {
    if (!showDropdown || filteredCities.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, filteredCities.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleCitySelect(filteredCities[highlightIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleLoadProfile = (e) => {
    const profile = profiles.find((p) => p.name === e.target.value);
    if (profile) {
      setForm({
        name: profile.name || '',
        dob: profile.dob || '',
        tob: profile.tob || '',
        pob: profile.pob || '',
        gender: profile.gender || 'Male',
      });
      setCityQuery(profile.pob || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saveToProfile && userId) {
      saveProfile(form, userId);
      setProfiles(getProfiles(userId));
    }
    onSubmit(form);
  };

  const isValid = form.name && form.dob && form.tob && form.pob;

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-5'}>
      {/* Load Profile */}
      {profiles.length > 0 && (
        <div>
          <label className="block text-text-secondary text-sm mb-1">{t('form.loadProfile')}</label>
          <select
            className="input-mystical"
            onChange={handleLoadProfile}
            defaultValue=""
          >
            <option value="" disabled>{t('form.selectProfile')}</option>
            {profiles.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">{t('form.fullName')}</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t('form.namePlaceholder')}
          className="input-mystical"
          required
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">{t('form.dob')}</label>
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          className="input-mystical"
          required
        />
      </div>

      {/* Time of Birth */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">{t('form.tob')}</label>
        <input
          type="time"
          name="tob"
          value={form.tob}
          onChange={handleChange}
          className="input-mystical"
          required
        />
      </div>

      {/* Place of Birth — Autocomplete */}
      <div ref={dropdownRef} className="relative">
        <label className="block text-text-secondary text-sm mb-1">{t('form.pob')}</label>
        <input
          ref={inputRef}
          type="text"
          name="pob"
          value={cityQuery || form.pob}
          onChange={handleCityInputChange}
          onFocus={() => cityQuery && setShowDropdown(true)}
          onKeyDown={handleCityKeyDown}
          placeholder={t('form.pobPlaceholder')}
          className="input-mystical"
          autoComplete="off"
          required
        />
        {showDropdown && filteredCities.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-border-custom bg-card-bg shadow-lg">
            {filteredCities.map((city, i) => (
              <li
                key={`${city.name}-${city.state}`}
                className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  i === highlightIndex
                    ? 'bg-gold-primary/20 text-gold-primary'
                    : 'text-text-primary hover:bg-white/5'
                }`}
                onMouseDown={() => handleCitySelect(city)}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                <span className="font-medium">{city.name}</span>
                <span className="text-text-secondary ml-1.5 text-xs">{city.state}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">{t('form.gender')}</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="input-mystical"
        >
          <option value="Male">{t('form.male')}</option>
          <option value="Female">{t('form.female')}</option>
          <option value="Other">{t('form.other')}</option>
        </select>
      </div>

      {/* Save Profile Checkbox — only for logged-in users */}
      {userId && (
        <label className="flex items-center gap-2 cursor-pointer text-text-secondary text-sm">
          <input
            type="checkbox"
            checked={saveToProfile}
            onChange={(e) => setSaveToProfile(e.target.checked)}
            className="w-4 h-4 rounded border-border-custom accent-gold-primary"
          />
          {t('form.saveProfile')}
        </label>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="btn-gold w-full text-center"
      >
        {loading ? t('form.processing') : label || t('form.defaultSubmit')}
      </button>
    </form>
  );
}
