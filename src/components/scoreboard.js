import React, { Component } from 'react';

export default class Scoreboard extends Component {
	
	render() {
		const scoreStyle = {
			width: '4vw',
			height: '4vw',
			color: 'lightgreen',
			position: 'absolute',
			top: '3vw',
			textAlign: 'center',
			fontSize: '4vw',
			cursor: 'none'
		}

		const nameStyle = {
			color: 'lightgreen',
			position: 'absolute',
			top: '1vw',
			textAlign: 'center',
			fontSize: '2vw',
			cursor: 'none'
		}

		if (this.props.position == 'left') {
			scoreStyle.left = '4vw'
			nameStyle.left = '4vw'
		} else {
			scoreStyle.right = '4vw'
			nameStyle.right = '4vw'
		}
		
		return (
			<div>
				<div style={nameStyle}>
					{this.props.name}
				</div>
				<div style={scoreStyle}>
					{this.props.score}
				</div>
			</div>
		);
	}
};
