//
//  uofrGraphics.h
//
//  Created by Alex Clarke on 2013-05-02.
//  Ported to Javascript/WebGL from C++/OpenGL on 2016-01-11
//

// The urgl object is declared here, but must not be constructed until there is
// a valid GL Context.
// eg. after these lines
//      gl = WebGLUtils.setupWebGL(canvas);
//      if (!gl) {
//        alert("WebGL isn't available");
//      }
//
// Then you construct urgl like this:
//      urgl = new uofrGraphics();
var urgl;


// uofrGraphics object constructor
// I am not a javascript programmer.
// This is likely very ugly.
var uofrGraphics = function () {
  this.primitive = gl.TRIANGLES;
  this.shaderProgram = 0;
  this.positionAttribLoc = -1;
  this.normalAttribLoc = -1;
  this.colourAttribLoc = -1;
  this.colour = vec4(0, 0, 0, 1);
  this.lastCubeSize = 0;
  this.lastSphereSlices = 0;
  this.lastSphereStacks = 0;
  this.lastRadius = 0;
  this.sphereVerts = 0;

  this.cubeVerts = [
        vec4(0.5, 0.5, 0.5, 1), //0
        vec4(0.5, 0.5, -0.5, 1), //1
        vec4(0.5, -0.5, 0.5, 1), //2
        vec4(0.5, -0.5, -0.5, 1), //3
        vec4(-0.5, 0.5, 0.5, 1), //4
        vec4(-0.5, 0.5, -0.5, 1), //5
        vec4(-0.5, -0.5, 0.5, 1), //6
        vec4(-0.5, -0.5, -0.5, 1) //7
    ];

  this.cubeFullVerts = //36 vertices total
    [
        this.cubeVerts[0], this.cubeVerts[4], this.cubeVerts[6], //front
        this.cubeVerts[6], this.cubeVerts[2], this.cubeVerts[0],
        this.cubeVerts[1], this.cubeVerts[0], this.cubeVerts[2], //right
        this.cubeVerts[2], this.cubeVerts[3], this.cubeVerts[1],
        this.cubeVerts[5], this.cubeVerts[1], this.cubeVerts[3], //back
        this.cubeVerts[3], this.cubeVerts[7], this.cubeVerts[5],
        this.cubeVerts[4], this.cubeVerts[5], this.cubeVerts[7], //left
        this.cubeVerts[7], this.cubeVerts[6], this.cubeVerts[4],
        this.cubeVerts[4], this.cubeVerts[0], this.cubeVerts[1], //top
        this.cubeVerts[1], this.cubeVerts[5], this.cubeVerts[4],
        this.cubeVerts[6], this.cubeVerts[7], this.cubeVerts[3], //bottom
        this.cubeVerts[3], this.cubeVerts[2], this.cubeVerts[6]
    ];

  this.right = vec4(1.0, 0.0, 0.0, 0.0);
  this.left = vec4(-1.0, 0.0, 0.0, 0.0);
  this.top = vec4(0.0, 1.0, 0.0, 0.0);
  this.bottom = vec4(0.0, -1.0, 0.0, 0.0);
  this.front = vec4(0.0, 0.0, 1.0, 0.0);
  this.back = vec4(0.0, 0.0, -1.0, 0.0);

  this.cubeNormsArray = [
        this.front, this.front, this.front, this.front, this.front, this.front,
        this.right, this.right, this.right, this.right, this.right, this.right,
        this.back, this.back, this.back, this.back, this.back, this.back,
        this.left, this.left, this.left, this.left, this.left, this.left,
        this.top, this.top, this.top, this.top, this.top, this.top,
        this.bottom, this.bottom, this.bottom, this.bottom, this.bottom, this.bottom

    ];
  this.cubeBuffer = 0;
  this.quadBuffer = 0;
  this.sphereBuffer = 0;

}

