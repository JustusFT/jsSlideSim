window.onload = generateBoard;

/*
 * VARIABLES
 */
var tiles = document.getElementsByClassName("tile"),
    piecesSolved = 0,
    timerState = 0,
    timer,
    times = [],
    board = {
        width: 4,
        height: 4,
        get area() {
            return this.width * this.height;
        }
    },
    //keep track of the last tile the board (empty slot) and be able to move it around
    empty = {
        position: null,
        move: function (n) {
            if (this.position + n < 0 || this.position + n >= board.area)
                return;
            swapElements(this.position, this.position + n);
            //remove event listeners via removing and putting back all elements
            //TODO only do with necessary elements for optimization
            for (var i = 0; i < tiles.length; i++) {
                tiles[i].parentNode.replaceChild(tiles[i].cloneNode(true), tiles[i]);
            }
            var lastPosition = this.position;
            this.position += n;
            //check if solved
            var emptyPosition = this.position + 1;
            var movedTilePosition = lastPosition + 1;
            var movedTileNumber = parseInt(tiles[lastPosition].innerHTML);
            if (movedTileNumber === movedTilePosition) {
                piecesSolved++;
                //also chack if all pieces are solved
                if (piecesSolved === board.area - 1) {
                    stopTimer();
                    addTime();
                    return;
                }
            } else if (movedTileNumber === emptyPosition) {
                piecesSolved--;
            }
            if (timerState > 0) {
                generateTileEvents();
                if (timerState === 1) {
                    timerState++;
                    startTimer();
                }
            }
        },
        up: function () {
            this.move(-board.width);
        },
        down: function () {
            this.move(board.width);
        },
        left: function () {
            if (this.position % board.width === 0)
                return;
            this.move(-1);
        },
        right: function () {
            if (this.position % board.width === board.width - 1)
                return;
            this.move(1);
        }
    };

/*
 * GLOBAL FUNCTIONS
 */
//dynamically generate board HTML depending on board variables
function generateBoard() {
    stopTimer();
    empty.position = board.area - 1;

    //HTML string to add
    var str = "<div>";
    for (var i = 1; i <= board.area - 1; i++) {
        str += "<span class='tile'>" + i + "</span>";
        if (i % board.width === 0 && i !== board.area) {
            str += "</div><div>";
        }
    }
    str += "<span id='empty' class='tile'></span></div>";
    document.getElementById("board").innerHTML = str;

    //Add background color CSS to tiles
    switch (document.getElementById("colorScheme").value) {
        case "lbl":
        default:
            var tile = 0;
            var hues = [];
            var colorCount = board.height;
            for (var i = 0; i < colorCount; i++) {
                hues.push(((i + 1) / colorCount * 360) - (1 / colorCount * 360));
            }
            
            for (var i = 0; i < board.height; i++) {
                for (var j = 0; j < board.width; j++) {
                    tiles[tile].style.backgroundColor = "hsl(" + hues[i] + ", 100%, 75%)";
                    tile++;
                }
            }
            break;
        case "l2l":
            var tile = 0;
            var hues = [];
            var colorCount = board.height - 2 + (board.width);
            for (var i = 0; i < colorCount; i++) {
                hues.push(((i + 1) / colorCount * 360) - (1 / colorCount * 360));
            }
            
            for (var i = 0; i < board.height - 2; i++) {
                for (var j = 0; j < board.width; j++) {
                    tiles[tile].style.backgroundColor = "hsl(" + hues[i] + ", 100%, 75%)";
                    tile++;
                }
            }
            for (var i = 0; i < board.width * 2; i++) {
                tiles[tile].style.backgroundColor = "hsl(" + hues[(i % board.width) + board.height - 2] + ", 100%, 75%)";
                tile++;
            }
            break;
        case "fringe":
            var tile = board.area - 1;
            var hues = [];
            var colorCount = Math.max(board.width, board.height) - 1;
            for (var i = 0; i < colorCount; i++) {
                hues.push(((i + 1) / colorCount * 360) - (1 / colorCount * 360));
            }
            
            for (var i = 0; i < board.height; i++) {
                for (var j = 0; j < board.width; j++) {
                    tiles[tile].style.backgroundColor = "hsl(" + hues[colorCount - Math.max(i, j)] + ", 100%, 75%)";
                    tile--;
                }
            }
            break;
    }
}

function scramble() {
    generateBoard();
    //swap every tile (excluding empty) on the board
    for (var i = 0; i < board.area - 1; i++) {
        var rand = Math.floor(Math.random() * (board.area - 2));
        //prevent swapping a tile with itself
        if (rand >= i) {
            rand += 1;
        }
        swapElements(i, rand);
    }
    //do another swap if there's parity
    if (board.area % 2 === 0) {
        swapElements(0, 1);
    }
    //evaluate solved pieces
    piecesSolved = 0;
    for (var i = 0; i < tiles.length - 1; i++) {
        if (parseInt(tiles[i].innerHTML) === (i + 1)) {
            piecesSolved++;
        }
    }
    //now move the empty to a random spot using sliding moves
    for (var i = 0; i < Math.floor(Math.random() * board.width); i++) {
        empty.left();
    }
    for (var i = 0; i < Math.floor(Math.random() * board.height); i++) {
        empty.up();
    }
    //add a event listener to empty, once it hace been moved, timer starts
    tiles[empty.position].addEventListener("mouseover", function () {
        generateTileEvents();
        timerState++;
    });
}

