var sigApp = (function ()
{
    var oldX = null;
    var oldY = null;

    function StartWebSocket()
    {
        var connection = new WebSocket('ws://echo.websocket.org/');

        connection.onopen = function ()
        {
            connection.send("Ping");
        };

        connection.onmessage = function (data)
        {
            alert(data.data);
        };
    };

    function BeginCapture()
    {
        var canvas = document.getElementById("sigCanvas");
        canvas.onmousemove = DrawSig;
    };
    function ClearSig()
    {
        var canvas = document.getElementById("sigCanvas");
        var context = canvas.getContext("2d");

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
    };
    function DrawSig(event)
    {
        var canvas = document.getElementById("sigCanvas");
        var context = canvas.getContext("2d");

        if (oldX != null && oldY != null)
        {
            //var color = "#" + Math.floor(Math.random() * 1000);
            //context.strokeStyle = color;
            context.beginPath();
            context.moveTo(oldX, oldY);
            context.lineTo(event.offsetX, event.offsetY);
            context.stroke();
        }

        oldX = event.offsetX;
        oldY = event.offsetY;
        //console.log(event);
    };
    function EndCapture()
    {
        var canvas = document.getElementById("sigCanvas");
        canvas.onmousemove = null;
        oldX = null;
        oldY = null;
    };
    function SaveSig()
    {
        var canvas = document.getElementById("sigCanvas");

        var imgUrl = canvas.toDataURL();

        document.getElementById("savedSig").innerHTML = "<img src='" + imgUrl + "'/>";
    };

    return {
        BeginCapture: BeginCapture,
        ClearSig: ClearSig,
        DrawSig: DrawSig,
        EndCapture: EndCapture,
        SaveSig: SaveSig,
        StartWebSocket: StartWebSocket
    };
})();

sigApp.StartWebSocket();