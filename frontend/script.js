const startBtn = document.getElementById('startBtn');
const joinBtn = document.getElementById('joinBtn');
const codeInput = document.getElementById('codeInput');
const revealBtn = document.getElementById('revealBtn');
const clueDisplay = document.getElementById('clueDisplay');
const launchBtn = document.getElementById('launchBtn');
const playerCount = document.getElementById('playerCount');

let socket;
let gameCode;

function generateCode() {
    return Math.random().toString(36).substr(2, 5).toUpperCase();
}

function connectWebSocket(code) {
    socket = new WebSocket(`wss://mystical-creature.onrender.com/?code=${code}`);

    socket.onopen = () => {
        console.log('Connected to WebSocket');
    };

    socket.onmessage = (event) => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            data = event.data;
        }

        if (data.playerCount !== undefined) {
            playerCount.textContent = data.playerCount;
        }

        if (data.clue !== undefined) {
            clueDisplay.textContent = data.clue;
        }

        if (data.type === 'gameStarted') {
            window.location.href = `game.html?code=${code}`;
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed');
    };
}

if (window.location.pathname.includes('waiting.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        connectWebSocket(code);
    } else {
        console.error('No game code provided');
    }
}

joinBtn?.addEventListener('click', () => {
    const code = codeInput.value.trim().toUpperCase();
    if (code) {
        window.location.href = `waiting.html?code=${code}`;
    }
});

launchBtn?.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        socket.send(JSON.stringify({ type: 'startGame' }));
    } else {
        console.error('No game code provided');
    }
});


revealBtn?.addEventListener('click', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        connectWebSocket(code);
    } else {
        console.error('No game code provided');
    }
});
