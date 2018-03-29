import React, { Component } from 'react';

export default class Paddle extends Component {
	constructor (props) {
		super(props)
		this.movePaddle = this.movePaddle.bind(this);
	}


	componentWillMount() {
		document.addEventListener("keydown", this.movePaddle.bind(this));
		document.addEventListener("keyup", this.movePaddle.bind(this));
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.movePaddle.bind(this));
		document.addEventListener("keyup", this.movePaddle.bind(this));
	} 

	render() {
		const style = {
			width: '3vw',
			height: '14vw',
			position: 'absolute',
			backgroundColor: 'white',
			top: `${this.props.paddle.y}vw`,
			cursor: 'none'	
		}

		if (this.props.position === 'left') {
			style.left = `${this.props.paddle.x}vw`;
			style.borderRadius = `30px 5px 5px 30px`
			style.borderLeft = '1vw solid lightgreen'
		} else {
			style.right = `${this.props.paddle.x + 15}vw`;
			style.borderRadius = `5px 30px 30px 5px`
			style.borderRight = '1vw solid lightgreen'
		}

		return (
		
			<div style={style}>
				
			</div>
		);
	};

	movePaddle (event) {

		if (!this.props.isPaused) {
			// arrow down
			if (event.keyCode === 40) {
				if (this.props.paddle.y < 30.5) {
					this.props.paddle.y += 2
				}
			}
			// arrow up
			if (event.keyCode === 38) {
				if (this.props.paddle.y > 1) {
					this.props.paddle.y -= 2
				}
			}
		}
	};

};
