// This variable will store the WebGL rendering context
var gl;
var uColor;
var rGreen = flatten(vec4 (0,0.72,0.48,1));
var rOrange= flatten(vec4 (1,0.753,0,1));
var rBlack= flatten(vec4 (0,0,0,1));
var rRed= flatten(vec4(1,0,0,1));
var pSize;

function circle(sides)
{
   var vertices = []; // create empty array
   if (sides < 3)
   {
      console.log("function circle: Not enough sides to make a polygon.");
   }
   else
   {
      if (sides > 10000)
      {
         sides = 10000;
         console.log("function circle: Sides limited to 10,000.");
      }
      for (var i = sides; i >= 0; i--)
      {
         vertices.push(vec2(Math.cos(i/sides*2*Math.PI), Math.sin(i/sides*2*Math.PI)));
      }
   }
   return vertices;
}

window.onload = function init() {
  // Set up a WebGL Rendering Context in an HTML5 Canvas
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //  Configure WebGL
  //  eg. - set a clear color
  //      - turn on depth testing
  gl.clearColor(1,1,1,1);
  		
  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);
  
  // Set up data to draw
  //Triangle positions
 
    
  
  //    vec2(),
  var points =
  [
  //u left
vec2(-0.9,0.9),
vec2(-0.8,0.9),
vec2(-0.9,0.8),
vec2(-0.8,0.8),
vec2(-0.9,0.7),
vec2(-0.8,0.7),
vec2(-0.9,0.6),
vec2(-0.8,0.6),
vec2(-0.9,0.5),
vec2(-0.8,0.5),
vec2(-0.9,0.4),
vec2(-0.8,0.4),
// u mid


vec2(-0.8,0.3),
vec2(-0.7,0.4),
vec2(-0.7,0.3),
vec2(-0.6,0.4),
vec2(-0.6,0.3),
vec2(-0.5,0.4),
vec2(-0.5,0.3),


// u right
vec2(-0.4,0.4),
vec2(-0.5,0.5),
vec2(-0.4,0.5),
vec2(-0.5,0.6),
vec2(-0.4,0.6),
vec2(-0.5,0.7),
vec2(-0.4,0.7),
vec2(-0.5,0.8),
vec2(-0.4,0.8),
vec2(-0.5,0.9),
vec2(-0.4,0.9),//30

// o top
vec2(-0.3,0.2),
vec2(-0.2,0.3),
vec2(-0.2,0.2),
vec2(-0.2,0.3),
vec2(-0.1,0.2),
vec2(-0.1,0.3),
vec2(-0.0,0.2),
vec2(-0.0,0.3),
vec2(0.1,0.2),
vec2(0.1,0.3),
vec2(0.2,0.2),

// o right
vec2(0.1,0.1),
	vec2(0.2,0.1),
	vec2(0.1,0),
	vec2(0.2,0),
	vec2(0.1,-0.1),
	vec2(0.2,-0.1),
	vec2(0.1,-0.2),
	vec2(0.2,-0.2),
	vec2(0.1,-0.3),
	
	
// o bottom
	vec2(0.0,-0.2),
	vec2(0.0,-0.3),
	vec2(-0.1,-0.2),
	vec2(-0.1,-0.3),
	vec2(-0.2,-0.2),
	vec2(-0.2,-0.3),
	vec2(-0.3,-0.2),

// o left
	vec2(-0.2,-0.1),
	vec2(-0.3,-0.1),
	vec2(-0.2,0),
	vec2(-0.3,0),
	vec2(-0.2,0.1),
	vec2(-0.3,0.1),
	vec2(-0.2,0.2),
	vec2(-0.3,0.2),
	
// r left
	vec2(0.4,-0.3),
	vec2(0.5,-0.3),
	vec2(0.4,-0.4),
	vec2(0.5,-0.4),
	vec2(0.4,-0.5),
	vec2(0.5,-0.5),
	vec2(0.4,-0.6),
	vec2(0.5,-0.6),
	vec2(0.4,-0.7),
	vec2(0.5,-0.7),
	vec2(0.4,-0.8),
	vec2(0.5,-0.8),
	vec2(0.4,-0.9),
	vec2(0.5,-0.9),
	
// r top
	vec2(0.5,-0.4),
	vec2(0.5,-0.3),
	vec2(0.6,-0.4),
	vec2(0.6,-0.3),
	vec2(0.7,-0.4),
	vec2(0.7,-0.3),
	vec2(0.8,-0.4),
	vec2(0.7,-0.5),
	vec2(0.8,-0.55),
	vec2(0.7,-0.65),
	vec2(0.6,-0.55),
	vec2(0.6,-0.65),
	vec2(0.5,-0.55),
	vec2(0.5,-0.65),
	
// r bottom
	vec2(0.5,-0.6),
	vec2(0.5,-0.7),
	vec2(0.6,-0.7),
	vec2(0.6,-0.8),
	vec2(0.7,-0.8),
	vec2(0.7,-0.9),
	vec2(0.8,-0.9),

//line right	
	vec2(-0.3,0.9),
	vec2(-0.2,0.8),
	vec2(-0.1,0.7),
	vec2(0.0,0.6),
	vec2(0.1,0.5),
	vec2(0.2,0.4),
	vec2(0.3,0.3),
	vec2(0.4,0.2),
	vec2(0.5,0.1),
	vec2(0.6,0.0),
	vec2(0.7,-0.1),
	vec2(0.8,-0.2),
	vec2(0.9,-0.3),
	
//line left
	vec2(-0.9,0.3),
	vec2(-0.8,0.2),
	vec2(-0.7,0.1),
	vec2(-0.6,0.0),
	vec2(-0.5,-0.1),
	vec2(-0.4,-0.2),
	vec2(-0.3,-0.3),
	vec2(-0.2,-0.4),
	vec2(-0.1,-0.5),
	vec2(-0.0,-0.6),
	vec2(0.1,-0.7),
	vec2(0.2,-0.8),
	vec2(0.3,-0.9),
	
//point left large
	vec2(-0.6,-0.1),
	vec2(-0.5,-0.2),
	vec2(-0.4,-0.3),
	vec2(-0.3,-0.4),
	vec2(-0.2,-0.5),
	vec2(-0.1,-0.6),
	
//point left small
	
	vec2(-0.5,-0.3),
	vec2(-0.4,-0.4),
	vec2(-0.3,-0.5),
	
//right thin line
	vec2(0.2,0.5),
	vec2(0.3,0.4),
	vec2(0.4,0.3),
	vec2(0.5,0.2),
	vec2(0.6,0.1),
	
// f top
	
vec2(-0.2,0.2),
vec2(-0.2,0.3),
vec2(-0.1,0.2),
vec2(-0.1,0.3),
vec2(-0.0,0.2),
vec2(-0.0,0.3),
vec2(0.1,0.2),
vec2(0.1,0.3),
vec2(0.2,0.2),
vec2(0.2,0.3),

vec2(-0.2,-0.05),
vec2(-0.2,0.05),
vec2(-0.1,-0.05),
vec2(-0.1,0.05),
vec2(-0.0,-0.05),
vec2(-0.0,0.05),

//f left
vec2(-0.2,-0.3),
//vec2(-0.3,-0.3),
vec2(-0.2,-0.2),
vec2(-0.3,-0.2),
vec2(-0.2,-0.1),
vec2(-0.3,-0.1),
vec2(-0.2,0),
vec2(-0.3,0),
vec2(-0.2,0.1),
vec2(-0.3,0.1),
vec2(-0.2,0.2),
vec2(-0.3,0.2),
vec2(-0.2,0.3),
//vec2(-0.3,0.3),

  ];
  
	

  points = points.concat(circle(8));

  // Load the data into GPU data buffers
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  // Associate shader attributes with corresponding data buffers
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, gl.FALSE, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  // Get addresses of shader uniforms
  uColor = gl.getUniformLocation(program, "uColor");
  pSize = gl.getUniformLocation(program, "pSize");
  // Either draw as part of initialization
  render();

  // Or draw just before the next repaint event
  //requestAnimFrame(render());
};


