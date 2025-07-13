const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const playerScoreElem = document.getElementById('player-score');
const aiScoreElem = document.getElementById('ai-score');
const startBtn = document.getElementById('start-btn');
const endBtn = document.getElementById('end-btn');

// Game constants
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 15;
const PLAYER_X = 25;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 7;
const AI_SPEED = 5;
const BALL_SPEED = 6;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;

let ballX = (canvas.width - BALL_SIZE) / 2;
let ballY = (canvas.height - BALL_SIZE) / 2;
let ballVelX = 0;
let ballVelY = 0;

let playerScore = 0;
let aiScore = 0;

let animationId = null;
let running = false;

// Helper function for resetting ball
function resetBall(direction = 1) {
    ballX = (canvas.width - BALL_SIZE) / 2;
    ballY = (canvas.height - BALL_SIZE) / 2;
    ballVelX = direction * BALL_SPEED;
    ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

// Mouse controls for player paddle
canvas.addEventListener('mousemove', (e) => {
    if (!running) return;
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(playerY, canvas.height - PADDLE_HEIGHT));
});

// Basic AI control for right paddle
function updateAI() {
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    const ballCenter = ballY + BALL_SIZE / 2;
    if (aiCenter < ballCenter - 10) {
        aiY += AI_SPEED;
    } else if (aiCenter > ballCenter + 10) {
        aiY -= AI_SPEED;
    }
    aiY = Math.max(0, Math.min(aiY, canvas.height - PADDLE_HEIGHT));
}

// Ball movement and collision
function updateBall() {
    ballX += ballVelX;
    ballY += ballVelY;

    // Top and bottom wall collision
    if (ballY < 0) {
        ballY = 0;
        ballVelY *= -1;
    } else if (ballY + BALL_SIZE > canvas.height) {
        ballY = canvas.height - BALL_SIZE;
        ballVelY *= -1;
    }

    // Paddle collision (Player)
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballVelX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballVelY = collidePoint * 0.2;
    }

    // Paddle collision (AI)
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_SIZE;
        ballVelX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballVelY = collidePoint * 0.2;
    }

    // Left wall (AI scores)
    if (ballX < 0) {
        aiScore++;
        updateScoreboard();
        resetBall(1);
    }
    // Right wall (Player scores)
    else if (ballX + BALL_SIZE > canvas.width) {
        playerScore++;
        updateScoreboard();
        resetBall(-1);
    }
}

// Drawing functions
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = "#888";
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, "#111");

    // Draw net
    drawNet();

    // Draw paddles
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#00ff99");
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#ff3366");

    // Draw ball
    drawCircle(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, "#fff");

    // Optional: you can draw the score here, but it's now in the DOM
}

function updateScoreboard() {
    playerScoreElem.textContent = playerScore;
    aiScoreElem.textContent = aiScore;
}

// Main game loop
function gameLoop() {
    if (!running) return;
    updateAI();
    updateBall();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    if (running) return;
    running = true;
    startBtn.disabled = true;
    endBtn.disabled = false;
    // Reset game state
    playerScore = 0;
    aiScore = 0;
    playerY = (canvas.height - PADDLE_HEIGHT) / 2;
    aiY = (canvas.height - PADDLE_HEIGHT) / 2;
    updateScoreboard();
    resetBall((Math.random() > 0.5) ? 1 : -1);
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    running = false;
    startBtn.disabled = false;
    endBtn.disabled = true;
    if (animationId) cancelAnimationFrame(animationId);
    // Optional: Draw a message on end
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Ended", canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

startBtn.addEventListener('click', startGame);
endBtn.addEventListener('click', endGame);

// Draw initial state
draw();
updateScoreboard();