//code from http://stackoverflow.com/questions/10716986/swap-2-html-elements-and-preserve-event-listeners-on-them
function swapElements(indexA, indexB) {
    swapHTML(tiles[indexA], tiles[indexB]);
    function swapHTML(obj1, obj2) {
        // save the location of obj2
        var parent2 = obj2.parentNode;
        var next2 = obj2.nextSibling;
        // special case for obj1 is the next sibling of obj2
        if (next2 === obj1) {
            // just put obj1 before obj2
            parent2.insertBefore(obj1, obj2);
        } else {
            // insert obj2 right before obj1
            obj1.parentNode.insertBefore(obj2, obj1);

            // now insert obj1 where obj2 was
            if (next2) {
                // if there was an element after obj2, then insert obj1 right before that
                parent2.insertBefore(obj1, next2);
            } else {
                // otherwise, just append as last child
                parent2.appendChild(obj1);
            }
        }
    }
}

function changeBoardSize(axis, dir) {
    board[axis] += dir;
    board[axis] = Math.max(2, Math.min(board[axis], 10));
    generateBoard();
    document.getElementById("boardWidth").innerHTML = board.width;
    document.getElementById("boardHeight").innerHTML = board.height;
}

function generateTileEvents() {
    //TODO hovering on tiles more than 1 tile away only moves the empty slot one space
    //(it still moves to the desired place but it's important if you want to incorparate click controls)

    var leftOfEmpty = empty.position % board.width,
        rightOfEmpty = board.width - leftOfEmpty - 1,
        aboveEmpty = Math.floor(empty.position / board.width),
        belowEmpty = Math.floor(board.height - aboveEmpty) - 1;

    for (var i = 0; i < leftOfEmpty; i++) {
        tiles[empty.position - i - 1].addEventListener("mouseover", function () {
            empty.left();
        });
    }
    for (var i = 0; i < rightOfEmpty; i++) {
        tiles[empty.position + i + 1].addEventListener("mouseover", function () {
            empty.right();
        });
    }
    for (var i = 0; i < aboveEmpty; i++) {
        tiles[empty.position - (board.width * (i + 1))].addEventListener("mouseover", function () {
            empty.up();
        });
    }
    for (var i = 0; i < belowEmpty; i++) {
        tiles[empty.position + (board.width * (i + 1))].addEventListener("mouseover", function () {
            empty.down();
        });
    }
}

function startTimer() {
    var start = Date.now();
    timer = setInterval(function () {
        //TODO FIXME passing a minute does not convert seconds to minute
        //e.x. displays as 125.00s other than 2:05s
        //TODO maybe even 10m = DNF?
        document.getElementById("timer").innerHTML = ((Date.now() - start) / 1000).toFixed(2);
    }, 1);
}

function stopTimer() {
    timerState = 0;
    clearInterval(timer);
}

function addTime() {
    times.push(parseFloat(document.getElementById("timer").innerHTML));
    getAverages();
    renderTimes();
}

function getAverages() {
    document.getElementById("timeStats").innerHTML = "";
    if (times.length === 0)
        return;

    var sortedTimes = times.slice(0).sort(function (a, b) {
        return a < b;
    });

    document.getElementById("timeStats").innerHTML += "<div><b>Best time:</b> " + sortedTimes[sortedTimes.length - 1].toFixed(2) + "</div>";
    document.getElementById("timeStats").innerHTML += "<div><b>Worst time:</b> " + sortedTimes[0].toFixed(2) + "</div>";

    getAverageOf("Current avg5", times, 5);
    getAverageOf("Best avg5", sortedTimes, 5);
    getAverageOf("Current avg12", times, 12);
    getAverageOf("Best avg12", sortedTimes, 12);
    getAverageOf("Current avg50", times, 50);
    getAverageOf("Best avg50", sortedTimes, 50);
    getAverageOf("Current avg100", times, 100);
    getAverageOf("Best avg100", sortedTimes, 100);
    getAverageOf("Session avg", sortedTimes, sortedTimes.length);

    document.getElementById("timeStats").innerHTML += "<b>Session mean:</b> " + getMean(times);

    function getMean(arr) {
        var mean = 0;
        for (var i = 0; i < arr.length; i++) {
            mean += arr[i];
        }
        return (mean / arr.length).toFixed(2);
    }

    function getAverageOf(str, arr, x) {
        if (arr.length < x || arr.length <= 2) {
            return;
        } else {
            //remove best and worst time
            var timesToAverage = arr.slice(-x).sort(function (a, b) {
                return a > b;
            }).slice(1, x - 1);
            //get average of remaining times
            document.getElementById("timeStats").innerHTML += "<div><b>" + str + ":</b> " + getMean(timesToAverage) + "</div>";
        }
    }
}

function resetTimes() {
    var yes = confirm("Reset all times?");
    if (!yes)
        return;
    times.length = 0;
    renderTimes();
    getAverages();
}

function renderTimes() {
    var str = "";
    for (var i = 0; i < times.length; i++) {
        str += "<span>" + times[i].toFixed(2) + "</span>";
        str += ", ";
    }
    str = str.substr(0, str.length - 2);
    document.getElementById("times").innerHTML = str;
}