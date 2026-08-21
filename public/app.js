/* ==========================================================================
   BERLIN TERMINE - LUXURY EXPAT HUB JAVASCRIPT & MULTILINGUAL LOGIC
   ========================================================================== */

const TRANSLATIONS = {
    en: {
        flag: "🇬🇧",
        name: "English",
        heroPill: "Live Bürgeramt Monitor Active",
        heroTitle: "Get Your Berlin <span>Anmeldung Appointment</span> Effortlessly",
        heroSubtitle: "Never miss a bookable slot in Berlin again. Free automated instant Email & Telegram alerts as soon as new Bürgeramt appointments open up.",
        inputPlaceholder: "Enter your email address...",
        subscribeBtn: "Get Free Alerts ⚡",
        benefitTitle: "Why Do You Need Anmeldung in Berlin?",
        benefitSubtitle: "Registering your address unlocks your entire life in Germany:",
        b1Title: "Tax ID (Steuer-ID)",
        b1Desc: "Essential for your employer to pay your salary without being taxed at the maximum 45% rate.",
        b2Title: "German Bank Account",
        b2Desc: "Required by traditional banks (Sparkasse, Deutsche Bank) to open a resident checking account.",
        b3Title: "Health Insurance & Contracts",
        b3Desc: "Sign internet plans, gym memberships, and set up mandatory public/private health insurance.",
        b4Title: "SCHUFA Credit Score",
        b4Desc: "Start building your credit history in Germany so landlords accept your future rental applications.",
        checklistTitle: "Expat Bureaucracy Survival Checklist",
        checklistSubtitle: "Check off your progress to track your arrival journey in Berlin:",
        c1Title: "1. Landlord Confirmation (Wohnungsgeberbestätigung)",
        c1Desc: "Get this signed form from your landlord or primary tenant before booking your appointment.",
        c2Title: "2. Passport & Identity Document",
        c2Desc: "Make sure your passport is valid for at least 6 months.",
        c3Title: "3. Complete Registration Form (Anmeldeformular)",
        c3Desc: "Download and fill out the official Berlin registration form above using our PDF generator.",
        c4Title: "4. Book & Attend Bürgeramt Appointment",
        c4Desc: "Use our alert bot to catch an open slot and attend in person.",
        newsTitle: "Berlin Expat News & Bureaucracy Tips",
        newsSubtitle: "Updated every 2-3 days with vital advice for new residents:",
        allNews: "All Updates",
        bureaucracy: "Bureaucracy",
        finances: "Finances",
        housing: "Housing",
        transport: "Transport",
        statusLive: "BOT STATUS",
        statusSubscribers: "ACTIVE SUBSCRIBERS",
        statusDistricts: "MONITORED DISTRICTS",
        subSuccess: "🎉 Success! You are now subscribed to instant Email & Telegram alerts.",
        subError: "❌ Failed to subscribe. Please try again."
    },
    de: {
        flag: "🇩🇪",
        name: "Deutsch",
        heroPill: "Live-Bürgeramt-Monitor Aktiv",
        heroTitle: "Deinen Berlin <span>Anmeldung-Termin</span> Mühelos Sichern",
        heroSubtitle: "Verpasse nie wieder einen freien Termin in Berlin. Kostenlose automatische E-Mail & Telegram-Benachrichtigungen.",
        inputPlaceholder: "Deine E-Mail-Adresse eingeben...",
        subscribeBtn: "Gratis-Alarme Aktivieren ⚡",
        benefitTitle: "Warum brauchst du die Anmeldung in Berlin?",
        benefitSubtitle: "Die Wohnsitzanmeldung schaltet dein gesamtes Leben in Deutschland frei:",
        b1Title: "Steuer-ID (Steuernummer)",
        b1Desc: "Unerlässlich für deinen Arbeitgeber, damit du nicht in die höchste Steuerklasse 6 eingestuft wirst.",
        b2Title: "Deutsches Bankkonto",
        b2Desc: "Wird von traditionellen Banken benötigt, um ein vollwertiges Girokonto zu eröffnen.",
        b3Title: "Krankenkasse & Verträge",
        b3Desc: "Schließe Internetverträge, Fitnessstudio-Abos und deine gesetzliche/private Krankenversicherung ab.",
        b4Title: "SCHUFA-Bonität",
        b4Desc: "Baue deine finanzielle Historie in Deutschland auf, damit Vermieter deine Wohnungsbewerbung akzeptieren.",
        checklistTitle: "Expat-Bürokratie-Checkliste",
        checklistSubtitle: "Markiere deinen Fortschritt für deinen Start in Berlin:",
        c1Title: "1. Wohnungsgeberbestätigung",
        c1Desc: "Lass dieses Formular vom Vermieter oder Hauptmieter vor dem Termin unterschreiben.",
        c2Title: "2. Reisepass / Personalausweis",
        c2Desc: "Stelle sicher, dass dein Ausweis noch mindestens 6 Monate gültig ist.",
        c3Title: "3. Anmeldeformular Ausfüllen",
        c3Desc: "Lade das offizielle Berliner Anmeldeformular mit unserem Generator oben herunter.",
        c4Title: "4. Termin Buchen & Wahrnehmen",
        c4Desc: "Nutze unseren Benachrichtigungs-Bot, um einen freien Termin zu ergattern.",
        newsTitle: "Berlin Expat-News & Bürokratie-Tipps",
        newsSubtitle: "Alle 2-3 Tage aktualisiert mit wichtigen Ratschlägen für neue Bewohner:",
        allNews: "Alle News",
        bureaucracy: "Bürokratie",
        finances: "Finanzen",
        housing: "Wohnen",
        transport: "Verkehr",
        statusLive: "BOT-STATUS",
        statusSubscribers: "AKTIVE ABONNENTEN",
        statusDistricts: "ÜBERWACHTE BEZIRKE",
        subSuccess: "🎉 Erfolgreich! Du bist jetzt für E-Mail & Telegram Alarme registriert.",
        subError: "❌ Anmeldung fehlgeschlagen. Bitte versuche es erneut."
    },
    es: {
        flag: "🇪🇸",
        name: "Español",
        heroPill: "Monitor en Vivo del Bürgeramt Activo",
        heroTitle: "Consigue tu Cita de <span>Anmeldung en Berlín</span> Sin Esfuerzo",
        heroSubtitle: "No vuelvas a perder un turno libre en Berlín. Alertas por correo y Telegram gratuitas e instantáneas.",
        inputPlaceholder: "Introduce tu correo electrónico...",
        subscribeBtn: "Recibir Alertas Gratis ⚡",
        benefitTitle: "¿Por qué necesitas el Anmeldung en Berlín?",
        benefitSubtitle: "Registrar tu dirección desbloquea tu vida completa en Alemania:",
        b1Title: "Tax ID (Steuer-ID)",
        b1Desc: "Esencial para que tu empresa te pague la nómina sin aplicarte la retención máxima del 45%.",
        b2Title: "Cuenta Bancaria Alemana",
        b2Desc: "Requisito obligatorio en bancos tradicionales (Sparkasse, Deutsche Bank) para abrir cuenta corriente.",
        b3Title: "Seguro Médico y Contratos",
        b3Desc: "Contrata internet, gimnasio y activa tu seguro médico público (Krankenkasse) o privado.",
        b4Title: "Historial SCHUFA",
        b4Desc: "Comienza a construir tu scoring crediticio en Alemania para que los caseros acepten tus alquileres.",
        checklistTitle: "Checklist de Supervivencia Expat",
        checklistSubtitle: "Marca tu progreso para organizar tu llegada a Berlín:",
        c1Title: "1. Wohnungsgeberbestätigung",
        c1Desc: "Consigue este certificado firmado por tu casero antes de acudir a la cita.",
        c2Title: "2. Pasaporte o Documento de Identidad",
        c2Desc: "Asegúrate de que tu documento tenga al menos 6 meses de validez.",
        c3Title: "3. Formulario de Registro (Anmeldeformular)",
        c3Desc: "Genera el PDF del formulario oficial arriba con nuestro generador automático.",
        c4Title: "4. Reservar y Acudir al Bürgeramt",
        c4Desc: "Usa nuestro bot para cazar una cita libre y acude presencialmente.",
        newsTitle: "Noticias y Consejos de Burocracia en Berlín",
        newsSubtitle: "Actualizado cada 2-3 días con guías vitales para residentes:",
        allNews: "Todas las Noticias",
        bureaucracy: "Burocracia",
        finances: "Finanzas",
        housing: "Vivienda",
        transport: "Transporte",
        statusLive: "ESTADO DEL BOT",
        statusSubscribers: "SUSCRIPTORES ACTIVOS",
        statusDistricts: "DISTRITOS MONITOREADOS",
        subSuccess: "🎉 ¡Conseguido! Ya estás suscrito a las alertas por correo y Telegram.",
        subError: "❌ Error en la suscripción. Inténtalo de nuevo."
    }
};

