var canvas, context;

// objetos del juego
var bird, grass, grass2, pipe, bg;
var scrollHandler;

// gameinfo
var score = 0;

// game states
// 0: game ready
// 1: game running
// 2: game over
var currentGameState = 0;

// collision objects
var bBox_grass;

// assets/media
var spriteSheet = new Image();
spriteSheet.src = 'assets/texture.png';

// ============================================
// para que el codigo corra

function init(){
	canvas = document.getElementById('game-canvas');
	context = canvas.getContext('2d');
	initInputHandlers();

	bird = new Bird(66, (canvas.height/2) - 10, 34, 24);
	scrollHandler = new ScrollHandler((canvas.height/2) + 132);
	pipe = new Pipe(0, 0, 0);
	bg = new BG(0, (canvas.height/2) + 46);

	bBox_grass = new Rectangle(0, (canvas.height/2) + 132, canvas.width, 22);

	update();
}

function update(){
	calculateTime();
	act();
	paint();
	requestAnimationFrame(update);
}

// ============================================
// para dividir tu juego en dos partes (datos y dibujo)

// NOTA podria ser conveniente en el primer dia dar una breve
// explicacion de la logica del codigo base, como por ejemplo
// indicar cual es la funcion del metodo act, cual la del metodo
// paint y el porque hacemos esto asi

function act(){
	switch (currentGameState) {
		case 0: // case gameready
			updateGameReady();
			break;
		case 1: // case gamerunning
			updateGameRunning();
			break;
	}
};

function paint(){
	paintGameRunning();
	if (currentGameState == 0) paintGameReady();
	if (currentGameState == 2) {
		paintGameOver();
		paintScoreInGameOver();
	}
}

function paintGameReady(){
	// game info
	var text = "press spacebar";

	context.fillStyle = '#000';
	context.font = '25px marioFont';
	context.textAlign = 'center';
	context.fillText(text, canvas.width/2, 115);

	context.fillStyle = '#fff';
	context.font = '25px marioFont';
	context.textAlign = 'center';
	context.fillText(text, canvas.width/2, 110);

}

function paintGameRunning(){
	// bg color
	context.fillStyle = '#375064';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// bg image
	bg.draw();

    // grass
    context.fillStyle = '#3E7A31';
	context.fillRect(0, (canvas.height/2) + 132, 272, 22);

	context.fillStyle = '#93501B';
	context.fillRect(0, (canvas.height/2) + 154, canvas.width, 104);

	scrollHandler.draw();
	bBox_grass.draw(context, '#F5AB35');

	// player
	bird.draw(); 

	if (currentGameState == 1) paintScore();
}

function paintGameOver(){
	// game info
	context.fillStyle = '#000';
	context.font = '32px marioFont';
	context.textAlign = 'center';
	context.fillText("Game Over", canvas.width/2, canvas.height/2 + 5);


	context.fillStyle = '#c0392b';
	context.font = '32px marioFont';
	context.textAlign = 'center';
	context.fillText("Game Over", canvas.width/2, canvas.height/2);
}

function paintScore(){
	// game info
	context.fillStyle = '#000';
	context.font = '45px marioFont';
	context.textAlign = 'center';
	context.fillText(score, canvas.width/2, 45 + 5);

	context.fillStyle = '#fff';
	context.font = '45px marioFont';
	context.textAlign = 'center';
	context.fillText(score, canvas.width/2, 45);
}

function paintScoreInGameOver(){
	// game info
	context.fillStyle = '#000';
	context.font = '45px marioFont';
	context.textAlign = 'center';
	context.fillText(score, canvas.width/2, 120 + 5);

	context.fillStyle = '#fff';
	context.font = '45px marioFont';
	context.textAlign = 'center';
	context.fillText(score, canvas.width/2, 120);
}

function updateGameReady(){
	scrollHandler.pipe1.stop();
	scrollHandler.pipe2.stop();
	scrollHandler.pipe3.stop();

	scrollHandler.update(deltaTime);
};

