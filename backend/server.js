const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const clues = require('./clues.json');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let games = {};

wss.on('connection', (ws, req) => {
    const params = new URLSearchParams(req.url.slice(1)); // Extraire les paramètres de l'URL
    const gameCode = params.get('code');

    if (!games[gameCode]) {
        games[gameCode] = { players: [] };
    }

    const playerNumber = games[gameCode].players.length + 1;
    games[gameCode].players.push(ws);

    if (playerNumber === 3) {
        // Une fois 3 joueurs connectés, distribuer les indices
        const randomClueGroup = clues[Math.floor(Math.random() * Object.keys(clues).length) + 1];
        games[gameCode].players.forEach((player, index) => {
            player.send(randomClueGroup[`indice${index + 1}`]);
        });
    }

    ws.on('close', () => {
        // Retirer le joueur de la partie en cas de déconnexion
        games[gameCode].players = games[gameCode].players.filter(player => player !== ws);
    });
});

const PORT = process.env.PORT || 3000; // Render utilise la variable d'environnement PORT
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
