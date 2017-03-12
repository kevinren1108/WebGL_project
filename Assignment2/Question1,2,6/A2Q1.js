function DotProduct(v1, v2)
{
	var dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
	return dot;
}

function FindAngle(v1, v2)
{
	var dot = DotProduct(v1, v2);
	var v1v2 = absolute(v1) * absolute(v2);
	var angle = Math.floor(Math.acos(dot / v1v2) * (180 / Math.PI)); 
	return angle;
}

function absolute(v1)
{
	var abValue;
	abValue = Math.pow((Math.pow(v1[0],2) + Math.pow(v1[1],2) + Math.pow(v1[2],2)),0.5);
	return abValue;
}

function CrossProduct(v1, v2)
{
	var cVector1 = v1[1]*v2[2] - v1[2]*v2[1];
	var cVector2 = v1[2]*v2[0] - v1[0]*v2[2];
	var cVector3 = v1[0]*v2[1] - v1[1]*v2[0];
	var cross = vec3(cVector1,cVector2,cVector3);
	return cross;
}



