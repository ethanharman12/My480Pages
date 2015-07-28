var inheritApp = (function ()
{
    function Auto(name)
    {
        this.name = name ? name : "Auto";
        this.wheelCount = 4;
    };

    Auto.prototype.showMessage = function ()
    {
        return "Das Auto Message";
    };

    function Motorcycle(name)
    {
        Auto.call(this, name);
        this.wheelCount = 2;
    };

    Motorcycle.prototype = Object.create(Auto.prototype);
    //Motorcycle.constructor = Motorcycle;

    function Car(name)
    {
        Auto.call(this, name);
    };

    Car.prototype = Object.create(Auto.prototype);
    //Car.constructor = Car;

    function Truck(name)
    {
        Auto.call(this, name);
        this.wheelCount = 10;
    };

    Truck.prototype = Object.create(Auto.prototype);

    Truck.prototype.showMessage = function () { return this.name + " comin' atcha!" };
    //Truck.constructor = Truck;

    function DisplayGarage()
    {
        var garage = document.getElementById("garage");
        $.each(autoList, function(index, auto)
        //autoList.forEach(function (auto)
        {
            garage.innerHTML += "<i>" + auto.name + "</i><br>";
            garage.innerHTML += "Number of wheels: " + auto.wheelCount + "<br>";
            garage.innerHTML += "Message: " + auto.showMessage() + "<br>";
            garage.innerHTML += "<br>";
        });
    };

    function FillGarage()
    {
        var bike = new Motorcycle("Bike");
        var car = new Car();
        var truck = new Truck("Big Rig");

        //autoList.push(bike, car, truck);
        autoList = [bike, car, truck];
    };

    return {
        DisplayGarage: DisplayGarage,
        FillGarage: FillGarage
    };
})();

$(document).ready(function ()
{
    inheritApp.FillGarage();
    inheritApp.DisplayGarage();
});