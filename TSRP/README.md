TSRP client
===========
Executing:

    npm -l install
    cd TSRP
    node flower-power-tsrp.js

will run a script that continuously looks for Flower Power devices,
queries them at 1 hour intervals,
and then rebroadcasts the information using [TSRP](http://thethingsystem.com/dev/Thing-Sensor-Reporting-Protocol.html).

If more than one instance of this script is running (on different hosts) in a network,
then at the instances will determine which one is responsible for polling any given Flower Power.
Typically, this is based on highest RSSI value.
If an instance fails, the responsibility for polling a particular Flower Power will failover automatically.
