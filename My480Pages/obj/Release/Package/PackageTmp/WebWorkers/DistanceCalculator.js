onmessage = function(e)
{
    postMessage(CalcDistanceBetween(e.data.origLat, e.data.origLong, e.data.newLat, e.data.newLong));
}

function CalcDistanceBetween(lat1, lon1, lat2, lon2)
{
    //Radius of the earth in:  1.609344 miles,  6371 km  | var R = (6371 / 1.609344);
    var earthRadius = 3958.7558657440545; // Radius of earth in Miles 
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = earthRadius * c;

    return d;
}

function toRad(Value)
{
    /** Converts numeric degrees to radians */
    return Value * Math.PI / 180;
}