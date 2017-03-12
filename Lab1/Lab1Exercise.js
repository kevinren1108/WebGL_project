// This variable will store the WebGL rendering context
var gl;

//WebGL State Management
////////////////////////
var mvIndex; //Shader Positioning Input
var projIndex; //Shader Projection Input
var mv; //Local Positioning Matrix
var p; //Local Projection Matrix

//Model Control Variables
/////////////////////////
var colors = 
{
  'red': new vec4(1, 0, 0, 1),
  'blue': new vec4(0, 0, 1, 1),
  'green': new vec4(0, 1, 0, 1),
  'yellow': new vec4(1, 1, 0, 1),
  'cyan': new vec4(0, 1, 1, 1),
  'magenta': new vec4(1, 0, 1, 1)
};
var objectColor = colors['red'];
var rotAngle = 0;
var rotChange = 0.5;

window.onload = function init() 
{
   // Set up a WebGL Rendering Context in an HTML5 Canvas
  var canvas = document.getElementById("gl-canvas");
  
  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) 
  {
    alert("WebGL isn't available");
  }

  //  Configure WebGL
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Get locations of transformation matrices from shader
  mvIndex = gl.getUniformLocation(program, "mv");
  projIndex = gl.getUniformLocation(program, "p");

  // Send a perspective transformation to the shader
  var p = perspective(50.0, canvas.width/ canvas.height, 0.5, 20.0);
  gl.uniformMatrix4fv(projIndex, gl.FALSE, flatten(p));

  // Get locations of lighting uniforms from shader
  var uLightPosition = gl.getUniformLocation(program, "lightPosition");

  // Set default light direction in shader.
  gl.uniform4f(uLightPosition, 0.0, 0.0, 1.0, 0.0);

  // Configure uofrGraphics object
  urgl = new uofrGraphics();
  urgl.connectShader(program, "vPosition", "vNormal", "vColor");
  
  // Begin an animation sequence
  requestAnimFrame(render);
  
  // You can't work with HTML elements until the page is loaded,
  // So init is a good place to set up event listeners
  setupEventListeners();
};


function render() 
{
  // Clear the canvas with the clear color instead of plain white,
  // and also clear the depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw previous model state
  // Notice we modularized the work a bit...
  PreRenderScene();
  RenderStockScene();
  RenderScene();

  // Update the model and request a new animation frame
  rotAngle += rotChange;
  requestAnimFrame(render);
}
// Use this to perform view transforms or other tasks
// that will affect both stock scene and detail scene
function PreRenderScene() 
{
  // select a default viewing transformation
  // of a 20 degree rotation about the X axis
  // then a -5 unit transformation along Z
  mv = mat4();
  mv = mult(mv, translate(0.0, 0.0, -5.0));
  mv = mult(mv, rotate(20.0, 1, 0, 0));

  //Allow variable controlled rotation around local y axis.
  mv = mult(mv, rotate(rotAngle, 0, 1, 0));
}

// Function: RenderStockScene
// Purpose:
//     Draw a stock scene that looks like a
//     black and white checkerboard
function RenderStockScene() 
{
  var delta = 0.5;

  // define four vertices that make up a square.
  var v1 = vec4(0.0, 0.0, 0.0, 1.0);
  var v2 = vec4(0.0, 0.0, delta, 1.0);
  var v3 = vec4(delta, 0.0, delta, 1.0);
  var v4 = vec4(delta, 0.0, 0.0, 1.0);


  var color = 0;

  // define the two colors
  var color1 = vec4(0.9, 0.9, 0.9, 1);
  var color2 = vec4(0.05, 0.05, 0.05, 1);

  //Make a checkerboard
  var placementX = mv;
  var placementZ;
  placementX = mult(placementX, translate(-10.0 * delta, 0.0, -10.0 * delta));
  for (var x = -10; x <= 10; x++) {
    placementZ = placementX;
    for (var z = -10; z <= 10; z++) {
      urgl.setDrawColour((color++) % 2 ? color1 : color2);
      gl.uniformMatrix4fv(mvIndex, gl.FALSE, flatten(placementZ));
      urgl.drawQuad(v1, v2, v3, v4);
      placementZ = mult(placementZ, translate(0.0, 0.0, delta));
    }
    placementX = mult(placementX, translate(delta, 0.0, 0.0));

  }
}

// Function: RenderScene
// Purpose:
//     Your playground. Code additional scene details here.
function RenderScene() 
{
  // draw a red sphere inside a light blue cube

  // Set the drawing color to red
  urgl.setDrawColour(objectColor);

  // Move the "drawing space" up by the sphere's radius
  // so the sphere is on top of the checkerboard
  // mv is a transformation matrix. It accumulates transformations through
  // right side matrix multiplication.
  mv = mult(mv, translate(0.0, 1.0, 0.0));

  // Rotate drawing space by 90 degrees around X so the sphere's poles
  // are vertical. Arguments are angle in degrees,
  // and a three part rotation axis with x, y and z components.
  mv = mult(mv, rotate(90.0, 1, 0, 0));

  //Send the transformation matrix to the shader
  gl.uniformMatrix4fv(mvIndex, gl.FALSE, flatten(mv));

  // Draw a sphere.
  // Arguments are Radius, Slices, Stacks
  // Sphere is centered around current origin.
  urgl.drawSolidSphere(0.5, 20, 20);


  // when we rotated the sphere earlier, we rotated drawing space
  // and created a new "local frame"
  // to move the cube up or down we now have to refer to the z-axis
  mv = mult(mv, translate(0.0, 0.0, 0.75));

  //Send the transformation matrix to the shader
  gl.uniformMatrix4fv(mvIndex, gl.FALSE, flatten(mv));

  // set the drawing color to light blue
  // arguments to vec4 are red, green, blue and alpha (transparancy)
  urgl.setDrawColour(vec4(0.5, 0.5, 1.0, 1.0));

  // Draw the cube.
  // Argument refers to length of side of cube.
  // Cube is centered around current origin.
  urgl.drawSolidCube(0.5);
  
  mv = mult(mv, translate(1.33, 0.0,0.1));
  gl.uniformMatrix4fv(mvIndex, gl.FALSE, flatten(mv));
	urgl.drawSolidCube(0.33);
  mv = mult(mv, translate(0, 0.0,-0.33));
  gl.uniformMatrix4fv(mvIndex, gl.FALSE, flatten(mv));
  urgl.drawSolidCube(0.33);
  //not able to use urgl.drawQuad function. lol!
 
}

function setupEventListeners()
{
  //Request an HTML element
  var m = document.getElementById("colorMenu");

  //Setup a listener - notice we are defining a function from inside a function
  //The textbook recommends onclick, but I find that onchange works better
  m.onchange = function(event) 
  {     
       //acquire the menu entry number
       var index = m.selectedIndex;
 
       //learn the value of the selected option. This need not match the text...
       var colorName = m.options[index].value;
       
       //change the object color by looking up the value in our associate array
       objectColor = colors[colorName];
	   
  }
  
	document.getElementById("Direction").onclick = function (event) 
	{
        rotChange = -rotChange;
    };
	
	document.getElementById("slider").onchange = function(event) {
        rotChange = 1 - event.target.value;
    };
	
}