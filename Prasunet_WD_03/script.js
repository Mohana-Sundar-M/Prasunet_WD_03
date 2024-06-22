const cells = document.querySelectorAll('.cell');
const resultDiv = document.querySelector('.result');
const resetButton = document.getElementById('resetButton');
const backButton = document.getElementById('backButton');
const pvpButton = document.getElementById('pvpButton');
const pvaiButton = document.getElementById('pvaiButton');
const boardContainer = document.querySelector('.board-container');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const player1Display = document.getElementById('player1');
const player2Display = document.getElementById('player2');
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeModal = document.getElementById('closeModal');
const modalCloseButton = document.getElementById('modalCloseButton');
const emojiRain = document.getElementById('emojiRain');
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = false;
let gameMode = 'PvP';
let player1Name = 'Player 1';
let player2Name = 'Player 2';

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellClick = (e) => {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    updateCell(clickedCell, clickedCellIndex);
    checkForWin();
    if (gameActive && gameMode === 'PvAI' && currentPlayer === 'O') {
        setTimeout(handleAI, 500);
    }
};

const updateCell = (cell, index) => {
    board[index] = currentPlayer;
    cell.innerHTML = currentPlayer;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.innerHTML = `Current Player: ${currentPlayer === 'X' ? player1Name : player2Name}`;
};

const checkForWin = () => {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        if (currentPlayer === 'X' && gameMode === 'PvAI') {
            showModal('Better luck next time!', '😔');
        } else {
            showModal(`Congratulations! ${currentPlayer === 'X' ? player2Name : player1Name} Wins!`, '🎉');
        }
        return;
    }

    if (!board.includes('')) {
        gameActive = false;
        showModal('Draw!', '😕');
        return;
    }
};

const handleAI = () => {
    const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < emptyCells.length; i++) {
        board[emptyCells[i]] = 'O';
        let score = minimax(board, 0, false, -Infinity, Infinity);
        board[emptyCells[i]] = '';
        if (score > bestScore) {
            bestScore = score;
            bestMove = emptyCells[i];
        }
    }

    const cell = document.querySelector(`.cell[data-index='${bestMove}']`);
    updateCell(cell, bestMove);
    checkForWin();
};

const minimax = (newBoard, depth, isMaximizing) => {
    const scores = {
        'O': 10,
        'X': -10,
        'draw': 0
    };

    let result = checkWinner();
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = 'O';
                let score = minimax(newBoard, depth + 1, false);
                newBoard[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = 'X';
                let score = minimax(newBoard, depth + 1, true);
                newBoard[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

const checkWinner = () => {
    let winner = null;

    winningConditions.forEach(condition => {
        const [a, b, c] = condition;
        if (board[a] === board[b] && board[b] === board[c] && board[a] !== '') {
            winner = board[a];
        }
    });

    if (winner === null && !board.includes('')) {
        return 'draw';
    }

    return winner;
};

const resetGame = () => {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = 'X';
    resultDiv.innerHTML = '';
    cells.forEach(cell => cell.innerHTML = '');
    currentPlayerDisplay.innerHTML = `Current Player: ${currentPlayer === 'X' ? player1Name : player2Name}`;
};

const showModal = (message, emoji) => {
    modalMessage.innerHTML = `${message} ${emoji}`;
    modal.style.display = 'block';
    if (message.includes('Congratulations')) {
        startEmojiRain(['🎉', '🏆', '👏', '🥳']);
    } else if (message.includes('Better luck next time')) {
        startEmojiRain(['😔', '😕']);
    }
};

const hideModal = () => {
    modal.style.display = 'none';
    stopEmojiRain();
};

const startEmojiRain = (emojis) => {
    emojiRain.innerHTML = '';
    for (let i = 0; i < 100; i++) {
        const emoji = document.createElement('div');
        emoji.classList.add('emoji');
        emoji.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.animationDelay = Math.random() * 2 + 's';
        emojiRain.appendChild(emoji);
    }
};

const stopEmojiRain = () => {
    emojiRain.innerHTML = '';
    resetGame()
};

const startGame = (mode) => {
    gameMode = mode;
    player1Name = getRandomName();
    player2Name = mode === 'PvAI' ? 'AI' : getRandomName();
    player1Display.innerHTML = `${player1Name} (X)`;
    player2Display.innerHTML = `${player2Name} (O)`;
    boardContainer.style.display = 'flex';
    document.querySelector('.mode-selection').style.display = 'none';
    boardContainer.style.opacity = '1';
    resetGame();
};

const goBack = () => {
    boardContainer.style.display = 'none';
    document.querySelector('.mode-selection').style.display = 'flex';
    resetGame();
};

const getRandomName = () => {
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Chris', 'Pat', 'Drew', 'Sam', 'Casey', 'Skyler'];
    return names[Math.floor(Math.random() * names.length)];
};

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);
pvpButton.addEventListener('click', () => startGame('PvP'));
pvaiButton.addEventListener('click', () => startGame('PvAI'));
backButton.addEventListener('click', goBack);
closeModal.addEventListener('click', hideModal);
modalCloseButton.addEventListener('click', hideModal);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        hideModal();
    }
});
