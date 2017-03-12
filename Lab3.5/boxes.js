/*
* boxes.cpp
* An exercise in positioning simple boxes using projection/modelview
* matrices and standard transforms.
*
* Adapted for WebGL by Alex Clarke, 2016.
*/


//----------------------------------------------------------------------------
// Variable Setup 
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;
var rotateAngle = 0;

/*var Green = flatten(vec4 (0,1,0,0));
var Orange= flatten(vec4 (1,0.753,0,1));
var Black= flatten(vec4 (0,0,0,1));
var Red= flatten(vec4(1,0,0,1));
var Pink = flatten(vec4(1,0,1,1));
var Blue= flatten(vec4(0,0,1,1));
var White= flatten(vec4(1,1,1,1));
var switchColor = [Green,Orange,Red,Pink,Blue,Green,Orange,Red];
var ucolor;*/

//Define points for
var cubeVerts = [
	[ 0, 1, 0, 1], //0 top
	[ 1, 0, 0, 1], //1 left
	[-1, 0, 0, 1], //2 right
	[ 0, 0, 1, 1], //3 front
	[ 0, 0,-1, 1], //4 back
	[ 0,-1, 0, 1], //5 botten
];

var wireCubeStart = 0;
var wireCubeVertices = 24;


var axesStart = 24;
var axesVertices = 6;

//Look up patterns from cubeVerts for different primitive types
var cubeLookups = [
//Wire Cube - use LINE_STRIP, starts at 0, 30 vertices
	0,2,3,
	0,1,3,
	0,1,4,
	0,4,2,
	5,4,2,
	5,2,3,
	5,3,1,
	5,1,4,
];

//load points into points array - runs once as page loads.
var points = [];
for (var i =0; i < cubeLookups.length; i++)
{
	points.push(cubeVerts[cubeLookups[i]]);
}
points.push([ 2.0, 0.0, 0.0, 1.0]); //x axis is green
points.push([-2.0, 0.0, 0.0, 1.0]);
points.push([ 0.0, 2.0, 0.0, 1.0]); //y axis is red
points.push([ 0.0,-2.0, 0.0, 1.0]); 
points.push([ 0.0, 0.0, 2.0, 1.0]); //z axis is blue
points.push([ 0.0, 0.0,-2.0, 1.0]);	
var red = 		 [1.0, 0.0, 0.0, 1.0];
var green = 	 [0.0, 1.0, 0.0, 1.0];
var blue = 		 [0.0, 0.0, 1.0, 1.0];
var lightred =   [1.0, 0.5, 0.5, 1.0];
var lightgreen = [0.5, 1.0, 0.5, 1.0];
var lightblue =  [0.5, 0.5, 1.0, 1.0];
var Yellow = 	 [1.0, 1.0, 0.0, 1.0];
var White =      [1.0, 1.0, 1.0, 1.0];
//Set up colors array
var colors = [
	//Colors for Solid Cube
	red, red, red, 
	White, White, White, 
	blue, blue, blue,	
	Yellow, Yellow, Yellow, 
	White, White, White, 
	blue, blue, blue,
	Yellow, Yellow, Yellow, 	
	red, red, red,
	//Colors for axes
	
	red, red,     //y
	green, green, //x
	blue, blue,   //z
];

//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;


//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------

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
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Set up data to draw
  // Done globally in this program...
  
  // Load the data into GPU data buffers and
  // Associate shader attributes with corresponding data buffers
  //***Vertices***
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
  program.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vPosition );
 
  //***Colors***
  var colorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors), gl.STATIC_DRAW );
  program.vColor = gl.getAttribLocation(program, "vColor");
  //uColor = gl.getUniformLocation(program, "uColor");
  gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vColor );

  // Get addresses of shader uniforms
  projLoc = gl.getUniformLocation(program, "p");
  mvLoc = gl.getUniformLocation(program, "mv");

  //Set up viewport
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  //Set up projection matrix
  p = perspective(30.0, 1.0, 0.1, 100.0);
  
  //p = ortho(-4,4,-4,4,2,13);
  
  gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(p));

 
  requestAnimFrame(render);
};

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
function render() 
{
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
	//Set initial view
	var eye = vec3(0.0, 0.0, 10.0);
	var at =  vec3(0.0, 0.0, 0.0);
	var up =  vec3(0.0, 1.0, 0.0);

	//mv = lookAt(eye,at,up);
	var matStack = [];
	matStack.push(mv);

	mv = mult(mv, translate(0,0,-5));
	mv = mult(mv, rotateX(20));
	mv = mult(mv, rotateY(rotateAngle));			
	
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.LINES, axesStart, axesVertices);

	
	matStack.push(mv);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.TRIANGLES, wireCubeStart , wireCubeVertices);
	
	mv = matStack.pop();		
	mv = matStack.pop();
	
	rotateAngle++;
	
	requestAnimFrame(render);
}

