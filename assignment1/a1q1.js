
var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    
    var vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c )
{
    points.push( a, b, c );
}

function divideTriangle( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
    
        //bisect the sides
        
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;
		
		var x1, x2, x3;	
		var d1,d2,d3;
		var l1,l2,l3;
		var k =6;
		
		d1 = subtract ( a , b);
		d2 = subtract ( a , c);
		d3 = subtract ( b , c);
		
		l1 = (d1[0] * d1[0]) + (d1[1] * d1[1]);
		l2 = (d2[0] * d2[0]) + (d2[1] * d2[1]);
		l3 = (d3[0] * d3[0]) + (d3[1] * d3[1]);
		
		l1 = Math.pow(l1,0.5);
		l2 = Math.pow(l2,0.5);
		l3 = Math.pow(l3,0.5);
		
		l1 = l1 / k;
		l2 = l2 / k;
		l3 = l3 / k;
		
		//console.log(l1,l2,l3);
		
		x1 = ((Math.random() * l1 ) - l1/2);
		x2 = ((Math.random() * l2 ) - l2/2);
		x3 = ((Math.random() * l3 ) - l3/2);
		x4 = ((Math.random() * l1 ) - l1/2);
		x5 = ((Math.random() * l2 ) - l2/2);
		x6 = ((Math.random() * l3 ) - l3/2);

		//console.log(x1,x2,x3,x4,x5,x6);
  
        var d1 = vec2(x1 ,x4);
        var d2 = vec2(x2 ,x5);
        var d3 = vec2(x3 ,x6);
        
        //console.log(d1);
        
        ab = add(ab , d1);
        ac = add(ac , d2);
        bc = add(bc , d3);
        
        // three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}