function updateGameRunning(){
	bird.update(deltaTime);
	scrollHandler.update(deltaTime);

	if (scrollHandler.collides(bird) && bird.isAlive) {
		// cleanup game over
		bird.die();
		scrollHandler.stop();
	}

	if (bird.boundingBox.collides2Rect(bBox_grass)) {
		bird.die();
		scrollHandler.stop();
		bird.decelarate();
		currentGameState = 2; // set game state to game over
	}
}

function startGame(){
	currentGameState = 1; // set current game state to running
}

function restartGame(){
	currentGameState = 0; // set current game state to ready
	score = 0;
	bird.onRestart(canvas.height/2 - 10);
	scrollHandler.onRestart();
}

function isGameReady(){
	return currentGameState == 0;
}

function isGameOver(){
	return currentGameState == 2;
}

window.addEventListener("DOMContentLoaded", init, false);

// ============================================
// Bird: codigo de nuestro personaje

function Bird(x, y, width, height){
	console.log("bird instantiated");
	this.position = new Vector(x, y);
	this.velocity = new Vector();
	this.acceleration = new Vector(0, 920);
	this.isAlive = true;

	this.rotation = 0;
	this.width = width;
	this.height = height;

	// animation stuff
	this.timer = 0;
	this.speed4changeImage = 4;

	// bounding circle
	this.boundingBox = new Rectangle(this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height);
}

Bird.prototype.update = function(delta) {

	// var accel = new Vector(this.acceleration.x, this.acceleration.y);
	var temp_accel = this.acceleration.copy();
	temp_accel.scl(delta);
	this.velocity.add(temp_accel);

	if (this.velocity.y > 400) this.velocity.y = 400;

	var temp_vel = this.velocity.copy();
	temp_vel.scl(delta);
	this.position.add(temp_vel);

	// rotate counterclockwise
	if (this.velocity.y < 0) {
		this.rotation -= 600 * delta;
		if (this.rotation < -20) this.rotation = -20;
	}

	if (this.position.y < -8) {
		this.position.y = -8;
		this.velocity.y = 0;
	}

	// rotate clockwise
	if (this.isFalling() || !this.isAlive) {
		this.rotation += 480 * delta;
		if (this.rotation > 90) this.rotation = 90;
	}

	// collision logic
	this.boundingBox.position.x = this.position.x - this.width/2;
	this.boundingBox.position.y = this.position.y - this.height/2;

};

Bird.prototype.draw = function() {
	/*context.fillStyle = '#fff';
	context.fillRect(this.position.x, this.position.y, this.width, this.height);*/

	this.timer += 1;
	if (this.shouldnFlap()) {
		this.drawBird();
		console.log('shouldn flap');
	} else {
		console.log('flapping');
		this.animateFlutter();
	}

	// collision logic
	this.boundingBox.draw(context, '#000');

};
	

Bird.prototype.drawBird = function() {
	context.save();
	context.translate(this.position.x, this.position.y);
	context.rotate((Math.PI/180)*this.rotation);

	context.drawImage(spriteSheet, 306, 0, 34, 24, -this.width/2, -this.height/2, this.width, this.height);

	context.restore();
};

Bird.prototype.animateFlutter = function() {
	
	context.save();
	context.translate(this.position.x, this.position.y);
	context.rotate((Math.PI/180)*this.rotation);

	if (this.timer < this.speed4changeImage) {
		// bird
		context.drawImage(spriteSheet, 306, 0, 34, 24, -this.width/2, -this.height/2, this.width, this.height);
	}

	if (this.timer >= this.speed4changeImage) {
		// bird down
		context.drawImage(spriteSheet, 272, 0, 34, 24, -this.width/2, -this.height/2, this.width, this.height);
	}

	if (this.timer >= this.speed4changeImage * 2) {
		// bird up
		context.drawImage(spriteSheet, 340, 0, 34, 24, -this.width/2, -this.height/2, this.width, this.height);
		this.timer = 0;
	}

	context.restore();

};

Bird.prototype.onRestart = function(y) {
	this.rotation = 0;
	this.position.y = y;
	this.velocity.y = 0;
	this.acceleration.y = 920;
	this.isAlive = true;
};

// method to decide when the bird should begin rotating downwards. 
Bird.prototype.isFalling = function() {
	return this.velocity.y > 220;
};

Bird.prototype.decelarate = function() {
	this.acceleration.y = 0;
};

