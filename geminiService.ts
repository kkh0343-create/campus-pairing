
import { GoogleGenAI, Type } from "@google/genai";
import { MyGroup, MatchGroup, UserProfile, ChatMessage } from "../types";

// Helper to get client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
};

export const generatePotentialMatches = async (user: UserProfile, groupCriteria: MyGroup): Promise<MatchGroup[]> => {
  try {
    const ai = getClient();
    
    const isDate = groupCriteria.matchType === 'date';
    const matchTypeDesc = isDate 
      ? "1:1 blind date partner (single individual)" 
      : `${groupCriteria.size}:${groupCriteria.size} group meeting team`;

    const prompt = `
      Generate 5 fictional university ${isDate ? 'students' : 'student groups'} for a matching app in South Korea.
      
      The user is a ${user.university} student (${user.gender}, ${user.age} years old, ${user.major}).
      They are looking for a ${matchTypeDesc}.
      
      CRITICAL MATCHING CRITERIA:
      1. Preferred Region: ${groupCriteria.region}.
      2. Atmosphere: ${groupCriteria.atmosphere}.
      3. Style: ${groupCriteria.gamePreference === '술게임 선호' ? "Loves drinking games" : "Prefers quiet conversations"}.
      4. Preferred Age Range: ${groupCriteria.preferredAgeMin} to ${groupCriteria.preferredAgeMax}.
      5. Preferred University: ${groupCriteria.preferredUniversity}.
      6. Preferred Major Type: ${groupCriteria.preferredMajorType}.
      
      For each member, generate:
      - BASIC info: Name, Major, University, Age, Gender.
      - EXTENDED info: MBTI, Face Type (e.g., Puppy, Cat), Ideal Type, Values (array of strings).
      - Generate a realistic fictional 'profileImage' URL using https://ui-avatars.com/api/?name=NAME&background=random format.
      
      Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              university: { type: Type.STRING, description: "Main university of the group/partner" },
              department: { type: Type.STRING },
              avgAge: { type: Type.NUMBER },
              region: { type: Type.STRING },
              atmosphere: { type: Type.STRING },
              bio: { type: Type.STRING },
              members: {
                type: Type.ARRAY,
                items: {
                   type: Type.OBJECT,
                   properties: {
                      name: { type: Type.STRING },
                      major: { type: Type.STRING },
                      university: { type: Type.STRING, description: "Individual's university" },
                      age: { type: Type.NUMBER },
                      gender: { type: Type.STRING },
                      mbti: { type: Type.STRING },
                      faceType: { type: Type.STRING, description: "e.g., Puppy, Cat, Fox" },
                      idealType: { type: Type.STRING },
                      profileImage: { type: Type.STRING },
                      values: { type: Type.ARRAY, items: { type: Type.STRING } }
                   }
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MatchGroup[];
    }
    return [];
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return [
      {
        id: 'mock-1',
        university: '연세대학교',
        department: '경영학과',
        avgAge: 23,
        region: '신촌/홍대',
        atmosphere: '친목 지향',
        bio: '즐겁게 놀 사람 구해요! 술게임 좋아합니다 ㅎㅎ',
        members: [
            { name: '김민지', major: '경영', university: '연세대학교', age: 23, gender: '여성', mbti: 'ENFP', faceType: '강아지상', idealType: '유머러스한 사람', profileImage: 'https://ui-avatars.com/api/?name=김민지&background=FF8FAB&color=fff', values: ['활발함', '솔직함'] },
            { name: '이수진', major: '경제', university: '이화여자대학교', age: 23, gender: '여성', mbti: 'ESFJ', faceType: '고양이상', idealType: '키 큰 사람', profileImage: 'https://ui-avatars.com/api/?name=이수진&background=8DE3D1&color=fff', values: ['배려', '센스'] }
        ]
      },
      {
        id: 'mock-2',
        university: '고려대학교',
        department: '미디어학부',
        avgAge: 24,
        region: '강남/건대',
        atmosphere: '연애 지향',
        bio: '진지하게 만나실 분 찾아요~ 매너 좋으신 분들 환영!',
        members: [
            { name: '박지영', major: '미디어', university: '고려대학교', age: 24, gender: '여성', mbti: 'INFJ', faceType: '토끼상', idealType: '다정한 사람', profileImage: 'https://ui-avatars.com/api/?name=박지영&background=FDF6C5&color=4A4A4A', values: ['차분함', '대화'] },
            { name: '최유나', major: '심리', university: '성신여자대학교', age: 24, gender: '여성', mbti: 'ISFP', faceType: '여우상', idealType: '배려심 많은 사람', profileImage: 'https://ui-avatars.com/api/?name=최유나&background=FEFBF6&color=4A4A4A', values: ['감성', '예의'] }
        ]
      }
    ];
  }
};

export const getIcebreakerTopic = async (context: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide a fun conversation topic for a blind date. Short (max 1 sentence). Korean. Context: ${context}`,
    });
    return response.text || "좋아하는 여행지에 대해 이야기해보세요!";
  } catch (e) {
    return "서로의 첫인상이 어땠는지 이야기해보세요!";
  }
};

export const getChatReplySuggestion = async (history: any[], language: 'ko' | 'en'): Promise<string> => {
  try {
    const ai = getClient();
    // Very simple instruction
    const langInstruction = language === 'ko' ? "in Korean" : "in English";
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Suggest ONE short, casual reply (max 10 words) ${langInstruction} to the last message: ${JSON.stringify(history.slice(-1))}`
    });
    return response.text?.replace(/['"]/g, '') || (language === 'ko' ? "반가워요!" : "Hi there!");
  } catch (e) {
      return language === 'ko' ? "반가워요!" : "Nice to meet you!";
  }
}

export const generatePersonaResponse = async (history: ChatMessage[], partner: MatchGroup, user: UserProfile, language: 'ko' | 'en'): Promise<string> => {
  try {
    const ai = getClient();
    const partnerInfo = `${partner.university} ${partner.department} student.`;
    const chatContext = history.map(m => `${m.sender}: ${m.text}`).join('\n');
    const langInstruction = language === 'ko' ? "Korean" : "English";
    
    const prompt = `
      Roleplay as a university student in a blind date app. 
      Partner: ${partnerInfo}
      Context:
      ${chatContext}
      
      Reply shortly (1-2 sentences) in ${langInstruction}. Friendly tone.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "안녕하세요!";
  } catch (e) {
    return "안녕하세요! 반가워요 ㅎㅎ";
  }
}
