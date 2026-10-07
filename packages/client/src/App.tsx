import { useState } from 'react';
import { LandingHero } from './components/LandingHero';
import { AuthScreen } from './components/AuthScreen';
import { WelcomeInterstitial } from './components/WelcomeInterstitial';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [stage, setStage] = useState<'hero' | 'auth' | 'welcome' | 'dashboard'>('hero');
  const [userName, setUserName] = useState('Abhijeet');

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col justify-center items-center relative overflow-x-hidden selection:bg-purple-600 selection:text-white">
      {/* Background Ambience & Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="fixed bottom-10 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Stage 1: Landing Hero Entrance */}
      {stage === 'hero' && (
        <LandingHero onStart={() => setStage('auth')} />
      )}

      {/* Stage 2: Auth Screen */}
      {stage === 'auth' && (
        <AuthScreen
          onSuccess={(name) => {
            setUserName(name);
            setStage('welcome');
          }}
          onBack={() => setStage('hero')}
        />
      )}

      {/* Stage 3: Welcome Interstitial */}
      {stage === 'welcome' && (
        <WelcomeInterstitial
          userName={userName}
          onProceed={() => setStage('dashboard')}
        />
      )}

      {/* Stage 4: Live Dashboard */}
      {stage === 'dashboard' && (
        <Dashboard
          userName={userName}
          onReset={() => setStage('hero')}
        />
      )}
    </div>
  );
}
