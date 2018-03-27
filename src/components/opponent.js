import React, { Component } from 'react';
import ReactDOM from 'react-dom';
export default class Paddle extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		const style = {
			width: '3vw',
			height: '14vw',
			position: 'absolute',
			backgroundColor: 'white',
			top: `${this.props.paddle.y}vw`,
			right:`${this.props.paddle.x}vw`,
			borderRadius: `5px 30px 30px 5px`
		}

		return (
			<div style={style}>
			</div>
		);
	};

	movePaddle(event) {
		// arrow down
		if (event.keyCode === 40) {
			if (this.props.paddle.y < 46) {
				this.props.paddle.y += 1
			}
		}
		// arrow up
		if (event.keyCode === 38) {
			if (this.props.paddle.y > 0) {
				this.props.paddle.y -= 1
			}
		}
	};

};
