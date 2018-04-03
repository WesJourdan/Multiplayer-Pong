const express = require('express');
const cors = require('cors');
const gameLoop = require('node-gameloop')
const actions = require('./socket-actions')
const PORT = 8080;
const app = express();
app.use(cors());
const server = app.listen(PORT, () => {
	console.log('server is running on port 8080')
});
const io = require('socket.io')(server);




// SOCKET EVENTS //
io.on('connection', (socket) => {

	console.log('connected ' + socket.id)
	
	socket.on('join', () => {
		actions.handleNewConnect(socket, activePlayers, gameState, playerQueue)
	});

	socket.on('setName', (data) => {
		actions.setName(socket, data)
	})

	socket.on('disconnecting', () => {
		actions.handleDisconnect(socket, activePlayers, gameState, playerQueue)
	})

	// Listen for new state from both clients
	socket.on('left', (data) => {
		actions.handleLeftInput(socket, data, gameState)
	})

	socket.on('right', (data) => {
		actions.handleRightInput(socket, data, gameState)
	})

	socket.on('ready', () => {
		actions.handlePause(gameState, activePlayers)
	})

});



// GAME STATE AND VARIABLES //
let gameState = {

	ball: {
		x: Math.floor(Math.random() * 10) + 5,
		y: Math.floor(Math.random() * 10) + 5,
		vx: 25 * (Math.random() < 0.5 ? 1 : -1),
		vy: 20 * (Math.random() < 0.5 ? 1 : -1)
	},
	score: {
		left: 0,
		right: 0
	},
	paddle: {
		left: {
			name: null,
			x: 0.5,
			y: 15
		},
		right: {
			name: null,
			x: 0.5,
			y: 15
		}
	},
	isPaused: true,
	readySetGo: 0
}

let updateLeftPlayer = {}
let updateRightPlayer = {}
let activePlayers = []
let playerQueue = []


// GAME METHODS //
resetGame = () => {
	gameState = {

		ball: {
			x: Math.floor(Math.random() * 10) + 5,
			y: Math.floor(Math.random() * 10) + 5,
			vx: 25 * (Math.random() < 0.5 ? 1 : -1),
			vy: 20 * (Math.random() < 0.5 ? 1 : -1)
		},
		score: {
			left: 0,
			right: 0
		},
		paddle: {
			left: {
				name: activePlayers[0].name,
				x: 0.5,
				y: 15
			},
			right: {
				name: activePlayers[1].name,
				x: 0.5,
				y: 15
			}
		},
		isPaused: true,
		readySetGo: 0
	}
	updateLeftPlayer = {}
	updateRightPlayer = {}

	activePlayers[0].emit('reset')
	activePlayers[0].broadcast.emit('reset')
}

announceWinner = () => {
	gameState.isPaused = true
	console.log("announce winner")
	if (gameState.score.left > gameState.score.right) {
		activePlayers[0].emit('gameover', { winner: activePlayers[0].name, loser: activePlayers[1].name })
		activePlayers[0].broadcast.emit('gameover', { winner: activePlayers[0].name, loser: activePlayers[1].name })
		activePlayers[1].disconnect()

	} else if (gameState.score.right > gameState.score.left) {
		activePlayers[1].emit('gameover', { winner: activePlayers[1].name, loser: activePlayers[0].name })
		activePlayers[1].broadcast.emit('gameover', { winner: activePlayers[1].name, loser: activePlayers[0].name })
		activePlayers[0].disconnect()
	}

}

// GAME LOOP
// houses all game logic.
const loop = gameLoop.setGameLoop((delta) => {

	if (gameState.isPaused) {
		return
	}
	// ball velocity
	gameState.ball.x += gameState.ball.vx * delta
	gameState.ball.y += gameState.ball.vy * delta

	// reverse ball velocity on collision with sides.
	if (gameState.ball.x > 57.25 && gameState.ball.vx > 0) {
		gameState.ball.vx *= -1
		gameState.score.left++
		//check for a winner
		if (gameState.score.left > 2) {
			announceWinner()
		}
	}
	if (gameState.ball.x <= 0 && gameState.ball.vx < 0) {
		gameState.ball.vx *= -1
		gameState.score.right++
		//check for a winner
		if (gameState.score.right > 2) {
			announceWinner()
		}
	}
	if (gameState.ball.y > 42.25 && gameState.ball.vy > 0) {
		gameState.ball.vy *= -1
	}
	if (gameState.ball.y <= 0 && gameState.ball.vy < 0) {
		gameState.ball.vy *= -1
	}
	// reverse ball velocity on collision with paddles.
	if (gameState.ball.x > 57.25 - 3.5
		&& gameState.ball.vx > 0
		&& gameState.ball.y < gameState.paddle.right.y + 14
		&& gameState.ball.y >= gameState.paddle.right.y - 1) {
		gameState.ball.vx *= -1
	}
	if (gameState.ball.x <= 0 + 3.5
		&& gameState.ball.vx < 0
		&& gameState.ball.y < gameState.paddle.left.y + 14
		&& gameState.ball.y >= gameState.paddle.left.y - 1) {
		gameState.ball.vx *= -1
	}

	//apply updates to the objects that we will send to the clients.
	updateLeftPlayer.ball = gameState.ball
	updateLeftPlayer.paddle = gameState.paddle.right
	updateLeftPlayer.score = gameState.score

	updateRightPlayer.ball = gameState.ball
	updateRightPlayer.paddle = gameState.paddle.left
	updateRightPlayer.score = gameState.score


	// update both players.

	activePlayers[0].emit('update', updateLeftPlayer)
	activePlayers[1].emit('update', updateRightPlayer)

	//update spectators.
	playerQueue.map(socket => {
		socket.emit('update', gameState)
	})

	//1000/fps
}, 1000 / 40)
	




