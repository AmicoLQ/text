var board = new Array();
var score = 0;
var hasConflicted = new Array();//判断每个格子是否已经发生过碰撞，避免一下子加好几个格子
 
$(document).ready(function () {
    newgame();
});

// 获取每个单元格的坐标
function getPosition( pos ) {
    return 20 + pos * 120;
}

 
function newgame() {
    // 初始化棋盘格
    init();
    // 在随机两个格子生成数字
    generateOneNumber();
    generateOneNumber();
}
 
/*  1、初始化棋盘格 gridCell
 *  2、初始化二维数组 用于存储数据 board
  3、初始化数据 清零 updateBoardView();*/ 

function init() {
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++) {
            var gridCell = $("#grid-cell-" + i + "-" + j);
            gridCell.css({
                'top':getPosition(i),
                'left':getPosition(j)
            });
        }

    for (var i = 0; i < 4; i++) {
        board[i] = new Array();
        hasConflicted[i] = new Array();
        for (var j = 0; j < 4; j++) {
            board[i][j] = 0;
            hasConflicted[i][j] = false;
        }
    }
    updateBoardView();
    score = 0;
    updateScore(score);
}

// 初始化数据，就是将数据可视化！根据board[i][j]存的数值来画图！
function updateBoardView() {
    $(".number-cell").remove();
    for (var i = 0; i < 4; i++)
        for (var j = 0; j < 4; j++) {
            $("#grid-container").append('<div class="number-cell" id="number-cell-' + i + '-' + j + '"></div>');
            var theNumberCell = $('#number-cell-' + i + '-' + j);
            if (board[i][j] == 0) {
                theNumberCell.css({
                    'width':'0px',
                    'height': '0px',
                    'top':getPosition(i) + 50,
                    'left': getPosition(j) + 50
                });
            } 
            else {
                theNumberCell.css({
                'width' : '100px',
                'height': '100px',
                'top'   : getPosition(i),
                'left'  :getPosition(j),
                'background-color': getNumberBackgroundColor(board[i][j]),
                'color' :getNumberColor(board[i][j])
                })
                .text(board[i][j]);
            }
            hasConflicted[i][j] = false;
        }
}

 
// 随机选一个格子生成一个数字
function generateOneNumber() {
    if (nospace(board))
        return false;
 
    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));
    while(true){
        if(board[randx][randy] == 0)
            break;
        randx = parseInt(Math.floor(Math.random() * 4));
        randy = parseInt(Math.floor(Math.random() * 4));
    }
 
    // 随机一个数字
    var randNumber = Math.random() < 0.5 ? 2 : 4;
 
    // 在随机位置显示随机数字
    board[randx][randy] = randNumber;
    showNumberWithAnimation(randx, randy, randNumber);
 
    return true;
}
 
// 判断键盘的响应时间 上下左右
$(document).keydown(function (event) {
    event.preventDefault();
    switch (event.keyCode) {
        case 37: // left 向左移动
            if (moveLeft()) {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            };
            break;
        case 38: // up 向上移动
            if (moveUp()) {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            };
            break;
        case 39: // right 向右移动
            if (moveRight()) {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            };
            break;
        case 40: // down 向下移动
            if (moveDown()) {
                setTimeout("generateOneNumber()", 210);
                setTimeout("isgameover()", 300);
            };
            break;
        default: // default
            break;
    }
});
 

function moveLeft() {
 
    // 1、首先，判断能否向左移动
    if (!canMoveLeft(board))
        return false;
 
    /*2、如果可以向左移动：
     *   ①当前的数字是否为0，不为0则进行左移 board[i][j] != 0
     *   ②如果左侧为空格子，则数字进行一个移位操作 board[i][k] == 0
     *   ③如果左侧有数字且不相等，则数字还是进行移位操作 noBlockHorizontal
     *   ④如果左侧有数字且相等，则数字进行相加操作 board[i][k] == board[i][j]
     */
    for (var i = 0; i < 4; i++)
        for (var j = 1; j < 4; j++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, k, j, board)) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue; //continue 用于跳过循环中的一个迭代,跳到for(var k....)
                    }
                    else if (board[i][k] == board[i][j] && noBlockHorizontal(i, k, j, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        updateScore(score);
 
                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    // 3、初始化数据 updateBoardView()
    // 为显示动画效果，设置该函数的等待时间200毫秒
    setTimeout("updateBoardView()", 200);
    return true;
}
 

// 向上移动
function moveUp() {
 
    if (!canMoveUp(board))
        return false;
 
    //moveUp
    for (var j = 0; j < 4; j++)
        for (var i = 1; i < 4; i++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] == 0 && noBlockVertical(j, k, i, board)) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if (board[k][j] == board[i][j] && noBlockVertical(j, k, i, board) && !hasConflicted[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        updateScore(score);
 
                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()", 200);
    return true;
}
 

// 向右移动
function moveRight() {
    if (!canMoveRight(board))
        return false;
 
    //moveRight
    for (var i = 0; i < 4; i++)
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] == 0 && noBlockHorizontal(i, j, k, board)) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if (board[i][k] == board[i][j] && noBlockHorizontal(i, j, k, board) && !hasConflicted[i][k]) {
                        //move
                        showMoveAnimation(i, j, i, k);
                        //add
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        updateScore(score);
 
                        hasConflicted[i][k] = true;
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()", 200);
    return true;
}
 

// 向下移动
function moveDown() {
    if (!canMoveDown(board))
        return false;
 
    //moveDown
    for (var j = 0; j < 4; j++)
        for (var i = 2; i >= 0; i--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] == 0 && noBlockVertical(j, i, k, board)) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        continue;
                    }
                    else if (board[k][j] == board[i][j] && noBlockVertical(j, i, k, board) && !hasConflicted[k][j]) {
                        //move
                        showMoveAnimation(i, j, k, j);
                        //add
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        updateScore(score);
 
                        hasConflicted[k][j] = true;
                        continue;
                    }
                }
            }
        }
    setTimeout("updateBoardView()", 200);
    return true;
}

function  updateScore(score){
    $('#score').text(score);
}
 
// 游戏结束
function isgameover() {
    if (nospace(board) && nomove(board)){
        gameover();
    }
    if (number==16){
        gameover();
    }
}

function gameover() {
    alert("游戏结束！您的得分为：" + score)
    newgame();
}
