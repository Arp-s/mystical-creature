function broadcastPlayerCount(gameCode) {
    const playerCount = games[gameCode].players.length;
    games[gameCode].players.forEach(player => {
        player.send(JSON.stringify({ playerCount }));
    });
}

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

    // Envoyer le message de mise à jour du joueur à tous les joueurs
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
            delete games[gameCode];
        } else {
            // Mise à jour après déconnexion
            broadcastPlayerCount(gameCode);
        }
    });
});
