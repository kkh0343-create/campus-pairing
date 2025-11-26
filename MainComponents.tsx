
import React, { useState, useEffect } from 'react';
import { UserProfile, MyGroup, MatchGroup, GroupMember, Appointment, ChatMessage } from '../types';
import { Users, MapPin, Heart, Coffee, Search, Plus, Check, X, Bell, ChevronLeft, ArrowRight, GraduationCap, Beer, BookOpen, Map, Edit3, MessageCircle, Smile, Calendar, Clock } from 'lucide-react';
import { generatePotentialMatches } from '../services/geminiService';

// --- Region Data ---
const REGION_DATA: Record<string, Record<string, string[]>> = {
  '서울': {
    '강남구': ['강남역', '신사/압구정', '청담/삼성', '역삼/선릉', '대치/도곡'],
    '마포구': ['홍대입구', '연남동', '신촌/이대', '망원/합정', '상수'],
    '서대문구': ['신촌', '연희동', '북가좌'],
    '성동구': ['성수/서울숲', '왕십리', '한양대'],
    '용산구': ['이태원/한남', '용산역', '숙대입구'],
    '광진구': ['건대입구', '구의', '군자'],
    '관악구': ['서울대입구', '신림', '샤로수길'],
    '송파구': ['잠실/석촌', '방이동', '송리단길'],
    '종로구': ['혜화/대학로', '익선동', '종각/광화문'],
    '중구': ['을지로/힙지로', '명동', '동국대'],
    '동작구': ['노량진', '중앙대/상도'],
    '성북구': ['안암(고대)', '성신여대'],
    '노원구': ['노원역', '공릉(과기대)', '월계'],
    '구로구': ['구로디지털단지', '신도림'],
    '영등포구': ['영등포/타임스퀘어', '여의도', '문래창작촌'],
  },
  '경기': {
    '수원시': ['수원역/AK', '인계동', '행궁동', '영통/경희대', '아주대'],
    '성남시': ['서현역', '판교', '정자/미금', '모란', '가천대'],
    '고양시': ['일산/라페스타', '화정', '백석', '원마운트'],
    '용인시': ['죽전/단국대', '기흥', '역북(명지대)', '에버랜드'],
    '안양시': ['안양일번가', '범계', '평촌'],
    '부천시': ['부천역', '신중동', '상동'],
    '안산시': ['중앙동', '한양대에리카', '고잔신도시'],
    '의정부시': ['의정부역', '민락2지구'],
  },
  '인천': {
    '부평구': ['부평역', '문화의거리'],
    '남동구': ['구월동', '인천터미널'],
    '미추홀구': ['인하대후문', '주안'],
    '연수구': ['송도/센트럴파크', '연수동', '트리플스트리트'],
    '서구': ['청라', '루원시티'],
  },
  '부산': {
    '부산진구': ['서면', '전포카페거리'],
    '금정구': ['부산대앞'],
    '남구': ['경성대/부경대', '대연'],
    '해운대구': ['해운대', '센텀시티', '장산', '해리단길'],
    '수영구': ['광안리', '민락'],
    '중구': ['남포동', '광복동'],
    '사하구': ['하단(동아대)'],
  },
  '대구': {
    '중구': ['동성로', '삼덕동', '교동'],
    '북구': ['경북대북문', '칠곡3지구'],
    '달서구': ['상인동', '계명대동문', '광장코아'],
    '수성구': ['수성못', '범어', '황금동'],
  },
  '대전': {
    '서구': ['둔산동', '갈마동'],
    '유성구': ['궁동(충남대)', '봉명동', '전민동', '죽동'],
    '중구': ['은행동/으능정이', '대흥동'],
    '동구': ['대전복합터미널', '우송대/대전대'],
  },
  '광주': {
    '동구': ['충장로', '동명동', '조선대후문'],
    '북구': ['전남대후문', '용봉동'],
    '서구': ['상무지구', '유스퀘어'],
    '광산구': ['첨단지구', '수완지구'],
  },
  '울산': {
    '남구': ['삼산동', '달동', '울산대앞(무거동)'],
    '중구': ['성남동'],
    '동구': ['일산지'],
  },
  '세종': {
    '세종시': ['나성동', '보람동', '조치원(고대/홍대)'],
  },
  '강원': {
    '춘천시': ['강원대후문', '명동', '애막골'],
    '원주시': ['단계동', '무실동'],
    '강릉시': ['교동택지', '강릉역', '안목해변'],
  },
  '충북': {
    '청주시': ['충북대중문', '성안길', '율량동', '청주대중문'],
    '충주시': ['연수동', '신연수동'],
  },
  '충남': {
    '천안시': ['신부동(야우리)', '두정동', '불당동', '안서동(대학가)'],
    '아산시': ['신용화동', '탕정', '순천향대후문'],
  },
  '전북': {
    '전주시': ['전북대구정문', '신시가지', '객리단길', '한옥마을'],
    '익산시': ['원광대대학로', '영등동'],
    '군산시': ['수송동', '나운동'],
  },
  '전남': {
    '목포시': ['평화광장', '목포대후문', '북항'],
    '순천시': ['조례동', '연향동'],
    '여수시': ['여서동', '해양공원', '여천'],
  },
  '경북': {
    '경산시': ['영남대앞', '하양(대가대)'],
    '포항시': ['영일대', '쌍사', '이동'],
    '구미시': ['인동', '금오산', '옥계'],
    '경주시': ['황리단길', '동국대석장', '성건동'],
  },
  '경남': {
    '창원시': ['상남동', '합성동', '창원대앞', '용호동'],
    '진주시': ['경상대후문', '평거동', '칠암동'],
    '김해시': ['내외동', '인제대앞', '율하'],
  },
  '제주': {
    '제주시': ['제주시청', '아라동', '노형동/연동'],
    '서귀포시': ['서귀포시내', '중문'],
  }
};

