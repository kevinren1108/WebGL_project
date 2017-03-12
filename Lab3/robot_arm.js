/*
* Copyright (c) 1993-1997, Silicon Graphics, Inc.
* ALL RIGHTS RESERVED 
* Permission to use, copy, modify, and distribute this software for 
* any purpose and without fee is hereby granted, provided that the above
* copyright notice appear in all copies and that both the copyright notice
* and this permission notice appear in supporting documentation, and that 
* the name of Silicon Graphics, Inc. not be used in advertising
* or publicity pertaining to distribution of the software without specific,
* written prior permission. 
*
* THE MATERIAL EMBODIED ON THIS SOFTWARE IS PROVIDED TO YOU "AS-IS"
* AND WITHOUT WARRANTY OF ANY KIND, EXPRESS, IMPLIED OR OTHERWISE,
* INCLUDING WITHOUT LIMITATION, ANY WARRANTY OF MERCHANTABILITY OR
* FITNESS FOR A PARTICULAR PURPOSE.  IN NO EVENT SHALL SILICON
* GRAPHICS, INC.  BE LIABLE TO YOU OR ANYONE ELSE FOR ANY DIRECT,
* SPECIAL, INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY
* KIND, OR ANY DAMAGES WHATSOEVER, INCLUDING WITHOUT LIMITATION,
* LOSS OF PROFIT, LOSS OF USE, SAVINGS OR REVENUE, OR THE CLAIMS OF
* THIRD PARTIES, WHETHER OR NOT SILICON GRAPHICS, INC.  HAS BEEN
* ADVISED OF THE POSSIBILITY OF SUCH LOSS, HOWEVER CAUSED AND ON
* ANY THEORY OF LIABILITY, ARISING OUT OF OR IN CONNECTION WITH THE
* POSSESSION, USE OR PERFORMANCE OF THIS SOFTWARE.
* 
* US Government Users Restricted Rights 
* Use, duplication, or disclosure by the Government is subject to
* restrictions set forth in FAR 52.227.19(c)(2) or subparagraph
* (c)(1)(ii) of the Rights in Technical Data and Computer Software
* clause at DFARS 252.227-7013 and/or in similar or successor
* clauses in the FAR or the DOD or NASA FAR Supplement.
* Unpublished-- rights reserved under the copyright laws of the
* United States.  Contractor/manufacturer is Silicon Graphics,
* Inc., 2011 N.  Shoreline Blvd., Mountain View, CA 94039-7311.
*
* OpenGL(R) is a registered trademark of Silicon Graphics, Inc.
*/

/*
* robot.cpp
* This program shows how to composite modeling transformations
* to draw translated and rotated hierarchical models.
* Interaction:  pressing the s and e keys (shoulder and elbow)
* alters the rotation of the robot arm.
*
* Adapted for OpenGL 3.2 Core Profile by Alex Clarke, 2012, with
* libraries provided with Interactive Computer Graphics 6th Ed. 
* by Dr. Edward Angel and Dave Shreiner
*
* Adapted from the above for WebGL by Alex Clarke, 2016, with
* libraries provided with Interactive Computer Graphics 7th Ed.
* by Dr. Edward Angel and Dave Shreiner
*/


//----------------------------------------------------------------------------
// Variable Setup 
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;

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
//Solid Cube - use TRIANGLES, starts at 0, 36 vertices
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


//Model state variables
var shoulder = 0, elbow = 0;



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
  gl.enable(gl.CULL_FACE);

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
  gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vColor );

  // Get addresses of shader uniforms
  projLoc = gl.getUniformLocation(program, "p");
  mvLoc = gl.getUniformLocation(program, "mv");

  //Set up projection matrix
  p = ortho(-3.0, 3.0,-3.0, 3.0, 1.0, 20.0);
  //p = perspective(45.0, canvas.clientWidth/canvas.clientHeight, 0.1, 100.0);
  gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(p));

  //Set initial view
  var eye = vec3(0.0, 1.0, 10.0);
  var at =  vec3(0.0, 0.0, 0.0);
  var up =  vec3(0.0, 1.0, 0.0);

  mv = lookAt(eye,at,up);
 
  //Animate - draw continuously
  requestAnimFrame(animate);
};



