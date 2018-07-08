const api = pJSDom[0].pJS.fn.modes

var videoInput = document.getElementById('video');
var ctracker = new clm.tracker();

ctracker.init();
ctracker.start(videoInput);

function gumSuccess( stream ) {
  if ("srcObject" in videoInput) {
    videoInput.srcObject = stream;
  } else {
    videoInput.src = (window.URL && window.URL.createObjectURL(stream));
  }

  videoInput.onloadedmetadata = function() {
    videoInput.play();
    setTimeout(positionLoop, 100)
  }
}

function gumFail () {}

if (navigator.mediaDevices) {
  navigator.mediaDevices.getUserMedia({video : true}).then(gumSuccess).catch(gumFail);
} else if (navigator.getUserMedia) {
  navigator.getUserMedia({video : true}, gumSuccess, gumFail);
} else {
  alert("Your browser does not seem to support getUserMedia, using a fallback video instead.");
}

function scale(positions) {
//center point of window
  const cx = window.pJSDom[0].pJS.canvas.w / 2
  const cy = window.pJSDom[0].pJS.canvas.h / 2

  var maxX = positions[0][0];
  var minX = positions[0][0];
  var maxY = positions[0][1];
  var minY = positions[0][1];

  for(var i = 1; i < positions.length; i++){
    if(positions[i][0] > maxX){
      maxX = positions[i][0];
    }
    if(positions[i][0] < minX){
      minX = positions[i][0];
    }
    if(positions[i][1] > maxY){
      maxY = positions[i][1];
    }
    if(positions[i][1] < minY){
      minY = positions[i][1];
    }
  }


//center point of face in video
  const w = (maxX - minX) / 2;
  const h = (maxY - minY) / 2;

//ratios
 const ratioX = cx / w;
 const ratioY = cy / h;

 var _positions = positions.map(item => item.slice());

 for(var i = 0; i < positions.length; i++){
   // if(!foobar)
   _positions[i][0] = (positions[i][0] - minX) * ratioX
   _positions[i][1] = (positions[i][1] - minY) * ratioY
 }

 return _positions
}

// foobar = false
// setTimeout(function(){foobar = true}, 10000)

function repulse(positions, ix) {
  const pJS = pJSDom[0].pJS
  const fpos = scale(positions, ix, 1);

  for(let i =0; i< pJS.particles.array.length; i++) {
    const p = pJS.particles.array[i]

    var dx_mouse = p.x - fpos.x,
      dy_mouse = p.y - fpos.y,
      dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);

    var normVec = {x: dx_mouse / dist_mouse, y: dy_mouse / dist_mouse},
      repulseRadius = pJS.interactivity.modes.repulse.distance,
      velocity = 100,
      repulseFactor = clamp((1 / repulseRadius) * (-1 * Math.pow(dist_mouse / repulseRadius, 2) + 1) * repulseRadius * velocity, 0, 5);

    var pos = {
      x: p.x + normVec.x * repulseFactor,
      y: p.y + normVec.y * repulseFactor
    }

    p.x = pos.x;
    p.y = pos.y;
  }
}

function demoicFace(pJS, positions) {
  pJS.particles.array.splice(pJS.particles.array.length - positions.length, positions.length)
  let _positions = scale(positions)
  for (var p = 0;p < _positions.length;p++) {
    // if(p < 44 || p > 61) {
      let pt = _positions[p];
      api.pushParticles(1, {pos_x: pt[0], pos_y: pt[1]})
    // }
  }

  // for (var p = 44;p < 61;p++) {
  //   repulse(positions, p)
  // }
}

function ghost(pJS, positions) {
  pJS.particles.array.splice(pJS.particles.array.length - positions.length, positions.length);
  scale(positions)
  for (var p = 0;p < positions.length;p++) {
    let pt = positions[p]
    api.pushParticles(1, {pos_x: pt.x, pos_y: pt.y})
  }
}
function positionLoop() {
  var positions = ctracker.getCurrentPosition();
  if (positions) {
    const pJS = pJSDom[0].pJS
    demoicFace(pJS, positions)
    //ghost(pJS, positions)
  }
}

setInterval(positionLoop, 100)
