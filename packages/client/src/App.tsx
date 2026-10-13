import { useState } from 'react';
import { ThemeProvider } from './lib/theme';
import { LandingHero } from './components/LandingHero';
import { AuthScreen } from './components/AuthScreen';
import { WelcomeInterstitial } from './components/WelcomeInterstitial';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [stage, setStage] = useState<'hero' | 'auth' | 'welcome' | 'dashboard'>('hero');
  const [userName, setUserName] = useState('Abhijeet');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-z-bg text-z-text-primary transition-colors font-sans selection:bg-z-accent selection:text-white flex flex-col relative overflow-x-hidden">
        {/* Subtle background ambient noise texture */}
        <div className="fixed inset-0 pointer-events-none z-noise" />

        {/* Stage 1: Landing Hero */}
        {stage === 'hero' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <LandingHero onStart={() => setStage('auth')} />
          </div>
        )}

        {/* Stage 2: Auth Screen */}
        {stage === 'auth' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <AuthScreen
              onSuccess={(name) => {
                setUserName(name);
                setStage('welcome');
              }}
              onBack={() => setStage('hero')}
            />
          </div>
        )}

        {/* Stage 3: Welcome Interstitial */}
        {stage === 'welcome' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <WelcomeInterstitial
              userName={userName}
              onProceed={() => setStage('dashboard')}
            />
          </div>
        )}

        {/* Stage 4: Live Dashboard Hub */}
        {stage === 'dashboard' && (
          <div className="w-full">
            <Dashboard
              userName={userName}
              onReset={() => setStage('hero')}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
