
function PointReflection2D(m, h, P)
{
	
    var angle = Math.floor(Math.atan(m) * (180 / Math.PI)); //find the angle between y = mx + h and x axis
	
	P = translate(P[0],P[1],0); //change vector P become a 4*4 matrix 
	
	P = mult(translate(0,-h,0),P);//move P 1 unix down with Y axis
	
	P = mult(rotateZ(-angle),P);//rotate P ( angle degree )
	
	P = vec4(P[12],-P[13],0,0); //change P to a homogeneous 3D vector and flip it with x axis
	
	P = mult(rotateZ(-angle), P);//rotate P ( angle degree )
	
	P = translate(P[0],P[1],0);//change vector P become a 4*4 matrix 
	
	P = mult(translate(0,h,0),P);//move P 1 unix up with Y axis
	
	var result = vec2(P[12],P[13]);
	return result;
	
	
	
	/*
	*********
	Another way 
	*/
	
	/*
	var Yp = (Math.pow(m,2)*P[1]+2*m*P[0]-P[1]+2*h) / (Math.pow(m,2) +1);	
	var Xp = (P[1]/m) + (Yp/m) - P[0] - ((2*h)/m);
	var result = vec2(Xp,Yp);
	return result;
	*/
	
	/*
	suppose P'(Xp',Yp') is a reflect point of P( Xp,Yp), so we have PP' is perpendicular to the line of y = mx + h .So the slope of PP' is (-1/m). 
	Also the middle point of PP' should excetly on the line y = mx + h due to P' is 
	a reflect point of P , so the distance between P to y = mx +h should equally to 
	y = mx +h to P', so the middle point ((Xp+Xp')/2 , (Yp+Yp')/2) should on y = mx +h,
	so we have to function, 
	1 -> (Yp'-Yp)/(Xp'-Xp) = -1/m
	2 -> (Yp+Yp')/2 = ((Xp +Xp')/2)*m +h
	
	slove equation 1 and 2, we can find Xp' and Yp'
	*********
	*/
	
	
	
	
}













