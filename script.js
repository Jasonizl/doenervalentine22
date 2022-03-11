const WINDOW_HEIGHT = window.innerHeight, WINDOW_WIDTH = window.innerWidth;
const MIDDLE_OF_SCREEN = WINDOW_HEIGHT / 2;
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

let initCounter = 0;

/* PIPES */ 
const pipe = new Image();
const pipeUp = new Image();
const pipeDown = new Image();
const pipeScale = 1.25;

const sound = new Howl({
    src: ['res/tap.mp3'],
    volume: 0.15,
});

const sound2 = new Howl({
    src: ['res/win.mp3'],
    volume: 0.15,
});


/* BACKGROUND */
const background1 = new Image();
const background2 = new Image();

let background1Speed = -1;

let velocityY = 0;
let gravity = 0.4;

let isStartScreenRendered = false;

/* GAME VARIABLES */
let paused = false;
let fps = 60, fpsInterval, startTime, now, then, elapsed;
let score = 0;
let currentScreen = "start"; // start - game - pause - end

let timeEnded;

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
        const scaleDoener = 0.4;
        doener.width = doener.image.width * scaleDoener;
        doener.height = doener.image.height * scaleDoener;
        doener.y = MIDDLE_OF_SCREEN - (doener.height/2);
    }

}

function init() {
    currentScreen = "start";
    score = 0;
    paused = false;
    gapX = 0;
    gapsPos = [GAP_BETWEEN_PIPES, GAP_BETWEEN_PIPES*2, GAP_BETWEEN_PIPES*3]
    velocityY = 0;
    gravity = 0.4;
    // game engine stuff
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    // Image stuff
    const scaleDoener = 0.4;
    doener.width = doener.image.width * scaleDoener;
    doener.height = doener.image.height * scaleDoener;
    doener.y = MIDDLE_OF_SCREEN;
    // pipes and stuff
    gaps = [getGap(), getGap(), getGap()];
    resizeCanvasToBrowserSize();

    document.ontouchstart = touchStart;
    document.ontouchend = touchEnd;   
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
        if (gapsPos[0] + gapX < doenerWidth - 50 && gapsPos[0] + gapX > -(pipe.width * pipeScale) + 100) {
            if (doenerTop < gaps[0] || doenerBottom > gaps[0] + GAP_SIZE ) {
                // At this stage you lost the game
                if (currentScreen !== 'end') {
                    currentScreen = 'end';
                    timeEnded = Date.now();         
                    sound2.play();
                }
            }
        }
        // when pipe is out of screen, add one score and replace old pipe with new pipe
        if(gapsPos[0] + gapX < 0 - pipe.width*pipeScale) {
            score++;
            calculateNewGap();
        }
    }

    background1Speed = (background1Speed - 1.5) % background1.width;

}

const win0 = ['Döner gesammelt!', 'Probiers nochmal!', '🥺']
const win3 = ['Döner gesammelt!', 'Da seh ich', 'mehr Dönerpotential!', '🤩']
const win5 = ['Döner gesammelt!', 'Das ist meine', 'Marie!', '😍']
const win10 = ['Döner gesammelt!', 'Das ist meine', 'Dönerfrau!', '😍❤️']

/* TODO https://stackoverflow.com/questions/9419263/how-to-play-audio */

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
            for(let i = 0; i < 4; i++) {
                ctx.drawImage(background1, ((background1.width*i) + background1Speed), 0, background1.width, ctx.canvas.height);
                // cant use another variable because the drawing wont work properly somehow...
                ctx.drawImage(background2, ((background2.width*i) + background1Speed*2), 0, background2.width, ctx.canvas.height);
            }


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
        case 'end':
            let win;
            if(score >= 10) {
                win = win10;
            } else if (score >= 5) {
                win = win5;
            } else if (score >= 3) {
                win = win3;
            } else {
                win = win0;
            }
            ctx.font = '75px Verdana';
            let offset = 100;
            for (let i = 0; i < win.length; i++) {
                let text = win[i];
                if (i === 0) {
                    text = `${score} ${win[i]}`;
                }
                ctx.fillText(text, ((WINDOW_WIDTH - ctx.measureText(text).width)/2), MIDDLE_OF_SCREEN-offset);
                if (i===0) {
                    offset -= 200;
                }else {
                    offset -= 100;
                }
            }
            text = 'tap to play again';
            ctx.fillText(text, ((WINDOW_WIDTH - ctx.measureText(text).width)/2), MIDDLE_OF_SCREEN-offset + 300);
            break;
    }
}

function drawPauseScreen() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    ctx.fillStyle= 'white';
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height); 
    ctx.font = '75px Verdana';
    ctx.fillStyle = 'black';
    text = 'tap to unpause';
    ctx.fillText(text, ((WINDOW_WIDTH - ctx.measureText(text).width)/2), MIDDLE_OF_SCREEN);
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
    else {
        drawPauseScreen();
    }
}

incrememtInitchecker = () => {
    initCounter++;
    if (initCounter === 6) {
        init();
    }
} 

window.onload = (event) => {
    doener.image.onload = () => incrememtInitchecker();
    pipe.onload = () => incrememtInitchecker();
    pipeUp.onload = () => incrememtInitchecker();
    pipeDown.onload = () => incrememtInitchecker();
    background1.onload = () => incrememtInitchecker();
    background2.onload = () => incrememtInitchecker();
    doener.image.src = 'res/doener.png';
    pipe.src = 'res/pipe.png';
    pipeUp.src = 'res/pipe_up.png';
    pipeDown.src = 'res/pipe_down.png';
    background1.src = 'res/second_background.png';
    background2.src = 'res/first_background.png';
}

function pause() {
    paused = true;
}

function unpause() {
    paused = false;
}

window.addEventListener('blur', () => {
    if (currentScreen === 'game' || currentScreen === 'start') {
        pause();
        currentScreen = 'paused'
    }
});

function tapAction() {
    if (currentScreen === 'game') {
        if (paused) {
            unpause();
            return;
        }
        sound.play();
        if(velocityY < 0) {
            velocityY -= 6;
        } else {
            velocityY = -12;
        } 
    } else if(currentScreen === 'paused' || currentScreen === 'start') {
        currentScreen = 'game';
        unpause();
    } else if (currentScreen === 'end') {
        if (Date.now()- timeEnded > 750) {
            init();
        }
    }
}

function myClick(e) {
    tapAction();
}

function touchStart(e) {
    e.preventDefault();
    tapAction();
}

function touchEnd(e) {
    e.preventDefault();
}
