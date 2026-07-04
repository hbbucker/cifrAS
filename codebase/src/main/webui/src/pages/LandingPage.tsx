import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Music, Guitar, Mic, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
    const { isAuthenticated } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <header className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#aa3bff]/20 rounded-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-[#aa3bff]" />
                    </div>
                    <span className="text-2xl font-bold">CifrAS</span>
                </div>
                <nav className="flex items-center space-x-4">
                    <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">{t('landing.privacy')}</Link>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="bg-[#aa3bff] hover:bg-[#902be6] px-5 py-2 rounded-lg font-medium transition-colors">
                            {t('landing.dashboard')}
                        </Link>
                    ) : (
                        <div className="flex space-x-3">
                            <Link to="/login" className="px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">{t('landing.login')}</Link>
                            <Link to="/login" className="bg-[#aa3bff] hover:bg-[#902be6] px-5 py-2 rounded-lg font-medium transition-colors">{t('landing.signUp')}</Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        {t('landing.yourUltimate')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#aa3bff] to-[#d980ff]">{t('landing.chordRepertoire')}</span> {t('landing.manager')}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        {t('landing.desc1')}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="w-full sm:w-auto bg-[#aa3bff] hover:bg-[#902be6] text-white font-bold py-4 px-8 rounded-full transition-colors text-lg flex items-center justify-center space-x-2">
                                <LayoutDashboard className="w-5 h-5" />
                                <span>{t('landing.goDashboard')}</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="w-full sm:w-auto bg-[#aa3bff] hover:bg-[#902be6] text-white font-bold py-4 px-8 rounded-full transition-colors text-lg">
                                {t('landing.getStarted')}
                            </Link>
                        )}
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-gray-800 hover:bg-gray-700 transition-colors text-lg">
                            {t('landing.learnMore')}
                        </a>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 text-left">
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                        <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                            <Guitar className="w-6 h-6 text-[#aa3bff]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('landing.instantTrans')}</h3>
                        <p className="text-gray-400">{t('landing.desc3')}</p>
                    </div>
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                        <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6 text-[#aa3bff]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('landing.theaterMode')}</h3>
                        <p className="text-gray-400">{t('landing.desc4')}</p>
                    </div>
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                        <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                            <Mic className="w-6 h-6 text-[#aa3bff]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">{t('landing.collab')}</h3>
                        <p className="text-gray-400">{t('landing.desc2')}</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
                <p>{t('landing.rights')}</p>
                <div className="mt-2 space-x-4">
                    <Link to="/privacy?lang=pt" className="hover:text-gray-300">{t('landing.privacy')}</Link>
                    <span>|</span>
                    <Link to="/privacy?lang=en" className="hover:text-gray-300">{t('landing.privacy')}</Link>
                </div>
            </footer>
        </div>
    );
};
