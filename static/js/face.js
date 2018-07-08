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

function scale(positions, ix, scale) {

  const cx = window.pJSDom[0].pJS.canvas.w / 2
  const cy = window.pJSDom[0].pJS.canvas.h / 2

  const w = (positions[13][0] - positions[1][0]) / 2
  const h = (positions[13][1] - positions[1][1]) / 2

  const xs = 10//cx / w
  const xy = 10//cy / h

  //console.log(cx,w, 'x', cy,h, '|', xs,xy)

  const x = (((positions[ix][0] - positions[62][0]) * xs) * scale + cx)
  const y = (((positions[ix][1] - positions[62][1]) * xy) * scale + cy)

  return {x, y}
}

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
  pJS.particles.array.splice(280)
  for (var p = 0;p < positions.length;p++) {
    if(p < 44 || p > 61) {
      let pt = scale(positions, p, 2);
      api.pushParticles(1, {pos_x: pt.x, pos_y: pt.y})
    }
  }

  for (var p = 44;p < 61;p++) {
    repulse(positions, p)
  }
}

function ghost(pJS, positions) {
  pJS.particles.array.splice(pJS.particles.array.length - positions.length, positions.length);
  for (var p = 0;p < positions.length;p++) {
    let pt = scale(positions, p, 2);
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