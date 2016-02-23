/* global Phaser, io, on, Player*/
var game = new Phaser.Game(1200, 900, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render:render });
var maze;
var maze_grid;

var base_layer;
var wall_up_layer;
var wall_down_layer;
var wall_left_layer;
var wall_right_layer;

var maze_h=51;
var maze_w=51;
var maze_px=16;

var speed=1000;

var socket;
var player;

//var enemies=[];
var drawEnemies=[];

var cursors;

var startx=24;
var starty=24;
var finx=784;
var finy=784;

var upKey;
var downKey;
var leftKey;
var rightKey;

function preload(){
    game.load.image('maze_tiles', 'Images/maze_tiles.png');
	game.load.image('player_pic', 'Images/knight.png');
	game.load.image('enemy', 'Images/player_1.png');
}

function create(){
    
    socket = io.connect("192.168.2.18:8080");
    game.physics.startSystem(Phaser.Physics.ARCADE);
	
	maze=game.add.tilemap();
    maze.addTilesetImage('maze_tiles', null, maze_px, maze_px, 0, 0, 0);
	
    base_layer = maze.create('base_layer', maze_w, maze_h, maze_px, maze_px);
    
    base_layer.resizeWorld();
	
	player = game.add.sprite(24, 24, 'player_pic');
    player.anchor.setTo(0.5, 0.5);
    
	game.physics.enable(player);
	player.body.setSize(12,12);
	player.body.collideWorldBounds = true;
	
	//base_layer.debug = true;
	
	wall_up_layer = maze.createBlankLayer('wall_up_layer', maze_w, maze_h, maze_px, maze_px);
    wall_down_layer = maze.createBlankLayer('wall_down_layer', maze_w, maze_h, maze_px, maze_px);
    wall_left_layer = maze.createBlankLayer('wall_left_layer', maze_w, maze_h, maze_px, maze_px);
    wall_right_layer = maze.createBlankLayer('wall_right_layer', maze_w, maze_h, maze_px, maze_px);
	
	cursors = game.input.keyboard.createCursorKeys();

    setEventHandlers();
}

var setEventHandlers = function () {
	// Socket connection successful
	socket.on('connect', onSocketConnected);

	// Socket disconnection
	socket.on('disconnect', onSocketDisconnect);

	// New player message received
	socket.on('new player', onNewPlayer);

	// Player move message received
	socket.on('move player', onMovePlayer);

	// Player removed message received
	socket.on('remove player', onRemovePlayer);
	
	socket.on('new map', onGameStart);
	
	socket.on('remove player', onRemovePlayer);
}

function onGameStart(data){
	
	maze_grid=data;
	clearMaze();
	//console.log('Maze data= '+maze_grid.cells);
	drawMaze();
	maze.setCollision(1, true, base_layer);
}

function drawMaze(){
	for(var i=0;i<maze_grid.height;i++){
        for(var j=0;j<maze_grid.width;j++){
            //console.log(''+maze_grid.cells[j][i]+', ');
            maze.putTile(maze_grid.cells[j][i], j, i, base_layer);
            //var neighbours=maze_grid.allNeighbours(j,i,1);
            //console.log(neighbours[0][0]);
            if(maze_grid.cells[j][i]==1){
                if(i>=1){
                    if(maze_grid.cells[j][i-1]==0){
                        maze.putTile(2, j, i, wall_up_layer);
                    }
                }else{
                    maze.putTile(2, j, i, wall_up_layer);
                }
                if(i<maze_grid.height-1){
                  if(maze_grid.cells[j][i+1]==0){
                        maze.putTile(3, j, i, wall_down_layer);
                  }
                }else{
                    maze.putTile(3, j, i, wall_down_layer);
                }
                if(j>=1){
                    if(maze_grid.cells[j-1][i]==0){
                        maze.putTile(5, j, i, wall_right_layer);
                    }
                }else{
                    maze.putTile(5, j, i, wall_right_layer);
                }
                if(j<maze_grid.width-1){
                    if(maze_grid.cells[j+1][i]==0){
                        maze.putTile(4, j, i, wall_left_layer);
                    }
                }else{
                    maze.putTile(4, j, i, wall_left_layer);
                }
            }
        }
    }
}

function clearMaze(){
	for(var i=0;i<maze_grid.height;i++){
        for(var j=0;j<maze_grid.width;j++){
			maze.putTile(null, j, i, base_layer);
			maze.putTile(null, j, i, wall_up_layer);
			maze.putTile(null, j, i, wall_down_layer);
			maze.putTile(null, j, i, wall_left_layer);
			maze.putTile(null, j, i, wall_right_layer);
		}
	}
}

// Socket connected
function onSocketConnected () {
	console.log('Connected to socket server');
	// Send local player data to the game server
	socket.emit('new player', {x: player.x, y: player.y});
}

// Socket disconnected
function onSocketDisconnect () {
	console.log('Disconnected from socket server');
}

// New player
function onNewPlayer (data) {
	console.log('New player connected:', data.id);
	//var newPlayer = new Player(data.x, data.y);
	//newPlayer.id = data.id;
	//enemies.push(newPlayer);
	var enemy;
	enemy= game.add.sprite(data.x, data.y, 'enemy');
	enemy.id=data.id;
	
	drawEnemies.push(enemy);
	drawEnemies[drawEnemies.length-1].id=data.id;
	console.log('Draw ID:'+drawEnemies[drawEnemies.length-1].id);
	drawEnemies[drawEnemies.length-1].anchor.setTo(0.5, 0.5);
}

function onMovePlayer (data) {
	var movePlayer=-1;
	movePlayer = playerById(data.id);

	// Player not found
	if (movePlayer==-1) {
		console.log('Player not found: ', data.id);
		return;
	}

  // Update player position
	drawEnemies[movePlayer].x = data.x;
	drawEnemies[movePlayer].y = data.y;
}

// Remove player
function onRemovePlayer (data) {
	var removePlayer=-1;
	console.log('Remove: '+data.id);
	removePlayer = playerById(data.id);
	// Player not found
	if (removePlayer==-1) {
		console.log('Removal: Player not found: ', data.id);
		return;
	}

	// Remove player from array
	//enemies.splice(removePlayer, 1);
	drawEnemies[removePlayer].destroy();
	drawEnemies.splice(removePlayer, 1);
	//enemy.destroy();
}

function update() {
	console.log('X: '+player.x+'Y: '+player.y);
	game.physics.arcade.collide(player, base_layer);

	player.body.velocity.set(0);

    if (cursors.left.isDown)
    {
        player.body.velocity.x = ((-1)*speed);
        player.play('left');
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = speed;
        player.play('right');
    }
    else if (cursors.up.isDown)
    {
        player.body.velocity.y = ((-1)*speed);
        player.play('up');
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = speed;
        player.play('down');
    }

	socket.emit('move player', { x: player.x, y: player.y })
  
	if(player.x>=finx&&player.y>=finy){
		//Win game
		socket.emit('player wins', {data: player.id});
	}
}

function render(){
	//game.debug.body(player);
	//game.debug.text('X: '+player.x+'Y: '+player.y, 100, 900, 'ffffff');
}

function playerById (id) {
	var i=0;
	var c=false;
	do{
	//console.log('ID: '+enemies[i].id);
		if (drawEnemies[i].id == id) {
			c=true;
		}else{
			i++;
		}
    }while(i<drawEnemies.length&&c==false);
	return i;
}