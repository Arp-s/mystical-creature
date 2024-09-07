const startBtn = document.getElementById('startBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const revealBtn = document.getElementById('revealBtn');
const clueDisplay = document.getElementById('clueDisplay');

let socket;

// Lancer une nouvelle partie
startBtn?.addEventListener('click', () => {
    // Générer un code de partie et rediriger vers la page de jeu
    const code = Math.random().toString(36).substr(2, 5);
    window.location.href = `game.html?code=${code}`;
});

// Rejoindre une partie existante
joinBtn?.addEventListener('click', () => {
    const code = codeInput.value.trim();
    if (code) {
        window.location.href = `game.html?code=${code}`;
    }
});

// Révéler un indice
revealBtn?.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code && !socket) {
        // Connexion au WebSocket backend
        socket = new WebSocket(`wss://ton-backend.onrender.com/?code=${code}`);

        socket.onopen = () => {
            console.log('Connected to WebSocket');
        };

        socket.onmessage = (event) => {
            clueDisplay.textContent = event.data; // Affiche l'indice reçu
        };

        socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };
    }
});
