/**
 * Created by KE on 2017/4/26.
 */
"use strict";

var LINE_COUNT=9;
var CELL_SIZE=50;
var BOARD_WIDTH=500;
var BOARD_HEIGHT=500;
var BOARD_SIZE=451;
var CANVAS;
var CANVAS_CTX;
var GAME_STATUS;
var PERSITENCY = null;
var HalmaGameStatus = {
    bestStepRecord:Math.POSITIVE_INFINITY,

    new:function(){
        var gameStatus={};
        gameStatus.moveCount=0;
        gameStatus.isGameInProgress=true;
        gameStatus.currentPieceIndex=-1;
        gameStatus.isInJump=false;
        gameStatus.pieces = [];
        gameStatus.name = "halma";
        for(var ii=0;ii<9;ii++)
        {
            var row = Math.floor(ii/3+6);
            var col = ii%3;
            gameStatus.pieces.push({row:row,col:col,clicked:false});
        }
        return gameStatus;
    }
};

function drawBoard()
{
    CANVAS_CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
    CANVAS_CTX.beginPath();
    CANVAS_CTX.strokeStyle = "#000";
    for(var ii = 0; ii <= 9; ii++)
    {
        // draw horizental lines
        CANVAS_CTX.moveTo(0,CELL_SIZE*ii+0.5);
        CANVAS_CTX.lineTo(CELL_SIZE*LINE_COUNT, CELL_SIZE*ii+0.5);
        // draw vertical lines
        CANVAS_CTX.moveTo(CELL_SIZE*ii+0.5,0);
        CANVAS_CTX.lineTo(CELL_SIZE*ii+0.5, CELL_SIZE*LINE_COUNT);
    }
    CANVAS_CTX.closePath();
    CANVAS_CTX.stroke();
}

function drawPiece(piece) {
    CANVAS_CTX.beginPath();

    // CANVAS_CTX.moveTo(,);
    CANVAS_CTX.arc(piece.col*CELL_SIZE+25,CELL_SIZE*piece.row+25,22,0,360);

    if(piece.clicked)
    {
        CANVAS_CTX.fillStyle = "#000";
        CANVAS_CTX.fill();
    }
    CANVAS_CTX.closePath();
    CANVAS_CTX.stroke();
}
function drawPieces() {
    for(var ii=0;ii<GAME_STATUS.pieces.length;ii++)
    {
        drawPiece(GAME_STATUS.pieces[ii]);
    }
}

function drawDashboard() {
    // move count
    CANVAS_CTX.font = "bold 20px sans-serif";
    CANVAS_CTX.fillText("Moves: "+GAME_STATUS.moveCount.toString(),  10,480 );

    // best record
    if(HalmaGameStatus.bestStepRecord!== Math.POSITIVE_INFINITY)
        CANVAS_CTX.fillText("Least moves: "+HalmaGameStatus.bestStepRecord.toString(),  200,480 );
}

function isAPieceBetweenCell(cellA,cellB)
{
    var result = false;
    if(cellA && cellB)
    {
        var row = (cellA.row + cellB.row) /2;
        var col = (cellA.col + cellB.col) /2;
        var pieceIndex = getClickedPiece({row:row, col:col});
        if(pieceIndex!==-1)
            result = true;
    }
    return result;
}

function getCursorPosition(e) {
    var x;
    var y;
    if (e.pageX !== undefined && e.pageY !== undefined) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    if(y>=BOARD_SIZE || x>=BOARD_SIZE)
        return null;
    return {row:Math.floor(y/CELL_SIZE),col:Math.floor(x/CELL_SIZE)};
}

function drawGame() {
    drawBoard();
    drawPieces();
    drawDashboard();
}

function halmaOnClick(event) {
    if(!GAME_STATUS.isGameInProgress)
        return;
    var clickedCellPos = getCursorPosition(event);
    if(!clickedCellPos)
        return
    var clickedPieceIndex = getClickedPiece(clickedCellPos);
    // No piece clicked
    if(clickedPieceIndex ===-1 && GAME_STATUS.currentPieceIndex ===-1) {
        return;
    }
    else if(clickedPieceIndex >= 0 ) {
        if(GAME_STATUS.currentPieceIndex>=0)
            GAME_STATUS.pieces[GAME_STATUS.currentPieceIndex].clicked = false;
        GAME_STATUS.currentPieceIndex = clickedPieceIndex;
        GAME_STATUS.pieces[GAME_STATUS.currentPieceIndex].clicked = true;
        drawGame();
        PERSITENCY.saveGame(GAME_STATUS);
        return;
    }

    var currentPiece = GAME_STATUS.pieces[GAME_STATUS.currentPieceIndex];
    currentPiece.clicked = true;
    var rowStep = Math.abs(clickedCellPos.row-currentPiece.row);
    var colStep = Math.abs(clickedCellPos.col-currentPiece.col);
    var stepSum = rowStep+colStep;
    if(stepSum >0 && stepSum<=2 && ( rowStep === 1 || colStep ===1 )) // valid one step move
    {
        currentPiece.row = clickedCellPos.row;
        currentPiece.col = clickedCellPos.col;
        GAME_STATUS.moveCount++;
        currentPiece.clicked=false;
        GAME_STATUS.currentPieceIndex=-1;
        GAME_STATUS.isInJump = false;
    }
    else if((stepSum ===4 || stepSum ===2) && isAPieceBetweenCell( currentPiece,clickedCellPos)) // valid jump
    {
        //colision check and valid jump check
        currentPiece.row = clickedCellPos.row;
        currentPiece.col = clickedCellPos.col;
        if(!GAME_STATUS.isInJump)
            GAME_STATUS.moveCount++;
        GAME_STATUS.isInJump = true;
    }

    GAME_STATUS.isGameInProgress = isGameOver();
    if(!GAME_STATUS.isGameInProgress)
    {
        currentPiece.clicked =false;
        GAME_STATUS.currentPieceIndex = -1;
        HalmaGameStatus.bestStepRecord = GAME_STATUS.moveCount;
    }
    drawGame();
    PERSITENCY.saveGame(GAME_STATUS);
}
// Return clicked piece index
function getClickedPiece(cellPos)
{
    var clickedPieceIndex = -1;
    for(var ii=0;ii<GAME_STATUS.pieces.length;ii ++)
    {
        var piece= GAME_STATUS.pieces[ii];
        if(piece.row === cellPos.row && piece.col === cellPos.col)
        {
            clickedPieceIndex = ii;
            break;
        }
    }
    return clickedPieceIndex;
}

function isGameOver() {
    for(var ii=0;ii<GAME_STATUS.pieces.length;ii++)
    {
        var piece = GAME_STATUS.pieces[ii];
        if(piece.row>2 || piece.col<6)
        {
            return true;
        }
    }
    return false;
}
function loadGameCB(gameState) {

    GAME_STATUS = gameState;
    if(!GAME_STATUS || !GAME_STATUS.isGameInProgress)
    {
        GAME_STATUS = HalmaGameStatus.new();
    }
    drawGame();
}

function initGame() {
    PERSITENCY = GamePersistency.new();
    PERSITENCY.loadGame(loadGameCB);
    if(!CANVAS)
    {
        CANVAS = document.getElementById("board");
        CANVAS.width = BOARD_WIDTH;
        CANVAS.height = BOARD_HEIGHT;
    }

    if(!CANVAS_CTX )
    {
        CANVAS_CTX = CANVAS.getContext("2d");
    }

    CANVAS.addEventListener("click", halmaOnClick, false);
    drawBoard();
}

window.onload=initGame;