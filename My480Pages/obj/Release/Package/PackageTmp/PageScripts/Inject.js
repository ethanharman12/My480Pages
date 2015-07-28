var injectApp = (function ()
{
    function Inject()
    {
        var messages = document.getElementById("messageBoard");
        var message = document.getElementById("message");
        messages.innerHTML += message.value;
        messages.innerHTML += "<br>";
    };

    function Safe()
    {
        var messages = document.getElementById("messageBoard");
        var message = document.getElementById("message");
        messages.innerHTML += htmlEntities(message.value);
        messages.innerHTML += "<br>";
    };

    function htmlEntities(str)
    {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    return {
        Inject: Inject,
        Safe: Safe
    };
})();