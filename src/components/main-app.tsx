"use client";

import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { Header } from '@/components/header';
import { SettingsPanel } from '@/components/settings-panel';
import { Loader } from '@/components/loader';
import { SubscriptionModal } from '@/components/subscription-modal';
import { AuthModal } from '@/components/auth-modal';
import { AccountPage } from '@/components/account-page';
import { Footer } from '@/components/footer';
import { LegalModal } from '@/components/legal-modal';
import { LandingPage } from '@/components/landing-page';
import { useToast } from '@/hooks/use-toast';
import { generateStudyAidsFromTopic } from '@/ai/flows/generate-study-aids-from-topic';
import { userService } from '@/lib/user-service';
import type { StudySet, Settings, User, ViewState, Theme } from '@/lib/types';
import { Button } from './ui/button';

const QuizView = React.lazy(() => import('@/components/quiz-view').then(module => ({ default: module.QuizView })));
const FlashcardView = React.lazy(() => import('@/components/flashcard-view').then(module => ({ default: module.FlashcardView })));
const MatchingGameView = React.lazy(() => import('@/components/matching-game-view').then(module => ({ default: module.MatchingGameView })));
const DiagramView = React.lazy(() => import('@/components/diagram-view').then(module => ({ default: module.DiagramView })));
const Chatbot = React.lazy(() => import('@/components/chatbot'));

type ActiveTab = 'quiz' | 'flashcards' | 'matching' | 'diagram';

