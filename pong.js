// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var W = 1400;
var H = 1000;
var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
var rounds = [5, 5, 3, 3, 2];
var colors = ['#1abc9c', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (W / 2) - 9,
            y: (H / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 9
        };
    }
};

// The paddle object (The two lines that move up and down)
var Paddle = {
    new: function (side) {
        return {
            width: 18,
            height: 70,
            x: side === 'left' ? 150 : W - 150,
            y: (H / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 10
        };
    }
};

var Game = {
    initialize: function () {
        t = this;
        t.v = document.querySelector('canvas');
        t.t = t.v.getContext('2d');

        t.v.width = W;
        t.v.height = H;

        t.v.style.width = (W / 2) + 'px';
        t.v.style.height = (H / 2) + 'px';

        t.l = Paddle.new.call(t, 'left');
        t.r = Paddle.new.call(t, 'right');
        t.b = Ball.new.call(t);

        t.r.speed = 8;
        t.running = t.over = false;
        t.turn = t.r;
        t.timer = t.u = 0;
        t.color = '#2c3e50';

        Pong.menu();
        Pong.listen();
    },

    endGameMenu: function (text) {
        // Change the canvas font size and color
        Pong.t.font = '50px Courier New';
        Pong.t.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.t.fillRect(
            W / 2 - 350,
            H / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        Pong.t.fillStyle = '#ffffff';

        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.t.fillText(text,
            W / 2,
            H / 2 + 15
        );

        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },

    menu: function () {
        // Draw all the Pong objects in their current state
        Pong.draw();
        t = this;

        // Change the canvas font size and color
        t.t.font = '50px Courier New';
        t.t.fillStyle = t.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        t.t.fillRect(
            W / 2 - 350,
            H / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        t.t.fillStyle = '#ffffff';

        // Draw the 'press any key to begin' text
        t.t.fillText('Press any key to begin',
            W / 2,
            H / 2 + 15
        );
    },

    // Update all objects (move the player, paddle, ball, increment the score, etc.)
    update: function () {
        t = this;
        if (!t.over) {

            // If the ball collides with the bound limits - correct the x and y coords.
            if (t.b.x <= 0) Pong._resetTurn.call(t, t.r, t.l);
            if (t.b.x >= W - t.b.width) Pong._resetTurn.call(t, t.l, t.r);
            if (t.b.y <= 0) t.b.moveY = DIRECTION.DOWN;
            if (t.b.y >= H - t.b.height) t.b.moveY = DIRECTION.UP;

            // Move player if they player.move value was updated by a keyboard event
            if (t.l.move === DIRECTION.UP) t.l.y -= t.l.speed;
            else if (t.l.move === DIRECTION.DOWN) t.l.y += t.l.speed;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(t) && t.turn) {
                t.b.moveX = t.turn === t.l ? DIRECTION.LEFT : DIRECTION.RIGHT;
                t.b.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                t.b.y = Math.floor(Math.random() * H - 200) + 200;
                t.turn = null;
            }

            // If the player collides with the bound limits, update the x and y coords.
            if (t.l.y <= 0) t.l.y = 0;
            else if (t.l.y >= (H - t.l.height)) t.l.y = (H - t.l.height);

            // Move ball in intended direction based on moveY and moveX values
            if (t.b.moveY === DIRECTION.UP) t.b.y -= (t.b.speed / 1.5);
            else if (t.b.moveY === DIRECTION.DOWN) t.b.y += (t.b.speed / 1.5);
            if (t.b.moveX === DIRECTION.LEFT) t.b.x -= t.b.speed;
            else if (t.b.moveX === DIRECTION.RIGHT) t.b.x += t.b.speed;

            // Handle paddle (AI) UP and DOWN movement
            if (t.r.y > t.b.y - (t.r.height / 2)) {
                if (t.b.moveX === DIRECTION.RIGHT) t.r.y -= t.r.speed / 1.5;
                else t.r.y -= t.r.speed / 4;
            }
            if (t.r.y < t.b.y - (t.r.height / 2)) {
                if (t.b.moveX === DIRECTION.RIGHT) t.r.y += t.r.speed / 1.5;
                else t.r.y += t.r.speed / 4;
            }

            // Handle paddle (AI) wall collision
            if (t.r.y >= H - t.r.height) t.r.y = H - t.r.height;
            else if (t.r.y <= 0) t.r.y = 0;

            // Handle Player-Ball collisions
            if (t.b.x - t.b.width <= t.l.x && t.b.x >= t.l.x - t.l.width) {
                if (t.b.y <= t.l.y + t.l.height && t.b.y + t.b.height >= t.l.y) {
                    t.b.x = (t.l.x + t.b.width);
                    t.b.moveX = DIRECTION.RIGHT;
                }
            }

            // Handle paddle-ball collision
            if (t.b.x - t.b.width <= t.r.x && t.b.x >= t.r.x - t.r.width) {
                if (t.b.y <= t.r.y + t.r.height && t.b.y + t.b.height >= t.r.y) {
                    t.b.x = (t.r.x - t.b.width);
                    t.b.moveX = DIRECTION.LEFT;
                }
            }
        }

        // Handle the end of round transition
        // Check to see if the player won the round.
        if (t.l.score === rounds[t.u]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[t.u + 1]) {
                t.over = true;
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                t.color = t._generateRoundColor();
                t.l.score = t.r.score = 0;
                t.l.speed += 0.5;
                t.r.speed += 1;
                t.b.speed += 1;
                t.u += 1;
            }
        }
        // Check to see if the paddle/AI has won the round.
        else if (t.r.score === rounds[t.u]) {
            t.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },

    // Draw the objects to the canvas element
    draw: function () {
        t = this;
        // Clear the Canvas
        t.t.clearRect(
            0,
            0,
            W,
            H
        );

        // Set the fill style to black
        t.t.fillStyle = t.color;

        // Draw the background
        t.t.fillRect(
            0,
            0,
            W,
            H
        );

        // Set the fill style to white (For the paddles and the ball)
        t.t.fillStyle = '#ffffff';

        // Draw the Player
        t.t.fillRect(
            t.l.x,
            t.l.y,
            t.l.width,
            t.l.height
        );

        // Draw the Paddle
        t.t.fillRect(
            t.r.x,
            t.r.y,
            t.r.width,
            t.r.height
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(t)) {
            t.t.fillRect(
                t.b.x,
                t.b.y,
                t.b.width,
                t.b.height
            );
        }

        // Draw the net (Line in the middle)
        t.t.beginPath();
        t.t.setLineDash([7, 15]);
        t.t.moveTo((W / 2), H - 140);
        t.t.lineTo((W / 2), 140);
        t.t.lineWidth = 10;
        t.t.strokeStyle = '#ffffff';
        t.t.stroke();

        // Set the default canvas font and align it to the center
        t.t.font = '100px Courier New';
        t.t.textAlign = 'center';

        // Draw the players score (left)
        t.t.fillText(
            t.l.score.toString(),
            (W / 2) - 300,
            200
        );

        // Draw the paddles score (right)
        t.t.fillText(
            t.r.score.toString(),
            (W / 2) + 300,
            200
        );

        // Change the font size for the center score text
        t.t.font = '30px Courier New';

        // Draw the winning score (center)
        t.t.fillText(
            'Round ' + (Pong.u + 1),
            (W / 2),
            35
        );

        // Change the font size for the center score value
        t.t.font = '40px Courier';

        // Draw the current round number
        t.t.fillText(
            rounds[Pong.u] ? rounds[Pong.u] : rounds[Pong.u - 1],
            (W / 2),
            100
        );
    },

    loop: function () {
        Pong.update();
        Pong.draw();

        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },

    listen: function () {
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }

            // Handle up arrow and w key events
            if (key.keyCode === 38 || key.keyCode === 87) Pong.l.move = DIRECTION.UP;

            // Handle down arrow and s key events
            if (key.keyCode === 40 || key.keyCode === 83) Pong.l.move = DIRECTION.DOWN;
        });

        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) { Pong.l.move = DIRECTION.IDLE; });
    },

    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function (victor, loser) {
        t = this;
        t.b = Ball.new.call(t, t.b.speed);
        t.turn = loser;
        t.timer = (new Date()).getTime();

        victor.score++;
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
        return ((new Date()).getTime() - this.timer >= 1000);
    },

    // Select a random color as the background of each level/round.
    _generateRoundColor: function () {
        var newColor = colors[Math.floor(Math.random() * colors.length)];
        if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};

var Pong = Object.assign({}, Game);
Pong.initialize();