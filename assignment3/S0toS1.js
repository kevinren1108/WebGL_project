
var gl;
var Green = vec4 (0,1,0,1);
var Orange= vec4 (1,0.753,0,1);
var Black= vec4 (0,0,0,1);
var Red= vec4(1,0,0,1);
var Pink = vec4(1,0,1,1);
var Blue= vec4(0,0,1,1);
var White= vec4(1,1,1,1);
var DimGray= vec4(0.41,0.41,0.41,1);
var uColor;
var urgl;
var xChange = 0;
//Define points for
var cubeVerts = [
	[ 0.5, 0.5, 0.5, 1], //0
	[ 0.5, 0.5,-0.5, 1], //1
	[ 0.5,-0.5, 0.5, 1], //2
	[ 0.5,-0.5,-0.5, 1], //3
	[-0.5, 0.5, 0.5, 1], //4
	[-0.5, 0.5,-0.5, 1], //5
	[-0.5,-0.5, 0.5, 1], //6
	[-0.5,-0.5,-0.5, 1], //7
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
points.push([ 4.0, 0.0, 0.0, 1.0]); //x axis is green
points.push([-4.0, 0.0, 0.0, 1.0]);
points.push([ 0.0, 4.0, 0.0, 1.0]); //y axis is red
points.push([ 0.0,-4.0, 0.0, 1.0]); 
points.push([ 0.0, 0.0, 4.0, 1.0]); //z axis is blue
points.push([ 0.0, 0.0,-4.0, 1.0]);

var vertexBuffer;
var program;

function bindBuffersToShader()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program.vPosition );   
    
}

//Set up colors array
//-------------
//vertex colour
//-------------
/*	
var red = 		 [1.0, 0.0, 0.0, 1.0];
var green = 	 [0.0, 1.0, 0.0, 1.0];
var blue = 		 [0.0, 0.0, 1.0, 1.0];
var lightred =   [1.0, 0.5, 0.5, 1.0];
var lightgreen = [0.5, 1.0, 0.5, 1.0];
var lightblue =  [0.5, 0.5, 1.0, 1.0];
var white = 	 [1.0, 1.0, 1.0, 1.0];


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
*/

//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;


//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------
function bindBuffersToShader()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program.vPosition );
}
window.onload = function init() {
  // Set up a WebGL Rendering Context in an HTML5 Canvas
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) 
  {
    alert("WebGL isn't available");
  }

  gl.clearColor(0.0, 0.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

 
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
  program.vPosition = gl.getAttribLocation(program, "vPosition");
  
    bindBuffersToShader();
 
  //***Colors***
  /*var colorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors), gl.STATIC_DRAW );
  program.vColor = gl.getAttribLocation(program, "vColor"); 
  gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vColor );*/
  

  
  // Get addresses of shader uniforms
  projLoc = gl.getUniformLocation(program, "p");
  mvLoc = gl.getUniformLocation(program, "mv");
  
  
  //Set up viewport
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  //Set up projection matrix
  p = perspective(45.0, 1.0, 0.1, 100.0);
  
  //p = ortho(-4,4,-4,4,2,50);
  
  gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(p));
  
  uColor = gl.getUniformLocation(program, "uColor");

  urgl = new uofrGraphics();
  urgl.connectShader(program, "vPosition");
  requestAnimFrame(render);
  
};

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var ry= 5;
var r = 0;
function render() 
{
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
	//Set initial view
	var eye = vec3(0.0, ry, 6.0);
	var at =  vec3(0.0, 0.75, 0.0);
	var up =  vec3(0.0, 1.0, 0.0);
	
	mv = lookAt(eye,at,up);
	mv = mult(mv, rotateY(r));
    bindBuffersToShader();  
    
	var matStack = [];
	matStack.push(mv);		
	
	matStack.push(mv);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.uniform4fv(uColor, Green);
	gl.drawArrays(gl.LINES, axesStart, 2);
	gl.uniform4fv(uColor, Red);
	gl.drawArrays(gl.LINES, axesStart+2, 2);		
	gl.uniform4fv(uColor, Blue);
	gl.drawArrays(gl.LINES, axesStart+4, 2);	
	
	//floor
	matStack.push(mv);	
	mv = mult(mv, scale(10, 0, 10));
	gl.uniform4fv(uColor, DimGray);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
	mv = matStack.pop();	
		
	//b1	
	matStack.push(mv);	
	mv = mult(mv, translate(1.5,1.5,0));
	mv = mult(mv, scale(1, 3, 1));
	gl.uniform4fv(uColor, Orange);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
	mv = matStack.pop();	
			
	//b2
	matStack.push(mv);	
	mv = mult(mv, translate(-1.5,0.75,0));
	mv = mult(mv, scale(1, 1.5, 1));
	gl.uniform4fv(uColor, Pink);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
	mv = matStack.pop();	
	
	//b3
	matStack.push(mv);	
	mv = mult(mv, translate(0,0.5,1.5));
	mv = mult(mv, scale(2, 1, 1));
	gl.uniform4fv(uColor, Red);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
	mv = matStack.pop();	
		
	//b4
	matStack.push(mv);	
	mv = mult(mv, translate(0,0.5,-1.5));
	mv = mult(mv, scale(2, 1, 1));
	gl.uniform4fv(uColor, White);
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
	mv = matStack.pop();	
		
	//sphere	
	matStack.push(mv);
	mv = mult(mv, translate(0,1,0));
    gl.uniform4fv(uColor, Black);
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
    urgl.drawSolidSphere(1,50,50);
	mv = matStack.pop();
	
	mv = matStack.pop();
	mv = matStack.pop();
	
	if(r<360)
	{
		r +=1;
	}
	else
	{
		r =0;
	}
	
	if(ry > 0.014 )
	{
		ry -= 0.0138888;
	}
	else
	{
		ry = 5;
	}
		
	requestAnimFrame(render);
}
