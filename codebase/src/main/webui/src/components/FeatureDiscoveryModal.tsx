import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FeatureDiscoveryModalProps {
  onClose: () => void;
}

export const FeatureDiscoveryModal: React.FC<FeatureDiscoveryModalProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Container */}
      <div className="bg-[#fbfbf9] rounded-[32px] w-full max-w-md p-8 flex flex-col items-center text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-full bg-[#8629cc]/10 flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 text-[#8629cc]" />
        </div>

        {/* Text */}
        <h2 className="text-[#000000] text-2xl font-bold mb-4">
          {t('featureDiscovery.title')}
        </h2>
        <div className="text-[#33332e] text-base space-y-3 mb-8 text-left w-full">
          <p>🎤 {t('featureDiscovery.singerMode')}</p>
          <p>📊 {t('featureDiscovery.playlistExport')}</p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#8629cc] text-white py-4 rounded-2xl font-semibold text-lg hover:bg-[#7221b0] transition-colors"
        >
          {t('featureDiscovery.button')}
        </button>
      </div>
    </div>
  );
};
