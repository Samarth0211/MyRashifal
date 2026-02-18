'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getProfiles, saveProfile, clearOldProfilesCache } from '@/lib/storage';

export default function BirthForm({ onSubmit, loading, label, compact }) {
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

  useEffect(() => {
    clearOldProfilesCache(); // Remove old shared profiles
    if (userId) {
      setProfiles(getProfiles(userId));
    }
  }, [userId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
          <label className="block text-text-secondary text-sm mb-1">Load Saved Profile</label>
          <select
            className="input-mystical"
            onChange={handleLoadProfile}
            defaultValue=""
          >
            <option value="" disabled>Select a profile...</option>
            {profiles.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g., Priya Sharma"
          className="input-mystical"
          required
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">Date of Birth</label>
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
        <label className="block text-text-secondary text-sm mb-1">Time of Birth</label>
        <input
          type="time"
          name="tob"
          value={form.tob}
          onChange={handleChange}
          className="input-mystical"
          required
        />
      </div>

      {/* Place of Birth */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">Place of Birth</label>
        <input
          type="text"
          name="pob"
          value={form.pob}
          onChange={handleChange}
          placeholder="e.g., Mumbai, Maharashtra"
          className="input-mystical"
          required
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-text-secondary text-sm mb-1">Gender</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="input-mystical"
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
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
          Save this profile for future use
        </label>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || loading}
        className="btn-gold w-full text-center"
      >
        {loading ? 'Processing...' : label || 'Generate My Kundli ✨'}
      </button>
    </form>
  );
}
