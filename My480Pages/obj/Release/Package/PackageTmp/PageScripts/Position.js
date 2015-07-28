var positApp = (function ()
{
    function throwError()
    {
        var message = 'Waiting';
        var int = $('#inpInt').val();

        try
        {
            if (int > 10)
            {
                throw new Error(100, 'Over 10');
            }

            message = 'success';
        }
        catch (e)
        {
            message = e.number + ": " + e.message;
        }
        finally
        {
            message += " DONE";

            document.getElementById("message").innerText = message;
        }
    };

    return {
        ThrowError: throwError
    };
})();

$(document).ready(function ()
{
    positApp.ThrowError();
});