//connectShader
//  Purpose: get vertex attribute entry points of a shader ("in" type variables)
//  Preconditions:
//     shaderProgram - the index number of a valid compiled shader program
//
//     positionAttribName - the name of the vertex position input as it appears
//                          in the shader's code. The input MUST be of type vec4
//                          If the name is "stub" it will be
//                          silently ignored.
//
//     normalAttribName - the name of the vertex normal input as it appears
//                        in the shader's code. The input MUST be of type vec4.
//                        If the name is "stub" it will be
//                        silently ignored.
//
//     colourAttribName - the name of the colour position input as it appears
//                        in the shader's code. The input MUST be of type vec4.
//                        If the name is "stub" it will be
//                        silently ignored.
//
// PostConditions:
//     the locations for the three attribute names will be retrieved and stored
//     in corresponding *AttribLoc index variable for use when drawing.
//     If any of the names were NULL pointers or were invalid names, the error
//     is silently ignored.
uofrGraphics.prototype.connectShader = function (shaderProgram, positionAttribName,
  normalAttribName, colourAttribName) {
  this.shaderProgram = shaderProgram;
  this.positionAttribLoc = this.normalAttribLoc = this.colourAttribLoc = -1;
  
  if (positionAttribName != "stub")
    this.positionAttribLoc = gl.getAttribLocation(shaderProgram, positionAttribName);
  if (normalAttribName != "stub")
    this.normalAttribLoc = gl.getAttribLocation(shaderProgram, normalAttribName);
  if (colourAttribName != "stub")
    this.colourAttribLoc = gl.getAttribLocation(shaderProgram, colourAttribName);
}


//setDrawColour
//  Purpose: set a colour with which to draw primitives
//  Preconditions:
//     The incoming colour should be a vec4
//     The value of each channel should be normalized, ie. lie between 0 and 1
//     with 0 being the darkest and 1 being the brightest.
//
// Postconditions:
//     Local variable colour, a vec 4, is set to the incoming colour. 
//     It will be used as the constant colour for subsequent draw operations.
uofrGraphics.prototype.setDrawColour = function (colour) {
  this.colour = colour;
}



