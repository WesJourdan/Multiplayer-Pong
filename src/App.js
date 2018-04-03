import React, { Component } from 'react';
import Paddle from './components/paddle'
import Opponent from './components/opponent'
import Ball from './components/ball'
import Scoreboard from './components/scoreboard'
import Pause from './components/pause'
import Lobby from './components/lobby'
import WaitingList from './components/waitingList'
import Gameover from './components/gameover'
import io from 'socket.io-client';
 var socket = io(`http://localhost:8080`);


class App extends Component {

  constructor(props) {
    super(props);

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
      opponent: {
        name: null,
        x: 0.5,
        y: 15
      },
      side: null,
      isPaused: true,
      name: null,
      waitingList: [],
      winner: null,
      loser: null
    }

    this.setState = this.setState.bind(this)
    this.startSockets = this.startSockets.bind(this)
    this.resetGame = this.resetGame.bind(this)
    this.gameOver = this.gameOver.bind(this)
  }

  render() {

    const style = {
      color: 'lightgreen',
      display: 'flex',
      width: '100%',
      height: '100%',
      margin: 'auto',
      textAlign: 'center',
      fontSize: '2vw',
      backgroundColor: 'black',
      cursor: 'none'
    }

    const gameContainerStyle = {
      color: 'lightgreen',
      width: '80%',
      height: '100%',
      textAlign: 'center',
      fontSize: '2vw',
      backgroundColor: 'black',
      cursor: 'none'
    }
    const pauseStyle = {
      color: 'lightgreen',
      width: '100%',
      height: '100%',
      margin: 'auto',
      textAlign: 'center',
      fontSize: '2vw',
      backgroundColor: 'black',
      opacity: '0.5',
      cursor: 'none'
    }


    if (this.state.winner !== null) {
      return (
        <Gameover winner={this.state.winner} loser={this.state.loser} />
      )
    }

    if (this.state.side === 'left' && !this.state.isPaused) {
      return (
        <div style={style}>
          <div style={gameContainerStyle}>
            < Scoreboard position={'left'} score={this.state.score.left} name={this.state.name}/>
            < Scoreboard position={'right'} score={this.state.score.right} name={this.state.opponent.name} />
            < Paddle position={'left'} paddle={this.state.paddle.left} isPaused={this.state.isPaused} />
            < Opponent position={'right'} paddle={this.state.opponent} />
            < Ball ball={this.state.ball} /> 
          </div> 
          <WaitingList list={this.state.waitingList} />
        </div>
      ); 
    } else if (this.state.side === 'right' && !this.state.isPaused) {
      return (
        <div style={style}>
          <div style={gameContainerStyle}>
            < Scoreboard position={'left'} score={this.state.score.left} name={this.state.opponent.name}/>
            < Scoreboard position={'right'} score={this.state.score.right} name={this.state.name}/>
            < Opponent position={'left'} paddle={this.state.opponent} />
            < Paddle position={'right'} paddle={this.state.paddle.right} isPaused={this.state.isPaused} />
            < Ball ball={this.state.ball} />
          </div>
          <WaitingList list={this.state.waitingList}/>
        </div>
      ); 
    } else if (this.state.side === 'left' && this.state.isPaused) {
      return (
        <div style={pauseStyle}>
          <div style={gameContainerStyle}>
            < Scoreboard position={'left'} score={this.state.score.left} name={this.state.name} />
            < Scoreboard position={'right'} score={this.state.score.right} name={this.state.opponent.name}/>
            < Paddle position={'left'} paddle={this.state.paddle.left} isPaused={this.state.isPaused} />
            < Opponent position={'right'} paddle={this.state.opponent} />
            < Ball ball={this.state.ball} />      
            < Pause opponent={this.state.opponent.name}/>
          </div>
          <WaitingList list={this.state.waitingList}/>
        </div>
      ); 

    } else if (this.state.side === 'right' && this.state.isPaused) {
      return (
        <div style={pauseStyle}>
          <div style={gameContainerStyle}>
            < Scoreboard position={'left'} score={this.state.score.left} name={this.state.opponent.name} />
            < Scoreboard position={'right'} score={this.state.score.right} name={this.state.name} />
            < Opponent position={'left'} paddle={this.state.opponent} />
            < Paddle position={'right'} paddle={this.state.paddle.right} isPaused={this.state.isPaused} />
            < Ball ball={this.state.ball} />
            < Pause opponent={this.state.opponent.name} />
          </div>
          <WaitingList list={this.state.waitingList}/>
        </div>
      );

    } else if (this.state.side === null) {
      return (
        <div style={style}>
          <div style={gameContainerStyle}>
            < Scoreboard position={'left'} score={this.state.score.left} name={this.state.paddle.left.name}/>
            < Scoreboard position={'right'} score={this.state.score.right} name={this.state.paddle.right.name} />
            < Opponent position={'left'} paddle={this.state.paddle.left} />
            < Opponent position={'right'} paddle={this.state.paddle.right} />
            < Ball ball={this.state.ball} />
            < Lobby name={this.state.name} setName={this.setState} socket={socket}/>
          </div>
          <WaitingList list={this.state.waitingList}/>
        </div>
      );
    } else {
      return <div>waiting</div>
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
    this.startSockets()
  }

  gameOver (data) {
    this.setState({
      winner: data.winner,
      loser: data.loser
    })
    setTimeout(this.resetGame, 1500)
  }

  resetGame () {
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
      opponent: {
        name: null,
        x: 0.5,
        y: 15
      },
      isPaused: true,
      winner: null,
      loser: null
    })
  }


  startSockets () {
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
        //spectators recieve all game state from the server.
        this.setState(data)
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

    socket.on('waitingList', (data) => {
      this.setState({
        waitingList: data
      })
    })

    socket.on('opponent', (data) => {
      this.setState({
        opponent: data
      })
    })

    socket.on('gameover', (data) => {
      this.gameOver(data)
    })

    socket.on('reset', () => {
      this.resetGame()
    })
  }
}

export default App;
