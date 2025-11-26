
import React, { useState, useEffect, useRef } from 'react';
import { MatchGroup, ChatMessage, UserProfile, Appointment } from '../types';
import { getIcebreakerTopic, getChatReplySuggestion, generatePersonaResponse } from '../services/geminiService';
import { Send, Calendar, Info, Sparkles, Check, Smile, ChevronLeft, MoreVertical, User, Heart, MapPin, Clock, UserPlus, Eye, Lock, Camera } from 'lucide-react';

interface ChatProps {
    match: MatchGroup;
    user: UserProfile;
    history: ChatMessage[];
    language: 'ko' | 'en';
    onUpdateHistory: (msgs: ChatMessage[]) => void;
    onBack: () => void;
    onScheduleAppointment: (apt: Appointment) => void;
    isProfileUnlocked: boolean;
    onUnlockProfile: () => void;
}

export const ChatView: React.FC<ChatProps> = ({ match, user, history, language, onUpdateHistory, onBack, onScheduleAppointment, isProfileUnlocked, onUnlockProfile }) => {
    const [messages, setMessages] = useState<ChatMessage[]>(history.length > 0 ? history : [
        { id: '0', sender: 'system', text: '매칭이 성사되었습니다! 설레는 대화를 시작해보세요.', timestamp: Date.now() },
    ]);
    const [input, setInput] = useState('');
    const [showMeetingMode, setShowMeetingMode] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    
    // Profile & Scheduler State
    const [isRequestingProfile, setIsRequestingProfile] = useState(false);
    const [showExtendedProfile, setShowExtendedProfile] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [suggestedReply, setSuggestedReply] = useState<string | null>(null);

    // Scheduler Data
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    const [bookingStep, setBookingStep] = useState<'input' | 'connecting' | 'confirmed'>('input');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync local state with parent history
    useEffect(() => {
        onUpdateHistory(messages);
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        const lastMsg = messages[messages.length-1];
         if (lastMsg && lastMsg.sender === 'partner') {
             getChatReplySuggestion(messages, language).then(reply => setSuggestedReply(reply));
         } else {
             setSuggestedReply(null);
         }
    }, [messages, language]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'me',
            text: text,
            timestamp: Date.now()
        };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setSuggestedReply(null); // Clear suggestion after sending
        
        setIsTyping(true);
        
        try {
            const responseText = await generatePersonaResponse(newMessages, match, user, language);

            setTimeout(() => {
                const aiMsg: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'partner',
                    text: responseText,
                    timestamp: Date.now()
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
            }, 1500);
        } catch (error) {
            console.error(error);
            setIsTyping(false);
        }
    };

    const handleRequestProfile = () => {
        if (isProfileUnlocked || isRequestingProfile) return;
        
        setIsRequestingProfile(true);
        const sysMsg1: ChatMessage = {
            id: Date.now().toString(),
            sender: 'system',
            text: '상대방에게 확장 프로필(사진, MBTI, 얼굴상 등) 공개를 요청했습니다.',
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, sysMsg1]);

        // Simulate acceptance
        setTimeout(() => {
             const sysMsg2: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'system',
                text: '상대방이 요청을 수락했습니다!\n이제 [확장 프로필 보기]를 통해 상세 정보를 확인할 수 있습니다.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, sysMsg2]);
            setIsRequestingProfile(false);
            onUnlockProfile();
        }, 2500);
    };

    const handleConfirmAppointment = () => {
        if(!scheduleDate || !scheduleTime) return alert('날짜와 시간을 선택해주세요.');
        
        setBookingStep('connecting');
        
        setTimeout(() => {
            setBookingStep('confirmed');
            
            // Save appointment
            const newApt: Appointment = {
                id: Date.now().toString(),
                matchId: match.id,
                partnerName: match.members.map(m => m.name).join(', '),
                date: scheduleDate,
                time: scheduleTime,
                location: match.region || '강남',
                status: 'confirmed'
            };
            onScheduleAppointment(newApt);
            
            // System message
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'system',
                text: `[📅 예약 확인] ${scheduleDate} ${scheduleTime}\n제휴 매장 예약이 완료되었습니다. 매칭 캘린더에서 확인하세요.`,
                timestamp: Date.now()
            }]);

            setTimeout(() => {
                setShowScheduler(false);
                setBookingStep('input');
                setScheduleDate('');
                setScheduleTime('');
            }, 1500);
        }, 2000);
    };

    if (showMeetingMode) {
        return <MeetingModeView onClose={() => setShowMeetingMode(false)} />;
    }

    return (
        <div className="flex flex-col h-screen bg-[#F5F7FA]">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm z-10 flex justify-between items-center border-b border-gray-100">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full">
                    <ChevronLeft />
                </button>
                <div className="text-center">
                    <h2 className="font-bold text-brand-dark text-lg">{match.university}</h2>
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <p className="text-xs text-gray-500 font-medium">
                            {isTyping ? '입력 중...' : '대화 가능'}
                        </p>
                    </div>
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/50">
                {messages.map(msg => {
                    if (msg.sender === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-6">
                                <div className="bg-gray-200/70 text-gray-600 text-[11px] px-4 py-1.5 rounded-full whitespace-pre-wrap text-center shadow-sm border border-white">
                                    {msg.text}
                                </div>
                            </div>
                        );
                    }
                    const isMe = msg.sender === 'me';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                             {!isMe && (
                                <div className="w-8 h-8 rounded-full bg-brand-secondary/30 mr-2 flex items-center justify-center flex-shrink-0 text-xs font-bold text-brand-secondary overflow-hidden border border-brand-secondary/50">
                                     {/* Generic Avatar in Chat until unlocked, or just keep generic */}
                                     {match.members[0].gender === '여성' ? '👩' : '🧑'}
                                </div>
                             )}
                            <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMe 
                                ? 'bg-brand-primary text-white rounded-br-none' 
                                : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-500 p-3.5 rounded-2xl rounded-bl-none border border-gray-100 flex space-x-1 ml-10">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Bar */}
            {suggestedReply && !isTyping && (
                 <div className="px-3 pb-2 bg-brand-cream/50">
                    <div 
                        onClick={() => handleSend(suggestedReply)}
                        className="w-full bg-white border border-brand-primary/30 text-brand-primary px-3 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center cursor-pointer hover:bg-brand-light"
                    >
                        <Sparkles className="w-3 h-3 mr-1.5" />
                        "{suggestedReply}"
                    </div>
                 </div>
            )}

            {/* Input Area */}
            <div className="bg-white p-3 border-t border-gray-100 pb-safe">
                 <div className="flex space-x-2 mb-3 px-1 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setShowMeetingMode(true)} className="flex-shrink-0 flex items-center text-xs font-bold bg-brand-secondary/10 text-brand-secondary px-3 py-2 rounded-xl border border-brand-secondary/20">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" /> 주제 추천
                    </button>
                    <button onClick={() => setShowScheduler(true)} className="flex-shrink-0 flex items-center text-xs font-bold bg-pink-50 text-pink-600 px-3 py-2 rounded-xl border border-pink-100">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" /> 약속 잡기
                    </button>
                     
                     {!isProfileUnlocked && !isRequestingProfile && (
                        <button onClick={handleRequestProfile} className="flex-shrink-0 flex items-center text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-xl border border-blue-100">
                            <Lock className="w-3.5 h-3.5 mr-1.5" /> 확장 프로필 요청
                        </button>
                     )}
                     {isRequestingProfile && (
                        <button disabled className="flex-shrink-0 flex items-center text-xs font-bold bg-gray-100 text-gray-400 px-3 py-2 rounded-xl border border-gray-200">
                            <Clock className="w-3.5 h-3.5 mr-1.5" /> 수락 대기중...
                        </button>
                     )}
                     {isProfileUnlocked && (
                         <button onClick={() => setShowExtendedProfile(true)} className="flex-shrink-0 flex items-center text-xs font-bold bg-brand-primary text-white px-3 py-2 rounded-xl border border-brand-primary shadow-sm animate-pulse">
                             <Eye className="w-3.5 h-3.5 mr-1.5" /> 확장 프로필 보기
                         </button>
                     )}
                 </div>
                 <div className="flex space-x-2 items-end">
                    <textarea 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                        placeholder="메시지를 입력하세요..."
                        rows={1}
                        className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-primary resize-none text-sm max-h-24"
                    />
                    <button 
                        onClick={() => handleSend()} 
                        className={`p-3 rounded-full transition-all ${input.trim() ? 'bg-brand-primary text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                 </div>
            </div>

            {/* Extended Profile Modal */}
            {showExtendedProfile && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up h-[80vh] flex flex-col">
                        <div className="bg-brand-primary p-6 text-white relative flex-shrink-0">
                            <button onClick={() => setShowExtendedProfile(false)} className="absolute top-4 right-4 opacity-70 hover:opacity-100"><Check className="w-6 h-6" /></button>
                            <h3 className="text-xl font-bold mb-1">{match.university}</h3>
                            <p className="text-brand-light text-sm">{match.department} • {match.members.length}명</p>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto flex-1">
                            <h4 className="text-center font-bold text-gray-800 text-lg mb-2">✨ 확장 프로필 상세</h4>
                            {match.members.map((m, i) => (
                                <div key={i} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm">
                                    <div className="flex items-center mb-4">
                                        <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-primary/20 mr-4 overflow-hidden shadow-inner relative">
                                            {/* Extended Profile Picture */}
                                            {m.profileImage ? (
                                                <img src={m.profileImage} alt={m.name} className="w-full h-full object-cover" />
                                            ) : (
                                                 <div className="w-full h-full flex items-center justify-center bg-brand-light text-brand-primary">
                                                     <User className="w-8 h-8" />
                                                 </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg text-gray-800">{m.name}</p>
                                            <p className="text-xs text-gray-500">{m.university || match.university} {m.major} • {m.age}세</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold mb-1">MBTI</p>
                                            <p className="text-brand-primary font-bold">{m.mbti || '?'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                                            <p className="text-xs text-gray-400 font-bold mb-1">얼굴상</p>
                                            <p className="text-gray-700">{m.faceType || '?'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 col-span-2">
                                            <p className="text-xs text-gray-400 font-bold mb-1">이상형</p>
                                            <p className="text-gray-700">{m.idealType || '?'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-gray-100 col-span-2">
                                            <p className="text-xs text-gray-400 font-bold mb-1">가치관</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {m.values && m.values.map((v, vi) => (
                                                    <span key={vi} className="bg-brand-secondary/10 text-brand-dark text-[10px] px-2 py-0.5 rounded-full">#{v}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Scheduler Modal */}
            {showScheduler && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
                     <div className="bg-white rounded-3xl w-full max-w-xs p-6 text-center shadow-2xl animate-slide-up">
                        <h3 className="font-bold text-lg text-brand-dark mb-6">만남 일정 조율</h3>
                        
                        {bookingStep === 'input' && (
                            <>
                                <div className="space-y-4 mb-6 text-left">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">날짜 선택</label>
                                        <input type="date" className="w-full bg-gray-50 p-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none" onChange={e => setScheduleDate(e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">시간 선택</label>
                                        <input type="time" className="w-full bg-gray-50 p-3 rounded-xl text-sm border border-gray-200 focus:ring-2 focus:ring-brand-primary outline-none" onChange={e => setScheduleTime(e.target.value)} />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowScheduler(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">취소</button>
                                    <button onClick={handleConfirmAppointment} className="flex-1 py-3 bg-brand-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/30">확인</button>
                                </div>
                            </>
                        )}

                        {bookingStep === 'connecting' && (
                             <div className="py-8">
                                 <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                 <p className="font-bold text-gray-800">제휴매장과 연결 중...</p>
                                 <p className="text-xs text-gray-400 mt-1">예약 가능 여부를 확인하고 있습니다</p>
                             </div>
                        )}

                        {bookingStep === 'confirmed' && (
                             <div className="py-8">
                                 <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                     <Check className="w-6 h-6" />
                                 </div>
                                 <p className="font-bold text-gray-800 text-lg">예약 확인 되었습니다</p>
                                 <p className="text-xs text-gray-400 mt-1">채팅방과 캘린더에 일정이 등록되었습니다.</p>
                             </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const MeetingModeView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [topic, setTopic] = useState<string>("로딩 중...");
    
    useEffect(() => {
        getIcebreakerTopic("university date").then(setTopic);
    }, []);

    return (
        <div className="h-screen bg-gradient-to-br from-brand-secondary to-brand-primary text-white flex flex-col relative p-6">
            <button onClick={onClose} className="self-end bg-white/20 rounded-full p-2"><Check className="w-6 h-6" /></button>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <h2 className="text-3xl font-bold mb-4">{topic}</h2>
            </div>
        </div>
    );
};

export const ReviewView: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    return (
        <div className="min-h-screen bg-brand-cream p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-3 text-brand-dark">평가 하기</h2>
            <button onClick={onFinish} className="w-full bg-brand-dark text-white py-4 rounded-2xl font-bold mt-8">
                완료
            </button>
        </div>
    );
};