//drawSolidSphere
//  Purpose: draw a sphere with solid filled polygons.
//  Preconditions:
//     radius: should be a positive value indicating the desired radius of the
//             sphere
//     slices: should be a positive value indicating how many "slices" you see
//             if you view the sphere from the top.
//     stacks: should be a positive value indicating how many layers there are
//             between the top and bottom of the sphere.
//
//  Postconditions:
//     the vertices for the sphere are drawn in GL_TRIANGLES mode with the
//     desired number of stacks and slices. The sphere has radius "radius" and
//     is centered at (0,0,0).
//     The vertices are stored in WebGL buffers that are managed by this function.
//     The sphere's buffers are connected to the shader program.
//     The shader program's colour is set to a constant value.
//
uofrGraphics.prototype.drawSolidSphere = function (radius, slices, stacks) {
  //Generate a new sphere ONLY if necessary - not the same dimesions as last time
  if (this.lastSphereSlices != slices || this.lastSphereStacks != stacks || this.lastRadius != radius) {
    this.lastSphereSlices = slices;
    this.lastSphereStacks = stacks;
      this.lastRadius = radius;
    var phiStep = 360.0 / slices;
    var rhoStep = 180.0 / stacks;

    //allocate new memory
    var vertsArray = [];
    var normsArray = [];

    var i = 0;

    //Top (Special because v2 and v3 are always both 0,0)
    for (var s = 0; s < slices; s++) {
      var t = 0;
      //Triangle:
      // v1 * (v3)
      //    |\
      //    | \
      // v2 *--* v4

      //v1
      normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
      normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
      normsArray.push(Math.cos(radians(rhoStep * (t))));
      normsArray.push(0.0);

      //v2
      normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t + 1))));
      normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t + 1))));
      normsArray.push(Math.cos(radians(rhoStep * (t + 1))));
      normsArray.push(0.0);

      //v4
      normsArray.push(Math.sin(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t + 1))));
      normsArray.push(Math.cos(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t + 1))));
      normsArray.push(Math.cos(radians(rhoStep * (t + 1))));
      normsArray.push(0.0);
    }

    //Body of sphere
    for (var t = 1; t < stacks - 1; t++) {
      for (var s = 0; s < slices; s++) {
        //Triangle 1:
        // v1 *  * v3
        //    |\
        //    | \
        // v2 *__* v4


        //v1
        normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
        normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
        normsArray.push(Math.cos(radians(rhoStep * (t))));
        normsArray.push(0.0);

        //v2
        normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t + 1))));
        normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t + 1))));
        normsArray.push(Math.cos(radians(rhoStep * (t + 1))));
        normsArray.push(0.0);

        //v4
        normsArray.push(Math.sin(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t + 1))));
        normsArray.push(Math.cos(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t + 1))));
        normsArray.push(Math.cos(radians(rhoStep * (t + 1))));
        normsArray.push(0.0);


        //Triangle 2:
        // v1 *--* v3
        //     \ |
        //      \|
        // v2 *  * v4


        //v4
        normsArray.push(Math.sin(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t + 1))));
        normsArray.push(Math.cos(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t + 1))));
        normsArray.push(Math.cos(radians(rhoStep * (t + 1))));
        normsArray.push(0.0);


        //v3
        normsArray.push(Math.sin(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t))));
        normsArray.push(Math.cos(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t))));
        normsArray.push(Math.cos(radians(rhoStep * (t))));
        normsArray.push(0.0);

        //v1
        normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
        normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
        normsArray.push(Math.cos(radians(rhoStep * (t))));
        normsArray.push(0.0);

      }
    }


    //Bottom (Special because v2 and v4 are always both 180,180)
    for (var s = 0; s < slices; s++) {
      var t = stacks - 1;
      //Triangle:
      // v1 *--* v3
      //    | /
      //    |/
      // v2 *  * v4

      //v1
      normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
      normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t))));
      normsArray.push(Math.cos(radians(rhoStep * (t))));
      normsArray.push(0.0);

      //v2
      normsArray.push(Math.sin(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t + 1))));
      normsArray.push(Math.cos(radians(phiStep * (s))) * Math.sin(radians(rhoStep * (t + 1))));
      normsArray.push(Math.cos(radians(rhoStep * (t + 1))));
      normsArray.push(0.0);

      //v3
      normsArray.push(Math.sin(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t))));
      normsArray.push(Math.cos(radians(phiStep * (s + 1))) * Math.sin(radians(rhoStep * (t))));
      normsArray.push(Math.cos(radians(rhoStep * (t))));
      normsArray.push(0.0);
    }
    for (var s = 0; s < normsArray.length; s++) {
      vertsArray[s] = normsArray[s] * radius;
      if (s % 4 == 3) vertsArray[s] = 1.0;
    }

    this.sphereVerts = vertsArray.length / 4;

    if (this.sphereBuffer != 0) {
      gl.deleteBuffer(this.sphereBuffer);
    }
    this.sphereBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.sphereVerts * 4 * 4 * 2, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertsArray));
    gl.bufferSubData(gl.ARRAY_BUFFER, this.sphereVerts * 4 * 4, flatten(normsArray));

  }
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphereBuffer);
  //connect position and normal arrays to shader
  if (this.positionAttribLoc != -1) {
    gl.enableVertexAttribArray(this.positionAttribLoc);
    gl.vertexAttribPointer(this.positionAttribLoc, 4, gl.FLOAT, gl.FALSE, 0, 0);
  }

  if (this.normalAttribLoc != -1) {
    gl.enableVertexAttribArray(this.normalAttribLoc);
    gl.vertexAttribPointer(this.normalAttribLoc, 4, gl.FLOAT, gl.FALSE, 0, this.sphereVerts * 4 * 4);
  }

  if (this.colourAttribLoc != -1) {
    //set a constant colour
    gl.disableVertexAttribArray(this.colourAttribLoc);
    gl.vertexAttrib4fv(this.colourAttribLoc, this.colour);
  }

  gl.drawArrays(this.primitive, 0, this.sphereVerts);
}