export function MainApp() {
  const [view, setView] = useState<ViewState>('landing');
  const [theme, setTheme] = useState<Theme>('light');
  
  const [user, setUser] = useState<User | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);

  const { toast } = useToast();

  const [settings, setSettings] = useState<Settings>({
    topic: '',
    fileContent: null,
    imageContent: null,
    resourceTypes: {
      mcqs: true,
      shortAnswer: true,
      flashcards: true,
      matching: false,
      diagram: false,
    },
    count: 5,
    difficulty: 'Intermediate',
  });
  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('quiz');

  useEffect(() => {
    const savedPrefs = userService.getPreferences();
    const isDark = savedPrefs.darkMode || window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
    } else {
        setTheme('light');
        document.documentElement.classList.remove('dark');
    }

    const unsubscribe = userService.initAuth((loadedUser) => {
        setUser(loadedUser);
        setAuthInitialized(true);
        if (loadedUser) {
            setView(prev => prev === 'landing' ? 'home' : prev);
            if (savedPrefs.lastTopic) {
                setSettings(prev => ({
                    ...prev,
                    topic: savedPrefs.lastTopic || '',
                    difficulty: savedPrefs.lastDifficulty || 'Intermediate',
                    resourceTypes: savedPrefs.lastResourceTypes || prev.resourceTypes,
                    count: userService.hasPremiumAccess(loadedUser) ? 10 : 5
                }));
            }
        } else {
             setView('landing');
        }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
      setTheme(prev => {
          const newTheme = prev === 'light' ? 'dark' : 'light';
          if (newTheme === 'dark') {
              document.documentElement.classList.add('dark');
          } else {
              document.documentElement.classList.remove('dark');
          }
          userService.savePreferences({ darkMode: newTheme === 'dark' });
          return newTheme;
      });
  };

  const navigateTo = (target: ViewState) => {
      if (target !== 'landing' && !user) {
          setShowAuthModal(true);
          return;
      }
      setView(target);
      window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
      await userService.logout();
      setUser(null);
      setStudySet(null);
      setView('landing');
      toast({ title: "Logged out", description: "You have been successfully logged out."});
  };

  const handleGenerate = useCallback(async (currentSettings: Settings) => {
    if (!user) {
        setShowAuthModal(true);
        return;
    }

    userService.savePreferences({
        lastTopic: currentSettings.topic,
        lastDifficulty: currentSettings.difficulty,
        lastResourceTypes: currentSettings.resourceTypes
    });

    setIsLoading(true);
    setError(null);
    setStudySet(null);
    
    try {
      const result = await generateStudyAidsFromTopic({
        ...currentSettings,
        imageContent: currentSettings.imageContent?.base64 || null
      });
      setStudySet(result);
      
      userService.incrementStats('setsGenerated');
      
      if (result.mcqs?.length || result.shortAnswerQuestions?.length) setActiveTab('quiz');
      else if (result.flashcards?.length) setActiveTab('flashcards');
      else if (result.matchingPairs?.length) setActiveTab('matching');
      else if (result.diagramQuestions?.length) setActiveTab('diagram');
      
    } catch (e: any) {
      console.error(e);
      const errorMessage = `Failed to generate study materials. ${e.message || 'Please try again.'}`;
      setError(errorMessage);
      toast({ title: "Generation Failed", description: "The AI failed to generate materials. Please check your topic and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const handleStartOver = () => {
    setStudySet(null);
    setError(null);
    setSettings(prev => ({
        ...prev,
        fileContent: null,
        imageContent: null,
    }));
  };

  const renderTabs = () => {
    if (!studySet) return null;
    const tabs: { key: ActiveTab, label: string, disabled: boolean }[] = [
        { key: 'quiz', label: 'Quiz', disabled: !(studySet.mcqs?.length || studySet.shortAnswerQuestions?.length) },
        { key: 'flashcards', label: 'Flashcards', disabled: !studySet.flashcards?.length },
        { key: 'matching', label: 'Matching', disabled: !studySet.matchingPairs?.length },
        { key: 'diagram', label: 'Diagram', disabled: !(settings.imageContent && studySet.diagramQuestions?.length) },
    ];

    return (
        <div className="border-b border-border mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.filter(tab => !tab.disabled).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
  };
  
  if (!authInitialized) {
      return (
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-200">
      <Header 
        user={user} 
        theme={theme} 
        toggleTheme={toggleTheme}
        onOpenSubscription={() => setShowSubscription(true)}
        onNavigateHome={() => navigateTo(user ? 'home' : 'landing')}
        onNavigateAccount={() => navigateTo('account')}
        onLogout={handleLogout}
      />
      
      <main className="mx-auto w-full max-w-5xl flex-grow p-4 md:p-6">
        
        {view === 'landing' && <LandingPage onGetStarted={() => setShowAuthModal(true)} />}

        {view === 'account' && user && (
            <AccountPage user={user} onLogout={handleLogout} onManagePlan={() => setShowSubscription(true)} />
        )}

        {view === 'home' && user && (
            <>
                {!studySet && !isLoading && (
                <SettingsPanel 
                    settings={settings}
                    setSettings={setSettings}
                    onGenerate={handleGenerate} 
                    isLoading={isLoading}
                    user={user}
                    onUpgradeClick={() => setShowSubscription(true)}
                />
                )}
                
                {isLoading && <Loader />}
                
                {error && !isLoading && (
                <div className="rounded-md border-l-4 border-destructive bg-destructive/10 p-4 text-destructive-foreground" role="alert">
                    <p className="font-bold">An Error Occurred</p>
                    <p>{error}</p>
                    <Button onClick={handleStartOver} variant="destructive" className="mt-4">
                        Try Again
                    </Button>
                </div>
                )}

                {studySet && !isLoading && (
                    <div className="animate-fade-in rounded-2xl border bg-card p-6 text-card-foreground shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-headline text-2xl font-bold text-foreground">Your Study Set for "{settings.topic}"</h2>
                            <Button onClick={handleStartOver} >
                                New Topic
                            </Button>
                        </div>

                        {renderTabs()}

                        <Suspense fallback={<div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div></div>}>
                            <div>
                                {activeTab === 'quiz' && <QuizView mcqs={studySet.mcqs || []} shortAnswers={studySet.shortAnswerQuestions || []} />}
                                {activeTab === 'flashcards' && <FlashcardView flashcards={studySet.flashcards || []} />}
                                {activeTab === 'matching' && <MatchingGameView pairs={studySet.matchingPairs || []} />}
                                {activeTab === 'diagram' && settings.imageContent && <DiagramView imageSrc={settings.imageContent.url} questions={studySet.diagramQuestions || []} />}
                            </div>
                        </Suspense>
                    </div>
                )}
            </>
        )}
      </main>
      
      <Footer 
        onOpenTerms={() => setShowLegal('terms')} 
        onOpenPrivacy={() => setShowLegal('privacy')} 
      />

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLogin={(u) => {
            setUser(u);
            toast({ title: `Welcome back, ${u.name}!`});
        }}
      />

      {user && <SubscriptionModal 
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        user={user}
        onUserUpdate={setUser}
      />}
      
      <LegalModal type={showLegal} onClose={() => setShowLegal(null)} />

      {user && (
         <Suspense fallback={null}>
            <Chatbot user={user} />
         </Suspense>
      )}
    </div>
  );
}
