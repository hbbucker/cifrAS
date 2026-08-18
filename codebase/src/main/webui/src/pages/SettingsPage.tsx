import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
 const { t } = useTranslation();
 const [preferences, setPreferences] = useState({
 enharmonics: 'flats',
 fontScale: 100,
 scrollSpeedMultiplier: 1.0
 });

 return (
    <>
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="min-h-[56px] sm:min-h-[64px] flex items-center px-4 sm:px-6 bg-bg-card border-b border-border-main shrink-0">
          <h1 className="text-lg sm:text-xl font-bold text-text-main">{t('settings.title')}</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 sm:pb-8 max-w-2xl min-w-0">
 <div className="bg-bg-card rounded-xl border border-border-main p-6 shadow-sm">
 <h2 className="text-lg font-bold text-text-main mb-6">{t('settings.musicPrefs')}</h2>
 
 <div className="space-y-6">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 {t('settings.enharmonics')}
 </label>
 <div className="flex gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio" 
 name="enharmonics" 
 value="flats"
 checked={preferences.enharmonics === 'flats'}
 onChange={() => setPreferences({ ...preferences, enharmonics: 'flats' })}
 className="text-[#8629cc] focus:ring-[#8629cc]"
 />
 <span className="text-text-main">{t('settings.flats')}</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio" 
 name="enharmonics" 
 value="sharps"
 checked={preferences.enharmonics === 'sharps'}
 onChange={() => setPreferences({ ...preferences, enharmonics: 'sharps' })}
 className="text-[#8629cc] focus:ring-[#8629cc]"
 />
 <span className="text-text-main">{t('settings.sharps')}</span>
 </label>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 {t('settings.fontScale', { scale: preferences.fontScale })}
 </label>
 <input 
 type="range" 
 min="80" max="150" step="10"
 value={preferences.fontScale}
 onChange={(e) => setPreferences({ ...preferences, fontScale: Number(e.target.value) })}
 className="w-full accent-[#8629cc]"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">
 {t('settings.scrollSpeed', { speed: preferences.scrollSpeedMultiplier })}
 </label>
 <input 
 type="range" 
 min="0.5" max="2.0" step="0.1"
 value={preferences.scrollSpeedMultiplier}
 onChange={(e) => setPreferences({ ...preferences, scrollSpeedMultiplier: Number(e.target.value) })}
 className="w-full accent-[#8629cc]"
 />
 </div>

 <div className="pt-4 border-t border-border-main">
 <button className="flex items-center gap-2 bg-[#8629cc] hover:bg-[#721eb8] text-white px-5 py-2.5 rounded-lg font-bold transition-colors">
 <Save className="w-5 h-5" /> {t('settings.save')}
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </>
 );
};
