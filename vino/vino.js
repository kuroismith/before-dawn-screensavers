let img;
let balls = [];
let sprites = [];
let numSprites = 30;
let minSprite = 1;
let maxSprite = 13;
let now = new Date();

function setup() {
  if ( typeof(window.urlParams) !== "undefined" ) {
    displayWidth = window.urlParams.width;
    displayHeight = window.urlParams.height;
    console.log(window.urlParams);

    if ( typeof(window.urlParams.density) !== "undefined" ) {
      count = window.urlParams.density * 2;
      console.log("set count to " + count);
    }
  }
  else {
    displayWidth = screen.width;
    displayHeight = screen.height;
  }

  createCanvas(displayWidth, displayHeight);

  img = loadImage(unescape(decodeURIComponent(window.urlParams.screenshot)));

  for ( let i = 0; i < numSprites; i++ ) {
    let index = int(random(minSprite, maxSprite));
    let tmp;
    if ((now.getMonth() === 7 && now.getDate() === 12) || (now.getMonth() === 9 && now.getDate() === 10)) {
      // happy birthday
      tmp = loadImage("data/surprise/" + index + ".png"); 
    } else {
      tmp = loadImage("data/" + index + ".png");
    }
    sprites.push(tmp);
    balls.push(new Ball());
  }
}

function draw() {
  image(img, 0, 0);
  for (let i = 0; i < balls.length; i++) {
    balls[i].move();
    balls[i].display();
    balls[i].turn();
  }
}

// Ball class
class Ball {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.xSpeed = random(-1.5, 1.5);
    this.ySpeed = random(-1.5, 1.5);
    this.xDirection = 0.7;
    this.yDirection = 0.7;
    this.sprite = int(random(0, numSprites));
  }

  move() {
    this.x += this.xSpeed * this.xDirection;
    this.y += this.ySpeed * this.yDirection;
  }

  turn() {
    if (this.x < -100) {
      this.x =  -100;
      this.xDirection = -this.xDirection;
    } else if (this.y <  -100) {
      this.y =  -100;
      this.yDirection = -this.yDirection;
    } else if (this.x > width - 100) {
      this.x = width - 100;
      this.xDirection = -this.xDirection;
    } else if (this.y > height - 100) {
      this.y = height - 100;
      this.yDirection = -this.yDirection;
    }
  }

  display() {
    image(sprites[this.sprite], this.x, this.y);
  }
}