let currentLang = localStorage.getItem('berlin_lang') || 'en';
let newsCache = [];

document.addEventListener('DOMContentLoaded', () => {
    initLang();
    initChecklist();
    fetchBotStatus();
    fetchNews();

    // Event listeners
    document.getElementById('subscribeForm').addEventListener('submit', handleSubscribe);
    document.getElementById('langBtn').addEventListener('click', toggleLangDropdown);
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-switcher-wrapper')) {
            document.getElementById('langDropdown').classList.remove('show');
        }
    });
});

/* Language Selector Logic */
function initLang() {
    renderLangOptions();
    applyLanguage(currentLang);
}

function renderLangOptions() {
    const dropdown = document.getElementById('langDropdown');
    dropdown.innerHTML = '';
    
    Object.keys(TRANSLATIONS).forEach(code => {
        const lang = TRANSLATIONS[code];
        const opt = document.createElement('a');
        opt.className = `lang-option ${code === currentLang ? 'active' : ''}`;
        opt.innerHTML = `<span>${lang.flag}</span> <span>${lang.name}</span>`;
        opt.onclick = (e) => {
            e.preventDefault();
            switchLanguage(code);
        };
        dropdown.appendChild(opt);
    });
}

function toggleLangDropdown() {
    document.getElementById('langDropdown').classList.toggle('show');
}