// --- University Mapping for Recommendations ---
const REGION_UNIVERSITIES: Record<string, string[]> = {
  '서울': ['서울대', '연세대', '고려대', '서강대', '성균관대', '한양대', '중앙대', '경희대', '한국외대', '서울시립대', '이화여대', '숙명여대', '건국대', '동국대', '홍익대', '국민대', '숭실대', '세종대', '성신여대', '광운대', '명지대', '상명대', '삼육대', '서경대', '서울여대', '동덕여대', '덕성여대'],
  '경기': ['가천대', '경기대', '경희대(국제)', '단국대(죽전)', '성균관대(자연)', '아주대', '인하대', '항공대', '한양대(에리카)', '명지대(자연)', '한국외대(글로벌)', '가톨릭대', '강남대', '대진대', '성결대', '수원대', '안양대', '용인대', '중부대', '평택대', '한경대', '한신대', '한세대', '협성대'],
  '인천': ['인하대', '인천대', '연세대(국제)', '가천대(메디컬)', '경인교대', '청운대(인천)'],
  '부산': ['부산대', '부경대', '동아대', '해양대', '경성대', '동의대', '신라대', '동서대', '부산외대', '동명대', '영산대', '고신대'],
  '대구': ['경북대', '계명대', '영남대', '대구대', '대구가톨릭대', '경일대', '대구한의대'], 
  '대전': ['카이스트', '충남대', '한밭대', '대전대', '한남대', '목원대', '우송대', '배재대', '건양대'],
  '광주': ['전남대', '조선대', '호남대', '광주대', '광주여대', '남부대', '송원대'],
  '울산': ['울산대', 'UNIST'],
  '세종': ['고려대(세종)', '홍익대(세종)'],
  '강원': ['강원대', '한림대', '연세대(미래)', '강릉원주대', '가톨릭관동대', '상지대', '경동대'],
  '충북': ['충북대', '청주대', '한국교원대', '서원대', '한국교통대', '건국대(글로컬)', '세명대', '우석대(진천)'],
  '충남': ['단국대(천안)', '상명대(천안)', '순천향대', '호서대', '백석대', '공주대', '건양대', '남서울대', '나사렛대', '선문대', '중부대', '청운대'],
  '전북': ['전북대', '전주대', '원광대', '우석대', '군산대', '호원대'],
  '전남': ['목포대', '순천대', '목포해양대', '동신대', '초당대'],
  '경북': ['영남대', '대구대', '대구가톨릭대', '포항공대', '금오공대', '안동대', '동국대(와이즈)', '경운대', '김천대'],
  '경남': ['경상국립대', '창원대', '경남대', '인제대', '영산대', '가야대'],
  '제주': ['제주대', '제주국제대']
};

