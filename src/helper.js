// ========================================================
// get delta time
var lastUpdate = 0,
	deltaTime = 0,
	FPS = 0,
	frames = 0,
	acumDelta = 0;

function calculateTime(){
	var now = Date.now();
	deltaTime = (now - lastUpdate) / 1000;
	if (deltaTime > 1) { deltaTime = 0;}
	lastUpdate = now;

	frames += 1;
	acumDelta += deltaTime;
	if (acumDelta > 1) {
		FPS = frames;
		frames = 0;
		acumDelta -= 1;
	}
}

// ========================================================
// CLASS: Circle
/*
function Circle(x, y, radius){
	this.position = new Vector(x, y);
	this.radius = radius;
}

Circle.prototype.draw = function(context, hexColor) {
	context.beginPath();

	context.fillStyle = hexColor;
	context.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
	context.fill();

	context.closePath();
};

Circle.prototype.collides2Rect = function(rectangle) {
	if (Math.abs(this.position.x - rectangle.width/2) <= rectangle.width/2 + this.radius) return true;
	if (Math.abs(this.position.y - rectangle.height/2) <= rectangle.height/2 + this.radius) return true;
	return false;
};*/

// ========================================================
// CLASS: Rectangle

function Rectangle(x, y, width, height){
	this.position = new Vector(x, y);
	this.width = width;
	this.height = height;
}


Rectangle.prototype.draw = function(context, hexColor) {/*
	context.beginPath();

	context.fillStyle = hexColor;
	context.fillRect(this.position.x, this.position.y, this.width, this.height);

	context.closePath();*/
};

Rectangle.prototype.collides2Rect = function(rect) {
	return (this.position.x + this.width > rect.position.x &&
			this.position.y + this.height > rect.position.y &&
			this.position.x < rect.width + rect.position.x &&
			this.position.y < rect.height + rect.position.y)
};

// ========================================================
// CLASS: Vector
function Vector(x, y){
	this.x = x ? x : 0;
	this.y = y ? y : 0;
}

Vector.prototype.copy = function() {
	var temp = new Vector(this.x, this.y);
	return temp;
};

Vector.prototype.add = function(vector){
	this.x += vector.x;
	this.y += vector.y;
}

Vector.prototype.sub = function(vector){
	this.x -= vector.x;
	this.y -= vector.y;
}

Vector.prototype.div = function(scalar){
	this.x /= scalar;
	this.y /= scalar;
}

Vector.prototype.scl = function(n){
	this.x *= n;
	this.y *= n;
}

Vector.prototype.normalize = function(){
	var m = this.getMagnitude();
	if(m == 0) return;
	this.div(m);
}

Vector.prototype.limit = function(max){
	if(this.getMagnitude() > max){
		this.normalize();
		this.scl(max);
	}
}

Vector.prototype.getMagnitude = function(){
	return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
}

// ========================================================
// Misc

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
