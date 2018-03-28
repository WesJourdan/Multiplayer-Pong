const express = require('express');
const cors = require('cors');
const gameLoop = require('node-gameloop')
const PORT = 8080;
const app = express();
app.use(cors());

const server = app.listen(PORT, () => {
	console.log('server is running on port 8080')
});
const io = require('socket.io')(server);
let socket1
let socket2

let gameState = {

	ball: {
		x: Math.floor(Math.random() * 10) + 5,
		y: Math.floor(Math.random() * 10) + 5,
		vx: 20 * (Math.random() < 0.5 ? 1 : -1),
		vy: 20 * (Math.random() < 0.5 ? 1 : -1)
	},
	score: {
		left: 0,
		right: 0
	},
	paddle: {
		left: {
			x: 0.5,
			y: 20
		},
		right: {
			x: 0.5,
			y: 20
		}
	}
}

let updateLeftPlayer = {}
let updateRightPlayer = {}
let playerIndex = []
let readySetGo = 0
let isPaused = true



io.on('connection', (socket) => {
	console.log('connected ' + socket.id)
	
	socket.on('join', () => {
		if (playerIndex.length < 2) {
			playerIndex.push(socket)
			// console.log('pushing player', socket.id)
		}

		if (playerIndex.length === 1) {
			socket.emit('leftPlayer', { side: 'left' })
			// console.log('emitting left', playerIndex[0])
		} else if (playerIndex.length === 2) {
			socket.emit('rightPlayer', { side: 'right' })
			// console.log('emitting right', playerIndex[1])
		}

	});

// Listen for new state from both clients
	socket.on('left', (data) => {
		gameState.paddle.left.y = data
	})

	socket.on('right', (data) => {
		gameState.paddle.right.y = data
	})


	// increment ready counter. When it gets to 2 the game starts. When it hits 3 the game pauses
	// and the counter is reset to 0. When it hits 2 the game starts again.
	socket.on('ready', () => {
		console.log('ready', readySetGo)
		if (readySetGo > 2) {
			readySetGo = 0
		}
		++readySetGo

		if (readySetGo !== 2) {
			playerIndex[0].emit('pause')
			playerIndex[1].emit('pause')
			console.log('paused')
			isPaused = true
		} else {
			playerIndex[0].emit('play')
			playerIndex[1].emit('play')
			console.log('play')
			//TODO put a set timeout here for when the game is unpaused to display a countdown to the players. 
			isPaused = false
		}
	})

});

	

	const loop = gameLoop.setGameLoop((delta) => {

		if (isPaused){
			//pause the game
			return
		}
		
		// ball velocity
		gameState.ball.x += gameState.ball.vx * delta
		gameState.ball.y += gameState.ball.vy * delta

		// reverse ball velocity on collision with sides.
		if (gameState.ball.x > 77 && gameState.ball.vx > 0) {
			gameState.ball.vx *= -1
			gameState.score.left++
		}
		if (gameState.ball.x <= 0 && gameState.ball.vx < 0) {
			gameState.ball.vx *= -1
			gameState.score.right++

		}
		if (gameState.ball.y > 57 && gameState.ball.vy > 0) {
			gameState.ball.vy *= -1
		}
		if (gameState.ball.y <= 0 && gameState.ball.vy < 0) {
			gameState.ball.vy *= -1
		}

		// reverse ball velocity on collision with paddles.
		if (gameState.ball.x > 77 - 3.5
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


		//set updates to their objects.
		updateLeftPlayer.ball = gameState.ball
		updateLeftPlayer.paddle = gameState.paddle.right
		updateLeftPlayer.score = gameState.score

		updateRightPlayer.ball = gameState.ball
		updateRightPlayer.paddle = gameState.paddle.left
		updateRightPlayer.score = gameState.score
		
		//update both players.
		playerIndex[0].emit('update', updateLeftPlayer)
		playerIndex[1].emit('update', updateRightPlayer)
	
		// 1000/fps
	}, 1000/60)



