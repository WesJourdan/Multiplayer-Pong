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

let updateLeft = {}
updateLeft.ball = gameState.ball
updateLeft.paddle = gameState.paddle.right

let updateRight = {}
updateRight.ball = gameState.ball
updateRight.paddle = gameState.paddle.left

let playerIndex = []
let readySetGo = 0



io.on('connection', (socket) => {
	console.log('connected ' + socket.id)
	
	socket.on('join', () => {
		console.log(socket)
		if (playerIndex.length < 2) {

			console.log('pushing player', socket.id)
			playerIndex.push(socket)
		}

		if (playerIndex.length === 1) {
			
			socket.emit('left', { side: 'left' })
			console.log('emitting left', playerIndex[0])
		} else if (playerIndex.length === 2) {
			
			socket.emit('right', { side: 'right' })
			// socket.to(playerIndex[1]).emit('right', { side: 'right' })
			console.log('emitting right', playerIndex[1])
		}

	});

// Listen for new state from both clients
	socket.on('left', (data) => {
		gameState.paddle.left.y = data
		console.log(gameState.paddle.left.y)
		socket.broadcast.emit('update', {
			paddle: gameState.paddle.left,
			ball: gameState.ball
		})
	})

	socket.on('right', (data) => {
		gameState.paddle.right.y = data
		socket.broadcast.emit('update', {
			paddle: gameState.paddle.right,
			ball: gameState.ball
		})
	})


	socket.on('ready', () => {
		console.log('ready', readySetGo)
		++readySetGo
	})


});

	let shouldUpdate = false

	const loop = gameLoop.setGameLoop((delta) => {

		if (readySetGo !== 2){
			return
		}
		
		// ball velocity
		gameState.ball.x += gameState.ball.vx * delta
		gameState.ball.y += gameState.ball.vy * delta

		// reverse ball velocity on collision with sides.
		if (gameState.ball.x > 77 && gameState.ball.vx > 0) {
			gameState.ball.vx *= -1
			gameState.score.left++
			console.log(gameState.ball.vx * delta)
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
		// socket1.to(playerIndex[1]).emit('update', updateRight);
		if (shouldUpdate) {
			playerIndex[0].emit('update', updateLeft)
			playerIndex[1].emit('update', updateRight)
		}
		shouldUpdate = !shouldUpdate
	}, 1000/24)



