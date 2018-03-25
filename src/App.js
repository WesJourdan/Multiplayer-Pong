import React, { Component } from 'react';
import PlayerPaddle from './bodies/paddle'
import Ball from './bodies/ball'
const Loop = require('./scripts/loop');

let ballState = {
  x: 1,
  y: 5,
  vx: 10,
  vy: 10
}


class App extends Component {

  constructor(props) {
    super(props);

  }

  render() {
    const style = {
      width: '25em',
      height: '18em',
      backgroundColor: 'black'
    }

    return (
      <div style={style}>
        < PlayerPaddle />
        < Ball ball={ballState} />
      </div>
    );
  }

  componentDidMount () {
    
    Loop((tick) => {
      ballState.x += ballState.vx * tick
      ballState.y += ballState.vy * tick
      this.forceUpdate()

      // reverse velocity on collision with sides.
      if (ballState.x > 23.9 || ballState.x < 0.1 ) {
        ballState.vx *= -1
      }
      if (ballState.y > 16.9 || ballState.y < 0.1) {
        ballState.vy *= -1
      }

    });
  }
}

export default App;
