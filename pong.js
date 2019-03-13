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
            w: 18,
            h: 18,
            x: (W / 2) - 9,
            y: (H / 2) - 9,
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            s: incrementedSpeed || 9
        };
    }
};

// The paddle object (The two lines that move up and down)
var Paddle = {
    new: function (side) {
        return {
            w: 18,
            h: 70,
            x: side === 'left' ? 150 : W - 150,
            y: (H / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            s: 10
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

        t.r.s = 8;
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
        b = t.b;
        l = t.l;
        r = t.r;
        if (!t.over) {

            // If the ball collides with the bound limits - correct the x and y coords.
            if (b.x <= 0) Pong._resetTurn.call(t, r, l);
            if (b.x >= W - b.w) Pong._resetTurn.call(t, l, r);
            if (b.y <= 0) b.moveY = DIRECTION.DOWN;
            if (b.y >= H - b.h) b.moveY = DIRECTION.UP;

            // Move player if they player.move value was updated by a keyboard event
            if (l.move === DIRECTION.UP) l.y -= l.s;
            else if (l.move === DIRECTION.DOWN) l.y += l.s;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(t) && t.turn) {
                b.moveX = t.turn === l ? DIRECTION.LEFT : DIRECTION.RIGHT;
                b.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                b.y = Math.floor(Math.random() * H - 200) + 200;
                t.turn = null;
            }

            // If the player collides with the bound limits, update the x and y coords.
            if (l.y <= 0) l.y = 0;
            else if (l.y >= (H - l.h)) l.y = (H - l.h);

            // Move ball in intended direction based on moveY and moveX values
            if (b.moveY === DIRECTION.UP) b.y -= (b.s / 1.5);
            else if (b.moveY === DIRECTION.DOWN) b.y += (b.s / 1.5);
            if (b.moveX === DIRECTION.LEFT) b.x -= b.s;
            else if (b.moveX === DIRECTION.RIGHT) b.x += b.s;

            // Handle paddle (AI) UP and DOWN movement
            if (r.y > b.y - (r.h / 2)) {
                if (b.moveX === DIRECTION.RIGHT) r.y -= r.s / 1.5;
                else r.y -= r.s / 4;
            }
            if (r.y < b.y - (r.h / 2)) {
                if (b.moveX === DIRECTION.RIGHT) r.y += r.s / 1.5;
                else r.y += r.s / 4;
            }

            // Handle paddle (AI) wall collision
            if (r.y >= H - r.h) r.y = H - r.h;
            else if (r.y <= 0) r.y = 0;

            // Handle Player-Ball collisions
            if (b.x - b.w <= l.x && b.x >= l.x - l.w) {
                if (b.y <= l.y + l.h && b.y + b.h >= l.y) {
                    b.x = (l.x + b.w);
                    b.moveX = DIRECTION.RIGHT;
                }
            }

            // Handle paddle-ball collision
            if (b.x - b.w <= r.x && b.x >= r.x - r.w) {
                if (b.y <= r.y + r.h && b.y + b.h >= r.y) {
                    b.x = (r.x - b.w);
                    b.moveX = DIRECTION.LEFT;
                }
            }
        }

        // Handle the end of round transition
        // Check to see if the player won the round.
        if (l.score === rounds[t.u]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[t.u + 1]) {
                t.over = true;
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 1000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                t.color = t._generateRoundColor();
                l.score = r.score = 0;
                l.s += 0.5;
                r.s += 1;
                b.s += 1;
                t.u += 1;
            }
        }
        // Check to see if the paddle/AI has won the round.
        else if (r.score === rounds[t.u]) {
            t.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 1000);
        }
    },

    // Draw the objects to the canvas element
    draw: function () {
        t = this;
        c = t.t;
        b = t.b;
        l = t.l;
        r = t.r;
        // Clear the Canvas
        c.clearRect(
            0,
            0,
            W,
            H
        );

        // Set the fill style to black
        c.fillStyle = t.color;

        // Draw the background
        c.fillRect(
            0,
            0,
            W,
            H
        );

        // Set the fill style to white (For the paddles and the ball)
        c.fillStyle = '#ffffff';

        // Draw the Player
        c.fillRect(
            l.x,
            l.y,
            l.w,
            l.h
        );

        // Draw the Paddle
        c.fillRect(
            r.x,
            r.y,
            r.w,
            r.h
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(t)) {
            c.fillRect(
                b.x,
                b.y,
                b.w,
                b.h
            );
        }

        // Draw the net (Line in the middle)
        c.beginPath();
        c.setLineDash([7, 15]);
        c.moveTo((W / 2), H - 140);
        c.lineTo((W / 2), 140);
        c.lineWidth = 10;
        c.strokeStyle = '#ffffff';
        c.stroke();

        // Set the default canvas font and align it to the center
        c.font = '100px Courier New';
        c.textAlign = 'center';

        // Draw the players score (left)
        c.fillText(
            l.score.toString(),
            (W / 2) - 300,
            200
        );

        // Draw the paddles score (right)
        c.fillText(
            r.score.toString(),
            (W / 2) + 300,
            200
        );

        // Change the font size for the center score text
        c.font = '30px Courier New';

        // Draw the winning score (center)
        c.fillText(
            'Round ' + (Pong.u + 1),
            (W / 2),
            35
        );

        // Change the font size for the center score value
        c.font = '40px Courier';

        // Draw the current round number
        c.fillText(
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
        t.b = Ball.new.call(t, t.b.s);
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