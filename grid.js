var create_grid = function(width, height) {
  this.width = width;
  this.height = height;
  this.cells = [];
  //var row=[];
  this.removedSides = [];
  
  for(var i=0;i<height;i++){
    this.cells[i]=[];
    if(i%2==0){
      for(var c=0;c<width;c++){
        this.cells[i].push(1);
      }
    }else{
      for(var n=0;n<width;n++){
        if(n%2==0){
          this.cells[i].push(1);
        }else{
          this.cells[i].push(-1);
        }
      }
    }
  }
  
  this.createMaze= function(message){
    var cellX=Math.floor((Math.random()*width));
    if(cellX%2==0){
      if(cellX<=(width/2)){
        cellX+=1;
      }else{
        cellX-=1;
      }
    }
    var cellY=Math.floor((Math.random()*height));
    if(cellY%2==0){
      if(cellY<=(height/2)){
        cellY+=1;
      }else{
        cellY-=1;
      }
    }
    //console.log(''+message);
    this.recursiveMaze(cellX, cellY);
  };
  
  this.recursiveMaze= function(cellX, cellY){
    //console.log('Processing cell: x: '+cellX+' y: '+cellY);
    this.cellProcess(cellX, cellY);
    var neighbour=this.randomNeighbour(cellX, cellY);
    //console.log('recurse');
    //console.log('X: '+neighbour[0][0]+' Y: '+neighbour[0][1]);
    for(var i=0;i<neighbour.length;i++){
      if(!this.cellProcessed(neighbour[i])){
        if(neighbour[i][0]<cellX){
          //console.log('Processing wall left');
          this.cellProcess(cellX-1, cellY);
        }
        if(neighbour[i][0]>cellX){
          //console.log('Processing wall right');
          this.cellProcess(cellX+1, cellY);
        }
        if(neighbour[i][1]<cellY){
          //console.log('Processing wall up');
          this.cellProcess(cellX, cellY-1);
        } 
        if(neighbour[i][1]>cellY){
          //console.log('Processing wall down');
          this.cellProcess(cellX, cellY+1);
        }
        this.recursiveMaze(neighbour[i][0], neighbour[i][1]);
      }
    }
  };
  
  this.cellExists= function(cellTarget){
    var exists;
    exists=true;
    //console.log('Exists check: '+cellTarget[0]);
    //console.log('Width: '+this.width);
    if (((cellTarget[0])<0)||((cellTarget[0])>=this.width)){
      exists= false;
    }
    //console.log('Exists check: '+cellTarget[1]);
    if (((cellTarget[1])<0)||((cellTarget[1])>=this.height)){
      exists= false;
    }
    //console.log('Final exists: '+exists);
    return exists;
  };
  
  this.cellProcess= function(cellX, cellY){
    this.cells[cellX][cellY]=0;
  };
  
  this.cellProcessed= function(cellTarget){
    if(this.cells[(cellTarget[0])][(cellTarget[1])]==0)
      return true;
    else
      return false;
  };
  
  this.allNeighbours = function(cellX, cellY, offset){
    var neighbours=[];
    neighbours.push([(cellX-offset), cellY]);
    neighbours.push([(cellX+offset), cellY]);
    neighbours.push([(cellX), cellY-offset]);
    neighbours.push([(cellX), cellY+offset]);
    return neighbours;
  };
  
  this.randomNeighbour = function(cellX, cellY){
    var neighbours=[];
    neighbours=this.allNeighbours(cellX, cellY, 2);
    //console.log('neighbours all: '+neighbours);
    
    for(var i=0;i<neighbours.length;i++){
      if(this.cellExists(neighbours[i])){
        //console.log('exists: '+neighbours[i]);
        if(this.cellProcessed(neighbours[i])){
          //console.log('Removing already processed: '+neighbours[i]+'value: '+this.cells[(neighbours[i][0])][(neighbours[i][1])]);
          neighbours.splice(i, 1);
          i--;
        }
      }else{
        //console.log('Removing nonexistant: '+neighbours[i]);
        neighbours.splice(i, 1);
        i--;
      }
    }
    //console.log('Random '+Math.floor((Math.random()*neighbours.length)));
    this.shuffle(neighbours);
    //console.log('neighbours fin: '+neighbours.length);
    return neighbours;
  };
  
  //From http://sedition.com/perl/javascript-fy.html
  this.shuffle= function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };
  
  this.createMaze('initial');
};

module.exports = create_grid;