import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Paddle from './components/paddle'
import Opponent from './components/opponent'
import Ball from './components/ball'
import Scoreboard from './components/scoreboard'
import io from 'socket.io-client';
const Loop = require('./scripts/loop');
const socket = io('http://localhost:8080');

let gameState = {
  gameHost: false,
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
      y: 0
    }
  },
  opponent: {
    x: 0.5,
    y: 20
  }
  
}


class App extends Component {

  constructor(props) {
    super(props);

  }

  render() {
    const style = {
      width: '100%',
      height: '100%',
      backgroundColor: 'black'
    }

    return (
      <div style={style}>
        < Scoreboard position={'left'} score={gameState.score.left} />
        < Scoreboard position={'right'} score={gameState.score.right} />
        < Paddle position={'left'} paddle={gameState.paddle.left} />
        < Opponent position={'right'} paddle={gameState.opponent} />
        < Ball ball={gameState.ball} />      
      </div>
    ); 
  }

  componentDidMount () {

    // Listen for state updates from the server.
    socket.on('newState', (data) => {
      console.log("new state")
      if (gameState.gameHost) {
        gameState.opponent.y = data.paddle.y
      } else {
        gameState.ball = data.ball
        gameState.opponent.y = data.paddle.y
      }
    })
    socket.on('gameHost'), () => {
      gameState.gameHost = true
      console.log('You are the host')
    }

    let updatedState
    // Game loop
    Loop((tick) => {
      
      if (gameState.gameHost) {
        updatedState = {
          ball: gameState.ball,
          paddle: gameState.paddle.left
        }
      } else {
        updatedState = {
          paddle: gameState.paddle.left
        }
      }

      if (updatedState) {
        socket.emit('update', updatedState )
      }
      
      // ball movement
      if (gameState.gameHost) {

        gameState.ball.x += gameState.ball.vx * tick
        gameState.ball.y += gameState.ball.vy * tick
        this.forceUpdate()
      
        // reverse ball velocity on collision with sides.
        if (gameState.ball.x > 77 && gameState.ball.vx > 0) {
          gameState.ball.vx *= -1
          gameState.score.left++
          console.log(gameState.ball.y)
        }
        if (gameState.ball.x <= 0 && gameState.ball.vx < 0) {
          gameState.ball.vx *= -1
          gameState.score.right++
          console.log(gameState.score)
        }
        if (gameState.ball.y > 57 && gameState.ball.vy > 0) {
          gameState.ball.vy *= -1
        }
        if (gameState.ball.y <= 0 && gameState.ball.vy < 0) {
          gameState.ball.vy *= -1
        }

        // reverse ball velocity on collision with paddles.
        if (gameState.ball.x > 77  - 3.5
          && gameState.ball.vx > 0
          && gameState.ball.y < gameState.opponent.y + 14
          && gameState.ball.y >= gameState.opponent.y - 1) 
        {
          gameState.ball.vx *= -1
        }

        if (gameState.ball.x <= 0 + 3.5
          && gameState.ball.vx < 0
          && gameState.ball.y < gameState.paddle.left.y + 14
          && gameState.ball.y >= gameState.paddle.left.y -  1) 
        {
          gameState.ball.vx *= -1
        }
      }


      // Opponent movement

      // Basic cooridnate matching
      // if (gameState.ball.y < 46 && gameState.ball.y > 0) {
      //   gameState.paddle.right.y = gameState.ball.y;
      // }

      // Based on increment movement like a real player
      // if (gameState.paddle.right.y != gameState.ball.y
      //   && gameState.ball.vx > 0
      //   && gameState.ball.y < 46
      //   && gameState.ball.y > 0) 
      // {
      //   if (gameState.ball.y > gameState.paddle.right.y) {
      //     gameState.paddle.right.y += 1
      //   }

      //   if (gameState.ball.y < gameState.paddle.right.y) {
      //     gameState.paddle.right.y -= 1
      //   }
      // }
    });

  }
}

export default App;
