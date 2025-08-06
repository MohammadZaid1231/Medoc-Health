/**
* Sample Collection Agent Pro - Main Application
* Advanced medical sample collection management system
*/

class SampleCollectionApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.pickupData = [];
        this.currentStep = 1;
        this.isOnline = navigator.onLine;
        this.healthTips = [];
        this.chatHistory = [];
        this.voiceRecognition = null;
        this.isRecording = false;
        this.currentLocation = null;
        this.temperatureInterval = null;
        this.elapsedTimeInterval = null;

        this.init();
    }

    async init() {
        try {
            ConfigUtils.log('info', 'Initializing Sample Collection App...');

            // Show loading screen
            this.showLoadingScreen();

            // Initialize core systems
            await this.initializeApp();

            // Load data and setup UI
            await this.loadInitialData();
            this.setupEventListeners();
            this.setupServiceWorker();
            this.startPeriodicTasks();

            // Hide loading screen
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showNotification('Welcome back! System ready.', 'success');
            }, 2000);

            ConfigUtils.log('info', 'App initialization complete');
        } catch (error) {
            ConfigUtils.log('error', 'Failed to initialize app', error);
            this.showNotification('Failed to initialize app. Please refresh.', 'error');
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }

    async initializeApp() {
        // Initialize date display
        this.updateDateTime();

        // Initialize connectivity monitoring
        this.setupConnectivityMonitoring();

        // Initialize geolocation
        await this.initializeGeolocation();

        // Initialize voice recognition
        this.initializeVoiceRecognition();

        // Load saved preferences
        this.loadUserPreferences();
    }

    async loadInitialData() {
        // Load pickup data
        this.loadPickupData();

        // Load health tips
        await this.loadHealthTips();

        // Load chat history
        this.loadChatHistory();

        // Update all UI components
        this.renderPickupList();
        this.updateStats();
        this.updateProgressSteps();
    }

    setupEventListeners() {
        // Navigation events
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Form validation
        const issueForm = document.getElementById('issueForm');
        if (issueForm) {
            issueForm.addEventListener('input', this.validateForm.bind(this));
        }

        // Character count for textarea
        const descriptionField = document.getElementById('issueDescription');
        if (descriptionField) {
            descriptionField.addEventListener('input', this.updateCharacterCount.bind(this));
        }

        // Priority button handlers
        document.querySelectorAll('input[name="priority"]').forEach(radio => {
            radio.addEventListener('change', this.updatePriorityIndicator.bind(this));
        });

        // Window events
        window.addEventListener('online', () => this.handleConnectivityChange(true));
        window.addEventListener('offline', () => this.handleConnectivityChange(false));
        window.addEventListener('beforeunload', this.saveUserData.bind(this));
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator && ConfigUtils.isFeatureEnabled('OFFLINE_MODE')) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    ConfigUtils.log('info', 'Service Worker registered', registration);
                })
                .catch(error => {
                    ConfigUtils.log('error', 'Service Worker registration failed', error);
                });
        }
    }

    startPeriodicTasks() {
        // Update time every minute
        setInterval(() => this.updateDateTime(), 60000);

        // Check connectivity every 30 seconds
        setInterval(() => this.checkConnectivity(), 30000);

        // Simulate temperature readings
        this.temperatureInterval = setInterval(() => this.updateTemperature(), 5000);

        // Update elapsed time
        this.elapsedTimeInterval = setInterval(() => this.updateElapsedTime(), 1000);

        // Auto-refresh health tips
        if (ConfigUtils.get('HEALTH_TIPS.REFRESH_INTERVAL')) {
            setInterval(() => this.loadHealthTips(false), 
                ConfigUtils.get('HEALTH_TIPS.REFRESH_INTERVAL'));
        }
    }

    // Navigation Methods
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });

            const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }

            // Section-specific initialization
            this.onSectionChanged(sectionId);

            ConfigUtils.log('debug', `Navigated to section: ${sectionId}`);
        }
    }

    onSectionChanged(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.refreshPickups();
                break;
            case 'tracking':
                this.startTrackingMode();
                break;
            case 'chat':
                this.focusChatInput();
                break;
            case 'tips':
                this.checkTipsCache();
                break;
            case 'report':
                this.initializeReportForm();
                break;
        }
    }

    // Data Management
    loadPickupData() {
        const savedData = localStorage.getItem(CONFIG.STORAGE.PICKUP_DATA);
        if (savedData) {
            try {
                this.pickupData = JSON.parse(savedData);
            } catch (error) {
                ConfigUtils.log('error', 'Failed to parse pickup data', error);
            }
        }

        // Use mock data if no saved data
        if (this.pickupData.length === 0) {
            this.pickupData = ConfigUtils.getMockData('PICKUPS');
        }
    }

    savePickupData() {
        try {
            localStorage.setItem(CONFIG.STORAGE.PICKUP_DATA, JSON.stringify(this.pickupData));
        } catch (error) {
            ConfigUtils.log('error', 'Failed to save pickup data', error);
        }
    }

    loadUserPreferences() {
        const savedPrefs = localStorage.getItem(CONFIG.STORAGE.USER_PREFERENCES);
        if (savedPrefs) {
            try {
                const preferences = JSON.parse(savedPrefs);
                this.applyUserPreferences(preferences);
            } catch (error) {
                ConfigUtils.log('error', 'Failed to load user preferences', error);
            }
        }
    }

    saveUserData() {
        this.savePickupData();
        this.saveChatHistory();
        this.saveUserPreferences();
    }

    // Pickup Management
    renderPickupList() {
        const container = document.getElementById('pickupList');
        if (!container) return;

        container.innerHTML = '';

        this.pickupData.forEach(pickup => {
            const pickupElement = this.createPickupElement(pickup);
            container.appendChild(pickupElement);
        });
    }

    createPickupElement(pickup) {
        const pickupItem = document.createElement('div');
        pickupItem.className = `pickup-item ${pickup.priority}-priority`;
        pickupItem.setAttribute('data-id', pickup.id);

        pickupItem.innerHTML = `
            <div class="pickup-info">
                <h3>${pickup.hospital}</h3>
                <div class="pickup-details">
                    📍 ${pickup.address}<br>
                    🕐 ${pickup.time} • ${pickup.type} • Priority: ${this.capitalizeFirst(pickup.priority)}<br>
                    👤 Contact: ${pickup.contact || 'N/A'}
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center; margin-top: 0.5rem;">
                    <span class="status status-${pickup.status}">${this.capitalizeFirst(pickup.status)}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">~${pickup.estimatedDuration}min</span>
                </div>
            </div>
            <div class="pickup-actions">
                <button class="btn btn-primary" onclick="app.startNavigation('${pickup.address}', ${pickup.coordinates?.lat}, ${pickup.coordinates?.lng})" 
                        title="Navigate to location">
                    🧭 Navigate
                </button>
                <button class="btn btn-outline" onclick="app.makeCall('${pickup.phone}')" 
                        title="Call contact">
                    📞 Call
                </button>
                ${pickup.status === 'pending' ? `
                    <button class="btn btn-success" onclick="app.markCollected('${pickup.id}')" 
                            title="Mark as collected">
                        ✅ Collect
                    </button>
                ` : pickup.status === 'collected' ? `
                    <button class="btn btn-secondary" disabled title="Already collected">
                        ✓ Collected
                    </button>
                ` : ''}
            </div>
        `;

        return pickupItem;
    }

    updateStats() {
        const pending = this.pickupData.filter(p => p.status === 'pending').length;
        const collected = this.pickupData.filter(p => p.status === 'collected').length;
        const total = this.pickupData.length;

        this.animateCounter('pendingCount', pending);
        this.animateCounter('collectedCount', collected);
        this.animateCounter('totalCount', total);
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    markCollected(sampleId) {
        const sample = this.pickupData.find(p => p.id === sampleId);
        if (sample && sample.status === 'pending') {
            sample.status = 'collected';
            sample.collectedAt = new Date().toLocaleTimeString();

            this.renderPickupList();
            this.updateStats();
            this.savePickupData();

            this.showNotification(`Sample ${sampleId} marked as collected!`, 'success');

            // Update tracking if it's the current sample
            if (sampleId === 'SM001') {
                document.getElementById('collectionToggle').checked = true;
                this.toggleCollection();
            }

            ConfigUtils.log('info', `Sample ${sampleId} collected`);
        }
    }

    refreshPickups() {
        // In a real app, this would fetch from an API
        this.showNotification('Pickup list refreshed', 'info');
        this.renderPickupList();

        // Animate refresh button
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                refreshBtn.style.transform = '';
            }, 300);
        }
    }

    // Sample Tracking
    toggleCollection() {
        const toggle = document.getElementById('collectionToggle');
        const status = document.getElementById('currentStatus');

        if (!toggle || !status) return;

        if (toggle.checked) {
            this.currentStep = 2;
            status.innerHTML = '<div class="status-dot collected"></div><span>Collected</span>';
            document.getElementById('stepTime2').textContent = new Date().toLocaleTimeString();

            // Auto-advance to in-transit after 3 seconds
            setTimeout(() => {
                this.currentStep = 3;
                status.innerHTML = '<div class="status-dot in-transit"></div><span>In Transit</span>';
                document.getElementById('stepTime3').textContent = new Date().toLocaleTimeString();
                this.updateProgressSteps();
            }, 3000);

            this.showNotification('Sample collection confirmed!', 'success');
        } else {
            this.currentStep = 1;
            status.innerHTML = '<div class="status-dot pending"></div><span>Pending</span>';
            document.getElementById('stepTime2').textContent = '--';
            document.getElementById('stepTime3').textContent = '--';
        }

        this.updateProgressSteps();
    }

    updateProgressSteps() {
        const steps = document.querySelectorAll('.timeline-step');
        const progressBar = document.querySelector('.timeline-progress::before') || 
                           document.querySelector('.timeline-progress');

        steps.forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');

            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            }
        });

        // Update progress bar
        if (progressBar) {
            const progressWidth = ((this.currentStep - 1) / (steps.length - 1)) * 100;
            const progressElement = document.querySelector('.timeline-progress');
            if (progressElement) {
                progressElement.style.setProperty('--progress-width', `${progressWidth}%`);
            }
        }
    }

    startTrackingMode() {
        // Start real-time monitoring
        this.updateTemperature();
        this.updateElapsedTime();

        ConfigUtils.log('info', 'Tracking mode activated');
    }

    updateTemperature() {
        const tempElement = document.getElementById('temperature');
        if (tempElement) {
            // Simulate temperature readings (2-8°C range with some variation)
            const baseTemp = 4.2;
            const variation = (Math.random() - 0.5) * 2; // ±1°C variation
            const temperature = (baseTemp + variation).toFixed(1);
            tempElement.textContent = `${temperature}°C`;

            // Color coding based on temperature
            if (parseFloat(temperature) < 2 || parseFloat(temperature) > 8) {
                tempElement.style.color = 'var(--danger-color)';
            } else {
                tempElement.style.color = 'var(--success-color)';
            }
        }

        // Update humidity
        const humidityElement = document.getElementById('humidity');
        if (humidityElement) {
            const humidity = Math.floor(40 + Math.random() * 20); // 40-60%
            humidityElement.textContent = `${humidity}%`;
        }
    }

    updateElapsedTime() {
        const elapsedElement = document.getElementById('elapsed');
        if (elapsedElement && this.currentStep > 1) {
            // Calculate elapsed time since collection
            const startTime = Date.now() - (Math.floor(Math.random() * 3600000)); // Random start time
            const elapsed = Date.now() - startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            elapsedElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Chat System
    async sendMessage(message = null) {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const messageText = message || input.value.trim();
        if (!messageText) return;

        // Add user message
        this.addMessage(messageText, 'user');
        input.value = '';

        // Show typing indicator
        this.addTypingIndicator();

        try {
            const response = await this.queryGemini(messageText);
            this.removeTypingIndicator();
            this.addMessage(response, 'ai');

            // Save to history
            this.saveChatMessage(messageText, response);

        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again later.', 'ai');
            ConfigUtils.log('error', 'Chat error', error);
        }
    }

    sendQuickMessage(message) {
        document.getElementById('chatInput').value = message;
        this.sendMessage();
    }

    handleChatKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const isWelcome = sender === 'ai' && messagesContainer.children.length === 1;

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-icon">${sender === 'user' ? '👤' : '🤖'}</div>
                ${sender === 'ai' ? '<div class="avatar-pulse"></div>' : ''}
            </div>
            <div class="message-content">
                <div class="message-text">${isWelcome ? content : this.formatMessageContent(content)}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animate message in
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
    }

    formatMessageContent(content) {
        // Basic formatting for AI responses
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    addTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai';
        typingDiv.id = 'typing-indicator';

        typingDiv.innerHTML = `
            <div class="message-avatar">
                <div class="avatar-icon">🤖</div>
                <div class="avatar-pulse"></div>
            </div>
            <div class="message-content">
                <div class="message-text">
                    <div class="loading-spinner" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px;"></div>
                    Thinking...
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) {
            typing.remove();
        }
    }

    async queryGemini(message) {
        const apiKey = CONFIG.GEMINI.API_KEY;
        const model = CONFIG.GEMINI.MODEL;
        const url = `${CONFIG.GEMINI.BASE_URL}${model}:generateContent?key=${apiKey}`;

        const contextualPrompt = `${CONFIG.GEMINI.SYSTEM_CONTEXT}

User question: "${message}"

Please provide helpful, accurate information. Keep responses concise and practical for field use.`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: contextualPrompt
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: CONFIG.GEMINI.MAX_TOKENS,
                    temperature: CONFIG.GEMINI.TEMPERATURE
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    loadChatHistory() {
        const savedHistory = localStorage.getItem(CONFIG.STORAGE.CHAT_HISTORY);
        if (savedHistory) {
            try {
                this.chatHistory = JSON.parse(savedHistory);
            } catch (error) {
                ConfigUtils.log('error', 'Failed to load chat history', error);
            }
        }
    }

    saveChatMessage(userMessage, aiResponse) {
        const chatEntry = {
            timestamp: new Date().toISOString(),
            user: userMessage,
            ai: aiResponse
        };

        this.chatHistory.push(chatEntry);

        // Limit history size
        if (this.chatHistory.length > CONFIG.PERFORMANCE.CHAT_HISTORY_LIMIT) {
            this.chatHistory = this.chatHistory.slice(-CONFIG.PERFORMANCE.CHAT_HISTORY_LIMIT);
        }

        this.saveChatHistory();
    }

    saveChatHistory() {
        try {
            localStorage.setItem(CONFIG.STORAGE.CHAT_HISTORY, JSON.stringify(this.chatHistory));
        } catch (error) {
            ConfigUtils.log('error', 'Failed to save chat history', error);
        }
    }

    focusChatInput() {
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, 100);
    }

    // Voice Recognition
    initializeVoiceRecognition() {
        if (!ConfigUtils.isFeatureEnabled('VOICE_INPUT')) return;

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();

            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';

            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.value = transcript;
                }
                this.stopVoiceInput();
            };

            this.voiceRecognition.onerror = (event) => {
                ConfigUtils.log('error', 'Voice recognition error', event.error);
                this.stopVoiceInput();
                this.showNotification('Voice input failed. Please try again.', 'error');
            };

            this.voiceRecognition.onend = () => {
                this.stopVoiceInput();
            };
        }
    }

    toggleVoiceInput() {
        if (!this.voiceRecognition) {
            this.showNotification('Voice input not supported', 'warning');
            return;
        }

        if (this.isRecording) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!this.voiceRecognition) return;

        try {
            this.voiceRecognition.start();
            this.isRecording = true;

            const voiceBtn = document.querySelector('.voice-btn');
            if (voiceBtn) {
                voiceBtn.classList.add('recording');
            }

            this.showNotification('Listening...', 'info');
        } catch (error) {
            ConfigUtils.log('error', 'Failed to start voice input', error);
        }
    }

    stopVoiceInput() {
        if (this.voiceRecognition && this.isRecording) {
            this.voiceRecognition.stop();
        }

        this.isRecording = false;

        const voiceBtn = document.querySelector('.voice-btn');
        if (voiceBtn) {
            voiceBtn.classList.remove('recording');
        }
    }

    // Health Tips System
    async loadHealthTips(showLoading = true) {
        const tipsContainer = document.getElementById('healthTips');
        const loadingElement = document.getElementById('tipsLoading');

        if (showLoading && loadingElement) {
            loadingElement.style.display = 'block';
        }

        try {
            // Check cache first
            const cachedTips = localStorage.getItem(CONFIG.STORAGE.HEALTH_TIPS_CACHE);
            const cacheTime = localStorage.getItem(CONFIG.STORAGE.HEALTH_TIPS_CACHE + '_time');

            const now = Date.now();
            const cacheMaxAge = 5 * 60 * 1000; // 5 minutes

            if (cachedTips && cacheTime && (now - parseInt(cacheTime)) < cacheMaxAge) {
                this.healthTips = JSON.parse(cachedTips);
                ConfigUtils.log('info', 'Loaded health tips from cache');
            } else {
                // Simulate API call with mock data
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.healthTips = this.shuffleArray(ConfigUtils.getMockData('HEALTH_TIPS'));
                
                // Cache the results
                localStorage.setItem(CONFIG.STORAGE.HEALTH_TIPS_CACHE, JSON.stringify(this.healthTips));
                localStorage.setItem(CONFIG.STORAGE.HEALTH_TIPS_CACHE + '_time', now.toString());
                
                ConfigUtils.log('info', 'Loaded fresh health tips');
            }

            this.displayHealthTips();

        } catch (error) {
            ConfigUtils.log('error', 'Failed to load health tips', error);
            this.showHealthTipsError();
        } finally {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }

    displayHealthTips(filteredTips = null) {
        const container = document.getElementById('healthTips');
        if (!container) return;

        const tipsToShow = filteredTips || this.healthTips;
        container.innerHTML = '';

        tipsToShow.forEach((tip, index) => {
            const tipCard = this.createTipCard(tip, index);
            container.appendChild(tipCard);
        });
    }

    createTipCard(tip, index) {
        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        tipCard.style.animationDelay = `${index * 100}ms`;

        tipCard.innerHTML = `
            <div class="tip-header">
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-title">${tip.title}</div>
                <div class="tip-category">${this.capitalizeFirst(tip.category)}</div>
            </div>
            <div class="tip-content">${tip.content}</div>
            ${tip.priority === 'critical' ? '<div style="margin-top: 1rem; color: var(--danger-color); font-weight: 600; font-size: 0.875rem;">⚠️ Critical Information</div>' : ''}
        `;

        return tipCard;
    }

    showHealthTipsError() {
        const container = document.getElementById('healthTips');
        if (container) {
            container.innerHTML = `
                <div class="tip-card" style="text-align: center; color: var(--text-secondary);">
                    <div class="tip-icon">⚠️</div>
                    <div class="tip-title">Unable to Load Tips</div>
                    <div class="tip-content">Please check your connection and try again.</div>
                    <button class="btn btn-primary" onclick="app.loadHealthTips(true)" style="margin-top: 1rem;">
                        🔄 Retry
                    </button>
                </div>
            `;
        }
    }

    filterTips(category) {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Filter tips
        let filteredTips = this.healthTips;
        if (category !== 'all') {
            filteredTips = this.healthTips.filter(tip => tip.category === category);
        }

        this.displayHealthTips(filteredTips);
        ConfigUtils.log('debug', `Filtered tips by category: ${category}`);
    }

    checkTipsCache() {
        const cacheTime = localStorage.getItem(CONFIG.STORAGE.HEALTH_TIPS_CACHE + '_time');
        if (cacheTime) {
            const now = Date.now();
            const cacheAge = now - parseInt(cacheTime);
            const maxAge = 5 * 60 * 1000; // 5 minutes

            if (cacheAge > maxAge) {
                this.loadHealthTips(false);
            }
        }
    }

    // Report System
    initializeReportForm() {
        this.updateCharacterCount();
        this.updatePriorityIndicator();
    }

    validateForm() {
        const form = document.getElementById('issueForm');
        const submitBtn = document.getElementById('submitBtn');

        if (!form || !submitBtn) return;

        const isValid = form.checkValidity();
        submitBtn.disabled = !isValid;

        if (isValid) {
            submitBtn.classList.remove('btn-secondary');
            submitBtn.classList.add('btn-primary');
        } else {
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-secondary');
        }
    }

    updateCharacterCount() {
        const textarea = document.getElementById('issueDescription');
        const counter = document.getElementById('charCount');

        if (textarea && counter) {
            const length = textarea.value.length;
            const maxLength = 500;

            counter.textContent = length;

            if (length > maxLength * 0.9) {
                counter.style.color = 'var(--danger-color)';
            } else if (length > maxLength * 0.7) {
                counter.style.color = 'var(--warning-color)';
            } else {
                counter.style.color = 'var(--text-secondary)';
            }
        }
    }

    updatePriorityIndicator() {
        const priorityRadios = document.querySelectorAll('input[name="priority"]');
        const indicator = document.getElementById('priorityIndicator');

        if (!indicator) return;

        let selectedPriority = 'medium';
        priorityRadios.forEach(radio => {
            if (radio.checked) {
                selectedPriority = radio.value;
            }
        });

        const priorityConfig = {
            low: { dot: 'low', text: 'Low Priority Report' },
            medium: { dot: 'medium', text: 'Standard Report' },
            high: { dot: 'high', text: 'High Priority Report' },
            urgent: { dot: 'urgent', text: 'Urgent Report' }
        };

        const config = priorityConfig[selectedPriority];
        indicator.innerHTML = `
            <span class="priority-dot ${config.dot}"></span>
            <span>${config.text}</span>
        `;
    }

    // Utility Functions
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }

    setupConnectivityMonitoring() {
        this.updateConnectivityStatus();
    }

    updateConnectivityStatus() {
        const statusElement = document.getElementById('statusText');
        const indicator = document.querySelector('.status-indicator');
        
        if (statusElement && indicator) {
            if (navigator.onLine) {
                statusElement.textContent = 'Online';
                indicator.classList.remove('offline');
            } else {
                statusElement.textContent = 'Offline';
                indicator.classList.add('offline');
            }
        }
    }

    handleConnectivityChange(isOnline) {
        this.isOnline = isOnline;
        this.updateConnectivityStatus();
        
        const message = isOnline ? 'Connection restored' : 'Working offline';
        const type = isOnline ? 'success' : 'warning';
        this.showNotification(message, type);
    }

    checkConnectivity() {
        const wasOnline = this.isOnline;
        const isOnline = navigator.onLine;
        
        if (wasOnline !== isOnline) {
            this.handleConnectivityChange(isOnline);
        }
    }

    async initializeGeolocation() {
        if (!ConfigUtils.isFeatureEnabled('GPS_TRACKING')) return;

        if ('geolocation' in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, CONFIG.GEO);
                });
                
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                ConfigUtils.log('info', 'Geolocation initialized', this.currentLocation);
            } catch (error) {
                ConfigUtils.log('warn', 'Geolocation failed', error);
            }
        }
    }

    applyUserPreferences(preferences) {
        // Apply user preferences like theme, notifications, etc.
        if (preferences.theme) {
            document.body.setAttribute('data-theme', preferences.theme);
        }
        
        ConfigUtils.log('info', 'User preferences applied');
    }

    saveUserPreferences() {
        const preferences = {
            theme: document.body.getAttribute('data-theme') || 'auto',
            notifications: true,
            voiceEnabled: ConfigUtils.isFeatureEnabled('VOICE_INPUT')
        };
        
        try {
            localStorage.setItem(CONFIG.STORAGE.USER_PREFERENCES, JSON.stringify(preferences));
        } catch (error) {
            ConfigUtils.log('error', 'Failed to save preferences', error);
        }
    }

    handleKeyboardShortcuts(event) {
        // Handle keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '1':
                    event.preventDefault();
                    this.showSection('dashboard');
                    break;
                case '2':
                    event.preventDefault();
                    this.showSection('tracking');
                    break;
                case '3':
                    event.preventDefault();
                    this.showSection('chat');
                    break;
                case '4':
                    event.preventDefault();
                    this.showSection('tips');
                    break;
                case '5':
                    event.preventDefault();
                    this.showSection('report');
                    break;
            }
        }
    }

    // Notification System
    showNotification(message, type = 'info', duration = 5000) {
        const container = this.getOrCreateToastContainer();
        const toast = this.createToast(message, type);
        
        container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // Auto remove
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    getOrCreateToastContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = CONFIG.NOTIFICATIONS.TYPES[type.toUpperCase()]?.icon || 'ℹ️';
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="app.removeToast(this.parentElement)">×</button>
        `;
        
        return toast;
    }

    removeToast(toast) {
        if (toast && toast.parentElement) {
            toast.classList.add('removing');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.parentElement.removeChild(toast);
                }
            }, 300);
        }
    }

    // Action handlers (these would typically call external services)
    startNavigation(address, lat, lng) {
        if (lat && lng) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            window.open(url, '_blank');
        } else {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
            window.open(url, '_blank');
        }
        this.showNotification(`Navigation started to ${address}`, 'info');
    }

    makeCall(phoneNumber) {
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
            this.showNotification(`Calling ${phoneNumber}`, 'info');
        }
    }

    getCurrentLocation() {
        if (this.currentLocation) {
            const locationInput = document.getElementById('issueLocation');
            if (locationInput) {
                locationInput.value = `Current Location (${this.currentLocation.lat.toFixed(6)}, ${this.currentLocation.lng.toFixed(6)})`;
            }
        } else {
            this.showNotification('Location not available', 'warning');
        }
    }

    clearForm() {
        const form = document.getElementById('issueForm');
        if (form) {
            form.reset();
            this.updateCharacterCount();
            this.updatePriorityIndicator();
            this.showNotification('Form cleared', 'info');
        }
    }

    submitIssue(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        const issueData = {
            type: formData.get('issueType'),
            priority: formData.get('priority'),
            location: formData.get('location'),
            description: formData.get('description'),
            timestamp: new Date().toISOString(),
            id: 'ISSUE_' + Date.now()
        };
        
        // In a real app, this would send to a server
        ConfigUtils.log('info', 'Issue submitted', issueData);
        
        this.showNotification('Issue report submitted successfully!', 'success');
        this.clearForm();
    }
}