function switchLanguage(code) {
    currentLang = code;
    localStorage.setItem('berlin_lang', code);
    renderLangOptions();
    applyLanguage(code);
    document.getElementById('langDropdown').classList.remove('show');
}

function applyLanguage(code) {
    const t = TRANSLATIONS[code] || TRANSLATIONS.en;
    
    document.getElementById('langCurrentFlag').innerText = t.flag;
    document.getElementById('langCurrentName').innerText = t.name;

    // Apply translations to UI elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
}

/* Subscription API (Email & Telegram) */
async function handleSubscribe(e) {
    e.preventDefault();
    const emailInput = document.getElementById('emailInput');
    const telegramInput = document.getElementById('telegramInput');
    const feedback = document.getElementById('formFeedback');
    
    const email = emailInput ? emailInput.value.trim() : '';
    const telegram = telegramInput ? telegramInput.value.trim() : '';

    if (!email && !telegram) return;

    feedback.className = 'form-feedback';
    feedback.innerText = 'Subscribing...';

    try {
        const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, telegram })
        });
        const data = await res.json();

        if (res.ok && data.success) {
            const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
            feedback.className = 'form-feedback success';
            feedback.innerText = t.subSuccess;
            if (emailInput) emailInput.value = '';
            if (telegramInput) telegramInput.value = '';
            fetchBotStatus();
        } else {
            feedback.className = 'form-feedback error';
            feedback.innerText = data.error || (TRANSLATIONS[currentLang] || TRANSLATIONS.en).subError;
        }
    } catch (err) {
        feedback.className = 'form-feedback error';
        feedback.innerText = 'Network error. Please try again.';
    }
}