// --- Mock Data ---
const MOCK_FRIENDS = [
    { name: '김준호', major: '컴퓨터공학', age: 24, mbti: 'ISTP' },
    { name: '박서준', major: '경영학과', age: 23, mbti: 'ENFJ' },
    { name: '이민호', major: '체육교육', age: 24, mbti: 'ESFP' },
    { name: '최유리', major: '시각디자인', age: 22, mbti: 'INFP' }
];

// --- Dashboard ---
export const DashboardView: React.FC<{ user: UserProfile, appointments: Appointment[], onStartMatch: () => void }> = ({ user, appointments, onStartMatch }) => {
  return (
    <div className="p-6 pb-24 bg-brand-cream min-h-screen">
      <header className="flex justify-between items-center mb-8 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">
            반가워요, <span className="text-brand-primary">{user.name}</span>님! 
            <span className="inline-block ml-1 animate-wave">👋</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">{user.university} {user.major}</p>
        </div>
        <div className="relative">
            <div className="w-12 h-12 rounded-full bg-brand-secondary p-0.5 shadow-sm overflow-hidden">
                 {user.profileImage ? (
                     <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                 ) : (
                    <img src={`https://ui-avatars.com/api/?name=${user.name}&background=FF8FAB&color=fff`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                 )}
            </div>
        </div>
      </header>

      {/* Stats / Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-pink-400 rounded-3xl p-6 text-white shadow-lg shadow-pink-200 mb-6 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]" onClick={onStartMatch}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-20 transition"></div>
        <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
                <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold">NEW</span>
                <span className="text-pink-100 text-xs">오늘의 매칭이 도착했어요</span>
            </div>
            <h2 className="text-2xl font-bold mb-4 leading-tight">
                새로운 인연을<br/>만나볼까요?
            </h2>
            <button className="bg-white text-brand-primary px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center">
                매칭 시작하기 <ArrowRight className="w-4 h-4 ml-1" />
            </button>
        </div>
      </div>

      {/* Matching Calendar */}
      {appointments.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center text-lg">
                    <Calendar className="w-5 h-5 mr-2 text-brand-primary" />
                    매칭 캘린더
                </h3>
            </div>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {appointments.map(apt => (
                    <div key={apt.id} className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-md border-l-4 border-brand-primary w-64 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-light px-2 py-1 rounded-bl-xl text-[10px] font-bold text-brand-primary">확정됨</div>
                        <h4 className="font-bold text-gray-800 text-lg mb-1 truncate">{apt.partnerName}</h4>
                        <div className="text-gray-500 text-sm space-y-1">
                             <div className="flex items-center"><Calendar className="w-3 h-3 mr-2" /> {apt.date}</div>
                             <div className="flex items-center"><Clock className="w-3 h-3 mr-2" /> {apt.time}</div>
                             <div className="flex items-center"><MapPin className="w-3 h-3 mr-2" /> {apt.location}</div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      )}

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div onClick={onStartMatch} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-secondary/20 flex flex-col items-center justify-center text-center py-8 hover:border-brand-secondary transition cursor-pointer">
            <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center mb-3 text-brand-primary">
                <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">미팅/과팅</h3>
            <p className="text-xs text-gray-400">친구들과 함께</p>
        </div>
        <div onClick={onStartMatch} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-secondary/20 flex flex-col items-center justify-center text-center py-8 hover:border-brand-secondary transition cursor-pointer">
            <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center mb-3 text-brand-primary">
                <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">1:1 소개팅</h3>
            <p className="text-xs text-gray-400">진지한 만남</p>
        </div>
      </div>

      {/* Friend List Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-secondary/20 mb-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center">
                <Smile className="w-4 h-4 mr-2 text-brand-primary" />
                내 친구 목록
            </h3>
            <button className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg hover:bg-gray-200">관리</button>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
             <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-xs text-gray-500">친구 추가</span>
            </div>
            {MOCK_FRIENDS.map((friend, idx) => (
                <div key={idx} className="flex-shrink-0 flex flex-col items-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-brand-light p-0.5 relative">
                        <img src={`https://ui-avatars.com/api/?name=${friend.name}&background=random&color=fff`} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-700">{friend.name}</p>
                        <p className="text-[10px] text-gray-400">{friend.major}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// --- Group Setup Flow ---
interface GroupSetupProps {
    onConfirm: (group: MyGroup) => void;
    onCancel: () => void;
}

export const GroupSetupView: React.FC<GroupSetupProps> = ({ onConfirm, onCancel }) => {
    const [step, setStep] = useState(1);
    const [matchType, setMatchType] = useState<'date' | 'group'>('date');
    
    // Region
    const [selCity, setSelCity] = useState('서울');
    const [selDistrict, setSelDistrict] = useState('');
    const [selDong, setSelDong] = useState('');

    // Members
    const [groupSize, setGroupSize] = useState<number>(2);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [showFriendSelector, setShowFriendSelector] = useState(false);

    // Preferences
    const [atmosphere, setAtmosphere] = useState<'연애 지향' | '친목 지향'>('연애 지향');
    const [gamePreference, setGamePreference] = useState<'대화 위주' | '술게임 선호'>('대화 위주');
    const [prefAgeMin, setPrefAgeMin] = useState(20);
    const [prefAgeMax, setPrefAgeMax] = useState(25);
    const [prefUniv, setPrefUniv] = useState('상관없음');
    const [prefMajorType, setPrefMajorType] = useState<'상관없음' | '메디컬' | '문과' | '이과' | '예체능'>('상관없음');

    const goNext = () => {
        if (step === 1) {
            if (matchType === 'date') setStep(2); // To Region
            else setStep(2); // To Friends
        } else if (step === 2) {
             if (matchType === 'date') {
                 if (!selCity || !selDistrict || !selDong) return alert('지역을 선택해주세요.');
                 setStep(3); // To Prefs
             } else {
                 // Group Flow: Friends -> Region
                 if (members.length < groupSize - 1) return alert(`친구를 ${groupSize - 1}명 추가해주세요.`);
                 setStep(3); 
             }
        } else if (step === 3) {
            if (matchType === 'date') {
                // Finish Date
                submit();
            } else {
                // Group Flow: Region -> Prefs
                if (!selCity || !selDistrict || !selDong) return alert('지역을 선택해주세요.');
                setStep(4);
            }
        } else if (step === 4) {
            // Finish Group
            submit();
        }
    };

    const submit = () => {
        const group: MyGroup = {
            matchType,
            size: matchType === 'date' ? 1 : groupSize as any,
            members,
            region: `${selDistrict} ${selDong}`,
            atmosphere,
            gamePreference,
            preferredAgeMin: prefAgeMin,
            preferredAgeMax: prefAgeMax,
            preferredUniversity: prefUniv,
            preferredMajorType: prefMajorType
        };
        onConfirm(group);
    };

    const goBack = () => {
        if (step === 1) onCancel();
        else setStep(s => s - 1);
    };

    const addFriend = (friend: GroupMember) => {
        if (members.length < groupSize - 1) {
            setMembers(prev => [...prev, friend]);
            setShowFriendSelector(false);
        }
    };
    
    const removeFriend = (idx: number) => {
        setMembers(prev => prev.filter((_, i) => i !== idx));
    }

    // Render helpers
    const renderRegionSelector = () => (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-brand-dark">어디서 만날까요?</h2>
            <p className="text-gray-500 mb-6">선호하는 지역을 선택해주세요.</p>

            <div className="bg-white rounded-3xl shadow-sm border border-brand-secondary/20 overflow-hidden h-[400px] flex text-sm">
                <div className="w-1/3 border-r border-gray-100 overflow-y-auto bg-gray-50">
                    {Object.keys(REGION_DATA).map(city => (
                        <div 
                            key={city}
                            onClick={() => { setSelCity(city); setSelDistrict(''); setSelDong(''); }}
                            className={`p-4 cursor-pointer font-medium transition-colors ${selCity === city ? 'bg-white text-brand-primary border-l-4 border-brand-primary' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            {city}
                        </div>
                    ))}
                </div>
                <div className="w-1/3 border-r border-gray-100 overflow-y-auto">
                    {selCity && Object.keys(REGION_DATA[selCity] || {}).map(district => (
                        <div 
                            key={district}
                            onClick={() => { setSelDistrict(district); setSelDong(''); }}
                            className={`p-4 cursor-pointer font-medium transition-colors ${selDistrict === district ? 'bg-brand-light text-brand-primary' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {district}
                        </div>
                    ))}
                </div>
                <div className="w-1/3 overflow-y-auto">
                    {selDistrict && (
                        <>
                            <div onClick={() => setSelDong('전체')} className={`p-4 cursor-pointer font-medium ${selDong === '전체' ? 'text-brand-primary font-bold' : 'text-gray-500'}`}>전체</div>
                            {(REGION_DATA[selCity]?.[selDistrict] || []).map(dong => (
                                <div 
                                    key={dong}
                                    onClick={() => setSelDong(dong)}
                                    className={`p-4 cursor-pointer font-medium transition-colors ${selDong === dong ? 'text-brand-primary font-bold' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {dong}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4 p-4 bg-white rounded-xl border border-brand-secondary/30 flex items-center text-brand-primary font-bold shadow-sm">
                <MapPin className="w-5 h-5 mr-2" />
                {selCity} {selDistrict} {selDong || '...'}
            </div>
        </div>
    );

    const renderPreferences = () => {
        const recommendedUnivs = REGION_UNIVERSITIES[selCity] || [];

        return (
            <div className="animate-fade-in space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-brand-dark">이상형 조건</h2>
                    <p className="text-gray-500">원하는 상대방의 조건을 알려주세요.</p>
                </div>

                {/* University Selection */}
                <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-brand-primary" /> 선호 학교
                    </h3>
                    <div className="mb-4">
                        <button 
                            onClick={() => setPrefUniv('상관없음')} 
                            className={`w-full py-3 rounded-xl text-sm font-bold border transition-all ${prefUniv === '상관없음' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >
                            상관없음 (모든 학교)
                        </button>
                    </div>
                    
                    {recommendedUnivs.length > 0 && (
                        <div className="bg-brand-light/50 p-4 rounded-2xl border border-brand-secondary/20">
                            <p className="text-xs text-brand-primary font-bold mb-3 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" /> {selCity} 지역 주요 대학 추천
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {recommendedUnivs.slice(0, 10).map(univ => (
                                    <button
                                        key={univ}
                                        onClick={() => setPrefUniv(univ)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition shadow-sm ${prefUniv === univ ? 'bg-brand-primary text-white ring-2 ring-brand-primary ring-offset-1' : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        {univ}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Major Selection Buttons */}
                <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-brand-primary" /> 선호 계열
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {['상관없음', '메디컬', '문과', '이과', '예체능'].map((type: any) => (
                            <button
                                key={type}
                                onClick={() => setPrefMajorType(type)}
                                className={`py-3 rounded-xl text-sm font-bold transition ${prefMajorType === type ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center">
                        <Beer className="w-5 h-5 mr-2 text-brand-primary" /> 술자리 스타일
                    </h3>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setGamePreference('대화 위주')}
                            className={`flex-1 py-3 rounded-lg text-xs font-bold transition ${gamePreference === '대화 위주' ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}
                        >
                            대화 위주 (술게임 X) ☕️
                        </button>
                        <button 
                            onClick={() => setGamePreference('술게임 선호')}
                            className={`flex-1 py-3 rounded-lg text-xs font-bold transition ${gamePreference === '술게임 선호' ? 'bg-white shadow text-gray-800' : 'text-gray-400'}`}
                        >
                            술게임 선호 🔥
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center">
                <button onClick={goBack} className="p-2">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex-1 text-center pr-10">
                    <span className="font-bold text-brand-dark">매칭 설정</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pb-24">
                {/* Step 1: Match Type */}
                {step === 1 && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-2 text-brand-dark">어떤 만남을 원하세요?</h2>
                        <p className="text-gray-500 mb-8">미팅 종류를 선택해주세요.</p>

                        <div className="grid grid-cols-1 gap-4 mb-6">
                            <button 
                                onClick={() => setMatchType('date')}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${matchType === 'date' ? 'border-brand-primary bg-brand-light' : 'border-transparent bg-white shadow-sm'}`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${matchType === 'date' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Heart className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`font-bold text-lg ${matchType === 'date' ? 'text-brand-primary' : 'text-gray-700'}`}>1:1 소개팅</h3>
                                        <p className="text-sm text-gray-400">진지한 만남</p>
                                    </div>
                                </div>
                                {matchType === 'date' && <Check className="w-6 h-6 text-brand-primary" />}
                            </button>

                            <button 
                                onClick={() => { setMatchType('group'); setGroupSize(2); }}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${matchType === 'group' ? 'border-brand-primary bg-brand-light' : 'border-transparent bg-white shadow-sm'}`}
                            >
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${matchType === 'group' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className={`font-bold text-lg ${matchType === 'group' ? 'text-brand-primary' : 'text-gray-700'}`}>다대다 미팅/과팅</h3>
                                        <p className="text-sm text-gray-400">즐거운 분위기</p>
                                    </div>
                                </div>
                                {matchType === 'group' && <Check className="w-6 h-6 text-brand-primary" />}
                            </button>
                        </div>

                        {matchType === 'group' && (
                            <div className="bg-white p-6 rounded-3xl shadow-sm animate-slide-up">
                                <h3 className="font-bold mb-4 text-gray-700">몇 대 몇으로 만날까요?</h3>
                                <div className="flex justify-between gap-2">
                                    {[2, 3, 4].map(num => (
                                        <button 
                                            key={num}
                                            onClick={() => setGroupSize(num)}
                                            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all ${groupSize === num ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-gray-100 text-gray-400'}`}
                                        >
                                            {num}:{num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Group Step 2: Members */}
                {step === 2 && matchType === 'group' && (
                     <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-2 text-brand-dark">함께할 친구</h2>
                        <p className="text-gray-500 mb-8">친구 {groupSize - 1}명을 선택해주세요.</p>
                        
                        <div className="space-y-4">
                             {members.map((member, idx) => (
                                 <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-brand-primary/20 flex items-center justify-between">
                                     <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-brand-light mr-3 overflow-hidden">
                                            <img src={`https://ui-avatars.com/api/?name=${member.name}&background=random`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.major} • {member.mbti}</p>
                                        </div>
                                     </div>
                                     <button onClick={() => removeFriend(idx)} className="text-gray-400 hover:text-red-500"><X className="w-5 h-5" /></button>
                                 </div>
                             ))}

                             {members.length < groupSize - 1 && (
                                 <button 
                                    onClick={() => setShowFriendSelector(true)}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-400 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary hover:bg-white transition"
                                 >
                                     <Plus className="w-5 h-5 mr-2" /> 친구 추가하기
                                 </button>
                             )}
                        </div>

                        {/* Friend Selector Modal */}
                        {showFriendSelector && (
                            <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
                                <div className="bg-white w-full max-w-sm rounded-3xl p-6 animate-slide-up max-h-[70vh] overflow-y-auto">
                                    <h3 className="font-bold text-lg mb-4">친구 목록에서 선택</h3>
                                    <div className="space-y-3">
                                        {MOCK_FRIENDS.map((f, i) => (
                                            <div key={i} onClick={() => addFriend(f)} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl active:bg-gray-100">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 overflow-hidden">
                                                        <img src={`https://ui-avatars.com/api/?name=${f.name}`} className="w-full h-full" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-sm">{f.name}</p>
                                                        <p className="text-xs text-gray-500">{f.major}</p>
                                                    </div>
                                                </div>
                                                <Plus className="w-5 h-5 text-brand-primary" />
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => setShowFriendSelector(false)} className="w-full mt-4 py-3 bg-gray-100 rounded-xl font-bold text-sm">닫기</button>
                                </div>
                            </div>
                        )}
                     </div>
                )}

                {/* Step Logic for Date vs Group */}
                {(step === 2 && matchType === 'date') || (step === 3 && matchType === 'group') ? renderRegionSelector() : null}
                {(step === 3 && matchType === 'date') || (step === 4 && matchType === 'group') ? renderPreferences() : null}

            </div>

            <div className="fixed bottom-0 w-full max-w-md p-6 bg-white border-t border-gray-100 pb-safe z-20">
                <button 
                    onClick={goNext}
                    className="w-full bg-brand-dark text-white font-bold py-4 rounded-2xl shadow-lg shadow-gray-300 hover:bg-black transition flex items-center justify-center"
                >
                    {(step === 3 && matchType === 'date') || (step === 4 && matchType === 'group') ? '매칭 시작하기' : '다음으로'} <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

// --- Match List ---
interface MatchListProps {
    user: UserProfile;
    criteria: MyGroup;
    onSelectMatch: (match: MatchGroup) => void;
    onBack: () => void;
}

export const MatchListView: React.FC<MatchListProps> = ({ user, criteria, onSelectMatch, onBack }) => {
    const [matches, setMatches] = useState<MatchGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [matchStatus, setMatchStatus] = useState<'idle' | 'requesting' | 'accepted'>('idle');
    const [targetMatch, setTargetMatch] = useState<MatchGroup | null>(null);

    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            const results = await generatePotentialMatches(user, criteria);
            setMatches(results);
            setLoading(false);
        };
        fetchMatches();
    }, [user, criteria]);

    const handleRequestClick = (match: MatchGroup) => {
        setTargetMatch(match);
        setMatchStatus('requesting');
        setTimeout(() => {
            setMatchStatus('accepted');
        }, 3000);
    };

    const handleStartChat = () => {
        if (targetMatch) {
             onSelectMatch(targetMatch);
        }
    };

    if (matchStatus !== 'idle' && targetMatch) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in">
                <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
                     {matchStatus === 'requesting' ? (
                         <div className="flex flex-col items-center">
                            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">매칭 수락 대기중...</h3>
                            <p className="text-gray-500 text-sm">상대방의 수락을 기다리고 있습니다.</p>
                         </div>
                     ) : (
                         <div className="flex flex-col items-center animate-bounce-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-500">
                                <Check className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-brand-dark mb-2">매칭이 수락되었습니다!</h3>
                            <button 
                                onClick={handleStartChat}
                                className="w-full bg-brand-primary text-white font-bold py-4 rounded-2xl mt-4 shadow-lg flex items-center justify-center"
                            >
                                <MessageCircle className="w-5 h-5 mr-2" /> 채팅 시작하기
                            </button>
                         </div>
                     )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-cream flex flex-col">
            <div className="bg-white p-4 shadow-sm z-10 flex items-center sticky top-0">
                 <button onClick={onBack} className="p-2">
                    <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex-1 text-center pr-10">
                    <h2 className="font-bold text-brand-dark">매칭 추천 결과</h2>
                    <p className="text-xs text-gray-400">{criteria.region}</p>
                </div>
            </div>

            <div className="p-4 pb-24 flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full pt-20">
                        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-brand-dark font-bold text-lg">AI 매칭 중...</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {matches.map((match, idx) => (
                            <div key={match.id} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-brand-secondary/20 animate-slide-up">
                                <div className="bg-brand-light p-5 relative">
                                    <h3 className="text-xl font-bold text-gray-800">{match.university}</h3>
                                    <p className="text-gray-600 text-sm">{match.department} • 평균 {match.avgAge}세</p>
                                </div>
                                
                                {/* Members List Section - Basic Profile Only */}
                                <div className="p-5 border-b border-gray-100">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-3">맴버 기본 프로필</p>
                                    <div className="space-y-3">
                                        {match.members.map((member, mIdx) => (
                                            <div key={mIdx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                                <div className="flex items-center">
                                                     <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mr-3 text-lg border border-gray-100">
                                                         {/* Basic Avatar Only */}
                                                         {member.gender === '여성' ? '👩' : '🧑'}
                                                     </div>
                                                     <div>
                                                         <p className="font-bold text-sm text-gray-800">{member.name}</p>
                                                         <p className="text-xs text-gray-500">
                                                             {member.university || match.university} {member.major}
                                                         </p>
                                                     </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-lg text-gray-600 font-medium">{member.age}세</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 text-center bg-gray-50 p-2 rounded-lg">
                                        * 확장 프로필(사진, MBTI, 이상형 등)은<br/>채팅방에서 <b>[확장 프로필 요청]</b>을 통해 확인 가능합니다.
                                    </p>
                                </div>

                                <div className="p-5">
                                    <div className="bg-gray-50 p-4 rounded-xl mb-5">
                                        <p className="text-sm text-gray-600">"{match.bio}"</p>
                                    </div>
                                    <button 
                                        onClick={() => handleRequestClick(match)}
                                        className="w-full bg-brand-dark text-white font-bold py-3.5 rounded-xl hover:bg-brand-primary transition-colors flex items-center justify-center"
                                    >
                                        <Heart className="w-4 h-4 mr-2" /> 매칭 신청하기
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Chat List Tab (Persistent History) ---
export const ChatListView: React.FC<{ matches: MatchGroup[], histories: Record<string, ChatMessage[]>, onEnterChat: (m: MatchGroup) => void, userRegion?: string }> = ({ matches, histories, onEnterChat, userRegion = '서울' }) => {
    // Filter matches that have at least one message in history (started chats)
    // Or just rely on matches that are passed down which should be the confirmed ones
    const activeChats = matches.filter(m => histories[m.id] && histories[m.id].length > 0);
    
    // Extract city for recommendations
    const city = Object.keys(REGION_DATA).find(c => userRegion.includes(c)) || '서울';
    const recommendations = REGION_UNIVERSITIES[city] || REGION_UNIVERSITIES['서울'];

    return (
        <div className="p-6 pb-24 bg-brand-cream min-h-screen">
             <header className="flex justify-between items-center mb-8 pt-2">
                <h1 className="text-2xl font-bold text-brand-dark">채팅 및 추천</h1>
            </header>

            <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-brand-primary" /> 진행 중인 대화
            </h2>
            
            {activeChats.length > 0 ? (
                <div className="space-y-4 mb-8">
                    {activeChats.map(match => {
                         const lastMsg = histories[match.id][histories[match.id].length - 1];
                         return (
                             <div key={match.id} onClick={() => onEnterChat(match)} className={`bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex items-center cursor-pointer hover:bg-gray-50 transition`}>
                                <div className="relative mr-4">
                                    <div className="w-14 h-14 bg-brand-light rounded-full flex items-center justify-center text-2xl">🎓</div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-gray-800">{match.university}</h3>
                                        <span className="text-xs text-gray-400">
                                            {new Date(lastMsg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">{lastMsg.text}</p>
                                </div>
                             </div>
                         );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 border-dashed mb-8">
                    <p className="text-gray-400 text-sm">진행 중인 대화가 없습니다.</p>
                </div>
            )}
            
             <h2 className="text-lg font-bold text-brand-dark mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-pink-500" /> 오늘의 추천 ({city} 지역)
            </h2>
             <div className="space-y-3 pb-20">
                 {recommendations.map((univ, i) => (
                     <div key={i} className="bg-white rounded-2xl p-4 shadow-sm flex items-center">
                         <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4 text-xl">🏫</div>
                         <div className="flex-1">
                             <h4 className="font-bold text-sm">{univ}</h4>
                             <p className="text-xs text-gray-400">이 학교 학생들과 매칭해볼까요?</p>
                         </div>
                         <button className="bg-brand-secondary/20 text-brand-dark text-xs font-bold px-3 py-2 rounded-lg">보기</button>
                     </div>
                 ))}
             </div>
        </div>
    )
}

export const MyPageView: React.FC<{ user: UserProfile }> = ({ user }) => {
    return (
        <div className="p-6 pb-24 bg-white min-h-screen">
             <header className="mb-8 pt-2 text-center">
                <h1 className="text-xl font-bold text-brand-dark">내 프로필</h1>
            </header>
            
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-brand-light p-1 mb-4 relative overflow-hidden">
                    {user.profileImage ? (
                        <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=FF8FAB&color=fff&size=200`} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    )}
                    <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-600">
                        <Edit3 className="w-4 h-4" />
                    </button>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    <Check className="w-3 h-3 mr-1 text-brand-primary" /> {user.university} 인증됨
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">기본 정보</h3>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">나이/성별</span>
                            <span className="font-bold text-gray-700">{user.age}세 / {user.gender}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">학과</span>
                            <span className="font-bold text-gray-700">{user.major}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">MBTI</span>
                            <span className="font-bold text-brand-primary">{user.mbti || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* NEW SECTION: Extended Profile */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">선택 프로필 (확장 정보)</h3>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                         <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-lg">
                                {user.faceType?.includes('강아지') ? '🐶' :
                                 user.faceType?.includes('고양이') ? '🐱' :
                                 user.faceType?.includes('토끼') ? '🐰' :
                                 user.faceType?.includes('여우') ? '🦊' :
                                 user.faceType?.includes('곰') ? '🐻' : '✨'}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">나의 얼굴상</p>
                                <p className="text-sm font-bold text-gray-700">{user.faceType || '미입력'}</p>
                            </div>
                         </div>

                         <div className="flex items-start">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-lg">💘</div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">이상형 / 연애관</p>
                                <p className="text-sm font-bold text-gray-700">{user.idealType || '미입력'}</p>
                            </div>
                         </div>

                         {user.instaId && (
                             <div className="flex items-start">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 shadow-sm text-lg">📸</div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Instagram</p>
                                    <p className="text-sm font-bold text-blue-600">@{user.instaId.replace('@','')}</p>
                                </div>
                             </div>
                         )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">자기 소개</h3>
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {user.bio || '자기소개가 없습니다.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
