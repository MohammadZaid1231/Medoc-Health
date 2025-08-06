// Configuration file for Sample Collection Agent App
// Note: In production, these should be loaded from environment variables or a secure config service

// API Configuration
const CONFIG = {
    // Gemini AI Configuration
    GEMINI: {
        API_KEY: 'AIzaSyD2T54lYTcnH1e5k2YZP4s7t8jO0YOI-dY', // Your API key
        MODEL: 'gemini-2.5-flash', // Model name
        BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/',
        MAX_TOKENS: 500,
        TEMPERATURE: 0.7,
        // Context for medical assistance
        SYSTEM_CONTEXT: `You are a specialized medical sample collection assistant AI. Your role is to help field agents with:

        - Sample collection procedures and protocols
        - Safety guidelines and contamination prevention
        - Equipment troubleshooting and maintenance
        - Temperature and handling requirements
        - Emergency procedures and protocols
        - Transportation and storage guidelines
        - Quality control measures
        - Regulatory compliance information

        Always provide accurate, practical, and safety-focused guidance. Keep responses concise and actionable for field use.
        If asked about non-medical topics, politely redirect to sample collection related questions.`
    },

    // Health Tips API (Mock configuration - replace with real API)
    HEALTH_TIPS: {
        API_URL: 'https://api.healthtips.com/v1/tips', // Mock URL
        API_KEY: 'your-health-tips-api-key',
        CATEGORIES: ['safety', 'handling', 'transport', 'storage', 'quality'],
        REFRESH_INTERVAL: 300000, // 5 minutes in milliseconds
    },

    // App Configuration
    APP: {
        NAME: 'SampleAgent Pro',
        VERSION: '2.1.0',
        BUILD: '2024.01',
        DEVELOPER: 'MedTech Solutions',
        SUPPORT_EMAIL: 'support@sampleagent.com',
        SUPPORT_PHONE: '+1-800-SAMPLES',
    },

    // Feature Flags
    FEATURES: {
        VOICE_INPUT: true,
        OFFLINE_MODE: true,
        GPS_TRACKING: true,
        PUSH_NOTIFICATIONS: true,
        BIOMETRIC_AUTH: false,
        DARK_MODE: true,
        HIGH_CONTRAST: true,
    },

    // Sample Collection Settings
    COLLECTION: {
        TEMPERATURE_RANGES: {
            'blood': { min: 2, max: 8, unit: '°C' },
            'urine': { min: 15, max: 25, unit: '°C' },
            'tissue': { min: -80, max: -70, unit: '°C' },
            'swab': { min: 15, max: 25, unit: '°C' },
        },
        PRIORITY_LEVELS: ['low', 'medium', 'high', 'urgent'],
        STATUS_TYPES: ['pending', 'collected', 'in-transit', 'delivered', 'cancelled'],
        MAX_TRANSPORT_TIME: 240, // minutes
    },

    // Geolocation Settings
    GEO: {
        HIGH_ACCURACY: true,
        TIMEOUT: 10000, // 10 seconds
        MAX_AGE: 300000, // 5 minutes
        WATCH_OPTIONS: {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 60000, // 1 minute
        },
    },

    // Notification Settings
    NOTIFICATIONS: {
        DURATION: 5000, // 5 seconds
        MAX_NOTIFICATIONS: 5,
        TYPES: {
            SUCCESS: { icon: '✅', color: '#22c55e' },
            ERROR: { icon: '❌', color: '#ef4444' },
            WARNING: { icon: '⚠️', color: '#f59e0b' },
            INFO: { icon: 'ℹ️', color: '#2563eb' },
        },
    },

    // Storage Keys for localStorage
    STORAGE: {
        PICKUP_DATA: 'sampleagent_pickups',
        USER_PREFERENCES: 'sampleagent_preferences',
        OFFLINE_QUEUE: 'sampleagent_offline_queue',
        HEALTH_TIPS_CACHE: 'sampleagent_health_tips',
        CHAT_HISTORY: 'sampleagent_chat_history',
        REPORT_DRAFTS: 'sampleagent_report_drafts',
    },

    // Performance Settings
    PERFORMANCE: {
        CHAT_HISTORY_LIMIT: 50,
        TIPS_CACHE_SIZE: 20,
        IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
        LAZY_LOAD_DELAY: 200,
    },

    // Security Settings
    SECURITY: {
        SESSION_TIMEOUT: 3600000, // 1 hour
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 900000, // 15 minutes
        ENCRYPT_LOCAL_DATA: true,
    },

    // UI/UX Settings
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 5000,
        LOADING_DELAY: 500,
        DEBOUNCE_DELAY: 300,
        THEMES: {
            LIGHT: 'light',
            DARK: 'dark',
            AUTO: 'auto',
        },
    },

    // Development Settings (remove in production)
    DEBUG: {
        ENABLED: true,
        LOG_LEVEL: 'info', // error, warn, info, debug
        MOCK_API: false,
        SIMULATE_OFFLINE: false,
        SHOW_PERFORMANCE: false,
    },
};

