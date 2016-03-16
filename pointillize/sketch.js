var img;
var pg;

var smallPoint = 2;
var largePoint = 10;


var pointillize, x, y, pix;

var pointsPerFrame = 3;
var maxFrames = 100000;


function preload() {
    var url = unescape(decodeURIComponent(window.urlParams.screenshot));
    img = loadImage(url);
}

function setup() {

    // figure out the screen dimensions
    var display_width, display_height;
    if ( typeof(window.urlParams) !== "undefined" ) {
        display_width = window.urlParams.width;
        display_height = window.urlParams.height;
    }
    else {
        display_width = screen.width;
        display_height = screen.height;
    }

    frameRate(60);

    createCanvas(display_width, display_height);

    pg = createGraphics(display_width, display_height);

    pg.noStroke();
    pg.background(0);

    img.loadPixels();
}

function draw() {
    // blank the screen and restart after awhile
    if ( frameCount % maxFrames == 0 ) {
        pg.background(0);
    }

    // original script was interactive and used the mouse position.
    // let's try it with a random value instead
    //  var pointillize = map(mouseX, 0, width, smallPoint, largePoint);
    for ( var i = 0 ; i < pointsPerFrame; i++ ) {
        pointillize = random(smallPoint, largePoint);

        x = floor(random(img.width));
        y = floor(random(img.height));

        var pt = floor((y * img.width) + x);

        pix = color(
            img.pixels[pt],
            img.pixels[pt+1],
            img.pixels[pt+2]);

        pg.fill(pix, 128);
        pg.ellipse(x, y, pointillize, pointillize);
    }

    background(0);
    image(pg, 0, 0);
}
