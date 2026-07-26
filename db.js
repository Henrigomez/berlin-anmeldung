const fs = require('fs');
const path = require('path');
const os = require('os');

// Use /tmp on serverless environments (Vercel, AWS Lambda) or fallback to local dir
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const SUBSCRIBERS_FILE = isServerless 
    ? path.join(os.tmpdir(), 'subscribers.json') 
    : path.join(__dirname, 'subscribers.json');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

let db = null;
let useFirebase = false;

// In-memory array fallback if filesystem is completely read-only
let memorySubscribers = [];

try {
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        const admin = require('firebase-admin');
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        db = admin.firestore();
        useFirebase = true;
        console.log('[Database] Connected to Firebase Firestore.');
    } else {
        console.log('[Database] serviceAccountKey.json not found. Using local/tmp subscribers storage.');
    }
} catch (e) {
    console.error('[Database Error] Firebase init failed, using local storage fallback:', e.message);
}

// Safely ensure local/tmp file exists
try {
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2));
    }
} catch (err) {
    console.warn('[Database Warning] Could not write subscribers file, using memory storage:', err.message);
}

function getLocalSubscribers() {
    try {
        if (fs.existsSync(SUBSCRIBERS_FILE)) {
            const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        // Fallback to memory
    }
    return memorySubscribers;
}

function saveLocalSubscribers(list) {
    try {
        fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));
    } catch (e) {
        memorySubscribers = list;
    }
}

async function addSubscriber(email) {
    const emailNormalized = email.toLowerCase().trim();
    
    // Save locally/memory
    const localList = getLocalSubscribers();
    const existsLocal = localList.some(s => s.email === emailNormalized);
    if (!existsLocal) {
        localList.push({ email: emailNormalized, subscribedAt: new Date().toISOString() });
        saveLocalSubscribers(localList);
    }

    // Save to Firebase if available
    if (useFirebase && db) {
        try {
            await db.collection('subscribers').doc(emailNormalized).set({
                email: emailNormalized,
                subscribedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.error('[Firebase Error] addSubscriber failed:', e.message);
        }
    }
    return true;
}

async function getSubscriberEmails() {
    if (useFirebase && db) {
        try {
            const snapshot = await db.collection('subscribers').get();
            const emails = [];
            snapshot.forEach(doc => emails.push(doc.id));
            if (emails.length > 0) return emails;
        } catch (e) {
            console.error('[Firebase Error] getSubscriberEmails failed, falling back to local:', e.message);
        }
    }
    
    // Fallback to local/memory
    const localList = getLocalSubscribers();
    return localList.map(s => s.email);
}

module.exports = {
    addSubscriber,
    getSubscriberEmails
};
