import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Guitar, Mic, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
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
                    <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="bg-[#aa3bff] hover:bg-[#902be6] px-5 py-2 rounded-lg font-medium transition-colors">
                            Dashboard
                        </Link>
                    ) : (
                        <div className="flex space-x-3">
                            <Link to="/login" className="px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">Log in</Link>
                            <Link to="/register" className="bg-[#aa3bff] hover:bg-[#902be6] px-5 py-2 rounded-lg font-medium transition-colors">Sign Up</Link>
                        </div>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        Your ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#aa3bff] to-[#d980ff]">chord & repertoire</span> manager.
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        CifrAS helps musicians manage, transpose, and organize their chord charts and setlists for live performances and rehearsals.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 pt-8">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="w-full sm:w-auto bg-[#aa3bff] hover:bg-[#902be6] text-white font-bold py-4 px-8 rounded-full transition-colors text-lg flex items-center justify-center space-x-2">
                                <LayoutDashboard className="w-5 h-5" />
                                <span>Go to Dashboard</span>
                            </Link>
                        ) : (
                            <Link to="/register" className="w-full sm:w-auto bg-[#aa3bff] hover:bg-[#902be6] text-white font-bold py-4 px-8 rounded-full transition-colors text-lg">
                                Get Started for Free
                            </Link>
                        )}
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-gray-800 hover:bg-gray-700 transition-colors text-lg">
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Features Grid */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-32 text-left">
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                        <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                            <Guitar className="w-6 h-6 text-[#aa3bff]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Instant Transposition</h3>
                        <p className="text-gray-400">Change keys in seconds. Never struggle with complex chords during a gig or rehearsal again.</p>
                    </div>
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                        <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                            <FileText className="w-6 h-6 text-[#aa3bff]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Theater Mode</h3>
                        <p className="text-gray-400">Distraction-free, full-screen auto-scrolling view optimized for live stage performances.</p>
                    </div>
                    <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700">
                        <div className="w-12 h-12 bg-[#aa3bff]/20 rounded-xl flex items-center justify-center mb-6">
                            <Mic className="w-6 h-6 text-[#aa3bff]" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Collaborative Playlists</h3>
                        <p className="text-gray-400">Create groups, share setlists with your bandmates, and keep everyone in sync effortlessly.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 text-center text-gray-500 text-sm">
                <p>© 2026 CifrAS. All rights reserved.</p>
                <div className="mt-2 space-x-4">
                    <Link to="/privacy?lang=pt" className="hover:text-gray-300">Política de Privacidade</Link>
                    <span>|</span>
                    <Link to="/privacy?lang=en" className="hover:text-gray-300">Privacy Policy</Link>
                </div>
            </footer>
        </div>
    );
};
