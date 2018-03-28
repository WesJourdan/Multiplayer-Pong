import React, { Component } from 'react';
import Paddle from './components/paddle'
import Opponent from './components/opponent'
import Ball from './components/ball'
import Scoreboard from './components/scoreboard'
import Pause from './components/pause'
import Lobby from './components/lobby'
import io from 'socket.io-client';
const socket = io('http://localhost:8080');
// const socket = io('http://wes1.localhost.run')


class App extends Component {

  constructor() {
    super();

    this.state = {
      ball: {
        x: -10,
        y: -10,
        vx: 0,
        vy: 0
      },
      score: {
        left: 0,
        right: 0
      },
      paddle: {
        left: {
          name: '',
          x: 0.5,
          y: 15
        },
        right: {
          name: '',
          x: 0.5,
          y: 15
        }
      },
      opponent: {
        name: '',
        x: 0.5,
        y: 15
      },
      side: null,
      isPaused: true,
      name: null
    }

    this.setState = this.setState.bind(this)
  }

  render() {

    const style = {
      color: 'lightgreen',
      position: 'absolute',
      width: '100%',
      height: '100%',
      margin: 'auto',
      textAlign: 'center',
      fontSize: '2vw',
      backgroundColor: 'black',
    }
    const pauseStyle = {
      color: 'lightgreen',
      position: 'absolute',
      width: '100%',
      height: '100%',
      margin: 'auto',
      textAlign: 'center',
      fontSize: '2vw',
      backgroundColor: 'black',
      opacity: '0.5'
    }

    if (this.state.side === 'left' && !this.state.isPaused) {
      return (
        <div style={style}>
          < Scoreboard position={'left'} score={this.state.score.left} name={this.state.name}/>
          < Scoreboard position={'right'} score={this.state.score.right} name={this.state.opponent.name} />
          < Paddle position={'left'} paddle={this.state.paddle.left} isPaused={this.state.isPaused} />
          < Opponent position={'right'} paddle={this.state.opponent} />
          < Ball ball={this.state.ball} />      
        </div>
      ); 
    } else if (this.state.side === 'right' && !this.state.isPaused) {
      return (
        <div style={style}>
          < Scoreboard position={'left'} score={this.state.score.left} name={this.state.opponent.name}/>
          < Scoreboard position={'right'} score={this.state.score.right} name={this.state.name}/>
          < Opponent position={'left'} paddle={this.state.opponent} />
          < Paddle position={'right'} paddle={this.state.paddle.right} isPaused={this.state.isPaused} />
          < Ball ball={this.state.ball} />
        </div>
      ); 
    } else if (this.state.side === 'left' && this.state.isPaused) {
      return (
        <div style={pauseStyle}>
          < Scoreboard position={'left'} score={this.state.score.left} name={this.state.name} />
          < Scoreboard position={'right'} score={this.state.score.right} name={this.state.opponent.name}/>
          < Paddle position={'left'} paddle={this.state.paddle.left} isPaused={this.state.isPaused} />
          < Opponent position={'right'} paddle={this.state.opponent} />
          < Ball ball={this.state.ball} />      
          < Pause />
        </div>
      ); 

    } else if (this.state.side === 'right' && this.state.isPaused) {
      return (
        <div style={pauseStyle}>
          < Scoreboard position={'left'} score={this.state.score.left} name={this.state.opponent.name} />
          < Scoreboard position={'right'} score={this.state.score.right} name={this.state.name} />
          < Opponent position={'left'} paddle={this.state.opponent} />
          < Paddle position={'right'} paddle={this.state.paddle.right} isPaused={this.state.isPaused} />
          < Ball ball={this.state.ball} />
          < Pause />
        </div>
      );

    } else if (this.state.side === null) {
      return (
        <div style={style}>
          < Scoreboard position={'left'} score={this.state.score.left} name={this.state.paddle.left.name}/>
          < Scoreboard position={'right'} score={this.state.score.right} name={this.state.paddle.right.name} />
          < Opponent position={'left'} paddle={this.state.paddle.left} />
          < Opponent position={'right'} paddle={this.state.paddle.right} />
          < Ball ball={this.state.ball} />
          < Lobby name={this.state.name} setName={this.setState} socket={socket}/>
        </div>
      )
    }
  }

  playerReady (event) {

    if (event.keyCode === 32 && this.state.side != null) {
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
    // socket.on('connect', () => {
    //   socket.emit('join')
    //   console.log('joining...')
    // })

    // Listen for the server to assign which side the client will control.
    socket.on('leftPlayer', (data) => {
      if (!this.state.side) {
        console.log('You are on the left')
        this.setState(data)
      }
    })

    socket.on('rightPlayer', (data) => {
      if (!this.state.side) {
        console.log('You are on the right')
        this.setState(data)
      }
    })

    // Listen for state updates from the server.
    socket.on('update', (data) => {
      if (this.state.side != null) {
        this.setState({
          opponent: data.paddle,
          ball: data.ball,
          score: data.score
        })
      } else if (this.state.side === null) {
        this.setState(data)
        console.log(data)
      }
      // on each update from the server, send client's current position.
      if (this.state.side === 'left') {
        socket.emit('left', this.state.paddle.left.y)
      } else if (this.state.side === 'right') {
        socket.emit('right', this.state.paddle.right.y)
      } 
    })

    socket.on('pause', () => {
      this.setState({
        isPaused: true
      })
    })

    socket.on('play', () => {
      this.setState({
        isPaused: false
      })
    })

    socket.on('reset', () => {
      this.setState({
        ball: {
          x: -10,
          y: -10,
          vx: 0,
          vy: 0
        },
        score: {
          left: 0,
          right: 0
        },
        paddle: {
          left: {
            name: '',
            x: 0.5,
            y: 15
          },
          right: {
            name: '',
            x: 0.5,
            y: 15
          }
        },
        opponent: {
          x: 0.5,
          y: 15
        },
        isPaused: true
      })
    })
  }
}

export default App;
