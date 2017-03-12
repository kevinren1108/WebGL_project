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
var Green = flatten(vec4 (0,1,0,1));
var Orange= flatten(vec4 (1,0.753,0,1));
var Black= flatten(vec4 (0,0,0,1));
var Red= flatten(vec4(1,0,0,1));
var Pink = flatten(vec4(1,0,1,1));
var Blue= flatten(vec4(0,0,1,1));
var White= flatten(vec4(1,1,1,1));
var ucolor;

//Define points for
var cubeVerts = [
	[ 1.5, 0.5, 0.5, 1], //0
	[ 1.5, 0.5,-0.5, 1], //1
	[ 1.5,-0.5, 0.5, 1], //2
	[ 1.5,-0.5,-0.5, 1], //3
	[-1.5, 0.5, 0.5, 1], //4
	[-1.5, 0.5,-0.5, 1], //5
	[-1.5,-0.5, 0.5, 1], //6
	[-1.5,-0.5,-0.5, 1], //7
];

var wireCubeStart = 0;
var wireCubeVertices = 30;

var solidCubeStart = 30;
var solidCubeVertices = 36;

var axesStart = 66;
var axesVertices = 6;

//Look up patterns from cubeVerts for different primitive types
var cubeLookups = [
//Wire Cube - use LINE_STRIP, starts at 0, 30 vertices
	0,4,6,2,0, //front
	1,0,2,3,1, //right
	5,1,3,7,5, //back
	4,5,7,6,4, //right
	4,0,1,5,4, //top
	6,7,3,2,6, //bottom
//Solid Cube - use TRIANGLES, starts at 30, 36 vertices
	0,4,6, //front
	0,6,2,
	1,0,2, //right
	1,2,3, 
	5,1,3, //back
	5,3,7,
	4,5,7, //left
	4,7,6,
	4,0,1, //top
	4,1,5,
	6,7,3, //bottom
	6,3,2,
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
var white = 	 [1.0, 1.0, 1.0, 1.0];

//Set up colors array
var colors = [
    //Colors for Wire Cube
	
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,
	white, white, white, white, white,

	//Colors for Solid Cube
	lightblue, lightblue, lightblue, lightblue, lightblue, lightblue,
	lightgreen, lightgreen, lightgreen, lightgreen, lightgreen, lightgreen,
	lightred, lightred, lightred, lightred, lightred, lightred,
	blue, blue, blue, blue, blue, blue,
	red, red, red, red, red, red,
	green, green, green, green, green, green,
	


	//Colors for axes
	green, green, //x
	red, red,     //y
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
  uColor = gl.getUniformLocation(program, "uColor");
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
  p = perspective(45.0, 1.0, 0.1, 100.0);
  
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

	
			
	
	//mv = mult( rotateX(30),mv);
	//mv = mult( rotateY(30),mv);	
	//mv = mult( translate(0,0,-10),mv);
    
	
	mv = mult(mv, translate(0,0,-10));
	mv = mult(mv, rotateX(30));
	mv = mult(mv, rotateY(30));	
	
	
	//If you wanted to leave your x and y axes unchanged, 
	//but still see the top of the boxes, like this: 					
	//mv = mult(mv, rotateX(-90));		
	//mv = mult(mv, translate(0,0,-10));	
	
	
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.uniform4fv(uColor, Green);
	gl.drawArrays(gl.LINES, axesStart, 2);
	gl.uniform4fv(uColor, Red);
	gl.drawArrays(gl.LINES, axesStart+2, 2);		
	gl.uniform4fv(uColor, Blue);
	gl.drawArrays(gl.LINES, axesStart+4, 2);	
	
	//If you wanted to leave your x and y axes unchanged, 
	//but still see the top of the boxes, like this: 				
	//mv = mult(mv, rotateX(-90));
	
	mv = mult(mv, translate(1,0,0));
	matStack.push(mv);
	mv = mult(mv, scale(1, 1, 1));
	gl.uniform4fv(uColor, White);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.LINE_STRIP, wireCubeStart, wireCubeVertices);
	mv = matStack.pop();	
		
	matStack.push(mv);
	mv = mult(mv, translate(0,1,0));
	mv = mult(mv, rotateY(45));
	gl.uniform4fv(uColor, Pink);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.LINE_STRIP, wireCubeStart, wireCubeVertices);
	mv = matStack.pop();
		
	
	
	mv = matStack.pop();
	requestAnimFrame(render);
	//v = T * R * T * (S * M)
}

