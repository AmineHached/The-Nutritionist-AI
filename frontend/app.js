document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const video = document.getElementById('cameraFeed');
    const canvas = document.getElementById('captureCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('previewImage');
    const videoContainer = document.getElementById('videoContainer');
    const cameraError = document.getElementById('cameraError');
    const arOverlay = document.getElementById('arOverlay');

    const navBtns = document.querySelectorAll('.nav-btn');
    const historyNavBtn = document.getElementById('historyNavBtn');
    const coachNavBtn = document.getElementById('coachNavBtn');
    const cameraView = document.getElementById('cameraview');
    const historyView = document.getElementById('historyView');

    const coachPanel = document.getElementById('coachPanel');
    const closeCoachBtn = document.getElementById('closeCoachBtn');
    const coachInput = document.getElementById('coachInput');
    const sendCoachBtn = document.getElementById('sendCoachBtn');
    const chatContainer = document.getElementById('chatContainer');

    // --- Initialization ---
    async function initCamera() {
        if (!video) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
        } catch (err) {
            console.warn("Camera access denied:", err);
            video.style.display = 'none';
            if (cameraError) {
                cameraError.classList.remove('hidden');
                cameraError.style.display = 'flex';
            }
        }
    }
    initCamera();

    // --- Navigation Logic ---
    function showView(viewName) {
        if (cameraView) {
            cameraView.classList.add('hidden');
            cameraView.classList.remove('active');
        }
        if (historyView) historyView.classList.add('hidden');

        navBtns.forEach(btn => btn.classList.remove('active'));

        if (viewName === 'camera' && cameraView) {
            cameraView.classList.remove('hidden');
            cameraView.classList.add('active');
        } else if (viewName === 'history' && historyView) {
            historyView.classList.remove('hidden');
            if (historyNavBtn) historyNavBtn.classList.add('active');
            renderHistory();
        }
    }

    if (historyNavBtn) {
        historyNavBtn.addEventListener('click', () => {
            console.log('History clicked');
            if (historyView && historyView.classList.contains('hidden')) {
                showView('history');
            } else {
                showView('camera');
            }
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', () => {
            console.log('Capture clicked');
            if (cameraView && cameraView.classList.contains('hidden')) {
                showView('camera');
            } else {
                captureImage();
            }
        });
    }

    if (coachNavBtn) {
        coachNavBtn.addEventListener('click', () => {
            console.log('Coach clicked');
            if (coachPanel) {
                coachPanel.classList.remove('hidden'); // Make it render
                // Small delay to allow display:block to apply before transition
                setTimeout(() => {
                    coachPanel.classList.add('active');
                }, 10);
                coachNavBtn.classList.add('active');
            }
        });
    }

    if (closeCoachBtn) {
        closeCoachBtn.addEventListener('click', () => {
            if (coachPanel) {
                coachPanel.classList.remove('active');
                // Wait for transition (0.4s) then hide
                setTimeout(() => {
                    coachPanel.classList.add('hidden');
                }, 400);
            }
            if (coachNavBtn) coachNavBtn.classList.remove('active');
        });
    }

    // --- Capture & Upload Logic ---
    function captureImage() {
        if (!canvas || !video) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => handleImageAnalysis(blob), 'image/jpeg');
    }

    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleImageAnalysis(e.target.files[0]);
            }
        });
    }

    async function handleImageAnalysis(imageBlob) {
        const originalText = captureBtn ? captureBtn.innerHTML : '';
        if (captureBtn) captureBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        const formData = new FormData();
        formData.append('file', imageBlob, 'capture.jpg');

        try {
            const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
            const response = await fetch(`/api/analyze?user_email=${encodeURIComponent(userEmail)}`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Analysis failed');
            const data = await response.json();

            saveToHistory(data);
            localStorage.setItem('analysisResults', JSON.stringify(data));
            window.location.href = 'results.html';

        } catch (error) {
            alert("Error analyzing image: " + error.message);
        } finally {
            if (captureBtn) captureBtn.innerHTML = originalText;
        }
    }

    // --- History Logic ---
    function saveToHistory(data) {
        const historyItem = {
            id: Date.now(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            summary: data.health_summary,
            score: data.health_score,
            items: data.food_items.map(i => i.name).join(', '),
            fullData: data
        };

        let history = JSON.parse(localStorage.getItem('mealHistory') || '[]');
        history.unshift(historyItem);
        if (history.length > 20) history.pop();
        localStorage.setItem('mealHistory', JSON.stringify(history));
    }

    function renderHistory() {
        const history = JSON.parse(localStorage.getItem('mealHistory') || '[]');
        const listContainer = document.getElementById('historyList');
        if (!listContainer) return;

        if (history.length === 0) {
            listContainer.innerHTML = '<p style="color: var(--text-muted); text-align: center; margin-top: 50px;">No meals scanned yet.</p>';
            return;
        }

        listContainer.innerHTML = history.map(item => `
            <div class="history-card" onclick="loadHistoryItem(${item.id})">
                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                    <strong>${item.date} ${item.time}</strong>
                    <span style="color: ${getHealthColor(item.score)}; font-weight:bold;">${item.score}</span>
                </div>
                <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 5px;">${item.items || 'Meal'}</div>
                <div style="font-size: 0.8rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${item.summary}
                </div>
            </div>
        `).join('');
    }

    window.loadHistoryItem = function (id) {
        const history = JSON.parse(localStorage.getItem('mealHistory') || '[]');
        const item = history.find(i => i.id === id);
        if (item) {
            localStorage.setItem('analysisResults', JSON.stringify(item.fullData));
            window.location.href = 'results.html';
        }
    };

    function getHealthColor(score) {
        if (score >= 80) return '#10b981';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    }

    // --- Coach Chat Logic & Session Management ---
    let chatHistory = [];
    let currentSessionId = Date.now(); // Start with a new session ID

    // Elements for new features
    const chatHistoryBtn = document.getElementById('chatHistoryBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const savedChatsList = document.getElementById('savedChatsList');

    function startNewChat() {
        chatHistory = [];
        currentSessionId = Date.now();
        if (chatContainer) {
            chatContainer.innerHTML = `
                 <div class="message ai-message">
                    Hello! I'm your nutrition coach. Ask me about diet plans, food analysis, or healthy habits!
                </div>
            `;
        }
        if (savedChatsList) savedChatsList.classList.add('hidden');
    }

    function saveChatSession() {
        if (chatHistory.length === 0) return; // Don't save empty chats

        let sessions = JSON.parse(localStorage.getItem('coachSessions') || '[]');
        const existingIndex = sessions.findIndex(s => s.id === currentSessionId);
        let existingSession = existingIndex >= 0 ? sessions[existingIndex] : null;

        const firstMsg = chatHistory.find(m => m.role === 'user')?.content || "New Chat";
        // Prefer existing title, else use first message
        const displayTitle = (existingSession && existingSession.title) ? existingSession.title : firstMsg;

        const sessionData = {
            id: currentSessionId,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            preview: displayTitle,
            title: existingSession?.title,
            hasCustomTitle: existingSession?.hasCustomTitle || false,
            messages: chatHistory
        };

        if (existingIndex >= 0) {
            sessions[existingIndex] = sessionData;
        } else {
            sessions.unshift(sessionData);
        }

        localStorage.setItem('coachSessions', JSON.stringify(sessions));
    }

    function renderSavedChats() {
        if (!savedChatsList) return;
        const sessions = JSON.parse(localStorage.getItem('coachSessions') || '[]');
        savedChatsList.innerHTML = '';

        if (sessions.length === 0) {
            savedChatsList.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:50px;">No saved chats yet.</p>';
            return;
        }

        sessions.forEach(session => {
            const card = document.createElement('div');
            card.className = 'chat-session-card';
            // Fallback for missing data
            const dateStr = session.date || 'Unknown Date';
            const previewStr = session.preview || session.title || 'Conversation';

            card.innerHTML = `
                <div class="chat-session-date">${dateStr}</div>
                <div class="chat-session-preview">${previewStr}</div>
            `;
            // Capture session correctly in closure or pass ID
            card.addEventListener('click', () => loadChatSession(session));
            savedChatsList.appendChild(card);
        });
    }

    function loadChatSession(session) {
        currentSessionId = session.id;
        chatHistory = session.messages || [];

        if (chatContainer) {
            chatContainer.innerHTML = '';
            chatHistory.forEach(msg => {
                appendMessage(msg.content, msg.role === 'assistant' ? 'ai' : 'user');
            });
        }

        if (savedChatsList) savedChatsList.classList.add('hidden');
    }

    // Toggle History List
    if (chatHistoryBtn) {
        chatHistoryBtn.addEventListener('click', () => {
            if (savedChatsList && savedChatsList.classList.contains('hidden')) {
                renderSavedChats();
                savedChatsList.classList.remove('hidden');
            } else if (savedChatsList) {
                savedChatsList.classList.add('hidden');
            }
        });
    }

    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }

    async function sendCoachMessage() {
        if (!coachInput) return;
        const text = coachInput.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        coachInput.value = '';

        // Update local history
        chatHistory.push({ role: 'user', content: text });
        saveChatSession();

        const loadingId = 'loading-' + Date.now();
        appendMessage('...', 'ai', loadingId);

        const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

        try {
            const response = await fetch('/api/coach/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory.slice(0, -1),
                    context_data: contextData,
                    user_email: userEmail,
                    session_id: (typeof currentSessionId === 'number' && currentSessionId > 1000000000000) ? null : currentSessionId
                })
            });

            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) loadingEl.remove();

            if (!response.ok) throw new Error("Coach unavailable");

            const data = await response.json();

            // If backend created a new session, update our local ID
            if (data.session_id && data.session_id !== currentSessionId) {
                console.log("DEBUG: Switching local session ID to DB ID:", data.session_id);
                currentSessionId = data.session_id;
            }

            const reply = data.reply || data.response || data.message || "I'm listening.";
            appendMessage(reply, 'ai');

            // Update history with reply
            chatHistory.push({ role: 'assistant', content: reply });
            saveChatSession();

            // Generate Title if needed (Background)
            generateTitleIfNeeded();

        } catch (error) {
            const loadingEl = document.getElementById(loadingId);
            if (loadingEl) loadingEl.remove();
            appendMessage("Sorry, I'm having trouble connecting to the coach.", 'ai');
        }
    }

    async function generateTitleIfNeeded() {
        console.log("Triggering Title Gen Check...");
        let sessions = JSON.parse(localStorage.getItem('coachSessions') || '[]');
        let session = sessions.find(s => s.id === currentSessionId);

        console.log("Current Session ID:", currentSessionId);
        console.log("Session Found:", !!session);
        console.log("History Length:", chatHistory.length);
        if (session) console.log("Has Custom Title:", session.hasCustomTitle);

        // Only generate if we don't have a custom title and have enough content
        // Debug: Trigger on length >= 1 for easier testing
        if (session && !session.hasCustomTitle && chatHistory.length >= 1) {
            console.log("Conditions met. Fetching title...");
            try {
                const res = await fetch('/api/coach/title', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        history: chatHistory,
                        session_id: currentSessionId
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("Title API Response:", data);

                    if (data.title) {
                        session.title = data.title;
                        session.preview = data.title; // Use title as preview text in card
                        session.hasCustomTitle = true;

                        // Save back
                        const idx = sessions.findIndex(s => s.id === currentSessionId);
                        if (idx >= 0) sessions[idx] = session;
                        localStorage.setItem('coachSessions', JSON.stringify(sessions));
                        console.log("Title updated in storage:", data.title);

                        // Update UI if list is open
                        if (savedChatsList && !savedChatsList.classList.contains('hidden')) renderSavedChats();
                    }
                } else {
                    console.error("Title API Error:", res.status, res.statusText);
                }
            } catch (e) { console.error("Title gen failed exception:", e); }
        } else {
            console.log("Title generation skipped. Conditions not met.");
        }
    }

    function appendMessage(text, sender, id = null) {
        if (!chatContainer) return;
        const div = document.createElement('div');
        div.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;

        if (sender === 'ai') {
            if (typeof marked !== 'undefined' && marked.parse) {
                div.innerHTML = marked.parse(text);
            } else {
                div.textContent = text;
            }
        } else {
            div.textContent = text;
        }

        if (id) div.id = id;
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    if (sendCoachBtn) {
        sendCoachBtn.addEventListener('click', sendCoachMessage);
    }
    if (coachInput) {
        coachInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendCoachMessage();
        });
    }
});
