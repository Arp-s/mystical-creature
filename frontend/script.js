const startBtn = document.getElementById('startBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const revealBtn = document.getElementById('revealBtn');
const clueDisplay = document.getElementById('clueDisplay');
const launchBtn = document.getElementById('launchBtn');
const playerCount = document.getElementById('playerCount');

let socket;
let gameCode;

// Générer un code de 5 lettres
function generateCode() {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Lancer une nouvelle partie
startBtn?.addEventListener('click', () => {
    gameCode = generateCode();
    window.location.href = `waiting.html?code=${gameCode}`;
});

// Rejoindre une partie existante
joinBtn?.addEventListener('click', () => {
    const code = codeInput.value.trim().toUpperCase();
    if (code) {
        window.location.href = `waiting.html?code=${code}`;
    }
});

// Gérer la connexion WebSocket et l'affichage des joueurs
function connectWebSocket(code) {
    socket = new WebSocket(`wss://mystical-creature.onrender.com/?code=${code}`);

    socket.onopen = () => {
        console.log('Connected to WebSocket');
    };

    socket.onmessage = (event) => {
        if (event.data.startsWith('playerCount:')) {
            playerCount.textContent = event.data.split(':')[1];
        } else {
            clueDisplay.textContent = event.data; // Affiche l'indice reçu
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
}

// Lancer le jeu après attente
launchBtn?.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    window.location.href = `game.html?code=${code}`;
});

// Connexion au WebSocket sur la page d'attente
if (window.location.pathname.includes('waiting.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    connectWebSocket(code);
}

// Révéler un indice sur la page de jeu
revealBtn?.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code && !socket) {
        connectWebSocket(code);
    }
});
