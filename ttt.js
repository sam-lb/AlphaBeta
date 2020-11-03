

class Board {
	
	constructor() {
		this.tileStartX = width * 0.25;
		this.tileStartY = height * 0.25;
		
		this.tileWidth = width / 6;
		this.tileHeight = height / 6;
		// ^^^ 0: nothing, 1: x, 2: o
		
		this.xColor = color(255, 0, 0);
		this.oColor = color(0, 0, 255);
		
		this.winningGameStates = [
			[0, 1, 2], [3, 4, 5],
			[6, 7, 8], [0, 3, 6],
			[1, 4, 7], [2, 5, 8],
			[0, 4, 8], [2, 4, 6],
		];
		this.reset();
	}
	
	reset() {
		this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		this.turn = 1;
	}
	
	generateChildren(boardState, player) {
		const childStates = [];
		for (let i=0; i<boardState.length; i++) {
			if (boardState[i] === 0) {
				let child = boardState.slice();
				child[i] = player;
				childStates.push(child);
			}
		}
		return childStates;
	}
	
	chooseMove(boardState) {
		let bestVal = -Infinity, bestMove = null, currentVal;
		for (let childState of this.generateChildren(boardState, 2)) {
			currentVal = this.minimax(childState, this.getDepth(childState), -Infinity, Infinity, false);
			if (currentVal > bestVal) {
				bestVal = currentVal;
				bestMove = childState;
			}
		}
		this.board = bestMove;
	}
	
	minimax(boardState, depth, alpha, beta, maximizing) {
		if (this.checkWinner(boardState) !== null) { return this.staticEval(boardState); }
		
		if (maximizing) {
			let value = -Infinity, childState;
			for (childState of this.generateChildren(boardState, 2)) {
				value = max(value, this.minimax(childState, depth-1, alpha, beta, false));
				alpha = max(alpha, value);
				if (alpha >= beta) break;
			}
			return value;
		} else {
			let value = Infinity, childState;
			for (childState of this.generateChildren(boardState, 1)) {
				value = min(value, this.minimax(childState, depth-1, alpha, beta, true));
				beta = min(beta, value);
				if (beta <= alpha) break;
			}
			return value;
		}
	}
	
	staticEval(boardState) {
		const winner = this.checkWinner(boardState);
		const depth = this.getDepth(boardState);
		let value;
		
		if (winner === 1) {
			value = -10; // lose
		} else if (winner === 2) {
			value = 10 + depth; // win
		} else if (winner === 3) {
			value = 0; // tie
		}
		return value;
	}
	
	getDepth(boardState=null) {
		if (boardState === null) boardState = this.board;
		let count = 0;
		for (let i=0; i<boardState.length; i++) {
			if (boardState[i] === 0) count++;
		}
		return count;
	}
	
	checkWinner(boardState=null) {
		if (boardState === null) boardState = this.board;
		for (let state of this.winningGameStates) {
			if (state.every((e)=>boardState[e]===1)) return 1;
			if (state.every((e)=>boardState[e]===2)) return 2;
		}
		if (boardState.every((e)=>e!==0)) return 3;
		return null;
	}
	
	endGame(winner) {
		if (winner === null) return;
		this.turn = 3;
	}
	
	handleClick(x, y) {
		if (this.tileStartX <= x && x <= this.tileStartX + 3 * this.tileWidth && this.tileStartY <= y && y <= this.tileStartY + 3 * this.tileHeight) {
			x -= this.tileStartX;
			y -= this.tileStartY;
			const index = floor(x / this.tileWidth) + 3 * floor(y / this.tileHeight);
			
			if (this.board[index] === 0 && this.turn == 1) {
				this.board[index] = 1;
				this.turn = 2;
				this.endGame(this.checkWinner());
			}
		}
	}
	
	print(boardState=null) {
		if (boardState === null) boardState = this.board;
		let string = "";
		for (let i=0; i<boardState.length; i++) {
			if (boardState[i] === 0) {
				string += "  ";
			} else if (boardState[i] === 1) {
				string += "X ";
			} else {
				string += "O ";
			}
			if ((i+1)%3===0) string += "\n";
		}
		console.log(string);
	}
	
	draw() {
		push();
		strokeWeight(5);
		fill(255);
		
		let x, y;
		for (let i=0; i<this.board.length; i++) {
			x = this.tileStartX + (i % 3) * this.tileWidth;
			y = this.tileStartY + floor(i / 3) * this.tileHeight;
			
			stroke(0);
			rect(x, y, this.tileWidth, this.tileHeight);
			
			if (this.board[i] === 1) {
				stroke(this.xColor);
				line(x + 5, y + 5, x + this.tileWidth - 5, y + this.tileHeight - 5);
				line(x + this.tileWidth - 5, y + 5, x + 5, y + this.tileHeight - 5);
			} else if (this.board[i] === 2) {
				stroke(this.oColor);
				ellipse(x + this.tileWidth / 2, y + this.tileHeight / 2, this.tileWidth-10, this.tileHeight-10);
			}
		}
		pop();
	}
	
	update() {
		this.draw();
		if (this.turn === 1) {
			text("X's turn", 200, 105);
		} else if (this.turn === 2) {
			text("O's turn", 200, 105);
			this.chooseMove(this.board);
			this.turn = 1;
			this.endGame(this.checkWinner());
		} else if (this.turn === 3) {
			text({1: "X won", 2: "O won", 3: "Tie.",}[this.checkWinner()], 200, 105);
		}
	}
	
}


class Button {
	
	constructor(text, cx, cy, callback) {
		textSize(32);
		
		this.text = text;
		this.x = cx - textWidth(this.text) / 2;
		this.y = cy - textSize() / 2;
		this.callback = callback;
		
		this.w = textWidth(this.text);
		this.h = textSize();
		
		this.textColor = color(0, 0, 0);
		this.backgroundColor = color(255, 255, 255)
		this.borderColor = color(0, 0, 0);
		this.hoverBackgroundColor = color(255, 200, 200);
		this.borderRadius = 10;
	}
	
	isHovered() {
		return (this.x <= mouseX && mouseX <= this.x + this.w && this.y <= mouseY && mouseY <= this.y + this.h);
	}
	
	handleClick() {
		if (this.isHovered()) this.callback();
	}
	
	draw() {
		push();
		if (this.isHovered()) {
			fill(this.hoverBackgroundColor);
		} else {
			fill(this.backgroundColor);
		}
		stroke(this.borderColor);
		rect(this.x, this.y, this.w, this.h);
		fill(this.textColor);
		stroke(this.textColor);
		text(this.text, this.x, this.y+this.h-4);
		pop();
	}
	
}



function mousePressed() {
	board.handleClick(mouseX, mouseY);
	for (let button of buttons) {
		button.handleClick();
	}
}


let board, buttons;
function setup() {
	const canvas = createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
	canvas.parent("canvas-div");
	
	board = new Board();
	buttons = [new Button("Restart", 100, 100, ()=>{return board.reset();})];
}

function draw() {
	background(255);
	board.update();
	for (let button of buttons) {
		button.draw();
	}
}