//drawSolidCube
//  Purpose: draw a cube in filled polygon style.
//  Preconditions:
//     size: should be a positive value indicating the dimension of one edge of
//           the cube
//
//  Postconditions:
//     The vertices for the cube are drawn in GL_TRIANGLES mode.
//     The cube has sides that measure size units and it centered at (0,0,0).
//     Data for 36 vertices and normals is stored in OpenGL buffers.
//     The cube's buffers are connected to the shader program.
//     The vertex program's colour is set to a constant value.
uofrGraphics.prototype.drawSolidCube = function (size) {
  //Generate a new cube ONLY if necessary - not the same dimesions as last time
  if (this.lastSize != size) {
    lastSize = size;
    var vertsArray = [];
    for (var i = 0; i < 36; i++) {
      vertsArray.push(scale(size , this.cubeFullVerts[i]));
      vertsArray[i][3] = 1.0;
    }

    if (this.cubeBuffer != 0) {
      gl.deleteBuffer(this.cubeBuffer);
    }
    this.cubeBuffer = gl.createBuffer();
	flatVerts = new Float32Array(flatten(vertsArray));
	flatNorms = new Float32Array(flatten(this.cubeNormsArray));
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatVerts.byteLength + flatNorms.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatVerts);
    gl.bufferSubData(gl.ARRAY_BUFFER, flatVerts.byteLength, flatNorms);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.cubeBuffer);
    
  //connect position and normal arrays to shader
  if (this.positionAttribLoc != -1) {
    gl.enableVertexAttribArray(this.positionAttribLoc);
    gl.vertexAttribPointer(this.positionAttribLoc, 4, gl.FLOAT, gl.FALSE, 0, 0);
  }

  if (this.normalAttribLoc != -1) {
    gl.enableVertexAttribArray(this.normalAttribLoc);
    gl.vertexAttribPointer(this.normalAttribLoc, 4, gl.FLOAT, gl.FALSE, 0, 36 * 4*4);
  }

  if (this.colourAttribLoc != -1) {
    //set a constant colour
    gl.disableVertexAttribArray(this.colourAttribLoc);
    gl.vertexAttrib4fv(this.colourAttribLoc, this.colour);
  }

  gl.drawArrays(this.primitive, 0, 36);
}



//drawQuad
//  Purpose: draw a quadrilateral in filled polygon style.
//  Preconditions:
//     v1, v2, v3, v4: are vertices that are arranged in "counter clockwise"
//                     order. The quadrilateral is assumed to be flat.
//
//  Postconditions:
//     The vertices for the quadrilateral are drawn in GL_TRIANGLES mode.
//     One normal is calculated from three of the vertices.
//     Data for 6 vertices are stored in WebGL buffers.
//     The quad's vertex buffer is bound to the shader program
//     The vertex program's normal and colour entry points are
//     set to a constant value.
uofrGraphics.prototype.drawQuad = function (v1, v2, v3, v4) {

  //update quad's data every time. People rarely draw the same quad repeatedly
  //(Lab 1 is an exception... we draw and translate a square... lol!)

  if (this.quadBuffer == 0) {
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 6 * 4*4 * 2, gl.STREAM_DRAW);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0 * 4*4, flatten(v1));
  gl.bufferSubData(gl.ARRAY_BUFFER, 1 * 4*4, flatten(v2));
  gl.bufferSubData(gl.ARRAY_BUFFER, 2 * 4*4, flatten(v3));
  gl.bufferSubData(gl.ARRAY_BUFFER, 3 * 4*4, flatten(v3));
  gl.bufferSubData(gl.ARRAY_BUFFER, 4 * 4*4, flatten(v4));
  gl.bufferSubData(gl.ARRAY_BUFFER, 5 * 4*4, flatten(v1));

  var normal = vec4(normalize(cross(subtract(v3, v2), subtract(v1, v2))), 0);

  //connect position and normal arrays to shader
  if (this.positionAttribLoc != -1) {
    gl.enableVertexAttribArray(this.positionAttribLoc);
    gl.vertexAttribPointer(this.positionAttribLoc, 4, gl.FLOAT, gl.FALSE, 0, 0);
  }

  if (this.normalAttribLoc != -1) {
    gl.disableVertexAttribArray(this.normalAttribLoc);
    gl.vertexAttrib4fv(this.normalAttribLoc, normal);    
  }

  if (this.colourAttribLoc != -1) {
    //set a constant colour
    gl.disableVertexAttribArray(this.colourAttribLoc);
    gl.vertexAttrib4fv(this.colourAttribLoc, this.colour);
  }

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

// TODO: finish porting these functions
//    void drawWireSphere(GLfloat radius, GLint slices, GLint stacks);
//    void drawWireCube(GLfloat size);
//    void drawSolidTorus( GLfloat innerRadius, GLfloat outerRadius, GLint nSides, GLint nRings);
//    void drawWireTorus( GLfloat innerRadius, GLfloat outerRadius, GLint nSides, GLint nRings);