// Global function handlers (called from HTML)
function showSection(sectionId) {
    if (window.app) {
        window.app.showSection(sectionId);
    }
}

function toggleCollection() {
    if (window.app) {
        window.app.toggleCollection();
    }
}

function sendMessage() {
    if (window.app) {
        window.app.sendMessage();
    }
}

function sendQuickMessage(message) {
    if (window.app) {
        window.app.sendQuickMessage(message);
    }
}

function handleChatKeyPress(event) {
    if (window.app) {
        window.app.handleChatKeyPress(event);
    }
}

function toggleVoiceInput() {
    if (window.app) {
        window.app.toggleVoiceInput();
    }
}

function loadHealthTips(showLoading) {
    if (window.app) {
        window.app.loadHealthTips(showLoading);
    }
}

function filterTips(category) {
    if (window.app) {
        window.app.filterTips(category);
    }
}

function refreshPickups() {
    if (window.app) {
        window.app.refreshPickups();
    }
}

function getCurrentLocation() {
    if (window.app) {
        window.app.getCurrentLocation();
    }
}

function clearForm() {
    if (window.app) {
        window.app.clearForm();
    }
}

function submitIssue(event) {
    if (window.app) {
        window.app.submitIssue(event);
    }
}

function showEmergencyContact() {
    if (window.app) {
        window.app.showNotification('Emergency: Call +1-800-SAMPLES', 'warning');
        window.location.href = 'tel:+18007267537';
    }
}

