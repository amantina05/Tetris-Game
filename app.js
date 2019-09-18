//accessing the canvas
const canvas = document.getElementById('tetris')
//get the context out
const context = canvas.getContext('2d')

//scaling bigger
context.scale(20, 20)

//tetris pieces in a 2d matrix
//starting with the t
// const matrix = [
//   [0, 0, 0],
//   [1, 1, 1],
//   [0, 1, 0],
// ]

//to connect the rows
function arenaSweep() {
  let rowCount = 1
  outer: for (let y = arena.length - 1; y > 0; y--) {
    for (let x = 0; x < arena[y].length; x++){
      //check if the rows are full
      if (arena[y][x] === 0){
        continue outer
      }
    }

    //remove the row if it is full
    const row = arena.splice(y, 1)[0].fill(0)
    //put it on the top of the arena?
    arena.unshift(row)
    //offset the y
    y++

    player.score += rowCount * 10
    rowCount *= 2
  }
}

function collide(arena, player){
   //player matrix & position
  const m = player.matrix
  const o = player.pos
  //looping through the player
  for (let y = 0; y < m.length; y++){
    for (let x = 0; x < m[y].length; x++){
      //check if the matrix of the player is not 0 & if the arena is not 0 && arena is real
      //if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
        if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        //means we collide
        return true
      }
    }
  }
  return false
}


//create matrix func
function createMatrix(w, h){
  const matrix = []
  //loop, height is not 0, decrease h
  while (h--){
    matrix.push(new Array(w).fill(0))
  }
  return matrix
}

//create pieces
function createPiece (type){
  if (type === 'T') {
    return [
      [0, 0, 0],
      [7, 7, 7],
      [0, 7, 0],
    ]
  } else if (type === 'L') {
    return [
        [0, 2, 0],
        [0, 2, 0],
        [0, 2, 2],
    ];
} else if (type === 'J') {
    return [
        [0, 3, 0],
        [0, 3, 0],
        [3, 3, 0],
    ];
} else if (type === 'O') {
    return [
        [4, 4],
        [4, 4],
    ];
} else if (type === 'Z') {
    return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
    ];
} else if (type === 'S') {
    return [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
    ];
} else if (type === 'I') {
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ];
}
}

//general draw function
function draw() {
  //paint the context to make sure it works
  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  //allows you to get new pieces
  drawMatrix(arena, {x: 0, y: 0})
  //calling the matrix with the players info
  drawMatrix(player.matrix, player.pos)
}

//drawing the piece
function drawMatrix(matrix, offset){
  //supports the offset objects?
    //will allow us to move the pieces later
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      //checking the value is not 0 (0 is transparent in our game)
      if (value !== 0){
        //then draw
        context.fillStyle = color[value]
        context.fillRect(x + offset.x,
                          y + offset.y,
                          1, 1)
      }
    })
  })
}

//add a merge function, copies all the values of the player into the arena
function merge (arena, player){
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        //copy value into arena
        arena[y + player.pos.y][x + player.pos.x] = value
      }
    })
  })
}

//implement the delay in drop
function playerDrop (){
  player.pos.y++
  //if we drop and collide
  if (collide(arena, player)){
    //moves player up
    player.pos.y--
    merge(arena, player)
    //after the merge run player reset
    playerReset()
    arenaSweep()
    updateScore()
  }
  //reset the drop counter, we want delay it a second
  dropCounter = 0
}

function playerMove(dir) {
      player.pos.x += dir
      //if we move and collide in the areana just move back
      if (collide(arena, player)){
        player.pos.x -= dir
      }
}
//to get a random one each time
function playerReset () {
  //list available pieces
  const pieces = 'TJLOSZI'
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0])
  //player on top (starts from the begining)
  player.pos.y = 0
  //player in the middle
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
  //ending game
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0))
    player.score = 0
    updateScore()
  }
}
//implement a player roatate function
function playerRotate(dir){
  const pos = player.pos.x
  //initialize and offset value
  let offset = 1
  rotate(player.matrix, dir)
  //check collision again
  while (collide(arena, player)){
    player.pos.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    //if didnt work
    if (offset > player.matrix[0].length){
      rotate(player.matrix, -dir)
      player.pos.x = pos
      return
    }
  }
}

//transpose + reverse = rotation
//transpse is making the rows into columns
function rotate (matrix, dir){
  for ( let y = 0; y < matrix.length; y++){
    for (let x = 0; x < y; x++ ){
      //this is the switch
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ]
    }
  }
    //rotating
    //check the direction
    //if the dir is positive
    if (dir > 0) {
      matrix.forEach(row => row.reverse())
    } else {
      matrix.reverse()
    }
}

let dropCounter = 0
//drops the piece every second one step
let dropInterval = 1000

//get the diff in time
let lastTime = 0

//draws the game continuously
function update (time = 0){
  const deltaTime = time - lastTime
  //update the time

  dropCounter += deltaTime
  if (dropCounter > dropInterval){
    //player.pos.y++
    //reset, so it starts counting from the begin
    //dropCounter = 0
    playerDrop()
  }
  lastTime = time
  //calls draws
  draw()
  //calls the animation frame & calls itself
  requestAnimationFrame(update)
}

//helper function
function updateScore () {
  document.getElementById('score').innerText = player.score
}


//triggered everytime i push the keyboard
document.addEventListener('keydown', event => {
  //keycode for arrow left is 37
  if (event.keyCode === 37) {
    //this is going to stop the pieces from going off the board
    playerMove(-1)
    //keycode for right key
  } else if (event.keyCode === 39){
    //this is going to stop the pieces from going off the board
    playerMove(1)
    //key code for down key
  } else if (event.keyCode === 40) {
    playerDrop()
    //key code for q (rotates)
  } else if (event.keyCode === 81){
    playerRotate(-1)
    //keycode for w (rotates)
  } else if (event.keyCode === 87){
    playerRotate(1)
  }
})

//change colors
const color = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
]

const arena = createMatrix(12, 20)
// console.log(arena)
// console.table(arena)

const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0
}

playerReset()
updateScore()
//initialize the game by saying update
update()
