export const API_KEY = process.env.ANTHROPIC_API_KEY;
export const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export const TRANSLATIONS = {
    en: {
        nav: {
            home: 'Home',
            analyze: 'Analysis',
            intel: 'Intelligence',
            admin: 'Admin Map',
            map: 'India Map',
            tools: 'Tools',
            faq: 'FAQ'
        },
        hero: {
            label: 'Government AI Initiative',
            titleStart: 'Empowering Every Citizen’s Voice in',
            titleEnd: 'Water Governance',
            desc: 'A bilingual AI voice assistant that helps citizens report water pollution, track complaints, and access governance services instantly.',
            btnPrimary: 'Start Voice Assistant',
            btnSecondary: 'Learn How It Works'
        },
        dashboard: {
            liveMonitor: 'Live Basin Monitoring',
            liveMonitorSub: 'Real-time sensor data & community reports',
            systemOp: 'System Operational',
            aiAnalysis: 'AI Situation Analysis',
            viewReport: 'View Full Report',
            chartTitle: 'Water Quality Trend',
            chartSub: '7-Day Composite Index',
            keyParams: 'Key Parameters',
            recentReports: 'Recent Citizen Reports',
            submitReport: 'Submit Report',
            uploadPhoto: 'Upload photos for AI analysis'
        },
        map: {
            title: 'Water Quality Map',
            subtitle: 'Regional water risks and issues',
            all: 'All',
            critical: 'Critical',
            high: 'High',
            medium: 'Medium',
            low: 'Low',
            keyIssues: 'Key Issues',
            getAdvice: 'Get Advice'
        }
    },
    hi: {
        nav: {
            home: 'होम',
            analyze: 'विश्लेषण',
            intel: 'इंटेलीजेंस',
            admin: 'प्रशासन मानचित्र',
            map: 'भारत का नक्शा',
            tools: 'उपकरण',
            faq: 'सामान्य प्रश्न'
        },
        hero: {
            label: 'सरकारी एआई पहल',
            titleStart: 'जल प्रशासन में हर नागरिक की',
            titleEnd: 'आवाज़ को सशक्त बनाना',
            desc: 'एक द्विभाषी एआई वॉयस असिस्टेंट जो नागरिकों को जल प्रदूषण की रिपोर्ट करने, शिकायतों को ट्रैक करने और शासन सेवाओं तक तुरंत पहुंचने में मदद करता है।',
            btnPrimary: 'वॉयस असिस्टेंट शुरू करें',
            btnSecondary: 'यह कैसे काम करता है'
        },
        dashboard: {
            liveMonitor: 'लाइव बेसिन निगरानी',
            liveMonitorSub: 'वास्तविक समय सेंसर डेटा और सामुदायिक रिपोर्ट',
            systemOp: 'सिस्टम सक्रिय',
            aiAnalysis: 'एआई स्थिति विश्लेषण',
            viewReport: 'पूरी रिपोर्ट देखें',
            chartTitle: 'जल गुणवत्ता रुझान',
            chartSub: '7-दिवसीय समग्र सूचकांक',
            keyParams: 'मुख्य पैरामीटर',
            recentReports: 'हालिया नागरिक रिपोर्ट',
            submitReport: 'रिपोर्ट भेजें',
            uploadPhoto: 'एआई विश्लेषण के लिए फोटो अपलोड करें'
        },
        map: {
            title: 'जल गुणवत्ता मानचित्र',
            subtitle: 'क्षेत्रीय जल जोखिम और मुद्दे',
            all: 'सभी',
            critical: 'गंभीर',
            high: 'उच्च',
            medium: 'मध्यम',
            low: 'कम',
            keyIssues: 'मुख्य मुद्दे',
            getAdvice: 'सलाह लें'
        }
    }
};