function openMapOverview() {
    if (window.app) {
        window.app.showNotification('Opening route overview...', 'info');
        // Would open a map view in a real app
    }
}

function checkWeather() {
    if (window.app) {
        window.app.showNotification('Weather: Clear, 72°F - Good conditions for transport', 'info');
    }
}

function toggleNotifications() {
    if (window.app) {
        window.app.showNotification('Notification settings opened', 'info');
    }
}

function showQuickActions() {
    if (window.app) {
        window.app.showNotification('Quick actions menu', 'info');
    }
}

function updatePriority() {
    if (window.app) {
        window.app.updatePriorityIndicator();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SampleCollectionApp();
    
    // Add CSS for toast notifications
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 5rem;
            right: 1rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .toast {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 0.5rem;
            padding: 0.75rem 1rem;
            box-shadow: var(--shadow-lg);
            max-width: 350px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .toast.removing {
            transform: translateX(100%);
            opacity: 0;
        }
        
        .toast-success {
            border-left: 4px solid var(--success-color);
        }
        
        .toast-error {
            border-left: 4px solid var(--danger-color);
        }
        
        .toast-warning {
            border-left: 4px solid var(--warning-color);
        }
        
        .toast-info {
            border-left: 4px solid var(--primary-color);
        }
        
        .toast-icon {
            font-size: 1.25rem;
        }
        
        .toast-message {
            flex: 1;
            font-size: 0.875rem;
            color: var(--text-primary);
        }
        
        .toast-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            color: var(--text-secondary);
            padding: 0;
            width: 1.5rem;
            height: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: var(--transition);
        }
        
        .toast-close:hover {
            background: var(--surface-dark);
            color: var(--text-primary);
        }
    `;
    document.head.appendChild(style);
});