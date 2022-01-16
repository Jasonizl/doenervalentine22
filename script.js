const WINDOW_HEIGHT = window.innerHeight, WINDOW_WIDTH = window.innerWidth;
const MIDDLE_OF_SCREEN = WINDOW_HEIGHT / 2;
const scaleDoener = 0.4;
const GAP_BETWEEN_PIPES = WINDOW_WIDTH - 50;
const GAP_SIZE = 450; // change dynamically to 400 when score is higher

/* PLAYER VARIABLES */
const doener = {
    x: 0,
    y: MIDDLE_OF_SCREEN,
    width: undefined,
    height: undefined,
    image: new Image(),
}

/* PIPES */ 
const pipe = new Image();
const pipeUp = new Image();
const pipeDown = new Image();
const pipeScale = 1.25;

let velocityY = 0;
let gravity = 0.4;

let isStartScreenRendered = false;

/* GAME VARIABLES */
let paused = false;
let frameCount = 0;
let fps = 60, fpsInterval, startTime, now, then, elapsed;
let score = 0;
let currentScreen = "start"; // start - game - pause - end

let gaps;
let gapsPos = [GAP_BETWEEN_PIPES, GAP_BETWEEN_PIPES*2, GAP_BETWEEN_PIPES*3]
let gapX = 0;

function getGap() {
    return Math.floor(Math.random() * (WINDOW_HEIGHT - (GAP_SIZE + 300))) + 100;
}

function calculateNewGap() {
    gaps.shift();
    gaps.push(getGap());
    gapsPos.shift();
    gapsPos.push(GAP_BETWEEN_PIPES*(score+3));
}

function resizeCanvasToBrowserSize() {
    const ctx = document.getElementById('canvas').getContext('2d');
    ctx.canvas.width = WINDOW_WIDTH;
    ctx.canvas.height = WINDOW_HEIGHT;
    if (doener.width === 0 || doener.height === 0) {
        doener.width = doener.image.width * scaleDoener;
        doener.height = doener.image.height * scaleDoener;
        doener.y = MIDDLE_OF_SCREEN - (doener.height/2);
    }

}

function init() {
    // game engine stuff
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    // Image stuff
    doener.image.src = 'res/doener.png';
    doener.width = doener.image.width;
    doener.height = doener.image.height;
    pipe.src = 'res/pipe.png';
    pipeUp.src = 'res/pipe_up.png';
    pipeDown.src = 'res/pipe_down.png';
    // pipes and stuff
    gaps = [getGap(), getGap(), getGap()];
    resizeCanvasToBrowserSize();

    /*window.onclick = myClick;
    document.ontouchstart = myTouch2;
    document.ontouchend = myTouch;*/
    window.onclick = myClick;
    window.requestAnimationFrame(loop);
}

function logic() {
    resizeCanvasToBrowserSize();
    if (currentScreen === 'game') {
        doener.y += velocityY;
        velocityY += gravity;
        gapX -= 7;

        // check if we hit the pipe with the döner
        let doenerTop = doener.y, doenerBottom = doener.y + doener.height, doenerWidth = doener.width;

        // tweak the hundred for more forgiving exit collision detecting
        if (gapsPos[0] + gapX < doenerWidth && gapsPos[0] + gapX > -(pipe.width * pipeScale) + 100) {
            if (doenerTop < gaps[0] || doenerBottom > gaps[0] + GAP_SIZE ) {
                // At this stage you lost the game
                paused = true;
            }
        }
        // when pipe is out of screen, add one score and replace old pipe with new pipe
        if(gapsPos[0] + gapX < 0 - pipe.width*pipeScale) {
            score++;
            calculateNewGap();
        }
    }

}

function draw() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    ctx.fillStyle= 'white';
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height); 

    ctx.font = '200px FlappyBirdy2';
    ctx.fillStyle = 'black';



    switch (currentScreen) {
        case 'start': 
            ctx.font = '200px FlappyBirdy';
            console.log(ctx.measureText('Flappy Doener'))
            ctx.fillText(`Flappy Doener`, ((WINDOW_WIDTH - ctx.measureText('Flappy Doener').width)/2), MIDDLE_OF_SCREEN);
            if(!isStartScreenRendered) {
                const startScreenImage = new Image();
                startScreenImage.id = '123';
                document.getElementById('divCanvas').appendChild(startScreenImage);
                startScreenImage.src = 'res/valentines.gif';
                isStartScreenRendered = true;
            }
            ctx.drawImage(doener.image, (WINDOW_WIDTH - doener.width) / 2, MIDDLE_OF_SCREEN * 1.5, doener.width, doener.height);  
            ctx.font = '100px FlappyBirdy';
            ctx.fillText(`Tippen um zu starten`, ((WINDOW_WIDTH - ctx.measureText('Tippen um zu starten').width)/2), MIDDLE_OF_SCREEN * 1.75);
            break;
        case 'game': 
            if (isStartScreenRendered) {
                document.getElementById('divCanvas').removeChild(document.getElementById('123'));
                isStartScreenRendered = false;
            }
            /* Draw the background */

            /* Draw the pipes */
            let index = 0;
            for (let gap of gaps) {
                ctx.drawImage(pipe, gapsPos[index] + gapX, 0, pipe.width * pipeScale, gap);
                ctx.drawImage(pipeDown, gapsPos[index] + gapX, gap - pipeDown.height - 50, pipe.width * pipeScale, pipeDown.height + 50)
                ctx.drawImage(pipe, gapsPos[index] + gapX, gap + GAP_SIZE, pipe.width * pipeScale, WINDOW_HEIGHT);
                ctx.drawImage(pipeUp, gapsPos[index] + gapX, gap + GAP_SIZE, pipe.width * pipeScale, pipeUp.height + 50)
                index++;
            }

            /* Draw the score */
            ctx.font = '200px FlappyBirdy2';
            ctx.fillStyle = 'black';
            ctx.fillText(`SCORE ${score}`, 20, 120);

            /* Draw the player */
            ctx.drawImage(doener.image, doener.x, doener.y, doener.width, doener.height);
            break;
        case 'pause':
            break;
        case 'end':
            break;
    }
}

function loop() {
    window.requestAnimationFrame(loop);
    if (!paused) {
        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval) {
            // Get ready for next frame by setting then=now, but also adjust for your
            // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
            then = now - (elapsed % fpsInterval);
            logic();
            draw();
        }
    }
}

window.onload = (event) => {
    init();
}

function pause() {
    paused = true;
}

function unpause() {
    paused = false;
}

window.addEventListener('blur', pause);

function myClick(e) {
    if (currentScreen === 'game') {
        if (paused) {
            paused = false;
            return;
        }
        if(velocityY < -4) {
            velocityY -= 4;
        } else {
            velocityY = -12;
        } 
    } else {
        currentScreen = 'game';
        paused = false;
    }
}