//----------------------------------------------------------------------------
// Animation and Rendering Event Functions
//----------------------------------------------------------------------------

//animate()
//updates and displays the model based on elapsed time
//sets up another animation event as soon as possible
var prevTime = 0;
function animate()
{
    requestAnimFrame(animate);
    
    //Do time corrected animation
    var curTime = new Date().getTime();
    if (prevTime != 0)
    {
       //Calculate elapsed time in secondss
       var timePassed = (curTime - prevTime)/1000.0;
       //Update any active animations 
       handleKeys(timePassed);
    }
    prevTime = curTime;
    
    //Draw
    render();
}

function render() {
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	
	var type = gl.TRIANGLES;
	var start = solidCubeStart;
	var num  = solidCubeVertices;
	
	var matStack = [];
	
	//Save view transform
	matStack.push(mv);
	
		//Position Shoulder Joint
		mv = mult(mv,translate(-2.0, 0.0, 0.0));
		//Shoulder Joint
		mv = mult(mv,rotateZ(shoulder));
		//Position Upper Arm Cube
		mv = mult(mv,translate(1.0, 0.0, 0.0));
		//Scale and Draw Upper Arm
		matStack.push(mv);
			mv = mult(mv,scale(2.0, 0.4, 1.0));
			gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
			gl.drawArrays(type, start, num);
		//Undo Scale
		mv = matStack.pop();

	
		//Position Elbow Joint
		mv = mult(mv, translate(1.0, 0.0, 0.0));
		//Elbow Joint
		mv = mult(mv, rotateZ(elbow));
		//Position Forearm Cube
		mv = mult(mv, translate(1, 0.0, 0.0));
		//Scale and Draw Forearm
		matStack.push(mv);
			mv = mult(mv, scale(2.0, 0.4, 1.0));
			gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(mv));
			gl.drawArrays(type, start, num);
		//Undo Scale
		mv = matStack.pop();

    //Restore mv to initial state
	mv = matStack.pop();
	
}



//----------------------------------------------------------------------------
// Keyboard Event Functions
//----------------------------------------------------------------------------

//This array will hold the pressed or unpressed state of every key
var currentlyPressedKeys = [];

//Store current state of shift key
var shift;

document.onkeydown = function handleKeyDown(event) {
   currentlyPressedKeys[event.keyCode] = true;
   shift = event.shiftKey;

   //Get unshifted key character
   var c = event.keyCode;
   var key = String.fromCharCode(c);

	//Place key down detection code here
}

document.onkeyup = function handleKeyUp(event) {
   currentlyPressedKeys[event.keyCode] = false;
   shift = event.shiftKey;
   
   //Get unshifted key character
   var c = event.keyCode;
   var key = String.fromCharCode(c);

	//Place key up detection code here
}

//isPressed(c)
//Utility function to lookup whether a key is pressed
//Only works with unshifted key symbol
// ie: use "E" not "e"
//     use "5" not "%"
function isPressed(c)
{
   var code = c.charCodeAt(0);
   return currentlyPressedKeys[code];
}

//handleKeys(timePassed)
//Continuously called from animate to cause model updates based on
//any keys currently being held down
function handleKeys(timePassed) 
{
   //Place continuous key actions here - anything that should continue while a key is
   //held

   //Calculate how much to move based on time since last update
   var s = 60.0; //degrees per second
   var d = s*timePassed; //degrees to rotate
   
   //Shoulder Updates
   if (!shift && isPressed("S")) 
   {

      if (shoulder < 90) shoulder = (shoulder + d);
      if (shoulder > 90)  shoulder = 90;
   }
   if (shift && isPressed("S")) 
   {
      if (shoulder > -90) shoulder = (shoulder - d);
      if (shoulder < -90)  shoulder = -90;
      if (shoulder < -90)  shoulder = -90;
   }
   
   //Elbow Updates
   if (!shift && isPressed("E")) 
   {
      if (elbow < 144) elbow = (elbow + d);
      if (elbow > 144)  elbow = 144;
   }
   if (shift && isPressed("E")) 
   {
      if (elbow > 0) elbow = (elbow - d);
      if (elbow < 0)  elbow = 0;
   }
}
