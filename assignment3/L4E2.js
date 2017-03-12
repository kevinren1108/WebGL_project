/*
 * L4E2.js
 * An exercise in positioning lights and setting material and light colours.
 *
 * Adapted for WebGL by Alex Clarke, 2016.
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


var solidCubeStart = 0;
var solidCubeVertices = 36;

var wireCubeStart = 36;
var wireCubeVertices = 30;

var axesStart = 66;
var axesVertices = 6;

//Look up patterns from cubeVerts for different primitive types
var cubeLookups = [
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
                   //Wire Cube - use LINE_STRIP, starts at 36, 30 vertices
                   0,4,6,2,0, //front
                   1,0,2,3,1, //right
                   5,1,3,7,5, //back
                   4,5,7,6,4, //left
                   4,0,1,5,4, //top
                   6,7,3,2,6, //bottom
                   ];

//load points into points array - runs once as page loads.
var points = [];
for (var i =0; i < cubeLookups.length; i++)
{
    points.push(cubeVerts[cubeLookups[i]]);
}

var left =  vec3(-1,0,0);
var right = vec3(1,0,0);
var down =  vec3(0,-1,0);
var up =    vec3(0,1,0);
var front = vec3(0,0,1);
var back =  vec3(0,0,-1);
var normals = [
               front, front, front, front, front, front,
               right, right, right, right, right, right,
               back, back, back, back, back, back,
               left, left, left, left, left, left,
               up, up, up, up, up, up,
               down, down, down, down, down, down
               ];
for (var i = 0; i < wireCubeVertices; i++)
{
    normals.push(up);
}

points.push([ 4.0, 0.0, 0.0, 1.0]); //x axis is green
points.push([-4.0, 0.0, 0.0, 1.0]);
points.push([ 0.0, 4.0, 0.0, 1.0]); //y axis is red
points.push([ 0.0,-4.0, 0.0, 1.0]); 
points.push([ 0.0, 0.0, 4.0, 1.0]); //z axis is blue
points.push([ 0.0, 0.0,-4.0, 1.0]);

var red = 		 [1.0, 0.0, 0.0, 1.0];
var green = 	 [0.0, 1.0, 0.0, 1.0];
var blue = 		 [0.0, 0.0, 1.0, 1.0];
var lightred =   [1.0, 0.5, 0.5, 1.0];
var lightgreen = [0.5, 1.0, 0.5, 1.0];
var lightblue =  [0.5, 0.5, 1.0, 1.0];
var white = 	 [1.0, 1.0, 1.0, 1.0];
var black =      [0.0, 0.0, 0.0, 1.0];



//Variables for Transformation Matrices
var mv = new mat4();
var p  = new mat4();
var mvLoc, projLoc;

//Variables for Lighting
var light;
var material;
var lighting;
var uColor;

//You will need to rebind these buffers
//and point attributes at them after calling uofrGraphics draw functions
var vertexBuffer, normalBuffer;
var program;


function bindBuffersToShader()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer( program.vPosition, 4, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program.vPosition );
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer( program.vNormal, 3, gl.FLOAT, gl.FALSE, 0, 0 );
    gl.enableVertexAttribArray( program.vNormal );
    
}

//----------------------------------------------------------------------------
// Initialization Event Function
//----------------------------------------------------------------------------

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
    //  eg. - set a clear color
    //      - turn on depth testing
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Set up data to draw
    // Done globally in this program...
    
    // Load the data into GPU data buffers and
    // Associate shader attributes with corresponding data buffers
    //***Vertices***
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(points), gl.STATIC_DRAW );
    program.vPosition = gl.getAttribLocation(program, "vPosition");
        
    //***Normals***
    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER,  flatten(normals), gl.STATIC_DRAW );
    program.vNormal = gl.getAttribLocation(program, "vNormal");
    
    bindBuffersToShader();
    
    // Get addresses of transformation uniforms
    projLoc = gl.getUniformLocation(program, "p");
    mvLoc = gl.getUniformLocation(program, "mv");
    
    //Set up viewport
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    
    //Set up projection matrix
    p = perspective(45.0, gl.viewportWidth/gl.viewportHeight, 0.1, 100.0);
    gl.uniformMatrix4fv(projLoc, gl.FALSE, flatten(p));
    
    
    // Get and set light uniforms
    light = [];   // array of light property locations (defined globally)
    var n = 1;    // number of lights - adjust to match shader
    for (var i = 0; i < n; i++)
    {
        light[i] = {};   // initialize this light object
        light[i].diffuse = gl.getUniformLocation(program,"light["+i+"].diffuse");
        light[i].ambient = gl.getUniformLocation(program,"light["+i+"].ambient");
        light[i].position = gl.getUniformLocation(program,"light["+i+"].position");
        
        //initialize light 0 to default of white light coming from viewer
        if (i == 0)
        {
            gl.uniform4fv(light[i].diffuse, white);
            gl.uniform4fv(light[i].ambient, vec4(0.2, 0.2, 0.2, 1.0));
            gl.uniform4fv(light[i].position,vec4(0.0, -1.0, 0.0, 0.0)); // directional source
        }
        else{ // set the second light's initial state to match the first light's initial state
        	gl.uniform4fv(light[i].diffuse, white);
            gl.uniform4fv(light[i].ambient, vec4(0.2, 0.2, 0.2, 1.0));
            gl.uniform4fv(light[i].position,vec4(0.0, 1.0, 0.0, 1.0)); // positional source
        }
        // else //disable all other lights
//         {
//             gl.uniform4fv(light[i].diffuse, black);
//             gl.uniform4fv(light[i].ambient, black);
//             gl.uniform4fv(light[i].position,black);
//         }
		
    }
    
    // Get and set material uniforms
    material = {};
    material.diffuse = gl.getUniformLocation(program, "material.diffuse");
    material.ambient = gl.getUniformLocation(program, "material.ambient");
    gl.uniform4fv(material.diffuse, vec4(0.8, 0.8, 0.8, 1.0));
    gl.uniform4fv(material.ambient, vec4(0.8, 0.8, 0.8, 1.0));
    
    // Get and set other lighting state
    lighting = gl.getUniformLocation(program, "lighting");
    uColor = gl.getUniformLocation(program, "uColor");
    gl.uniform1i(lighting, 1);
    gl.uniform4fv(uColor, white);
    
    urgl = new uofrGraphics();
    urgl.connectShader(program, "vPosition", "vNormal", "stub");
    requestAnimFrame(render);
};




//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var rx = 0, ry = 0, rLamp = 0;
function render()
{
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    
    
    //Set initial view
    var eye = vec3(0.0, 0.0, 10.0);
    var at =  vec3(0.0, 0.0, 0.0);
    var up =  vec3(0.0, 1.0, 0.0);
    
    mv = lookAt(eye,at,up);
    mv = mult(mv, translate(0,0,-5));
	mv = mult(mv, rotateX(30));
	mv = mult(mv, rotateY(ry));	
	
    //place this immediately after mv is set by the lookAt function...
    gl.uniform4fv(light[0].position, mult(transpose(mv), vec4(0, -3.0, -10.0, 1.0)));
    	
	//gl.uniform4fv(light[2].position, mult(transpose(mv), vec4(10.0, -3.0, 10.0, 1.0)));
    
    
    //rebind local buffers to shader
    //necessary if uofrGraphics draw functions are used
    bindBuffersToShader();    
        
	

	//light
	var lamp = mult(mv,rotateY(rLamp));
	lamp = mult(lamp, translate(5,5,0));
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(lamp));
    gl.uniform4fv(light[0].position, mult(transpose(lamp),vec4(0,0,0,1)));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);			
		
    //floor
    var floor = mult(mv, scale(10, 0.0, 10));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(floor));
    gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);	
	
	//b1
	var b1 = mult(mv, mult(translate(1.5,1.5,0),scale(1, 3, 1)));
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(b1));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
	
			
	//b2

	var b2 = mult(mv, mult(translate(-1.5,0.75,0),scale(1, 1.5, 1)));
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(b2));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);	
	
	//b3
	
	var b3 = mult(mv, mult(translate(0,0.5,1.5),scale(2, 1, 1)));
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(b3));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);
		
	//b4
	var b4 = mult(mv, mult(translate(0,0.5,-1.5),scale(2, 1, 1)));
	gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(b4));
	gl.drawArrays(gl.TRIANGLES, solidCubeStart, solidCubeVertices);

	//sphere
    sphereTF = mult(mv, translate(0,1,0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(sphereTF));
    urgl.drawSolidSphere(1,50,50);
    
    rx += 1;
    ry += 0.5;
	rLamp += 2;
    
    requestAnimFrame(render);
}
