
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
        vec2( -0.866, -0.5 ),
        vec2(  0,  1 ),
        vec2( 0.866, -0.5 )
    ];

    divideLine( vertices[0], vertices[1], vertices[2],NumTimesToSubdivide);
	

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

function triangle(a, b)
{
    points.push(a, b);
}

function divideLine(a, b, c,count)
{	
	line(a,b,count);
	line(b,c,count);
	line(c,a,count);
}

function line(x, y,count)
{	                   
	if(count ===0 )
	{
		triangle(x,y)
	}
	else
	{
	/* 
		   Mid
		   /|\
		  / | \
		 /  |  \
		X --M-- Y
	*/
	
	//find two position for new equilateral triangle A and B
	var p1 = mix(x, y, 1/3);
	var p2 = mix(y, x, 1/3);
	
	//find the position for C
	//AM + MC = point C
	var vInves = subtract(p2,p1);
	var temp = vInves[0];
	vInves[0] = -vInves[1];
	vInves[1] = temp;
	vInves[0] = Math.sin(60 * 0.017453293) * vInves[0];
	vInves[1] = Math.sin(60 * 0.017453293) * vInves[1];	
	var mid = mix(p1,p2,0.5);
	mid = add(mid,vInves);
	var result = [p1, mid, p2];
	count--;
	line(x,p1,count);
	line(p1,mid,count);
	line(mid,p2,count);
	line(p2,y,count);
	}                          
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.LINE_LOOP, 0, points.length );
}