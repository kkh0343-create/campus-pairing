
import React, { useState } from 'react';
import { AppState, AppView, UserProfile, MyGroup, MatchGroup, ChatMessage, Appointment } from './types';
import { LoginView, ProfileSetupView } from './components/AuthComponents';
import { DashboardView, GroupSetupView, MatchListView, ChatListView, MyPageView } from './components/MainComponents';
import { ChatView, ReviewView } from './components/ActionComponents';
import { Home, MessageCircle, User as UserIcon } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    view: AppView.LOGIN,
    language: 'ko',
    user: null,
    myGroup: null,
    matches: [],
    activeMatch: null,
    chatHistories: {},
    appointments: [], // New State
    isProfileRevealed: false,
    unlockedMatches: []
  });

  const handleLoginSuccess = () => {
    setState(prev => ({ ...prev, view: AppView.PROFILE_SETUP }));
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setState(prev => ({ ...prev, user: profile, view: AppView.GROUP_SETUP }));
  };

  const startMatchProcess = () => {
    setState(prev => ({ ...prev, view: AppView.GROUP_SETUP }));
  };

  const handleGroupConfirm = (group: MyGroup) => {
    setState(prev => ({ ...prev, myGroup: group, view: AppView.MATCH_LIST }));
  };

  const handleMatchSelect = (match: MatchGroup) => {
     setState(prev => {
         // CRITICAL: Ensure this match is added to the persistent matches list if not already there.
         // This makes it show up in the Chat List view.
         const exists = prev.matches.find(m => m.id === match.id);
         const updatedMatches = exists ? prev.matches : [...prev.matches, match];

         const existingHistory = prev.chatHistories[match.id] || [];
         const newHistory: ChatMessage[] = existingHistory.length > 0 ? existingHistory : [
            { id: 'init', sender: 'system', text: '대화가 시작되었습니다.', timestamp: Date.now() }
         ];
         
         return { 
             ...prev, 
             matches: updatedMatches,
             activeMatch: match, 
             view: AppView.CHAT,
             chatHistories: { ...prev.chatHistories, [match.id]: newHistory }
         };
     });
  };

  const updateChatHistory = (messages: ChatMessage[]) => {
      if (state.activeMatch) {
          setState(prev => ({
              ...prev,
              chatHistories: {
                  ...prev.chatHistories,
                  [state.activeMatch!.id]: messages
              }
          }));
      }
  };
  
  const handleAddAppointment = (apt: Appointment) => {
      setState(prev => ({
          ...prev,
          appointments: [...prev.appointments, apt]
      }));
  };
  
  const handleUnlockProfile = (matchId: string) => {
      setState(prev => ({
          ...prev,
          unlockedMatches: [...prev.unlockedMatches, matchId]
      }));
  };

  const handleSetLanguage = (lang: 'ko' | 'en') => {
      setState(prev => ({ ...prev, language: lang }));
  };

  const NavButton = ({ icon: Icon, label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${active ? 'text-brand-primary' : 'text-gray-300 hover:text-gray-400'}`}
    >
      <Icon className={`w-7 h-7 mb-1 ${active ? 'fill-current' : 'stroke-2'}`} />
    </button>
  );

  const renderContent = () => {
    switch (state.view) {
      case AppView.LOGIN:
        return <LoginView onLoginSuccess={handleLoginSuccess} language={state.language} onSetLanguage={handleSetLanguage} />;
      case AppView.PROFILE_SETUP:
        return <ProfileSetupView onComplete={handleProfileComplete} />;
      case AppView.DASHBOARD:
        return state.user && (
            <DashboardView 
                user={state.user} 
                appointments={state.appointments}
                onStartMatch={startMatchProcess} 
            />
        );
      case AppView.GROUP_SETUP:
        return <GroupSetupView onConfirm={handleGroupConfirm} onCancel={() => setState(prev => ({ ...prev, view: AppView.DASHBOARD }))} />;
      case AppView.MATCH_LIST:
        return state.user && state.myGroup && (
            <MatchListView 
                user={state.user} 
                criteria={state.myGroup} 
                onSelectMatch={handleMatchSelect} 
                onBack={() => setState(prev => ({ ...prev, view: AppView.GROUP_SETUP }))} 
            />
        );
      case AppView.CHAT_LIST:
          return (
              <ChatListView 
                matches={state.matches}
                histories={state.chatHistories}
                onEnterChat={handleMatchSelect}
                userRegion={state.myGroup?.region || '서울'}
              />
          );
      case AppView.MY_PAGE:
          return state.user && <MyPageView user={state.user} />;
      case AppView.CHAT:
        return state.user && state.activeMatch && (
            <ChatView 
                user={state.user} 
                match={state.activeMatch} 
                language={state.language}
                history={state.chatHistories[state.activeMatch.id] || []}
                onUpdateHistory={updateChatHistory}
                onBack={() => setState(prev => ({ ...prev, view: AppView.DASHBOARD }))}
                onScheduleAppointment={handleAddAppointment}
                isProfileUnlocked={state.unlockedMatches.includes(state.activeMatch.id)}
                onUnlockProfile={() => handleUnlockProfile(state.activeMatch!.id)}
            />
        );
      case AppView.REVIEW:
        return <ReviewView onFinish={() => setState(prev => ({ ...prev, view: AppView.DASHBOARD, activeMatch: null }))} />;
      default:
        return <div>Error: Unknown View</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-brand-cream min-h-screen shadow-2xl overflow-hidden relative font-sans">
      {renderContent()}

      {(state.view === AppView.DASHBOARD || state.view === AppView.MATCH_LIST || state.view === AppView.CHAT_LIST || state.view === AppView.MY_PAGE) && (
        <div className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-lg border-t border-gray-100 flex justify-between px-8 pb-safe shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.02)] z-50 rounded-t-3xl">
            <NavButton 
                icon={Home} 
                label="홈" 
                active={state.view === AppView.DASHBOARD || state.view === AppView.MATCH_LIST} 
                onClick={() => setState(prev => ({ ...prev, view: AppView.DASHBOARD }))} 
            />
            <NavButton 
                icon={MessageCircle} 
                label="채팅" 
                active={state.view === AppView.CHAT_LIST} 
                onClick={() => setState(prev => ({ ...prev, view: AppView.CHAT_LIST }))} 
            />
            <NavButton 
                icon={UserIcon} 
                label="마이" 
                active={state.view === AppView.MY_PAGE} 
                onClick={() => setState(prev => ({ ...prev, view: AppView.MY_PAGE }))} 
            />
        </div>
      )}
    </div>
  );
};

export default App;
