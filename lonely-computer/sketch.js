var mic;
var Color = net.brehaut.Color;

var colors = [
  "#d30100", // 11
  "#f37100", // 10
  "#f37100", // 9
  "#f2b10f", // 8     
  "#f2b10f", // 7
  "#f3f320", // 6
  "#f3f320", // 5     
  "#f3f320", // 4    
  "#908d31", // 3     
  "#908d31", // 2
  "#308a45", // 1
  "#308a45", // 0
];

var svg, cType, point = {}, smile, brow, face;
var pupil;
var browPoints = {};

var level = 12;
var maxLevel = 12;
var dir = -1;

var base = {};
var controlDiff = 20;
var pointDiff = 0;

var browControlDiff = -3;
var browPointDiff = 0;

var movePoints = true;

var pupilBase = {};
var pupilWiggle = 12;

var max_tween = 1000;
var max_wiggle_wait = 5000;
var current_wiggle_wait = max_wiggle_wait;


if ( movePoints === true ) {
  controlDiff = controlDiff / 2;
  pointDiff = controlDiff;

  browControlDiff = browControlDiff / 2;
  browPointDiff = browControlDiff;
}

cType = "C";


var volumePoints = [];

var baseline;
var likesNoise;

var mapMin = -0.5;
var mapMax = 0.5;

var currentLevel = -100;

const volumeThresholds = [0.05, 0.02];
const cooldownThresholds = [0.04, 0.025];
const moodCheckRange = [250, 50];
const moodHoldRange = [1250, 250];

const volumeSampleRange = [1500, 250];

//
// NOTE: the variables below get tweaked in setup()
//

// how much noise before mood triggered?
var minVolumeThreshold = 0.02;
var minCooldownThreshold = 0.02;

// how often to check mood?
var moodCheckRate = 100;

// after mood change, how long to wait before checking again
var moodHoldRate = 750;

// how many volume samples to hold?
var maxPoints = 1000;

// how many points for recent volume?
var samplePoints = 5;



var getCurrentPoints = function(str) {
  var re = new RegExp('[MC]', 'g');
  var raw = str.replace(re, '').split(/ /);
  var point = {};
  var tmp;

  tmp = raw[0].split(/,/);
  point.p1 = {};
  point.p1.x = parseInt(tmp[0], 10);
  point.p1.y = parseInt(tmp[1], 10);

  tmp = raw[1].split(/,/);
  point.c1 = {};
  point.c1.x = parseInt(tmp[0], 10);
  point.c1.y = parseInt(tmp[1], 10);
  

  tmp = raw[2].split(/,/);
  point.c2 = {};
  point.c2.x = parseInt(tmp[0], 10);
  point.c2.y = parseInt(tmp[1], 10);

  tmp = raw[3].split(/,/);
  point.p2 = {};
  point.p2.x = parseInt(tmp[0], 10);
  point.p2.y = parseInt(tmp[1], 10);

  return point;
};

var pointToPath = function(point) {
	return "M" + point.p1.x + "," + point.p1.y + " " +
         cType +
         point.c1.x + "," + point.c1.y + " " +
         point.c2.x + "," + point.c2.y+" " +
			   point.p2.x + "," + point.p2.y;
};



var wiggleEyes = function() {
  var tween_rate = Math.random() * max_tween;
  var next_tween = Math.random() * current_wiggle_wait;
  var start = {
    cx: pupil.getAttributeNS(null, "cx"),
    cy: pupil.getAttributeNS(null, "cy")       
  };

  var end = {
    cx: pupilBase.cx - pupilWiggle + Math.random() * (pupilWiggle * 2),
    cy: pupilBase.cy - pupilWiggle + Math.random() * (pupilWiggle * 2)
  }

  tween = new TWEEN.Tween(start);
  tween.to(end, tween_rate)
       .onUpdate(function() {
         pupil.setAttributeNS(null, "cx", this.cx);
         pupil.setAttributeNS(null, "cy", this.cy);
       })
       .onComplete(function() {
         setTimeout(wiggleEyes, next_tween);
       });
  tween.start();
};


// draw smile
function drawFace(l) {
  var path = smile.getAttributeNS(null, "d");
  var point = getCurrentPoints(path);

  l = parseInt(l, 10);
  
  point.p1.y = base.p1.y - l * pointDiff;
  point.p2.y = base.p2.y - l * pointDiff;
  point.c1.y = base.c1.y + l * controlDiff;
  point.c2.y = base.c2.y + l * controlDiff;
  
	smile.setAttributeNS(null, "d", pointToPath(point));

  //  console.log(point);
  
  // brow
  point = {
    p1: { x: browPoints.p1.x, y: browPoints.p1.y - l * browPointDiff },
    p2: { x: browPoints.p2.x, y: browPoints.p2.y - l * browPointDiff },       
    c1: { x: browPoints.c1.x, y: browPoints.c1.y + l * browControlDiff },
    c2: { x: browPoints.c2.x, y: browPoints.c2.y + l * browControlDiff }
  };

  //  console.log(point);
  brow.setAttributeNS(null, "d", pointToPath(point));

  //face.style.fill = fill;
}

