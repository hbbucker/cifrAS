import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    Guitar,
    FileText,
    LayoutDashboard,
    Users,
    Search,
    Smartphone,
    Layers,
    Play,
    Pause,
    Plus,
    Minus,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/ui/BrandLogo';

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const transposeChord = (root: string, suffix: string, semitones: number): string => {
    const idx = CHROMATIC_SCALE.indexOf(root);
    if (idx === -1) return root + suffix;
    const newIdx = (idx + semitones + 120) % 12;
    return CHROMATIC_SCALE[newIdx] + suffix;
};

export const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const [transposeOffset, setTransposeOffset] = useState<number>(0);
    const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
    const [scrollSpeed, setScrollSpeed] = useState<number>(3);

    const handleTranspose = (delta: number) => {
        setTransposeOffset((prev) => prev + delta);
    };

    const handleSpeedChange = (delta: number) => {
        setScrollSpeed((prev) => Math.min(10, Math.max(1, prev + delta)));
    };

    const chord1 = transposeChord('G', '', transposeOffset);
    const chord2 = transposeChord('E', 'm', transposeOffset);
    const chord3 = transposeChord('C', '', transposeOffset);
    const chord4 = transposeChord('D', '7', transposeOffset);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col selection:bg-[#aa3bff]/30 selection:text-white">
            {/* Header */}
            <header className="container mx-auto px-4 sm:px-6 py-5 flex justify-between items-center border-b border-gray-800/80">
                <div className="flex items-center space-x-3">
                    <BrandLogo size="md" asLink to="/" textClassName="text-white text-xl sm:text-2xl font-bold tracking-tight" />
                </div>
                <nav className="flex items-center space-x-3 sm:space-x-4">
                    <a href="#features" className="hidden sm:inline-block text-sm text-gray-400 hover:text-white transition-colors">
                        {t('landing.learnMore')}
                    </a>
                    <Link to="/privacy" className="hidden sm:inline-block text-sm text-gray-400 hover:text-white transition-colors">
                        {t('landing.privacy')}
                    </Link>
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="bg-[#9926f0] hover:bg-[#7a1ab8] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base flex items-center space-x-1.5 shadow-sm"
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>{t('landing.dashboard')}</span>
                        </Link>
                    ) : (
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <Link
                                to="/login"
                                className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium hover:bg-gray-800 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                            >
                                {t('landing.login')}
                            </Link>
                            <Link
                                to="/login"
                                className="bg-[#9926f0] hover:bg-[#7a1ab8] px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base shadow-sm"
                            >
                                {t('landing.signUp')}
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto w-full">
                {/* Hero Section */}
                <section className="w-full flex flex-col items-center text-center space-y-8 pt-4 pb-12">
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-[#aa3bff]/10 border border-[#aa3bff]/30 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#d980ff]">
                        <Sparkles className="w-4 h-4 text-[#aa3bff]" />
                        <span>{t('landing.badge')}</span>
                    </div>

                    {/* Headline */}
                    <div className="max-w-4xl space-y-4">
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            {t('landing.yourUltimate')}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#aa3bff] via-[#c966ff] to-[#d980ff]">
                                {t('landing.chordRepertoire')}
                            </span>
                            {t('landing.manager')}
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            {t('landing.desc1')}
                        </p>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 w-full max-w-md sm:max-w-none pt-2">
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="w-full sm:w-auto bg-[#9926f0] hover:bg-[#7a1ab8] text-white font-bold py-3.5 px-8 rounded-full transition-all text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg shadow-[#9926f0]/20 active:scale-95"
                            >
                                <LayoutDashboard className="w-5 h-5" />
                                <span>{t('landing.goDashboard')}</span>
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="w-full sm:w-auto bg-[#9926f0] hover:bg-[#7a1ab8] text-white font-bold py-3.5 px-8 rounded-full transition-all text-base sm:text-lg flex items-center justify-center space-x-2 shadow-lg shadow-[#9926f0]/20 active:scale-95"
                            >
                                <span>{t('landing.getStarted')}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                        <a
                            href="#features"
                            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold bg-gray-800/90 hover:bg-gray-700/90 border border-gray-700 transition-colors text-base sm:text-lg text-gray-200"
                        >
                            {t('landing.learnMore')}
                        </a>
                    </div>

                    {/* Interactive Chord Preview Demo Card */}
                    <div className="w-full max-w-2xl mt-8 pt-4">
                        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-700/80 p-5 sm:p-6 text-left shadow-2xl relative overflow-hidden">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-700/70 pb-4 mb-4">
                                <div>
                                    <div className="text-xs font-semibold text-[#d980ff] uppercase tracking-wider">Demo Interativa</div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                        {t('landing.demoSongTitle')} <span className="text-xs text-gray-400 font-normal">({t('landing.demoArtist')})</span>
                                    </h2>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Transpose Controls */}
                                    <div className="flex items-center bg-gray-900/90 border border-gray-700 rounded-lg p-1">
                                        <button
                                            onClick={() => handleTranspose(-1)}
                                            className="p-1.5 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors"
                                            title="Transpor Tom -"
                                            aria-label="Transpor Tom Menos"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-2 text-xs font-semibold text-[#d980ff]">
                                            {t('landing.demoKey')}: {chord1}
                                        </span>
                                        <button
                                            onClick={() => handleTranspose(1)}
                                            className="p-1.5 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors"
                                            title="Transpor Tom +"
                                            aria-label="Transpor Tom Mais"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Speed Controls */}
                                    <div className="flex items-center bg-gray-900/90 border border-gray-700 rounded-lg p-1">
                                        <button
                                            onClick={() => handleSpeedChange(-1)}
                                            className="p-1.5 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors"
                                            title="Velocidade -"
                                            aria-label="Diminuir Velocidade"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-2 text-xs font-semibold text-gray-300">
                                            {t('landing.demoSpeed')}: {scrollSpeed}x
                                        </span>
                                        <button
                                            onClick={() => handleSpeedChange(1)}
                                            className="p-1.5 hover:bg-gray-800 rounded text-gray-300 hover:text-white transition-colors"
                                            title="Velocidade +"
                                            aria-label="Aumentar Velocidade"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Auto-scroll toggle */}
                                    <button
                                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                                        aria-label="Alternar rolagem automática"
                                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            isAutoScrolling
                                                ? 'bg-[#aa3bff]/20 border-[#aa3bff]/40 text-[#d980ff]'
                                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                        <span className="hidden xs:inline">Auto-Scroll</span>
                                    </button>
                                </div>
                            </div>

                            {/* Simulated Chords & Lyrics */}
                            <div className="space-y-4 font-mono text-sm sm:text-base">
                                <div className="space-y-1">
                                    <div className="flex space-x-12 text-[#d980ff] font-bold text-sm sm:text-base tracking-wide">
                                        <span>{chord1}</span>
                                        <span>{chord2}</span>
                                    </div>
                                    <p className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed">
                                        {t('landing.demoLyrics1')}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex space-x-12 text-[#d980ff] font-bold text-sm sm:text-base tracking-wide">
                                        <span>{chord3}</span>
                                        <span>{chord4}</span>
                                    </div>
                                    <p className="text-gray-300 font-sans text-sm sm:text-base leading-relaxed">
                                        {t('landing.demoLyrics2')}
                                    </p>
                                </div>
                            </div>

                            {/* Active scroll bar indicator */}
                            {isAutoScrolling && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#aa3bff] to-[#d980ff] w-1/3 animate-pulse" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-16 sm:py-24 border-t border-gray-800/80">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            {t('landing.featuresTitle')}
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg">
                            {t('landing.featuresSubtitle')}
                        </p>
                    </div>

                    {/* 6 Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto text-left">
                        {/* 1. Transposição */}
                        <div className="bg-gray-800/50 hover:bg-gray-800/80 p-6 sm:p-8 rounded-2xl border border-gray-700/70 hover:border-[#aa3bff]/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                                    <Guitar className="w-6 h-6 text-[#aa3bff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{t('landing.instantTrans')}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.desc3')}</p>
                            </div>
                        </div>

                        {/* 2. Modo Teatro */}
                        <div className="bg-gray-800/50 hover:bg-gray-800/80 p-6 sm:p-8 rounded-2xl border border-gray-700/70 hover:border-[#aa3bff]/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                                    <FileText className="w-6 h-6 text-[#aa3bff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{t('landing.theaterMode')}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.desc4')}</p>
                            </div>
                        </div>

                        {/* 3. Playlists DnD */}
                        <div className="bg-gray-800/50 hover:bg-gray-800/80 p-6 sm:p-8 rounded-2xl border border-gray-700/70 hover:border-[#aa3bff]/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                                    <Layers className="w-6 h-6 text-[#aa3bff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{t('landing.collab')}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.desc2')}</p>
                            </div>
                        </div>

                        {/* 4. Grupos & Bandas */}
                        <div className="bg-gray-800/50 hover:bg-gray-800/80 p-6 sm:p-8 rounded-2xl border border-gray-700/70 hover:border-[#aa3bff]/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                                    <Users className="w-6 h-6 text-[#aa3bff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{t('landing.featGroupsTitle')}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.featGroupsDesc')}</p>
                            </div>
                        </div>

                        {/* 5. Editor & Busca */}
                        <div className="bg-gray-800/50 hover:bg-gray-800/80 p-6 sm:p-8 rounded-2xl border border-gray-700/70 hover:border-[#aa3bff]/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                                    <Search className="w-6 h-6 text-[#aa3bff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{t('landing.featEditorTitle')}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.featEditorDesc')}</p>
                            </div>
                        </div>

                        {/* 6. Otimizado para Pedestal & Palco */}
                        <div className="bg-gray-800/50 hover:bg-gray-800/80 p-6 sm:p-8 rounded-2xl border border-gray-700/70 hover:border-[#aa3bff]/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                                    <Smartphone className="w-6 h-6 text-[#aa3bff]" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{t('landing.featMobileTitle')}</h3>
                                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.featMobileDesc')}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="w-full py-16 sm:py-24 border-t border-gray-800/80">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            {t('landing.howItWorksTitle')}
                        </h2>
                        <p className="text-gray-400 text-base sm:text-lg">
                            {t('landing.howItWorksSubtitle')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="bg-gray-800/30 border border-gray-800 p-6 sm:p-8 rounded-2xl relative text-left">
                            <div className="w-10 h-10 bg-[#aa3bff]/20 text-[#d980ff] rounded-full flex items-center justify-center font-bold text-lg mb-6">
                                1
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{t('landing.step1Title')}</h3>
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.step1Desc')}</p>
                        </div>

                        <div className="bg-gray-800/30 border border-gray-800 p-6 sm:p-8 rounded-2xl relative text-left">
                            <div className="w-10 h-10 bg-[#aa3bff]/20 text-[#d980ff] rounded-full flex items-center justify-center font-bold text-lg mb-6">
                                2
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{t('landing.step2Title')}</h3>
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.step2Desc')}</p>
                        </div>

                        <div className="bg-gray-800/30 border border-gray-800 p-6 sm:p-8 rounded-2xl relative text-left">
                            <div className="w-10 h-10 bg-[#aa3bff]/20 text-[#d980ff] rounded-full flex items-center justify-center font-bold text-lg mb-6">
                                3
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{t('landing.step3Title')}</h3>
                            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">{t('landing.step3Desc')}</p>
                        </div>
                    </div>
                </section>

                {/* Final CTA Banner */}
                <section className="w-full py-12 sm:py-16">
                    <div className="bg-gradient-to-r from-[#aa3bff]/20 via-purple-900/30 to-gray-800/60 border border-[#aa3bff]/30 rounded-3xl p-8 sm:p-12 text-center max-w-5xl mx-auto space-y-6">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                            {t('landing.ctaTitle')}
                        </h2>
                        <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                            {t('landing.ctaSubtitle')}
                        </p>
                        <div className="pt-2">
                            <Link
                                to={isAuthenticated ? "/dashboard" : "/login"}
                                className="inline-flex items-center space-x-2 bg-[#9926f0] hover:bg-[#7a1ab8] text-white font-bold py-4 px-8 rounded-full text-base sm:text-lg transition-all shadow-xl shadow-[#9926f0]/25 active:scale-95"
                            >
                                <span>{t('landing.ctaButton')}</span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 text-center text-gray-400 text-sm">
                <p>{t('landing.rights')}</p>
                <div className="mt-2 space-x-4">
                    <Link to="/privacy?lang=pt" className="hover:text-gray-200 transition-colors">{t('landing.privacy')}</Link>
                    <span>|</span>
                    <Link to="/privacy?lang=en" className="hover:text-gray-200 transition-colors">{t('landing.privacy')}</Link>
                </div>
            </footer>
        </div>
    );
};
