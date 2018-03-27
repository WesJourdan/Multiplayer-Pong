import React, { Component } from 'react';


export default class Ball extends Component {

	render() {
		
		const style = {
			width: '3vw',
			height: '3vw',
			position: 'absolute',
			backgroundColor: 'white',
			top: `${this.props.ball.y}vw`,
			left: `${this.props.ball.x}vw`,
			overflow: 'hidden',
			borderRadius: '50px'
		};

		return (
			<div style={style}>
			</div>
		);
	};

};
