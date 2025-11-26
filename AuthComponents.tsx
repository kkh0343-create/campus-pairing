
import React, { useState, useRef } from 'react';
import { AppView, Gender, UserProfile } from '../types';
import { User, ArrowRight, BookOpen, Heart, CheckCircle, ExternalLink, Lock, Smile, HeartHandshake, Sparkles, Globe, Camera } from 'lucide-react';

const EVERYTIME_ICON = "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/9c/16/26/9c162671-1509-5794-f94b-030d794775c4/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/246x0w.webp";

interface LoginProps {
  onLoginSuccess: () => void;
  language: 'ko' | 'en';
  onSetLanguage: (lang: 'ko' | 'en') => void;
}

export const LoginView: React.FC<LoginProps> = ({ onLoginSuccess, language, onSetLanguage }) => {
  const [step, setStep] = useState<'INIT' | 'WAITING'>('INIT');
  const [loading, setLoading] = useState(false);

  const handleOpenEverytime = () => {
    window.open('https://account.everytime.kr/login', '_blank');
    setStep('WAITING');
  };

  const handleVerifyCompletion = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-cream p-6 text-brand-dark relative overflow-hidden">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <div className="bg-white rounded-full p-1 shadow-md flex">
            <button 
                onClick={() => onSetLanguage('ko')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${language === 'ko' ? 'bg-brand-primary text-white' : 'text-gray-400'}`}
            >
                한국어
            </button>
            <button 
                onClick={() => onSetLanguage('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${language === 'en' ? 'bg-brand-primary text-white' : 'text-gray-400'}`}
            >
                ENG
            </button>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand-secondary opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-brand-primary opacity-20 rounded-full blur-3xl"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-md">
        <div className="relative mb-8 group">
           <div className="absolute inset-0 bg-brand-accent rounded-full blur-sm scale-110 opacity-50 group-hover:scale-125 transition-transform"></div>
           <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center relative overflow-hidden border-4 border-brand-secondary">
              <div className="absolute top-0 w-full h-1/2 bg-brand-accent/30"></div>
              <div className="relative z-10 flex flex-col items-center">
                <Heart className="w-12 h-12 text-brand-primary fill-brand-primary animate-pulse" />
                <BookOpen className="w-10 h-10 text-brand-dark -mt-2" />
              </div>
           </div>
        </div>

        <h1 className="text-4xl font-bold mb-2 tracking-tight text-brand-dark font-display">
          Campus <span className="text-brand-primary">Pairing</span>
        </h1>
        <p className="text-gray-500 mb-12 text-center font-medium">
            {language === 'ko' ? '에브리타임 계정 연동으로\n안전하고 확실한 매칭을 시작하세요' : 'Start safe matching with\nEverytime account verification'}
        </p>

        <div className="w-full space-y-4">
            {step === 'INIT' ? (
                <button 
                onClick={handleOpenEverytime}
                className="w-full bg-white text-[#c62917] font-bold py-4 px-6 rounded-2xl shadow-lg shadow-gray-200 border border-red-100 flex items-center justify-center space-x-3 hover:bg-red-50 transition-all active:scale-95"
                >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                        <img src={EVERYTIME_ICON} alt="Everytime" className="w-full h-full object-cover" />
                    </div>
                    <span>{language === 'ko' ? '에브리타임 로그인 하러가기' : 'Login with Everytime'}</span>
                    <ExternalLink className="w-4 h-4 opacity-70 ml-auto" />
                </button>
            ) : (
                <div className="space-y-3 animate-fade-in w-full">
                    <div className="bg-white p-4 rounded-2xl border border-brand-secondary/30 text-center mb-4 shadow-sm">
                        <p className="text-sm font-bold text-brand-dark mb-1">로그인 창이 열렸나요?</p>
                        <p className="text-xs text-gray-500">로그인 완료 후 아래 버튼을 눌러주세요.</p>
                    </div>
                    
                    <button 
                        onClick={handleVerifyCompletion}
                        disabled={loading}
                        className="w-full bg-brand-primary text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center justify-center space-x-3 hover:bg-pink-400 transition-all active:scale-95 disabled:opacity-70"
                    >
                         {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>확인 중...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                <span>로그인 완료 (연동하기)</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

export const ProfileSetupView: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    gender: Gender.MALE,
    university: '경북대학교',
    isVerified: true,
    faceType: '강아지상',
    idealType: '',
    mbti: 'ISFP'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            handleChange('profileImage', reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age || !formData.major || !formData.bio) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }
    onComplete(formData as UserProfile);
  };

  const mbtiTypes = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
  ];

  return (
    <div className="min-h-screen bg-brand-cream p-4 pb-20">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-brand-secondary/20 p-6">
        
        <div className="mb-6 bg-[#FFF0F0] border border-[#FFDCDC] rounded-xl p-3 flex items-center space-x-3">
            <div className="bg-white w-8 h-8 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden p-0.5 border border-red-100">
                <img src={EVERYTIME_ICON} alt="Everytime" className="w-full h-full object-cover rounded" />
            </div>
            <div>
                <p className="text-xs font-bold text-[#c62917]">에브리타임 인증 완료</p>
                <p className="text-[10px] text-gray-500">경북대학교 학생임이 확인되었습니다.</p>
            </div>
            <CheckCircle className="w-5 h-5 text-[#c62917] ml-auto" />
        </div>

        <h2 className="text-2xl font-bold text-brand-dark mb-2 flex items-center">
          <span className="bg-brand-light p-2 rounded-full mr-2">
            <User className="w-6 h-6 text-brand-primary" />
          </span>
          프로필 작성
        </h2>
        <p className="text-gray-400 text-sm mb-8 pl-1">매력적인 프로필로 매칭 성공률을 높여보세요!</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">이름 (닉네임)</label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none"
              placeholder="예: 20학번 공대남"
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">나이</label>
              <input 
                type="number" 
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none"
                placeholder="20"
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1.5">성별</label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => handleChange('gender', Gender.MALE)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${formData.gender === Gender.MALE ? 'bg-blue-100 text-blue-600 shadow-inner' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('gender', Gender.FEMALE)}
                  className={`flex-1 py-4 rounded-2xl font-bold transition-all ${formData.gender === Gender.FEMALE ? 'bg-brand-light text-brand-primary shadow-inner' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  여
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">학과</label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none"
              placeholder="예: 경영학과"
              onChange={(e) => handleChange('major', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">한줄 소개 (필수)</label>
            <textarea 
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none resize-none h-28"
              placeholder="자신을 어필할 수 있는 매력적인 소개를 적어주세요!"
              onChange={(e) => handleChange('bio', e.target.value)}
            />
          </div>

          <div className="pt-6 border-t border-dashed border-gray-200">
            <p className="text-xs font-bold text-brand-primary mb-4 uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 bg-brand-primary rounded-full mr-2"></span>
              선택 정보 (매칭 확률 UP)
            </p>
            
            {/* Profile Image Upload */}
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center">
                    <Camera className="w-4 h-4 mr-1 text-brand-dark" /> 프로필 사진
                </label>
                <div 
                    className="w-full h-32 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <Camera className="w-8 h-8 mx-auto mb-1" />
                            <span className="text-xs">사진 추가하기</span>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>
            </div>

            <div className="mb-4">
               <label className="block text-sm font-bold text-gray-600 mb-1.5 flex items-center">
                  <Smile className="w-4 h-4 mr-1 text-brand-secondary" /> 얼굴상 (동물상)
               </label>
               <select 
                  className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-secondary outline-none appearance-none"
                  onChange={(e) => handleChange('faceType', e.target.value)}
                  defaultValue="강아지상"
               >
                   <option value="강아지상">🐶 멍뭉미 넘치는 강아지상</option>
                   <option value="고양이상">🐱 도도한 고양이상</option>
                   <option value="토끼상">🐰 귀여운 토끼상</option>
                   <option value="여우상">🦊 매력적인 여우상</option>
                   <option value="곰상">🐻 듬직한 곰상</option>
                   <option value="공룡상">🦖 개성있는 공룡상</option>
                   <option value="기타">✨ 기타</option>
               </select>
            </div>

            <div className="mb-4">
               <label className="block text-sm font-bold text-gray-600 mb-1.5 flex items-center">
                  <HeartHandshake className="w-4 h-4 mr-1 text-brand-primary" /> 연애 가치관 / 이상형
               </label>
               <input 
                 type="text" 
                 className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all outline-none"
                 placeholder="예: 연락 잘 되는 사람"
                 onChange={(e) => handleChange('idealType', e.target.value)}
               />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                <label className="block text-xs text-gray-500 mb-1 flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> MBTI
                </label>
                <select 
                  className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-brand-secondary outline-none"
                  onChange={(e) => handleChange('mbti', e.target.value)}
                  defaultValue="ISFP"
                >
                    {mbtiTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
               </div>
               <div>
                <label className="block text-xs text-gray-500 mb-1">Instagram ID</label>
                <input 
                  type="text" 
                  className="w-full p-3 bg-gray-50 rounded-xl text-sm border-0 focus:ring-2 focus:ring-brand-secondary outline-none"
                  placeholder="@campus"
                  onChange={(e) => handleChange('instaId', e.target.value)}
                />
               </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-primary/30 hover:bg-pink-400 transition flex items-center justify-center"
          >
            완료하고 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
