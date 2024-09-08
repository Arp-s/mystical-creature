const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const clues = require('./clues.json');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let games = {};

// Fonction pour diffuser le nombre de joueurs à tous les clients de la partie
function broadcastPlayerCount(gameCode) {
    const playerCount = games[gameCode].players.length;
    games[gameCode].players.forEach(player => {
        player.send(JSON.stringify({ playerCount }));
    });
}

// Gestion des connexions WebSocket
wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.slice(1));
    const gameCode = params.get('code');

    if (!gameCode) {
        ws.send('No game code provided');
        ws.close();
        return;
    }

    if (!games[gameCode]) {
        games[gameCode] = { players: [] };
    }

    const playerNumber = games[gameCode].players.length + 1;
    games[gameCode].players.push(ws);
    broadcastPlayerCount(gameCode); // Mise à jour du nombre de joueurs
    ws.send(JSON.stringify({ message: 'Player joined', playerNumber }));

    // Envoie les indices lorsque 3 joueurs sont connectés
    if (playerNumber === 3) {
        const randomClueGroup = clues[Object.keys(clues)[Math.floor(Math.random() * Object.keys(clues).length)]];
        games[gameCode].players.forEach((player, index) => {
            const clue = randomClueGroup[`indice${index + 1}`];
            if (clue) player.send(JSON.stringify({ clue }));
            else console.error(`Clue indice${index + 1} not found`);
        });
    }

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        games[gameCode].players = games[gameCode].players.filter(player => player !== ws);
        if (games[gameCode].players.length === 0) delete games[gameCode];
        else broadcastPlayerCount(gameCode); // Mise à jour du nombre de joueurs
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
