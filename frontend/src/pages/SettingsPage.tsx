import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [preferences, setPreferences] = useState({
    enharmonics: 'flats',
    fontScale: 100,
    scrollSpeedMultiplier: 1.0
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Music Preferences</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enharmonics Preference
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="enharmonics" 
                      value="flats"
                      checked={preferences.enharmonics === 'flats'}
                      onChange={() => setPreferences({ ...preferences, enharmonics: 'flats' })}
                      className="text-[#aa3bff] focus:ring-[#aa3bff]"
                    />
                    <span className="text-gray-900 dark:text-white">Flats (b)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="enharmonics" 
                      value="sharps"
                      checked={preferences.enharmonics === 'sharps'}
                      onChange={() => setPreferences({ ...preferences, enharmonics: 'sharps' })}
                      className="text-[#aa3bff] focus:ring-[#aa3bff]"
                    />
                    <span className="text-gray-900 dark:text-white">Sharps (#)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chord Font Scale: {preferences.fontScale}%
                </label>
                <input 
                  type="range" 
                  min="80" max="150" step="10"
                  value={preferences.fontScale}
                  onChange={(e) => setPreferences({ ...preferences, fontScale: Number(e.target.value) })}
                  className="w-full accent-[#aa3bff]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Base Scroll Speed Multiplier: {preferences.scrollSpeedMultiplier}x
                </label>
                <input 
                  type="range" 
                  min="0.5" max="2.0" step="0.1"
                  value={preferences.scrollSpeedMultiplier}
                  onChange={(e) => setPreferences({ ...preferences, scrollSpeedMultiplier: Number(e.target.value) })}
                  className="w-full accent-[#aa3bff]"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex items-center gap-2 bg-[#aa3bff] hover:bg-[#902be6] text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
                  <Save className="w-5 h-5" /> Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