/* PDF Generator Handler */
async function generatePDF(e) {
    e.preventDefault();

    const formData = {
        firstName: document.getElementById('pdfFirstName').value.trim(),
        lastName: document.getElementById('pdfLastName').value.trim(),
        birthName: document.getElementById('pdfBirthName').value.trim(),
        dob: document.getElementById('pdfDob').value,
        birthPlace: document.getElementById('pdfBirthPlace').value.trim(),
        gender: document.getElementById('pdfGender').value,
        nationality: document.getElementById('pdfNationality').value.trim(),
        civilStatus: document.getElementById('pdfCivilStatus').value,
        religion: document.getElementById('pdfReligion').value,
        moveDate: document.getElementById('pdfMoveDate').value,
        newStreet: document.getElementById('pdfNewStreet').value.trim(),
        newApt: document.getElementById('pdfNewApt').value.trim(),
        newZip: document.getElementById('pdfNewZip').value.trim(),
        newDistrict: document.getElementById('pdfNewDistrict').value.trim(),
        prevStreet: document.getElementById('pdfPrevStreet').value.trim(),
        landlordName: document.getElementById('pdfLandlordName').value.trim()
    };

    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Generating PDF... ⏳';
        submitBtn.disabled = true;

        const response = await fetch('/api/generate-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('PDF Generation failed');
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `Anmeldeformular_${formData.lastName || 'Berlin'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

        submitBtn.innerHTML = 'Downloaded Successfully! ✅';
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 3000);
    } catch (err) {
        alert('Error generating PDF. Please ensure all required fields are filled out.');
        console.error(err);
    }
}

/* Expat Checklist LocalStorage State */
function initChecklist() {
    const saved = JSON.parse(localStorage.getItem('berlin_checklist') || '[]');
    const items = document.querySelectorAll('.check-item');
    
    items.forEach((item, index) => {
        if (saved.includes(index)) {
            item.classList.add('completed');
            item.querySelector('.check-box').innerHTML = '✓';
        }

        item.addEventListener('click', () => {
            item.classList.toggle('completed');
            const isDone = item.classList.contains('completed');
            item.querySelector('.check-box').innerHTML = isDone ? '✓' : '';
            
            // Save state
            const currentSaved = JSON.parse(localStorage.getItem('berlin_checklist') || '[]');
            if (isDone) {
                if (!currentSaved.includes(index)) currentSaved.push(index);
            } else {
                const idx = currentSaved.indexOf(index);
                if (idx > -1) currentSaved.splice(idx, 1);
            }
            localStorage.setItem('berlin_checklist', JSON.stringify(currentSaved));
            updateChecklistProgressBar();
        });
    });

    updateChecklistProgressBar();
}

function updateChecklistProgressBar() {
    const total = document.querySelectorAll('.check-item').length;
    const completed = document.querySelectorAll('.check-item.completed').length;
    const pct = Math.round((completed / total) * 100);
    document.getElementById('checklistProgressFill').style.width = `${pct}%`;
}

/* Bot Status API Fetch */
async function fetchBotStatus() {
    try {
        const res = await fetch('/api/status');
        if (res.ok) {
            const data = await res.json();
            document.getElementById('activeSubscribersCount').innerText = data.activeSubscribers || '142';
        }
    } catch (e) {
        console.warn('Status fetch error:', e.message);
    }
}

/* News Feed Fetching & Filtering */
async function fetchNews() {
    try {
        const res = await fetch('/api/news');
        if (res.ok) {
            const data = await res.json();
            newsCache = data.news || [];
            renderNews('ALL');
        }
    } catch (e) {
        console.warn('News fetch error:', e.message);
    }
}

function renderNews(filterCategory) {
    const container = document.getElementById('newsGrid');
    if (!container) return;

    container.innerHTML = '';

    const filtered = filterCategory === 'ALL' 
        ? newsCache 
        : newsCache.filter(item => item.category.toUpperCase() === filterCategory.toUpperCase());

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div>
                <span class="news-badge">${item.icon} ${item.category}</span>
                <h4>${item.title}</h4>
                <p>${item.summary}</p>
            </div>
            <div class="news-meta">
                <span>📅 ${item.date}</span>
                <span>⏱️ ${item.readTime}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   BERLIN FOCUS AMBIENT SOUNDSCAPE PLAYER (WEB AUDIO SYNTH ENGINE)
   ========================================================================== */

let audioCtx = null;
let isPlayingAudio = false;
let currentTrackIndex = 0;
let gainNode = null;
let synthInterval = null;

const TRACKS = [
    { name: "🌆 Berlin Midnight Chill", type: "synth", chord: [130.81, 164.81, 196.00, 246.94] }, // Deep Cmaj7 warm sub pad
    { name: "🌧️ Spree River Calm", type: "synth", chord: [146.83, 174.61, 220.00, 261.63] }, // Dm7 warm pad
    { name: "☕ Tiergarten Relax Focus", type: "synth", chord: [110.00, 130.81, 164.81, 196.00] } // Am7 deep relaxing pad
];

function toggleAudioPlayer() {
    const popup = document.getElementById('audioPopup');
    popup.classList.toggle('show');
}

function initAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.35;
        gainNode.connect(audioCtx.destination);
    }
}

function togglePlayMusic() {
    initAudioContext();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (isPlayingAudio) {
        stopSynthMusic();
    } else {
        startSynthMusic();
    }
}

function startSynthMusic() {
    isPlayingAudio = true;
    document.getElementById('audioToggleBtn').classList.add('playing');
    document.getElementById('playMainBtn').innerText = '⏸️';
    updateTrackDisplay();
    playAmbientPad();
}

function stopSynthMusic() {
    isPlayingAudio = false;
    document.getElementById('audioToggleBtn').classList.remove('playing');
    document.getElementById('playMainBtn').innerText = '▶️';
    if (synthInterval) clearInterval(synthInterval);
}

function updateTrackDisplay() {
    document.getElementById('trackName').innerText = TRACKS[currentTrackIndex].name;
}

function playAmbientPad() {
    if (!isPlayingAudio || !audioCtx) return;

    if (synthInterval) clearInterval(synthInterval);

    const track = TRACKS[currentTrackIndex];
    
    // Play warm, soothing lo-fi analog pad with Lowpass Filter
    const playChord = () => {
        if (!isPlayingAudio) return;

        // Biquad Lowpass filter removes all harsh high frequencies
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, audioCtx.currentTime); // Soft warm 320Hz cut

        track.chord.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();
            
            // Pure sine wave for deep relaxing acoustic feel
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            // Soft gradual fade-in (3.5s) and fade-out (3.5s)
            noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 3.5);
            noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 7);
            
            osc.connect(noteGain);
            noteGain.connect(filter);
            filter.connect(gainNode);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 7.2);
        });
    };

    playChord();
    synthInterval = setInterval(playChord, 6500);
}


function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % TRACKS.length;
    updateTrackDisplay();
    if (isPlayingAudio) playAmbientPad();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    updateTrackDisplay();
    if (isPlayingAudio) playAmbientPad();
}

function changeVolume(val) {
    if (gainNode) {
        gainNode.gain.value = parseFloat(val);
    }
}

function filterNews(category, btnElement) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');
    renderNews(category);
}

function scrollToSubscribe() {
    document.getElementById('subscribeForm').scrollIntoView({ behavior: 'smooth' });
}

async function buyVIPPlan(event) {
    const btn = event.currentTarget;
    const originalText = btn.innerText;
    btn.innerText = "Redirecting to Stripe... 💳";
    btn.disabled = true;

    const emailInput = document.getElementById('emailInput')?.value || '';

    try {
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailInput })
        });

        const data = await response.json();
        if (data.success && data.url) {
            window.location.href = data.url;
        } else {
            alert("Payment initiation error: " + (data.error || "Please try again."));
            btn.innerText = originalText;
            btn.disabled = false;
        }
    } catch (e) {
        alert("Failed to connect to checkout: " + e.message);
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

const FALLBACK_EVENTS = [
    {
        id: "evt-1",
        title: "Berlin Summer Sunset Open-Air Festival",
        category: "Music & Nightlife",
        date: "Saturday, August 15, 2026",
        time: "16:00 - 23:00",
        location: "Tempelhofer Feld, Neukölln",
        price: "Free Entry / Spende",
        badge: "FEATURED",
        icon: "🎵",
        description: "Join thousands of Berliners at Tempelhof airfield for sunset lo-fi beats, food trucks, and open-air electronic music."
    },
    {
        id: "evt-2",
        title: "Kreuzberg Street Food & Vintage Flea Market",
        category: "Food & Markets",
        date: "Sunday, August 16, 2026",
        time: "11:00 - 18:00",
        location: "Markthalle Neun, Kreuzberg",
        price: "Free Entry",
        badge: "POPULAR",
        icon: "🍔",
        description: "Explore Berlin's vibrant street food scene with international dishes, artisan coffee, and curated vintage clothing stalls."
    },
    {
        id: "evt-3",
        title: "Berlin Tech Expat Networking & Founders Drinks",
        category: "Tech & Networking",
        date: "Thursday, August 13, 2026",
        time: "19:00 - 22:00",
        location: "Factory Berlin Mitte, Rheinsberger Str.",
        price: "Free RSVP",
        badge: "NETWORKING",
        icon: "🚀",
        description: "Connect with software engineers, product managers, and international founders living in Berlin over craft beer."
    },
    {
        id: "evt-4",
        title: "Museum Island Late-Night Art & Light Exhibition",
        category: "Culture & Art",
        date: "Friday, August 14, 2026",
        time: "20:00 - 01:00",
        location: "Museumsinsel (Pergamon & Bode Museum)",
        price: "12 € / Discounted",
        badge: "CULTURE",
        icon: "🎨",
        description: "Nighttime guided tours, illuminated neoclassical courtyards, and live acoustic violin performances."
    }
];

function renderEventsList(events) {
    const grid = document.getElementById('eventsGrid');
    if (!grid) return;
    grid.innerHTML = events.map(evt => `
        <div class="event-card">
            <div>
                <div class="event-header">
                    <span class="event-badge">${evt.badge}</span>
                    <span style="font-size: 1.5rem;">${evt.icon}</span>
                </div>
                <h3 class="event-title" style="margin-top: 10px;">${evt.title}</h3>
            </div>

            <div class="event-meta">
                <div class="event-meta-item">
                    <span>📅</span> <strong>${evt.date}</strong>
                </div>
                <div class="event-meta-item">
                    <span>⏰</span> <span>${evt.time}</span>
                </div>
                <div class="event-meta-item">
                    <span>📍</span> <span>${evt.location}</span>
                </div>
                <div class="event-meta-item">
                    <span>🎟️</span> <span style="color: var(--accent-emerald); font-weight: 700;">${evt.price}</span>
                </div>
            </div>

            <p class="event-desc">${evt.description}</p>
        </div>
    `).join('');
}

async function loadWeather() {
    try {
        const res = await fetch('/api/weather');
        const data = await res.json();
        if (data.success && data.current) {
            const cur = data.current;
            document.getElementById('weatherCurrentTemp').innerText = `${cur.temp}°C`;
            
            const weatherMap = {
                0: { icon: "☀️", desc: "Clear & Sunny Sky" },
                1: { icon: "🌤️", desc: "Mainly Clear & Mild" },
                2: { icon: "⛅", desc: "Partly Cloudy" },
                3: { icon: "☁️", desc: "Overcast Sky" },
                45: { icon: "🌫️", desc: "Foggy Morning" },
                61: { icon: "🌧️", desc: "Light Rain Showers" },
                80: { icon: "🌦️", desc: "Passing Rain Showers" }
            };
            const wInfo = weatherMap[cur.weathercode] || { icon: "🌤️", desc: "Pleasant Berlin Weather" };
            document.getElementById('weatherIcon').innerText = wInfo.icon;
            document.getElementById('weatherDesc').innerText = `${wInfo.desc} • Wind ${cur.windspeed} km/h`;

            const forecastStrip = document.getElementById('weatherForecastStrip');
            if (forecastStrip && data.daily) {
                const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                forecastStrip.innerHTML = data.daily.map(d => {
                    const dateObj = new Date(d.date);
                    const dayName = daysOfWeek[dateObj.getDay()];
                    const icon = (weatherMap[d.code] || { icon: "🌤️" }).icon;
                    return `
                        <div class="forecast-day-card">
                            <span class="forecast-day-name">${dayName}</span>
                            <span class="forecast-icon">${icon}</span>
                            <div class="forecast-temps">${d.maxTemp}° <span>${d.minTemp}°</span></div>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (e) {
        console.warn("Weather load fallback:", e);
    }
}

async function loadEvents() {
    renderEventsList(FALLBACK_EVENTS);
    try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.success && data.events && data.events.length > 0) {
            renderEventsList(data.events);
        }
    } catch (e) {
        console.warn("Events API fallback active:", e);
    }
}

