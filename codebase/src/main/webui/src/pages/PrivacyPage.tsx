import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Shield, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const lang = searchParams.get('lang') || 'pt';

    useEffect(() => {
        const fileName = lang === 'en' ? '/privacy-en.md' : '/privacy-pt.md';
        fetch(fileName)
            .then(res => res.text())
            .then(text => {
                setContent(text);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to load privacy policy', err);
                setContent('# Error loading privacy policy. Please try again later.');
                setIsLoading(false);
            });
    }, [lang]);

    const handleLanguageChange = (newLang: string) => {
        if (lang !== newLang) {
            setIsLoading(true);
            setSearchParams({ lang: newLang });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <div className="bg-gray-850 px-6 py-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-800 z-10">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-500 hover:text-white"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-2">
                            <Shield className="w-6 h-6 text-[#8629cc]" />
                            <h1 className="text-xl font-bold text-white">{t('landing.privacy')}</h1>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => handleLanguageChange('pt')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${lang === 'pt' ? 'bg-[#8629cc] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            PT
                        </button>
                        <button 
                            onClick={() => handleLanguageChange('en')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${lang === 'en' ? 'bg-[#8629cc] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>
                
                <div className="p-8 prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#8629cc] max-w-none">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8629cc]"></div>
                        </div>
                    ) : (
                        <ReactMarkdown>{content}</ReactMarkdown>
                    )}
                </div>
                
                <div className="bg-gray-850 px-6 py-4 border-t border-gray-700 text-center">
                    <p className="text-sm text-gray-500">{t('landing.rights')}</p>
                </div>
            </div>
        </div>
    );
};
