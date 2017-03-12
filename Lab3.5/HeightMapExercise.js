/*
* HeightMapExercise.cpp
* An exercise in using indexed arrays and triangle strips.
*
* Adapted for WebGL by Alex Clarke, 2016.
*/


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;
var elements1;


//Data Buffers
var points = [];
var colors = [];
var trianglesStart, trianglesVertices;
var linesStart, linesVertices;


//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;

var program;
var canvas

//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------
window.onload = function init() {
  // Set up a WebGL Rendering Context in an HTML5 Canvas
   canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //  Configure WebGL
  //  eg. - set a clear color
  //      - turn on depth testing
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Set up data to draw
  var data = getImageData("GLimage");
  var r = data.height-1, c = data.width-1;
  generatePoints(c,r, data);
  var lines = generateLineStrip(c,r);
  var triangles = generateTriangles(c,r);

  linesStart = 0;
  linesVertices = lines.length;
  //points = points.concat(lines);

  trianglesStart = 0;
  trianglesVertices = triangles.length;
  //points = points.concat(triangles);

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

  elements1 = gl.createBuffer();
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elements1 );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements1), gl.STATIC_DRAW );
  
  // Get addresses of shader uniforms
  program.p = gl.getUniformLocation(program, "p");
  program.mv = gl.getUniformLocation(program, "mv");
  program.zOffset = gl.getUniformLocation(program, "zOffset");


  //Set up viewport
  gl.viewport(0, 0, canvas.width, canvas.height);

  //Set up projection matrix
  p = perspective(45.0, canvas.clientWidth/canvas.clientHeight, 0.1, 1000.0);
  gl.uniformMatrix4fv(program.p, gl.FALSE, flatten(p));


  requestAnimFrame(render);
};


//----------------------------------------------------------------------------
// Gets RGBA data, width and height from <img> tag
// in an ImageData object.
//----------------------------------------------------------------------------
function getImageData(name)
{
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var img = document.getElementById(name);
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0 );
  var myData = context.getImageData(0, 0, img.width, img.height);
  return myData;
}

//----------------------------------------------------------------------------
// Uses image data for heights
//----------------------------------------------------------------------------
function generatePoints(width, height, data) {
	for (var j = 0; j <= height; j++)
	{
		for (var i = 0; i <= width; i++)
		{
		  //Each line in the image is 4 elements wide (RGBA)
		  h = data.data[i*4+j*(width+1)*4]/2550; //The 2550 is a height scaling factor.
			points.push(vec4(i/width,1-j/height,h,1));
			colors.push(vec4(1,1,1,1));
		}
	}
}

//----------------------------------------------------------------------------
// Generates line strips that outline the triangles
//----------------------------------------------------------------------------
function generateLineStrip(width, height) {
  var data = [];
	for (var j = 0; j < height; j++)
	{
	  //Line across bottom of row
		for (var i = width; i > 0; i--)
		{
			data.push(i + j*(width+1));
		}

		//Zig-zag back
		for (var i = 0; i <= width; i++)
		{
			data.push(i + j*(width+1));      //one on current row
			data.push(i + (j+1)*(width+1));  //one on next row
		}
	}

	//Last line across top
	for (var i = width; i > 0; i--)
	{
		data.push(points[i+height*(width+1)]);
	}
	return data;
}

//----------------------------------------------------------------------------
// Generates triangle strips for rectangular patch
//----------------------------------------------------------------------------
function generateTriangles(width, height) {
  var data = [];
  for (var j = 0; j < height; j++)
  {
    for (var i = 0; i <= width; i++)
    {
      data.push(i + j*(width+1));      //current pos
      data.push(i + (j+1)*(width+1));  //next row
    }
    //data.push(i + (j+1)*(width+1));  //next row
    data.push(0 + (j+1)*(width+1));
    
  }
  return data;
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var roty = 0;
function render() {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

  //Set initial view
  var eye = vec3(0.0, 0.0, 10);
  var at =  vec3(0.0, 0.0, 0.0);
  var up =  vec3(0.0, 1.0, 0.0);

	mv = lookAt(eye,at,up);

	mv = mult(mv, rotateX(30));
	mv = mult(mv, rotateY(roty));
	roty+= 0.5;
	mv = mult(mv, rotateX(-90));
	mv = mult(mv, translate(-3, -3, 0));
	mv = mult(mv, scale(6, 6, 6));

	gl.uniformMatrix4fv(program.mv, gl.FALSE, flatten(mv));

  //Disabling a vertex attribute array allows it to be used a bit like a uniform
  gl.disableVertexAttribArray( program.vColor );

  //Set a disabled attribute like this
  gl.vertexAttrib4f( program.vColor, 0.5, 0.5, 0.5, 1.0 );

  //Draw triangles with normal depth
  gl.uniform1f(program.zOffset, 0.0);

	
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements1);
  gl.drawArrays(gl.TRIANGLE_STRIP, trianglesStart,trianglesVertices);
  //gl.drawElements(gl.TRIANGLE_STRIP, trianglesVertices, gl.UNSIGNED_SHORT, trianglesStart);

  //Draw lines a little closer
  gl.uniform1f(program.zOffset, 0.0001);
  gl.vertexAttrib4f( program.vColor, 0.0, 0.0, 0.0, 1.0 );

  requestAnimFrame(render);
}


