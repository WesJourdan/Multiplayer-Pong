import React, { Component } from 'react';
import ReactDOM from 'react-dom';
export default class Opponent extends Component {
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

		}

		if (this.props.position === 'left') {
			style.left = `${this.props.paddle.x}vw`;
			style.borderRadius = `30px 5px 5px 30px`
		} else {
			style.right = `${this.props.paddle.x}vw`;
			style.borderRadius = `5px 30px 30px 5px`
		}
		return (
			<div style={style}>
			</div>
		);
	};
};
