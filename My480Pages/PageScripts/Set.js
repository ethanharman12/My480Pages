var setApp = (function ()
{
    var deck = [];
    var totalSet = [];
    var completedSets = [];
    var potentialSets = [];
    var cardCount = 0;
    var timer = null;

    function ClearBoard()
    {
        var board = document.getElementById("setBoard");
        board.innerHTML = "";
        totalSet.length = 0;
    };
    function CreateDeck()
    {
        deck.length = 0;

        for (var colorNum = 0; colorNum < 3; colorNum++)
        {
            for (var shapeNum = 0; shapeNum < 3; shapeNum++)
            {
                for (var fillNum = 0; fillNum < 3; fillNum++)
                {
                    for (var numberNum = 0; numberNum < 3; numberNum++)
                    {
                        var card = {
                            id: cardCount,
                            isNew: true
                        };
                        cardCount++;

                        //var colorNum = Math.floor(Math.random() * 3);
                        //var shapeNum = Math.floor(Math.random() * 3);
                        //var fillNum = Math.floor(Math.random() * 3);
                        //var numberNum = Math.floor(Math.random() * 3);

                        switch (colorNum)
                        {
                            case 0: card.color = "blue";
                                break;
                            case 1: card.color = "red";
                                break;
                            case 2: card.color = "green";
                                break;
                        }

                        switch (shapeNum)
                        {
                            case 0: card.shape = "circle";
                                break;
                            case 1: card.shape = "rect";
                                break;
                            case 2: card.shape = "triangle";
                                break;
                        }

                        switch (fillNum)
                        {
                            case 0: card.fill = "solid";
                                break;
                            case 1: card.fill = "shaded";
                                break;
                            case 2: card.fill = "empty";
                                break;
                        }

                        card.number = numberNum + 1;

                        deck.push(card);
                    }
                }
            }
        }
    };
    function DetermineSet()
    {
        var selectedSet = document.getElementsByClassName("cardSelect");
        if (selectedSet.length == 3)
        {
            var selected = [];

            [].slice.call(selectedSet).forEach(function (card)
            {
                var id = card.id.substring(4, card.id.length);//Card0-Card11

                var setCard = totalSet.filter(function (sCard)
                {
                    return sCard.id == id;
                });

                selected.push(setCard[0]);
            });

            if (IsSet(selected))
            {
                completedSets.push(selected);

                var score = document.getElementById("setCount");
                score.innerText = completedSets.length;

                for (var i = 0; i < 3; i++)
                {
                    var repIndex = totalSet.indexOf(selected[i]);
                    if (deck.length > 0)
                    {
                        var deckIndex = Math.floor(Math.random() * deck.length);
                        deck[deckIndex].isNew = true;
                        totalSet[repIndex] = deck[deckIndex];
                        deck.splice(deckIndex, 1);
                    }
                    else
                    {
                        totalSet.splice(repIndex, 1);
                    }
                }

                DrawBoard();

                [].slice.call(selectedSet).forEach(function (card)
                {
                    card.style.visibility = "hidden";
                    card.classList.remove("cardSelect");
                });

                HidePossibleSets();
            }
        }
    };
    function DetermineSets()
    {
        potentialSets = [];

        if (typeof (Worker) != undefined)
        {
            setDeterminer = new Worker("../WebWorkers/SetDeterminer.js");

            setDeterminer.postMessage({ sets: totalSet });

            setDeterminer.onmessage = function (e)
            {
                potentialSets = e.data;
                DisplayPossibleSets();
            };
        }
    };
    function DisplaySet()
    {
        var sol = potentialSets[0];

        sol.forEach(function (card)
        {
            //var svg = $('#Card' + card.id);
            //svg.addClass("preview");
            var svg = document.getElementById('Card' + card.id);
            svg.classList.add('preview');

            setTimeout(function ()
            {
                svg.classList.remove('preview');
            }, 2000);
        });
    };
    function DisplayPossibleSets()
    {
        $('#possibleSetsCount').show();
        $('#possibleSetsCount').text(potentialSets.length);

        if (potentialSets.length > 0)
        {
            $('#showSolButton').attr('disabled', false);
        }
        else
        {
            $('#showSolButton').attr('disabled', true);
        }
    };
    function DrawBoard()
    {
        var board = document.getElementById("setBoard");
        var cards = "";

        totalSet.forEach(function (card)
        {
            cards += DrawCard(card);
        });

        board.innerHTML = cards;

        totalSet.forEach(function (card)
        {
            var cardEle = document.getElementById("Card" + card.id);
            cardEle.addEventListener("click", ToggleSelect);

            if (card.isNew)
            {
                card.isNew = false;
                window.getComputedStyle(cardEle).opacity;
                cardEle.style.opacity = 1;
            }
        });
    };
    function DrawCard(card)
    {
        var cardHtml = "<svg id='Card" + card.id + "' class='card' style='opacity:" + (card.isNew ? "0" : "1") + "'>";

        var points = [];

        switch (card.number)
        {
            case 2:
                points.push({ x: 35, y: 35 });
                points.push({ x: 65, y: 65 });
                break;
            case 3:
                points.push({ x: 25, y: 25 });
                points.push({ x: 75, y: 75 });
            case 1:
                points.push({ x: 50, y: 50 });
                break;
        }

        points.forEach(function (pt)
        {
            switch (card.shape)
            {
                case "circle":
                    cardHtml += "<circle cx='" + pt.x + "' cy='" + pt.y + "' r='10' ";

                    //cardHtml += "stroke='" + card.color + "' stroke-width='1' fill='" + card.color + "' />";
                    break;
                case "rect":
                    cardHtml += "<rect x='" + (pt.x - 10) + "' y='" + (pt.y - 10) + "' height='20' width='20' ";
                    //cardHtml += "style='fill:" + card.color + ";stroke:" + card.color + ";' />";
                    break;
                case "triangle":
                    cardHtml += "<polygon points='"
                              + pt.x + "," + (pt.y - 10) + " "
                              + (pt.x - 10) + "," + (pt.y + 10) + " "
                              + (pt.x + 10) + "," + (pt.y + 10) + "' ";
                    //cardHtml += "style='fill:" + card.color + ";stroke:" + card.color + "' />";
                    break;
            }

            switch (card.fill)
            {
                case "empty":
                    cardHtml += "style='fill:white;stroke:" + card.color + "' />";
                    break;
                case "solid":
                    cardHtml += "style='fill:" + card.color + ";stroke:black' />";
                    break;
                case "shaded":
                    cardHtml += "style='fill:" + card.color + ";stroke:black;fill-opacity:.5' />";
                    break;
            }

        });

        cardHtml += "</svg>";
        return cardHtml
    };
    function GenerateSet()
    {
        if (deck.length == 0)
        {            
            CreateDeck();
            totalSet.length = 0;
        }
        else
        {
            totalSet.forEach(function (card)
            {
                deck.push(card);
            });
        }

        ClearBoard();

        for (var i = 0; i < 12; i++)
        {
            var index = Math.floor(Math.random() * deck.length);
            deck[index].isNew = true;
            totalSet.push(deck[index]);
            deck.splice(index, 1);
            //var card = RandomCard();
            //totalSet.push(card);
        }

        HidePossibleSets();

        DrawBoard();
        SetTimer();
    };
    function HidePossibleSets()
    {
        $('#possibleSetsCount').hide();
        $('#showSolButton').attr('disabled', true);
    };
    function IsSet(set)
    {
        if (set.length != 3)
        {
            return false;
        }
        else
        {
            onlyUnique = function (value, index, self)
            {
                return self.indexOf(value) === index;
            };

            var colorSet = set.map(function (card) { return card.color; }).filter(onlyUnique);
            var fillSet = set.map(function (card) { return card.fill; }).filter(onlyUnique);
            var numberSet = set.map(function (card) { return card.number; }).filter(onlyUnique);
            var shapeSet = set.map(function (card) { return card.shape; }).filter(onlyUnique);

            var sameColor = (colorSet.length == 1);
            var diffColor = (colorSet.length == 3);

            var sameFill = (fillSet.length == 1);
            var diffFill = (fillSet.length == 3);

            var sameNumber = (numberSet.length == 1);
            var diffNumber = (numberSet.length == 3);

            var sameShape = (shapeSet.length == 1);
            var diffShape = (shapeSet.length == 3);

            return (sameColor || diffColor)
                && (sameFill || diffFill)
                && (sameNumber || diffNumber)
                && (sameShape || diffShape);
        }
    };
    function RandomCard()
    {
        var card = {
            id: cardCount,
            isNew: true
        };
        cardCount++;

        var colorNum = Math.floor(Math.random() * 3);
        var shapeNum = Math.floor(Math.random() * 3);
        var fillNum = Math.floor(Math.random() * 3);
        var numberNum = Math.floor(Math.random() * 3);

        switch (colorNum)
        {
            case 0: card.color = "blue";
                break;
            case 1: card.color = "red";
                break;
            case 2: card.color = "green";
                break;
        }

        switch (shapeNum)
        {
            case 0: card.shape = "circle";
                break;
            case 1: card.shape = "rect";
                break;
            case 2: card.shape = "triangle";
                break;
        }

        switch (fillNum)
        {
            case 0: card.fill = "solid";
                break;
            case 1: card.fill = "shaded";
                break;
            case 2: card.fill = "empty";
                break;
        }

        card.number = numberNum + 1;

        return card;
    };
    function SetTimer()
    {
        if (typeof (Worker) != undefined)
        {
            if (timer == null)
            {
                timer = new Worker("../WebWorkers/Timer.js");

                timer.onmessage = function (results)
                {
                    var time = document.getElementById("timePlayed");
                    var seconds = Number(results.data);
                    time.innerText = parseInt(seconds / 60) + ":" + (seconds % 60);
                };
            }
        }
    };
    function ToggleSelect(event)
    {
        if (this.classList.contains("cardSelect"))
        {
            this.classList.remove("cardSelect");
        }
        else
        {
            this.classList.add("cardSelect");
        }

        DetermineSet();
    };

    return {
        ClearBoard: ClearBoard,
        DrawCard: DrawCard,
        DetermineSet: DetermineSet,
        DetermineSets: DetermineSets,
        DisplaySet: DisplaySet,
        DrawBoard: DrawBoard,
        GenerateSet: GenerateSet,
        IsSet: IsSet,
        RandomCard: RandomCard,
        ToggleSelect: ToggleSelect
    };
})();