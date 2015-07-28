$(document).ready(function ()
{
    var navLinks = ["IMDB", "Weather", "Set", "Signature", "Inject", "Inherit", "Position"];

    var nav = $('header nav');

    navLinks.forEach(function (link)
    {
        nav.append("<a href='" + link + ".html'>" + link + "</a>");
    });
})