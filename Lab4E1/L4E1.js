/*
 * L4E1.js
 * An exercise in creating an octahedron with correct normals.
 *
 * Adapted for WebGL by Alex Clarke, 2016.
 */


//----------------------------------------------------------------------------
// Variable Setup
//----------------------------------------------------------------------------

// This variable will store the WebGL rendering context
var gl;

//Define points for
var octahedronVerts = 
[
	[ 0, 1, 0, 1], //0 top
	[ 1, 0, 0, 1], //1 left
	[-1, 0, 0, 1], //2 right
	[ 0, 0, 1, 1], //3 front
	[ 0, 0,-1, 1], //4 back
	[ 0,-1, 0, 1], //5 botten
];


var octahedronStart = 0;
var octahedronVertices = 24;

//Look up patterns from cubeVerts for different primitive types
var octahedronLookups = [
                   
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
for (var i =0; i < octahedronLookups.length; i++)
{
    points.push(octahedronVerts[octahedronLookups[i]]);
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
        
    makeFlatNormals(points, octahedronStart, octahedronVertices, normals);    
        
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
    var n = 2;    // number of lights - adjust to match shader
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
            gl.uniform4fv(light[i].position,vec4(0.0, 0.0, 1.0, 0.0));
        }
        else //disable all other lights
        {
            gl.uniform4fv(light[i].diffuse, black);
            gl.uniform4fv(light[i].ambient, black);
            gl.uniform4fv(light[i].position,black);
        }
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
// makeFlatNormals(triangles, start, num, normals)
// Caculates Flat Normals for Triangles
// Input parameters:
//  - triangles: an array of vec4's that represent TRIANGLES
//  - start: the index of the first TRIANGLES vertex
//  - num: the number of vertices, as if you were drawing the TRIANGLES
// Output parameters:
//  - normals: an array of vec3's that will represent normals to be used with 
//             triangles
// Preconditions:
//  - the data in triangles should specify triangles in counterclockwise
//    order to indicate their fronts
//  - num must be divisible by 3
//  - triangles and normals must have the types indicated above
// Postconditions:
//  - the normals array will contain unit length vectors from start, 
//    to (start + num)
//----------------------------------------------------------------------------
function makeFlatNormals(triangles, start, num, normals)
{
    if (num % 3 != 0)
    {
        console.log("Warning: number of vertices is not a multiple of 3");
        return;
    }
    for (var i = start; i < num; i+= 3)
    {
      var p0 = vec3(triangles[i][0],triangles[i][1],triangles[i][2]);
      var p1 = vec3(triangles[i+1][0],triangles[i+1][1],triangles[i+1][2]);
      var p2 = vec3(triangles[i+2][0],triangles[i+2][1],triangles[i+2][2]);
      var v1 = normalize(vec3(subtract(p0, p1)));
      var v2 = normalize(vec3(subtract(p0, p2)));
        
      var n = normalize(cross(v1,v2));
      normals[i+0] = vec3(n);
      normals[i+1] = vec3(n);
      normals[i+2] = vec3(n);
    }
}


//----------------------------------------------------------------------------
// Rendering Event Function
//----------------------------------------------------------------------------
var rx = 0, ry = 0;
function render()
{
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    
    
    //Set initial view
    var eye = vec3(0.0, 0.0, 10.0);
    var at =  vec3(0.0, 0.0, 0.0);
    var up =  vec3(0.0, 1.0, 0.0);
    
    mv = lookAt(eye,at,up);
    
    //rebind local buffers to shader
    //necessary if uofrGraphics draw functions are used
    bindBuffersToShader();    
        
    //draw cube
	//gl.uniform4fv(light[0].position, mult(transpose(mv),vec4(0,1,0,0)));



    var octahedronTF = mult(mv, mult(rotateX(rx),rotateY(ry)));
    //octahedronTF = mult(octahedronTF, translate(5,0,0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(octahedronTF));
    //gl.uniform4fv(light[0].position, mult(transpose(octahedronTF),vec4(0,0,0,1)));
    gl.drawArrays(gl.TRIANGLES, octahedronStart, octahedronVertices);	



    var sphereTF = mult(mv, translate(-2,0,0));
    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(sphereTF));
    urgl.drawSolidSphere(1,50,50);
    
    
    
    sphereTF = mult(mv, translate(2,0,0));

    gl.uniformMatrix4fv(mvLoc, gl.FALSE, flatten(sphereTF));
    urgl.drawSolidSphere(1,50,50);
    
    rx += 0.0;
    ry += 2.0;
    
    requestAnimFrame(render);
}