Bird.prototype.die = function() {
	this.isAlive = false;
	this.velocity.y = 0;
};

// method to determine when the bird should stop animating.
Bird.prototype.shouldnFlap = function() {
	return this.velocity.y > 140 || !this.isAlive;
};

Bird.prototype.onClick = function() {
	if (!this.isAlive) return;
	this.velocity.y = 0;
	this.velocity.y -= 280;
};

// ============================================
// grass

function Grass(x, y, scrollSpeed){
	this.isStopped = false;
	this.position = new Vector(x, y);
	this.scrollSpeed = scrollSpeed;
}

Grass.prototype.update = function(delta) {
	if (!this.isStopped) this.position.x -= this.scrollSpeed * delta;
	if (this.position.x < -272) this.position.x = 272;
};

Grass.prototype.draw = function() {
	// grass image
	context.drawImage(spriteSheet, 0, 86, 286, 22, this.position.x, this.position.y, 272, 22);

};

Grass.prototype.stop = function() {
	this.isStopped = true;
};

Grass.prototype.onRestart = function(x) {
	this.position.x = x;
	this.isStopped = false;
};

// ============================================
// pipe
function Pipe(x, y, width, height, scrollSpeed){
	this.VERTICAL_GAP = 90;
	this.isStopped = false;
	this.width = width;
	this.height = height;
	this.position = new Vector(x, y);
	this.scrollSpeed = scrollSpeed;
	this.isScrolled = false;
	this.isScored = false;

	// collision
	this.barTop_bBox = new Rectangle(this.position.x, 0, this.width, this.height);
	this.barBttm_bBox = new Rectangle(this.position.x, this.height + this.VERTICAL_GAP, this.width, canvas.height/2 + 132 - (this.height + 90));
}

Pipe.prototype.update = function(delta) {
	if (!this.isStopped) this.position.x -= this.scrollSpeed * delta;
	// If the Scrollable object is no longer visible:
	if (this.position.x + this.width < 0)
		this.isScrolled = true;

	// collision logic
	this.barTop_bBox.position.x = this.position.x;

	this.barBttm_bBox.position.x = this.position.x;
};

Pipe.prototype.draw = function() {

	// bar up
    context.drawImage(spriteSheet, 272, 32, 44, 4, this.position.x, 0, 44, this.height);

    // bar down
    context.drawImage(spriteSheet, 272, 32, 44, 4, this.position.x, this.height + this.VERTICAL_GAP, 44, canvas.height/2 + 132 - (this.height + this.VERTICAL_GAP));
	
	// skull up with bar down
	context.drawImage(spriteSheet, 384, 0, 48, 28, this.position.x - 2, this.height + this.VERTICAL_GAP, 48, 28);
	
	// skull down with bar up
	context.save();
    context.scale(1, -1);
    context.drawImage(spriteSheet, 384, 0, 48, 28, this.position.x - 2, -this.height + 28, 48, 28*-1);
    context.restore();

    // collision logic
    this.barTop_bBox.draw(context, '#2ecc71');
    this.barBttm_bBox.draw(context, '#2ecc71');

};

Pipe.prototype.reset = function(newX) {
	this.position.x = newX;
	this.isScrolled = false;
	this.isScored = false;
	this.isStopped = false;
	this.height = getRandomArbitrary(0, 90) + 15;

	// collision logic
	this.barTop_bBox.height = this.height;

	this.barBttm_bBox.position.y = this.height + this.VERTICAL_GAP;
	this.barBttm_bBox.height = canvas.height/2 + 132 - (this.height + this.VERTICAL_GAP);
};

Pipe.prototype.stop = function() {
	this.isStopped = true;
};

Pipe.prototype.onRestart = function(x) {
	this.reset(x);
};

Pipe.prototype.collides = function(bird) {
	if (this.position.x > bird.position.x + bird.width) return;
	return (bird.boundingBox.collides2Rect(this.barBttm_bBox) ||
			bird.boundingBox.collides2Rect(this.barTop_bBox));
	return false;
};

Pipe.prototype.isScrolledLeft = function() {
	return this.isScrolled;
};

