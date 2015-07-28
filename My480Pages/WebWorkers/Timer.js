var sec = 0;

function incTimer()
{
    sec++;
    postMessage(sec);
    setTimeout("incTimer()", 1000);
};

incTimer();