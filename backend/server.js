const express = require('express'); // Assure-toi d'avoir importé express
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

    ws.send(JSON.stringify({ message: 'Player joined', playerNumber: playerNumber }));

    if (playerNumber === 3) {
        const clueKeys = Object.keys(clues);
        const randomKey = clueKeys[Math.floor(Math.random() * clueKeys.length)];
        const randomClueGroup = clues[randomKey];
    
        games[gameCode].players.forEach((player, index) => {
            const clue = randomClueGroup[`indice${index + 1}`];
            if (clue) {
                player.send(JSON.stringify({ clue }));
            } else {
                console.error(`Clue indice${index + 1} not found`);
            }
        });
    }

    ws.on('message', (message) => {
        // Ici tu peux gérer les messages reçus des joueurs
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        // Retirer le joueur de la partie en cas de déconnexion
        games[gameCode].players = games[gameCode].players.filter(player => player !== ws);
        if (games[gameCode].players.length === 0) {
            delete games[gameCode]; // Supprimer la partie si aucun joueur n'est connecté
        }
    });
});

const PORT = process.env.PORT || 3000; // Render utilise la variable d'environnement PORT
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