Pipe.prototype.getTailX = function() {
	return this.position.x + this.width;
};

// ============================================
// scroll handler

// Constructor receives a float that tells us where we need to create our
// Grass and Pipe objects.
function ScrollHandler(Ypos) {
	// ScrollHandler will use the constants below to determine
    // how fast we need to scroll and also determine
    // the size of the gap between each pair of pipes.

    this.SCROLL_SPEED = 118;
    this.PIPE_GAP = 98

	// scrollable objects
	this.pipe1 = new Pipe(420, 0, 44, 120, this.SCROLL_SPEED);
	this.pipe2 = new Pipe(this.pipe1.getTailX() + this.PIPE_GAP, 0, 44, 140, this.SCROLL_SPEED);
	this.pipe3 = new Pipe(this.pipe2.getTailX() + this.PIPE_GAP, 0, 44, 120, this.SCROLL_SPEED);

	this.grass1 = new Grass(0, Ypos, this.SCROLL_SPEED);
	this.grass2 = new Grass(273, Ypos, this.SCROLL_SPEED);
}

ScrollHandler.prototype.update = function(delta) {
	this.grass1.update(delta);
	this.grass2.update(delta);

	this.pipe1.update(delta);
	this.pipe2.update(delta);
	this.pipe3.update(delta);

	// Check if any of the pipes are scrolled left,
    // and reset accordingly
    if (this.pipe1.isScrolledLeft()) {
    	this.pipe1.reset(this.pipe3.getTailX() + this.PIPE_GAP);
    } else if (this.pipe2.isScrolledLeft()) {
    	this.pipe2.reset(this.pipe1.getTailX() + this.PIPE_GAP);
    } else if (this.pipe3.isScrolledLeft()) {
    	this.pipe3.reset(this.pipe2.getTailX() + this.PIPE_GAP);
    }

};

ScrollHandler.prototype.draw = function() {
	this.grass1.draw();
	this.grass2.draw();

	this.pipe1.draw();
	this.pipe2.draw();
	this.pipe3.draw();
};

ScrollHandler.prototype.collides = function(bird) {

	if (!this.pipe1.isScored &&
		bird.position.x + bird.width/2 > this.pipe1.position.x + this.pipe1.width/2) {
		this.pipe1.isScored = true;
		score += 1;
	}

	if (!this.pipe2.isScored &&
		bird.position.x + bird.width/2 > this.pipe2.position.x + this.pipe2.width/2) {
		this.pipe2.isScored = true;
		score += 1;
	}

	if (!this.pipe3.isScored &&
		bird.position.x + bird.width/2 > this.pipe3.position.x + this.pipe3.width/2) {
		this.pipe3.isScored = true;
		score += 1;
	}

	return (this.pipe1.collides(bird) || this.pipe2.collides(bird) || this.pipe3.collides(bird));
};

ScrollHandler.prototype.stop = function() {
	this.pipe1.stop();
	this.pipe2.stop();
	this.pipe3.stop();
	this.grass1.stop();
	this.grass2.stop();
};

ScrollHandler.prototype.onRestart = function() {
	this.pipe1.onRestart(420);
	this.pipe2.onRestart(this.pipe1.getTailX() + this.PIPE_GAP);
	this.pipe3.onRestart(this.pipe2.getTailX() + this.PIPE_GAP);
	this.grass1.onRestart(0);
	this.grass2.onRestart(272);
};

// ============================================
// bg

function BG(x, y){
	this.position = new Vector(x, y);
}

BG.prototype.draw = function() {
	// background image
	context.drawImage(spriteSheet, 0, 0, 272, 86, this.position.x, this.position.y, 272, 86);
};

// ============================================
// Input handler

function initInputHandlers(){
	window.addEventListener("keydown", function(event){
		if (event.keyCode == "32" && isGameReady()) {
			startGame();
			scrollHandler.onRestart();
		} 
		if (event.keyCode == "32") bird.onClick();
		if (isGameOver()) restartGame();
	}, false);
}

/*
DIA 2:
 - se definieron las dimensiones del player
 - se definio el tamaño del canvas
 - se cambio el nombre del metodo run a update
DIA 3:
 - se empieza a trabajar la seccion "objetos del juego"
*/