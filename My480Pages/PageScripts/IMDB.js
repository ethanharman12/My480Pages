$(document).ready(function ()
{
	$("#findForm").submit(function (event)
	{
		event.preventDefault();

		FindAnswer()
	    .done(function(answer)
	    {
	        DisplayAnswer(answer);
	    });		
	});
});

function FindAnswer()
{
    return $.ajax({
        method:'GET',
        url: '../JSONData.txt',
        dataType: 'json',
        cache: false
    });
}

function DisplayAnswer(answer)
{
	var x = document.getElementById("answerTitle");
	x.innerText = answer.Id;
}