// Mock data for development and testing
const MOCK_DATA = {
    // Sample pickup data
    PICKUPS: [
        {
            id: 'SM001',
            hospital: 'City General Hospital',
            address: '123 Medical Center Dr, Downtown',
            coordinates: { lat: 40.7128, lng: -74.0060 },
            time: '09:00 AM',
            type: 'Blood Sample',
            priority: 'high',
            status: 'pending',
            phone: '+1-555-0101',
            contact: 'Dr. Sarah Johnson',
            requirements: ['Temperature controlled', 'Priority delivery', 'Chain of custody'],
            estimatedDuration: 30,
        },
        {
            id: 'SM002',
            hospital: 'Regional Medical Clinic',
            address: '456 Health Avenue, Midtown',
            coordinates: { lat: 40.7589, lng: -73.9851 },
            time: '10:30 AM',
            type: 'Urine Sample',
            priority: 'medium',
            status: 'pending',
            phone: '+1-555-0102',
            contact: 'Nurse Maria Garcia',
            requirements: ['Standard handling', 'Room temperature'],
            estimatedDuration: 15,
        },
        {
            id: 'SM003',
            hospital: 'Community Health Center',
            address: '789 Care Street, Uptown',
            coordinates: { lat: 40.7831, lng: -73.9712 },
            time: '11:45 AM',
            type: 'Tissue Sample',
            priority: 'urgent',
            status: 'collected',
            phone: '+1-555-0103',
            contact: 'Dr. Michael Chen',
            requirements: ['Frozen transport', 'STAT processing'],
            estimatedDuration: 45,
            collectedAt: '11:45 AM',
        },
        {
            id: 'SM004',
            hospital: 'Metropolitan Hospital',
            address: '321 Wellness Boulevard, Eastside',
            coordinates: { lat: 40.7505, lng: -73.9934 },
            time: '01:15 PM',
            type: 'Swab Sample',
            priority: 'high',
            status: 'pending',
            phone: '+1-555-0104',
            contact: 'Lab Technician Amy Liu',
            requirements: ['Sterile collection', 'Viral transport medium'],
            estimatedDuration: 20,
        },
        {
            id: 'SM005',
            hospital: 'Suburban Family Practice',
            address: '654 Family Drive, Westside',
            coordinates: { lat: 40.7282, lng: -74.0776 },
            time: '02:30 PM',
            type: 'Blood Sample',
            priority: 'low',
            status: 'collected',
            phone: '+1-555-0105',
            contact: 'Nurse Practitioner John Davis',
            requirements: ['Standard venipuncture', 'Multiple tubes'],
            estimatedDuration: 25,
            collectedAt: '02:25 PM',
        },
    ],

    // Health tips data
    HEALTH_TIPS: [
        {
            id: 1,
            title: 'Proper Hand Hygiene',
            content: 'Always wash your hands for at least 20 seconds with soap and warm water before and after each sample collection. Use alcohol-based hand sanitizer when soap is unavailable.',
            category: 'safety',
            icon: '🧼',
            priority: 'high',
            tags: ['hygiene', 'infection-control', 'safety'],
        },
        {
            id: 2,
            title: 'Temperature Control',
            content: 'Blood samples must be kept between 2-8°C during transport. Use insulated containers with ice packs and monitor temperature regularly. Document any temperature excursions.',
            category: 'handling',
            icon: '🌡️',
            priority: 'critical',
            tags: ['temperature', 'transport', 'blood'],
        },
        {
            id: 3,
            title: 'Sample Labeling Best Practices',
            content: 'Label samples immediately after collection. Include patient ID, collection date/time, sample type, and your initials. Verify with two patient identifiers.',
            category: 'quality',
            icon: '🏷️',
            priority: 'critical',
            tags: ['labeling', 'identification', 'quality'],
        },
        {
            id: 4,
            title: 'Personal Protective Equipment',
            content: 'Always wear appropriate PPE including gloves, safety glasses, and lab coat. Change gloves between patients and dispose of contaminated materials properly.',
            category: 'safety',
            icon: '🥽',
            priority: 'high',
            tags: ['ppe', 'protection', 'contamination'],
        },
        {
            id: 5,
            title: 'Chain of Custody',
            content: 'Maintain proper chain of custody documentation. Record who collected, transported, and received each sample. Keep samples secure and supervised at all times.',
            category: 'quality',
            icon: '📋',
            priority: 'high',
            tags: ['documentation', 'custody', 'security'],
        },
        {
            id: 6,
            title: 'Specimen Transport Timing',
            content: 'Transport specimens to the laboratory within 2 hours of collection when possible. For longer transport times, follow specific storage requirements.',
            category: 'transport',
            icon: '⏰',
            priority: 'medium',
            tags: ['timing', 'transport', 'storage'],
        },
        {
            id: 7,
            title: 'Contamination Prevention',
            content: 'Use sterile collection techniques and avoid touching the inside of collection containers. Keep specimens covered and separated to prevent cross-contamination.',
            category: 'handling',
            icon: '🛡️',
            priority: 'critical',
            tags: ['sterile', 'contamination', 'technique'],
        },
        {
            id: 8,
            title: 'Equipment Maintenance',
            content: 'Regularly clean and calibrate temperature monitoring devices. Check expiration dates on collection supplies and replace as needed.',
            category: 'maintenance',
            icon: '🔧',
            priority: 'medium',
            tags: ['equipment', 'maintenance', 'calibration'],
        },
    ],

    // Chat conversation starters
    CHAT_STARTERS: [
        'How should I handle a blood sample that\'s been at room temperature?',
        'What\'s the proper procedure for collecting urine samples?',
        'My temperature monitor is showing an error. What should I do?',
        'How do I properly dispose of contaminated materials?',
        'What are the storage requirements for tissue samples?',
        'Can you explain the chain of custody process?',
        'What PPE should I wear for different sample types?',
        'How long can samples be stored before transport?',
    ],
};

