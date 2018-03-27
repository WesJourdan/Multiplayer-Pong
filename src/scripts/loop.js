const Loop = (func) => {
	(function loop(time) {
		func(Math.min((Date.now() - time) / 1000, 1))
		window.requestAnimationFrame(loop.bind(null, Date.now()))
	})(Date.now())

}

module.exports = Loop

// Game loop
// Loop((tick) => {

// 	// ball movement

// 	gameState.ball.x += gameState.ball.vx * tick
// 	gameState.ball.y += gameState.ball.vy * tick
// 	this.forceUpdate()

// 	// reverse ball velocity on collision with sides.
// 	if (gameState.ball.x > 77 && gameState.ball.vx > 0) {
// 		gameState.ball.vx *= -1
// 		gameState.score.left++
// 		console.log(gameState.ball.y)
// 	}
// 	if (gameState.ball.x <= 0 && gameState.ball.vx < 0) {
// 		gameState.ball.vx *= -1
// 		gameState.score.right++
// 		console.log(gameState.score)
// 	}
// 	if (gameState.ball.y > 57 && gameState.ball.vy > 0) {
// 		gameState.ball.vy *= -1
// 	}
// 	if (gameState.ball.y <= 0 && gameState.ball.vy < 0) {
// 		gameState.ball.vy *= -1
// 	}

// 	// reverse ball velocity on collision with paddles.
// 	if (gameState.ball.x > 77 - 3.5
// 		&& gameState.ball.vx > 0
// 		&& gameState.ball.y < gameState.opponent.y + 14
// 		&& gameState.ball.y >= gameState.opponent.y - 1) {
// 		gameState.ball.vx *= -1
// 	}

// 	if (gameState.ball.x <= 0 + 3.5
// 		&& gameState.ball.vx < 0
// 		&& gameState.ball.y < gameState.paddle.left.y + 14
// 		&& gameState.ball.y >= gameState.paddle.left.y - 1) {
// 		gameState.ball.vx *= -1
// 	}



// 	// Opponent movement

// 	// Basic cooridnate matching
// 	// if (gameState.ball.y < 46 && gameState.ball.y > 0) {
// 	//   gameState.paddle.right.y = gameState.ball.y;
// 	// }

// 	// Based on increment movement like a real player
// 	// if (gameState.paddle.right.y != gameState.ball.y
// 	//   && gameState.ball.vx > 0
// 	//   && gameState.ball.y < 46
// 	//   && gameState.ball.y > 0) 
// 	// {
// 	//   if (gameState.ball.y > gameState.paddle.right.y) {
// 	//     gameState.paddle.right.y += 1
// 	//   }

// 	//   if (gameState.ball.y < gameState.paddle.right.y) {
// 	//     gameState.paddle.right.y -= 1
// 	//   }
// 	// }
// });