// Rent & Living Cost Calculator Logic
function calculateBerlinCost() {
    const districtSelect = document.getElementById('calcDistrict');
    const sqmInput = document.getElementById('calcSquareMeters');
    
    if (!districtSelect || !sqmInput) return;

    const district = districtSelect.value;
    const sqm = parseInt(sqmInput.value);

    document.getElementById('calcSquareMetersVal').innerText = `${sqm} m²`;

    const rateMap = {
        neukoelln: 18.5,
        mitte: 24.0,
        charlottenburg: 21.0,
        wedding: 15.5
    };

    const rate = rateMap[district] || 18.0;
    const warmRent = Math.round(sqm * rate);
    const utilities = Math.round(60 + (sqm * 1.2));
    const transport = 49;
    const total = warmRent + utilities + transport;

    document.getElementById('resWarmRent').innerText = `€ ${warmRent.toLocaleString()} / mo`;
    document.getElementById('resUtilities').innerText = `€ ${utilities.toLocaleString()} / mo`;
    document.getElementById('resTransport').innerText = `€ ${transport} / mo`;
    document.getElementById('resTotalCost').innerText = `€ ${total.toLocaleString()} / mo`;
}

// 1-Click Copy German Template Handler
function copyTemplate(elementId, btnElement) {
    const textarea = document.getElementById(elementId);
    if (!textarea) return;

    textarea.select();
    navigator.clipboard.writeText(textarea.value);

    const originalText = btnElement.innerText;
    btnElement.innerText = "Copied to Clipboard! ✅";
    btnElement.style.background = "linear-gradient(135deg, #10b981, #059669)";

    setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.style.background = "";
    }, 2500);
}

// Unlock audio context on mobile touch or click
function unlockAudioOnTouch() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Initialize Weather, Events & Calculator on page load
document.addEventListener('DOMContentLoaded', () => {
    loadWeather();
    loadEvents();
    calculateBerlinCost();

    document.addEventListener('touchstart', unlockAudioOnTouch, { once: true });
    document.addEventListener('click', unlockAudioOnTouch, { once: true });
});




