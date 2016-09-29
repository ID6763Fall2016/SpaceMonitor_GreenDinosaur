# SpaceMonitor
GreenDinosaur team: John Kimionis, Hareen Godthi

This is the repository for the Cafe Monitor. 
Additional instructions for setup can be found in the repository Wiki.




#Required Components:
* a raspberry pi 3
* a photoresistor
* a temperature and humidity sensor (DHT22)
* a pushbutton
* a microphone (SPW2430)
* an LED
* an ADC (ADS1115)


# How to Use the Code:
Main code: Space_Monitor/sm.js

HTML/CSS folder: Space_Monitor/sm/

Database folder: Space_Monitor/db/

run with
```
node sm.js
```


# Assembly
1. Laser cut the pieces of the house template on 1/16" chipboard.
2. Use hot glue to put together the four side walls.
  * the two pentagons and the two rectangle pieces
3. Glue the bottom piece to the four walls.
  * the bottom piece is the square with four outward extensions
4. Glue a piece of tracing paper over the windows inside the house.
5. Tape the microphone to the underside of the roof piece so that it can be seen through the hole from the outside.
  * the roof pieces are the rounded rectangles with holes in the middle
6. Like in the previous step, the photoresistor should be taped to the underside of the second roof piece.
7. Secure the temperature and humidity sensor in the rectangular hole in the side wall.
8. Wire the breadboard with the button, resistor, and additional external wires through the hole in the side wall so that they are outside the house.
9. Place the raspberry pi inside the house.
10. Finally, place the two roof pieces on top of the house.

