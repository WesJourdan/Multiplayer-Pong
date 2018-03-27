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
    x: -10,
    y: -10,
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

    this.state = {
      side: null
    }
  }

  render() {
    const style = {
      width: '100%',
      height: '100%',
      backgroundColor: 'black'
    }

    if (this.state.side === 'left') {
      return (
        <div style={style}>
          < Scoreboard position={'left'} score={gameState.score.left} />
          < Scoreboard position={'right'} score={gameState.score.right} />
          < Paddle position={'left'} paddle={gameState.paddle.left} forceRender={this.forceUpdate.bind(this)} />
          < Opponent position={'right'} paddle={gameState.opponent} />
          < Ball ball={gameState.ball} />      
        </div>
      ); 
    } else if (this.state.side === 'right') {
      return (
        <div style={style}>
          < Scoreboard position={'left'} score={gameState.score.left} />
          < Scoreboard position={'right'} score={gameState.score.right} />
          < Opponent position={'left'} paddle={gameState.opponent} />
          < Paddle position={'right'} paddle={gameState.paddle.right} forceRender={this.forceUpdate.bind(this)} />
          < Ball ball={gameState.ball} />
        </div>
      ); 
    } else {
      return (
        <div style={style}>
          <h1>Waiting for an opponent...</h1>
        </div>
      )
    }
  }

  playerReady (event) {
    console.log(socket)
    if (event.keyCode === 32) {
      socket.emit('ready')
    }
    
  }

  componentWillMount() {
    document.addEventListener("keydown", this.playerReady.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.playerReady.bind(this));;
  } 


  componentDidMount () {

    socket.on('connect', () => {
      socket.emit('join')
      console.log('joining...')
    })

    // Listen for state updates from the server.
    socket.on('update', (data) => {
      console.log('update')
      gameState.opponent.y = data.paddle.y
      gameState.ball = data.ball
      socket.emit('left', gameState.paddle.left.y)
      this.forceUpdate()
    })
    
    socket.on('left', (data) => {
      if (!this.state.side) {
        console.log('You are on the left')
        this.setState(data, () => {
          console.log(this.state.side)
        })
      }
      this.forceUpdate()
    })

    socket.on('right', (data) => {
      if (!this.state.side) {
        console.log('You are on the right')
        this.setState(data, () => {
          console.log(this.state.side)
        })
      }
      this.forceUpdate()
    })



  }
}

export default App;
