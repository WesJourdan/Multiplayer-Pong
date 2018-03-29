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
	}
}

resetGame = () => {
	readySetGo = 0
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
				name: playerIndex[0].name,
				x: 0.5,
				y: 15
			},
			right: {
				name: playerIndex[1].name,
				x: 0.5,
				y: 15
			}
		}
	}
}

let updateLeftPlayer = {}
let updateRightPlayer = {}
let playerIndex = []
let playerQueue = []
let readySetGo = 0
let isPaused = true

io.on('connection', (socket) => {

	console.log('connected ' + socket.id)
	
	//When a new player joins...
	socket.on('join', () => {
		// If we have less than 2 players, add the player to the game.
		if (playerIndex.length < 2) {
			playerIndex.push(socket)
			// Assign sides to each player.
			if (playerIndex.length === 1) {
				gameState.paddle.left.name = socket.name
				socket.emit('leftPlayer', { side: 'left' })
			} else if (playerIndex.length === 2) {
				gameState.paddle.right.name = socket.name
				socket.emit('rightPlayer', { side: 'right' })
				playerIndex[0].emit('opponent', gameState.paddle.right)
				playerIndex[1].emit('opponent', gameState.paddle.left)
			}
		} else {
		// Otherwise, we already have 2 players, so we add the player to the queue.
			playerQueue.push(socket)
		}
		// update the waiting list.
		let waitingList = [];
		playerQueue.map( player => {
			waitingList.push(player.name)
		})
		//send the waiting list to the new socket.
		socket.emit('waitingList', waitingList)
		//send the waiting list to everyone else.
		socket.broadcast.emit('waitingList', waitingList)
	});

	socket.on('setName', (data) => {
		socket.name = data
	})

	socket.on('disconnecting', () => {
		let index = playerIndex.indexOf(socket)
		//If the user disconnecting is currently playing...
		if (index != -1) {
			// reset clients' UIs
			socket.broadcast.emit('reset')
			isPaused = true
		
			//If another player is waiting, add them to the game.
			if (playerQueue.length > 0) {
				playerIndex[index] = playerQueue.shift()
				resetGame()
				//assign them to the vacant side.
				if (index === 0) {
					playerIndex[index].emit('leftPlayer', { side: 'left' })
					gameState.paddle.left.name = playerIndex[index].name
					//send both players their opponent information.
					playerIndex[0].emit('opponent', gameState.paddle.right)
					playerIndex[1].emit('opponent', gameState.paddle.left)
				} else if (index === 1) {
					playerIndex[index].emit('rightPlayer', { side: 'right' })
					gameState.paddle.right.name = playerIndex[index].name
					//send both players their opponent information.
					playerIndex[0].emit('opponent', gameState.paddle.right)
					playerIndex[1].emit('opponent', gameState.paddle.left)
				}	
			}
			//If the user disconnecting is not currently playing...
		} else if (playerQueue.indexOf(socket) != -1) {
			//remove them from the queue.
			let index = playerQueue.indexOf(socket)
			playerQueue.splice(index, 1)
		}

	})

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

		if (readySetGo > 2) {
			readySetGo = 0
		}
		++readySetGo

		if (readySetGo !== 2) {
			playerIndex[0].emit('pause')
			playerIndex[1].emit('pause')
			isPaused = true
		} else {
			playerIndex[0].emit('play')
			playerIndex[1].emit('play')
			//TODO put a set timeout here. When the game is unpaused display a countdown to the players. 
			isPaused = false
		}
	})
});

	
// Game loop houses all game logic.
const loop = gameLoop.setGameLoop((delta) => {

	if (isPaused) {
		return
	}	
	// ball velocity
	gameState.ball.x += gameState.ball.vx * delta
	gameState.ball.y += gameState.ball.vy * delta

	// reverse ball velocity on collision with sides.
	if (gameState.ball.x > 57.25 && gameState.ball.vx > 0) {
		gameState.ball.vx *= -1
		gameState.score.left++
	}
	if (gameState.ball.x <= 0 && gameState.ball.vx < 0) {
		gameState.ball.vx *= -1
		gameState.score.right++
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
// the if statement ensures that updates aren't sent when
// the game is paused above in the loop.
	playerIndex[0].emit('update', updateLeftPlayer)
	playerIndex[1].emit('update', updateRightPlayer)

	//update spectators.
	playerQueue.map(socket => {
		socket.emit('update', gameState)
	})
	
	//1000/fps
}, 1000/40)



