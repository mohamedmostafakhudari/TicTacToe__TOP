import mustache from "https://cdn.jsdelivr.net/npm/mustache@4.2.0/+esm";
const gameboard = (function () {
	let board = new Array(9).fill("");

	const placeMark = function (i, player) {
		if (board[i]) return;
		board[i] = player.mark;
	};
	const getBoard = () => board;
	const resetBoard = () => {
		board = new Array(9).fill("");
	};
	const checkOccupiedCell = (position) => board[position];
	const printBoard = () => {
		for (let i = 0; i < 3; i++) {
			const row = [];
			for (let j = 0; j < 3; j++) {
				row.push(board[i * 3 + j]);
			}
			console.log(row.join(" | "));
		}
	};
	return {
		checkOccupiedCell,
		placeMark,
		getBoard,
		resetBoard,
		printBoard,
	};
})();

const createPlayer = function (name, mark) {
	return {
		name,
		mark,
	};
};

const gameController = (function () {
	let playerXName = prompt("Enter player X name", "John");
	let playerOName = prompt("Enter player O name", "Laura");
	let player1 = createPlayer(playerXName, "x");
	let player2 = createPlayer(playerOName, "o");
	let gameOver = true;
	let round = 1;
	let activePlayer = player1;
	let winner = null;
	let gamesCounter = 0;

	const switchTurn = () => {
		activePlayer = activePlayer.mark === player1.mark ? player2 : player1;
	};
	const startGame = () => {
		gameOver = false;
		gameboard.printBoard();
		screenController.render();
	};
	function playRound(position) {
		if (gameOver || gameboard.checkOccupiedCell(position)) return;
		gameboard.placeMark(position, activePlayer);
		switchTurn();
		incrementRound();

		if (checkWin()) {
			const winner = activePlayer.mark === player1.mark ? player2 : player1;
			setWinner(winner);
			updateScore();
			scoreDialog.showModal();
			gameOver = true;
		} else if (getRound() > 9) {
			updateScore();
			scoreDialog.showModal();
			gameOver = true;
		}
		screenController.render();
		gameboard.printBoard();
	}
	const checkWin = () => {
		const winCombos = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8],
			[0, 4, 8],
			[2, 4, 6],
		];
		for (const combo of winCombos) {
			const board = gameboard.getBoard();
			const [a, b, c] = combo;
			if (board[a] && board[a] === board[b] && board[a] === board[c]) {
				return true;
			}
		}
	};

	const getRound = () => round;
	const getActivePlayer = () => activePlayer;
	const incrementRound = () => round++;
	const setWinner = (player) => {
		winner = player;
	};
	const getWinner = () => winner;
	const updateScore = () => {
		if (winner) {
			if (winner.mark === "x") {
				scoreboard.incrementPlayerX();
			} else if (winner.mark === "o") {
				scoreboard.incrementPlayerO();
			}
		} else {
			scoreboard.incrementPlayerX();
			scoreboard.incrementPlayerO();
		}
	};
	const getPlayers = () => {
		return { player1, player2 };
	};
	const resetGame = () => {
		updatePlayersInfo();
		gamesCounter = 0;
		gameOver = true;
		round = 1;
		activePlayer = player1;
		winner = null;
		gameboard.resetBoard();
		scoreboard.resetScoreBoard();
		screenController.render();
	};
	const playAgain = () => {
		gamesCounter++;
		gameOver = false;
		round = 1;
		activePlayer = gamesCounter % 2 === 0 ? player1 : player2;
		winner = null;
		gameboard.resetBoard();
		screenController.render();
	};
	const updatePlayersInfo = () => {
		if (confirm("New Players?")) {
			playerXName = prompt("Enter player X name", "John");
			playerOName = prompt("Enter player O name", "Laura");
			player1 = createPlayer(playerXName, "x");
			player2 = createPlayer(playerOName, "o");
		}
	};
	return {
		startGame,
		playAgain,
		resetGame,
		getRound,
		playRound,
		getActivePlayer,
		getPlayers,
		getWinner,
	};
})();
const scoreboard = (function () {
	let playerX = 0;
	let playerO = 0;

	const incrementPlayerX = () => {
		playerX++;
		console.log(`playerX: ${playerX}`);
	};
	const incrementPlayerO = () => {
		playerO++;
		console.log(`playerO: ${playerO}`);
	};
	const getScores = () => {
		return {
			playerX,
			playerO,
		};
	};
	const resetScoreBoard = () => {
		playerX = 0;
		playerO = 0;
	};
	return {
		incrementPlayerX,
		incrementPlayerO,
		getScores,
		resetScoreBoard,
	};
})();

const screenController = (function () {
	// templates
	const cellTemplate = `<button id="{{id}}" data-type="cell" class="bg-[#211f1e] block text-white aspect-square uppercase text-8xl grid place-content-center">{{mark}}</button>`;
	const headerTemplate = `
	<p>Round: {{round}}</p>
	<p>Current Player: <span class="uppercase">{{activePlayer}}</span></p>`;
	const scoreTemplate = `
	<div class="text-lg text-slate-600 font-bold">{{playerXName}}<br/> <span class="text-5xl font-bold text-blue-400">{{playerX}}</span></div>
						<div class="text-lg text-slate-600 font-bold">{{playerOName}}<br/> <span class="text-5xl font-bold text-red-400">{{playerO}}</span></div>
	`;
	// cache dom
	const $gameHeader = document.querySelector("#game-header");
	const $board = document.querySelector("#board");
	const $startBtn = document.querySelector("#startBtn");
	const $scoreBoard = document.querySelector("#scoreboard");
	const $againBtn = document.querySelector("#againBtn");
	const $startNewBtn = document.querySelector("#startNewBtn");
	// bind events
	$board.addEventListener("click", (e) => {
		const $cell = e.target.closest("[data-type=cell]");
		if (!$cell) return;
		const position = $cell.getAttribute("id");
		gameController.playRound(position);
	});
	$startBtn.addEventListener("click", (e) => {
		e.target.parentElement.classList.add("hidden");
		gameController.startGame();
	});
	$againBtn.addEventListener("click", (e) => {
		scoreDialog.close();
		gameController.playAgain();
	});
	$startNewBtn.addEventListener("click", (e) => {
		scoreDialog.close();
		$startBtn.parentElement.classList.remove("hidden");
		gameController.resetGame();
	});
	// render
	const render = () => {
		$board.textContent = "";
		$gameHeader.textContent = "";
		$scoreBoard.textContent = "";
		const board = gameboard.getBoard();
		const { getRound, getActivePlayer } = gameController;
		for (let i = 0; i < board.length; i++) {
			$board.insertAdjacentHTML("beforeend", mustache.render(cellTemplate, { mark: board[i], id: i }));
		}
		$gameHeader.insertAdjacentHTML("beforeend", mustache.render(headerTemplate, { round: getRound(), activePlayer: getActivePlayer().mark }));
		const {
			player1: { name: playerXName },
			player2: { name: playerOName },
		} = gameController.getPlayers();
		const { getScores } = scoreboard;
		$scoreBoard.insertAdjacentHTML("beforeend", mustache.render(scoreTemplate, Object.assign({}, getScores(), { playerXName, playerOName })));
	};
	render();

	return {
		render,
	};
})();
