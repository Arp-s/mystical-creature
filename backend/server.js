const express = require('express'); // Assure-toi d'avoir importé express
const http = require('http');
const WebSocket = require('ws'); // Importation correcte du module WebSocket
const clues = require('./clues.json');

const app = express();
const server = http.createServer(app);

// Initialise wss avant toute utilisation
const wss = new WebSocket.Server({ server });

let games = {};

// Fonction pour diffuser le nombre de joueurs à tous les clients de la partie
function broadcastPlayerCount(gameCode) {
    const playerCount = games[gameCode].players.length;
    games[gameCode].players.forEach(player => {
        player.send(JSON.stringify({ playerCount })); // Envoie le nombre de joueurs à chaque client
    });
}

// Gestion des connexions WebSocket
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

    // Diffuse le nombre de joueurs après qu'un joueur ait rejoint
    broadcastPlayerCount(gameCode);

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
        console.log(`Received message: ${message}`);
    });

    ws.on('close', () => {
        games[gameCode].players = games[gameCode].players.filter(player => player !== ws);
        if (games[gameCode].players.length === 0) {
            delete games[gameCode]; // Supprimer la partie si aucun joueur n'est connecté
        } else {
            // Diffuse le nombre de joueurs après qu'un joueur ait quitté
            broadcastPlayerCount(gameCode);
        }
    });
});

const PORT = process.env.PORT || 3000; // Render utilise la variable d'environnement PORT
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