function render() {
   // clear the screen
   gl.clear(gl.COLOR_BUFFER_BIT);
   // draw
   gl.uniform4fv(uColor, rBlack);
   //gl.enable(gl.CULL_FACE);
   //gl.frontFace(gl.CW);
   //gl.uniform4f(uColor, 1, 0, 1, 1);
   
   gl.uniform1f(pSize,10);
   gl.drawArrays(gl.POINTS, 126, 6);
   gl.uniform1f(pSize,5);
   gl.drawArrays(gl.POINTS, 131, 4);
   gl.uniform4fv(uColor, rGreen);
   gl.drawArrays(gl.TRIANGLE_STRIP, 0,30); 
   gl.uniform4fv(uColor, rRed);
   gl.drawArrays(gl.TRIANGLE_STRIP, 30,35);
   gl.uniform4fv(uColor, rOrange);
   gl.drawArrays(gl.TRIANGLE_STRIP, 65,14);
   gl.drawArrays(gl.TRIANGLE_STRIP, 79,21);//99
   gl.uniform4fv(uColor, rBlack);
   gl.lineWidth(5);
   gl.drawArrays(gl.LINE_STRIP, 100, 13);
   gl.drawArrays(gl.LINE_STRIP, 113, 13);
   gl.lineWidth(15);
   gl.drawArrays(gl.LINE_STRIP, 135, 4);
   
   gl.uniform1f(pSize,8);
   gl.uniform4fv(uColor, rBlack);
   
   gl.drawArrays(gl.TRIANGLE_STRIP, 140,9);
   gl.drawArrays(gl.TRIANGLE_STRIP, 150,6);
   gl.drawArrays(gl.TRIANGLE_STRIP, 156,12);
}












