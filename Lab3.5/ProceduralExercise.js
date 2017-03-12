/*
* ProceduralMesh.js
* An exercise in animating a procedural mesh.
* This code generates points
*
* by Alex Clarke, 2017.
*/


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;

//Data Buffers
var points = [];
var colors = [];
var elements1 = [];
var elements2 = [];
var elementBuffer1, elementBuffer2;
var vertexBuffer, colorBuffer;

//Grid size
var c = 20, r = 20;


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
  generatePoints(c,r,0);
  generateWireElements(c,r);
  generateTriangleStripElements(c,r);

  // Load the data into GPU data buffers and
  // Associate shader attributes with corresponding data buffers
  //***Vertices***
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
  program.vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vPosition );

  //***Colors***
  colorBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferData( gl.ARRAY_BUFFER,  flatten(colors), gl.STATIC_DRAW );
  program.vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer( program.vColor, 4, gl.FLOAT, gl.FALSE, 0, 0 );
  gl.enableVertexAttribArray( program.vColor );


	//***Elements***
	//Only one elements buffer may be active at once
	//It controls order of access to all array buffers
	//Details are specified at draw time rather than with a pointer call
	elementBuffer1 = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elementBuffer1 );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements1), gl.STATIC_DRAW );

	elementBuffer2 = gl.createBuffer();
	gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, elementBuffer2 );
	gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(elements2), gl.STATIC_DRAW );


  // Get addresses of shader uniforms
  program.p = gl.getUniformLocation(program, "p");
  program.mv = gl.getUniformLocation(program, "mv");
  program.zOffset = gl.getUniformLocation(program, "zOffset");
  program.time = gl.getUniformLocation(program, "time");


  //Set up viewport
  gl.viewport(0, 0, canvas.width, canvas.height);

  //Set up projection matrix
  p = perspective(45.0, canvas.clientWidth/canvas.clientHeight, 0.1, 1000.0);
  gl.uniformMatrix4fv(program.p, gl.FALSE, flatten(p));


  requestAnimFrame(render);
};


function generatePoints(width, height, time) {
  var count = 0;
  if (points.length == 0)
  {
    for (var j = height; j >= 0; j--)
    {
      for (var i = 0; i <= width; i++)
      {
        var h = Math.sin((j/height+time) * Math.PI*2)/15 + Math.sin(i/width * Math.PI*3)/20;
        points[count] = (vec4(i/width,j/height,h,1));
        colors[count] = (vec4(1,1,1,1));
        count++;
      }
    }
  }
  else
  {
    for (var j = height; j >= 0; j--)
    {
      for (var i = 0; i <= width; i++)
      {
        var h = Math.sin((j/height+time) * Math.PI*2)/15 + Math.sin(i/width * Math.PI*3)/20;
        points[count][2] = h;
        colors[count] = vec4(h*10-0.5,1-h*10-0.5,1,1);
        count++;
      }
    }
  }

}

function generateWireElements(width, height) {
	for (var j = 0; j < height; j++)
	{
	  //Line across top of row
		for (var i = width; i > 0; i--)
		{
			elements1.push(i+j*(width+1));
		}

		//Zig-zag back
		for (var i = 0; i <= width; i++)
		{
			elements1.push(i+j*(width+1)); //one on current row
			elements1.push(i+(j+1)*(width+1));//one on next row
		}
	}

	//Last line across bottom
	for (var i = width; i > 0; i--)
	{
		elements1.push(i+height*(width+1));
	}
}

function generateTriangleStripElements(width, height) {
  for (var j = 0; j < height; j++)
  {
    for (var i = 0; i <= width; i++)
    {
      elements2.push(i+(j)*(width+1));
      elements2.push(i+(j+1)*(width+1));
    }
    //duplicate last element and go to next point to introduce degenerate (line shaped)
    //triangles on the way to the next row. Preserves point order, and
    //avoids drawing unwanted things.
    if (j < height - 1)
    {
      elements2.push(elements2[elements2.length-1]);
      elements2.push(0+(j+1)*(width+1));
    }
  }
}

//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var roty = 0;
var time = 0;
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


  //Animate the buffer
  generatePoints(c,r,time);
  gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
  gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(points) );
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(colors) );
  time += 0.01;

	gl.uniformMatrix4fv(program.mv, gl.FALSE, flatten(mv));



  //Draw triangles with normal depth
  gl.uniform1f(program.zOffset, 0.0);

  //Switch how you draw your points by binding a new element buffer
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer2);
	gl.drawElements(gl.TRIANGLE_STRIP, elements2.length, gl.UNSIGNED_SHORT, 0);

  //Draw lines a little closer
  gl.uniform1f(program.zOffset, 0.0003);

  //Disabling a vertex attribute array allows it to be used a bit like a uniform
  gl.disableVertexAttribArray( program.vColor );

  //Set a disabled attribute like this
  gl.vertexAttrib4f( program.vColor, 0.0, 0.0, 0.0, 1.0 );

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer1);
	gl.drawElements(gl.LINE_STRIP, elements1.length, gl.UNSIGNED_SHORT, 0);

  //Disabling a vertex attribute array allows it to be used a bit like a uniform
  gl.enableVertexAttribArray( program.vColor );

  requestAnimFrame(render);
}


