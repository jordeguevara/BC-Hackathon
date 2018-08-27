/* Authors:
            Jorde
            Edward
            Kevin
            Abhiskek
*/

var Turn = 0;
var start = 3;
var large = 73;

function isAlly(that, botID) {
    if (botID < 1) {
        return false
    }
    var bot = that.getRobot(botID);
    var me = that.me();
    if (bot.signal == me.signal || bot.signal == (me.signal + large) % 15) {
        return true
    }
    return false
}
var coords = [
    [bc.NORTHWEST, bc.NORTH, bc.NORTHEAST],
    [bc.WEST, 0, bc.EAST],
    [bc.SOUTHWEST, bc.SOUTH, bc.SOUTHEAST],
];

function Attack(that, FieldOfViz) {
    var me = that.me();
    var close = that.getVisibleRobots();
    for (var i in close) {
        if (close[i].id > 0 && !aly(that, close[i].id) && Math.abs(close[i].x - me.x) <= 1 && Math.abs(close[i].y - me.y) <= 1) {
            return that.attack(coords[close[i].y - me.y][me.x - close[i].x]);
        }
    }
}

function isInPosition(that, FieldOfViz) {
    if (isAlly(that, FieldOfViz[3][1]) && FieldOfViz[3][1] != bc.HOLE) {
        return true
    } else if (isAlly(that, FieldOfViz[3][5]) && FieldOfViz[3][5] != bc.HOLE) {
        return true
    } else if (isAlly(that, FieldOfViz[4][2]) && FieldOfViz[4][2] != bc.HOLE) {
        return true
    } else if (isAlly(that, FieldOfViz[4][4]) && FieldOfViz[4][4] != bc.HOLE) {
        return true;
    } else if (isAlly(that, FieldOfViz[2][4]) && FieldOfViz[2][4] != bc.HOLE) {
        return true;
    } else if (isAlly(that, FieldOfViz[2][2]) && FieldOfViz[2][2] != bc.HOLE) {
        return true;
    } else {
        return false;
    }
}

function avoidObstacles(that, dir) { //Jorde
    //Check the location of robot
    var position;
    var directions = new Array();

    for (var i = dir; i < dir + 8; i++) {
        position = that.getInDirection(i % 8); //checks all directions NORTH,SOUTH,ETC
        directions.push(position);
    }

    var nextMoveDirection;

    for (var j = 0; j < 7; j++) {
        if (directions[j] === 0) {
            nextMoveDirection = (j + dir) % 8; //records the direction of next move 
            break;
        }

    }
    return that.move(nextMoveDirection);
}

function GoTo(that, X, Y) {//Edward
    me = that.me();
    seen = {
        x: X,
        y: Y
    };
    if (seen) {
        var left = 0;
        if (seen.x > me.x) {
            left = -1;
        } else if (seen.x < me.x) {
            left = 1;
        }
        var down = 0;
        if (seen.y > me.y) {
            down = -10;
        } else if (seen.y < me.y) {
            down = 10;
        }
        switch (left + down) {
            case (0):
                return 0;
                break;
            case (1):
                return bc.WEST;
            case (-1):
                return bc.EAST;
            case (10):
                return bc.NORTH;
            case (-10):
                return bc.SOUTH;
            case (11):
                return bc.NORTHWEST;
            case (9):
                return bc.NORTHEAST;
            case (-11):
                return bc.SOUTHEAST;
            case (-9):
                return bc.SOUTHWEST;
        }
    }
}

function goTo(that, x, y) {
    return avoidObstacles(that, GoTo(that, x, y));
}

var Fexcept={
    '3,2':true,
    '2,3':true,
    '3,4':true,
    '4,3':true
};

function Converge(that, FieldOfViz) {
    for (var i = 1; i < 6; i++) {
        for (var j = 1; j < 6; j++) {
            var c = 0;
            if (FieldOfViz[i - 1][j] > 1) {
                c++;
            }
            if (FieldOfViz[i + 1][j] > 1) {
                c++;
            }
            if (FieldOfViz[i][j - 1] > 1) {
                c++;
            }
            if (FieldOfViz[i][j + 1] > 1) {
                c++;                        
            }

            if (c >= 3 && FieldOfViz[i][j]!=-1) {
                if(Fexcept.hasOwnProperty(i+','+j)){return -1;}
                if (FieldOfViz[i - 1][j] == 0) {
                    return goTo(that, i - 1, j);
                }
                if (FieldOfViz[i + 1][j] == 0) {
                    return goTo(that, i + 1, j);
                }
                if (FieldOfViz[i][j - 1] == 0) {
                    return goTo(that, i, j - 1);
                }
                if (FieldOfViz[i][j + 1] == 0) {
                    return goTo(that, i, j + 1);
                }
            }
        }
    }
}

function DiamondFormation(that, FieldOfViz) {//kevin
    var C = Converge(that, FieldOfViz);
    if(C==-1){return;}
    if (C) {
        return C;
    }
    var xPos = -1000 //
    var yPos = -1000
    var didBreak = false;
    var minDistx = 10
    var minDisty = 10
    for (var i = 0; i < 7; i++) {
        for (var j = 0; j < 7; j++) {
            if (!(i == 3 && j == 3) && FieldOfViz[i][j] != bc.EMPTY && FieldOfViz[i][j] != bc.HOLE && (i != 3 && j != 3)){
                xPos = i;
                yPos = j;
                didBreak = true;
                break;
            }
        }
        if (didBreak) {
            break;
        }
    }
    var me=that.me();
    if (isInPosition(that, FieldOfViz)) {
        if(Math.sqrt((10-me.x)*(10-me.x)+(10-me.y)*(10-me.y))<3){return;}
        return goTo(that, 10, 10);
    }
    return goTo(that,10,10);
}
class MyRobot extends BCAbstractRobot {
    turn() {
        Turn++;
        var map = this.getVisibleMap();
        var temp = DiamondFormation(this, map);
        var me = this.me();
        var seeing = this.getVisibleRobots();
        var seen = false;
        var closest = Infinity;
        var attack=Attack(this,map);
        this.signal((me.signal + large) % 15);
        if (temp) {
            return temp;
        }
        else
            return attack;
    }
}

/**
this.me(): Returns an object containing details about your bot, including .health and .id.
this.log(message): Print a message to the command line. You cannot use ordinary console.log in Battlehack for security reasons.
this.signal(integer): Set your signal bits to a certain value 0 to 15 inclusive.
this.getRobot(id): Returns a robot object with the given integer ID. Returns null if such a robot is not in your vision.
this.getVisibleRobots(): Returns a list of all robot objects visible to you.
this.getVisibleMap(): Returns a 7x7 2d int array of your robot's current vision, where a value of bc.EMPTY means there's nothing there, bc.HOLE means the square is impassable, and if the value is neither hole or empty, the ID of the robot occupying that space.
this.getRelativePos(dX,dY): A shortcut to get what's in the square (dX,dY) away. Returns a robot object if one is there, otherwise bc.EMPTY or bc.HOLE.
this.getInDirection(direction): Returns the output of this.getRelativePos in the specified direction.
this.move(direction): Returns an action to move in a given direction.
this.attack(direction): Returns an action to attack in a given direction.
bc.NORTH:2
bc.NORTHEAST:1
bc.EAST:0
bc.SOUTHEAST:7
bc.SOUTH:6
bc.SOUTHWEST:5
bc.WEST:4
bc.NORTHWEST:3
bc.EMPTY:0
bc.HOLE:-1
*/
