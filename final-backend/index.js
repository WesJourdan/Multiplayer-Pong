const express = require('express');
const cors = require('cors');

const PORT = 8080;
const app = express();
app.use(cors());

let playerIndex = []

const server = app.listen(PORT, () => {
	console.log('server is running on port 8080')
});
const io = require('socket.io')(server);

io.on('connection', (client) => {
	playerIndex.push(client.id)
	if (playerIndex.length > 1) {
		client.to(playerIndex[0]).emit('gameHost')
		console.log('gamehost chosen')
	}
	console.log("client connected with id " + client.id)

	// Listen for new state from both clients
	client.on('update', (data) => {
		client.broadcast.emit('newState', data);
	});

	client.on('disconnect', () => {
		console.log("deleted socket:" + client.id);
	});

});

