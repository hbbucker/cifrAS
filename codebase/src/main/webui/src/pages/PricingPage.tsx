import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const PricingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-text-main sm:text-4xl">
          {t('pricing.title')}
        </h1>
        <p className="mt-4 text-xl text-text-mute">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-bg-card rounded-[32px] p-8 border border-border-main flex flex-col h-full">
          <h2 className="text-2xl font-bold text-text-main">{t('pricing.free.title')}</h2>
          <p className="mt-4 text-text-mute flex-1">{t('pricing.free.description')}</p>
          <div className="mt-8">
            <div className="text-4xl font-extrabold text-text-main">$0</div>
            <p className="text-text-mute mt-2">{t('pricing.free.limit')}</p>
          </div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center text-text-main">
              <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {t('pricing.free.feature1')}
            </li>
          </ul>
          <Button
            variant="secondary"
            className="mt-8 w-full py-4 text-lg rounded-[16px]"
            onClick={() => navigate('/dashboard')}
          >
            {t('pricing.free.button')}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="bg-bg-card rounded-[32px] p-8 border-2 border-[#aa3bff] shadow-lg flex flex-col h-full relative">
          <div className="absolute top-0 right-0 -mt-4 mr-8 px-4 py-1 bg-[#aa3bff] text-white text-sm font-bold rounded-full">
            {t('pricing.pro.badge')}
          </div>
          <h2 className="text-2xl font-bold text-text-main">{t('pricing.pro.title')}</h2>
          <p className="mt-4 text-text-mute flex-1">{t('pricing.pro.description')}</p>
          <div className="mt-8">
            <div className="text-4xl font-extrabold text-[#aa3bff] uppercase tracking-wider text-2xl">{t('pricing.pro.price')}</div>
            <p className="text-text-mute mt-2">{t('pricing.pro.period')}</p>
          </div>
          <ul className="mt-8 space-y-4 flex-1">
            <li className="flex items-center text-text-main">
              <svg className="w-5 h-5 text-[#aa3bff] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {t('pricing.pro.feature1')}
            </li>
            <li className="flex items-center text-text-main">
              <svg className="w-5 h-5 text-[#aa3bff] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              {t('pricing.pro.feature2')}
            </li>
          </ul>
          <Button
            className="mt-8 w-full py-4 text-lg rounded-[16px] bg-[#aa3bff] hover:bg-[#9630e6] text-white !border-none"
            onClick={() => window.open('https://buy.stripe.com/test', '_blank')}
          >
            {t('pricing.pro.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};
