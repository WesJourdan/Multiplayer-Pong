import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Paddle from './components/paddle'
import Ball from './components/ball'
import Scoreboard from './components/scoreboard'
const Loop = require('./scripts/loop');

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
      y: 46
    },
    right: {
      x: 0.5,
      y: 0
    }
  }
  
}


class App extends Component {

  constructor(props) {
    super(props);

    // this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  // handleKeyPress (event) {
  //   console.log('key pressed')
  //   console.log(event)

  // }

  // componentWillMount () {
  //   document.addEventListener("keydown", this.handleKeyPress.bind(this));
  // }

  // componentWillUnmount() {
  //   document.removeEventListener("keydown", this.handleKeyPress.bind(this));
  // } 

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
        {/* < Paddle position={'right'} paddle={gameState.paddle.right} /> */}
        < Ball ball={gameState.ball} />      
      </div>
    ); 
  }

  componentDidMount () {


    //Game loop
    Loop((tick) => {
      gameState.ball.x += gameState.ball.vx * tick
      gameState.ball.y += gameState.ball.vy * tick
      this.forceUpdate()
      
      // reverse velocity on collision with sides.
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

      //collision for paddles
      if (gameState.ball.x > 76.5 - 3.5
        && gameState.ball.vx > 0
        && gameState.ball.y < gameState.paddle.right.y + 12
        && gameState.ball.y >= gameState.paddle.right.y - 1
      ) {
        gameState.ball.vx *= -1
      }
      if (gameState.ball.x <= 0 + 3.5
        && gameState.ball.vx < 0
        && gameState.ball.y < gameState.paddle.left.y + 12
        && gameState.ball.y >= gameState.paddle.left.y -  1
      ) {
        gameState.ball.vx *= -1
      }
    });

  }
}

export default App;