var setFaceFill = function(l, rate) {
  var fill = colors[Math.floor(l)];

  var c = Color(face.style.fill); 
  var start = {
    r: c.getRed(),
    g: c.getGreen(),
    b: c.getBlue()
  };

  c = Color(fill);
  //console.log("!!!!!!!!", fill, c);
  var end = {
    r: c.getRed(),
    g: c.getGreen(),
    b: c.getBlue()
  }
  //console.log(start, end, fill);
  
  tween = new TWEEN.Tween(start);
  tween.to(end, rate)
       .onUpdate(function() {
         var tmp = Color([this.r * 255, this.g * 255, this.b * 255]);
         //console.log(tmp.toString());
         face.style.fill = tmp.toRGB();
       })
       .onComplete(function() {
         //setTimeout(wiggleEyes, next_tween);
       });
  tween.start();

};


function setup() {
  // figure out the screen dimensions
  if ( typeof(window.urlParams) !== "undefined" ) {
    display_width = window.urlParams.width;
    display_height = window.urlParams.height;
  }
  else {
    display_width = screen.width;
    display_height = screen.height;
  }

  // note -- if you don't do this, width/height will be strings!
  display_width = parseInt(display_width, 10);
  display_height = parseInt(display_height, 10);

  if ( typeof(window.sensitivity) !== "undefined" ) {
    sensitivity = parseInt(window.sensitivity, 10);
  }
  else {
    sensitivity = 100;
  }
    

  minVolumeThreshold = map(sensitivity, 0, 100, volumeThresholds[0], volumeThresholds[1]);
  minCooldownThreshold = map(sensitivity, 0, 100, cooldownThresholds[0], cooldownThresholds[1]);  
  moodCheckRate = map(sensitivity, 0, 100, moodCheckRange[0], moodCheckRange[1]);
  moodHoldRate = map(sensitivity, 0, 100, moodHoldRange[0], moodHoldRange[1]);
  maxPoints = map(sensitivity, 0, 100, volumeSampleRange[0], volumeSampleRange[1]);

  console.log("minVolumeThreshold: " + minVolumeThreshold);
  console.log("minCooldownThreshold: " + minCooldownThreshold);  
  console.log("moodCheckRate: " + moodCheckRate);
  console.log("moodHoldRate: " + moodHoldRate);
  console.log("maxPoints: " + maxPoints);

  
  // Create an Audio input
  mic = new p5.AudioIn();

  // start the Audio Input.
  // By default, it does not .connect() (to the computer speakers)
  mic.start();


  baseline = 11; //parseInt(random(0, 11), 10);
  currentLevel = baseline;
  
  if ( random() > 0.5 ) {
    likesNoise = false;
  }
  else {
    likesNoise = true;
  }

  likesNoise = false;
  
  current_wiggle_wait = random(1, max_wiggle_wait);
  
  console.log("data points: " + samplePoints);
  console.log("baseline: " + baseline);
  console.log("likes noise: " + likesNoise);
  
  
  var path;

	svg = document.getElementById("svg");
	face = svg.getElementById("face");
	smile = svg.getElementById("smile");
	brow = svg.getElementById("brow");
	pupil = svg.getElementById("pupil");
  
  path = smile.getAttributeNS(null, "d");
  base = getCurrentPoints(path);

  path = brow.getAttributeNS(null, "d");
  browPoints = getCurrentPoints(path);

  console.log(browPoints);
  
  pupilBase.cx = pupil.getAttributeNS(null, "cx");
  pupilBase.cy = pupil.getAttributeNS(null, "cy");
  
  // put the face somewhere random on the screen
  var faceX = random(0, display_width - 500);
  var faceY = random(0, display_height - 500);
  var container = document.getElementById("container");
  container.style.top = faceY + "px";
  container.style.left = faceX + "px";  

  wiggleEyes();
  setFaceFill(currentLevel, 10);
  frameRate(15);

  recordVolume();
  updateMood();
}

var recordVolume = function() {
  // Get the overall volume (between 0 and 1.0)
  var vol = mic.getLevel();

  volumePoints.push(vol);
  if ( volumePoints.length > maxPoints ) {
    volumePoints.shift();
  }
};

var getVolumeDiff = function() {

  // remove current points from total average
  var total_average = volumePoints.slice(0, -samplePoints).reduce(function (a, b) {
    return a + b;
  }, 0) / volumePoints.length;

  
  var recentPoints = volumePoints.slice( -samplePoints );
  var sum = recentPoints.reduce(function (a, b) {
    return a + b;
  }, 0);

  var recent_average = sum / recentPoints.length;

  //console.log("TOTAL: " + total_average + ", RECENT: " + recent_average);

  var diff = recent_average - total_average;
  return diff;
};


var updateMood = function() {
  var diff = getVolumeDiff();
  
  var h;
  var _min, _max;
  var waitFor = moodCheckRate;

  var bump = 0;
  var cooldown = false;
  
  if ( Math.abs(diff) <= minCooldownThreshold ) {
    if ( currentLevel !== baseline ) {
      cooldown = true;

      if ( currentLevel > baseline ) {
        bump = -1;
      }
      else {
        bump = 1;
      }
    }    
  }
  else if ( Math.abs(diff) >= minVolumeThreshold ) {
    if ( likesNoise === true ) {
      bump = 1;
    }
    else {
      bump = -1;
    }
  }

  if ( bump !== 0 ) {
    console.log("bump!", cooldown, diff, bump, currentLevel + bump);
    waitFor = moodHoldRate;

    currentLevel = currentLevel + bump;
    if ( currentLevel < 0 ) {
      currentLevel = 0;
    }
    else if ( currentLevel >= maxLevel ) {
      currentLevel = maxLevel - 1;
    }
    setFaceFill(currentLevel, waitFor);
  }

  setTimeout(updateMood, waitFor);
};

function draw() {
  recordVolume();
  clear();
	TWEEN.update();
  drawFace(currentLevel); 
}