// Utility functions for configuration
const ConfigUtils = {
    // Get configuration value with fallback
    get: (path, fallback = null) => {
        const keys = path.split('.');
        let value = CONFIG;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return fallback;
            }
        }
        
        return value;
    },

    // Check if feature is enabled
    isFeatureEnabled: (feature) => {
        return ConfigUtils.get(`FEATURES.${feature}`, false);
    },

    // Get API endpoint URL
    getApiUrl: (service, endpoint = '') => {
        const baseUrl = ConfigUtils.get(`${service}.API_URL`) || ConfigUtils.get(`${service}.BASE_URL`);
        return baseUrl ? `${baseUrl}${endpoint}` : null;
    },

    // Get mock data
    getMockData: (type) => {
        return MOCK_DATA[type] || [];
    },

    // Debug logging
    log: (level, message, data = null) => {
        if (!ConfigUtils.get('DEBUG.ENABLED')) return;
        
        const logLevel = ConfigUtils.get('DEBUG.LOG_LEVEL', 'info');
        const levels = { error: 0, warn: 1, info: 2, debug: 3 };
        
        if (levels[level] <= levels[logLevel]) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            
            if (data) {
                console.log(`${prefix} ${message}`, data);
            } else {
                console.log(`${prefix} ${message}`);
            }
        }
    },
};

// Export for global access
window.CONFIG = CONFIG;
window.MOCK_DATA = MOCK_DATA;
window.ConfigUtils = ConfigUtils;

// Development helpers
if (ConfigUtils.get('DEBUG.ENABLED')) {
    window.devTools = {
        config: CONFIG,
        mockData: MOCK_DATA,
        utils: ConfigUtils,
        version: () => `${CONFIG.APP.NAME} v${CONFIG.APP.VERSION} (${CONFIG.APP.BUILD})`,
        features: () => Object.entries(CONFIG.FEATURES).filter(([, enabled]) => enabled).map(([name]) => name),
        clearStorage: () => {
            Object.values(CONFIG.STORAGE).forEach(key => localStorage.removeItem(key));
            console.log('Local storage cleared');
        },
    };
    
    console.log('🧪 Sample Collection Agent - Developer Tools Available');
    console.log('Access via window.devTools');
    console.log(`Version: ${CONFIG.APP.VERSION}`);
}