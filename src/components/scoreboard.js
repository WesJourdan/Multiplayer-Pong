import React, { Component } from 'react';


export default class Scoreboard extends Component {
	
	render() {
		const style = {
			width: '4vw',
			height: '4vw',
			color: 'lightgreen',
			position: 'absolute',
			top: '2vw',
			textAlign: 'center',
			fontSize: '4vw'
		}

		if (this.props.position == 'left') {
			style.left = '4vw'
		} else {
			style.right = '4vw'
		}
		

		return (
			<div style={style}>
				{this.props.score}
			</div>
		);
	}

};
