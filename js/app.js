import tetrominos from './data.js'
/*-------------------------------- Constants --------------------------------*/

/*---------------------------- Variables (state) ----------------------------*/
let currentT, nextT, playBoard
let TSequence = []
let lockedT = [] /* contains the locked T on playBoard */


/*------------------------ Cached Element References ------------------------*/
const startBtn = document.getElementById('startBtn')
const stopBtn = document.getElementById('stopBtn')
const board = document.querySelector('.board')
const preview = document.querySelector('.preview')

/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('DOMContentLoaded', init)
// startBtn.addEventListener('click', init)
// stopBtn.addEventListener('click', gameOver)
document.addEventListener('keydown', userInput)

/*-------------------------------- Functions --------------------------------*/
function init() {
  playBoard = Array(20).fill().map(() => Array(10).fill(0))
  currentT = getNextT()
  nextT = getNextT()
  render()
}

function render() {
  displayCurrentT()
  displayNextT()
  displayLockedT()
}

function displayCurrentT() {
  for (let i = 0; i < currentT.Tarr.length; i++) {
    for (let j = 0; j < currentT.Tarr[0].length; j++) {
      if (currentT.Tarr[i][j] === 1) {
        const cell = document.createElement('div')
        cell.classList.add('cell', `${currentT.name}`)
        cell.style.gridRow = currentT.row + i + 1
        cell.style.gridColumn = currentT.column + j + 1
        board.appendChild(cell)
      }
    }
  }
}

function displayNextT() {
  while (preview.firstChild) {
    preview.removeChild(preview.firstChild)
  }
  for (let i = 0; i < nextT.Tarr.length; i++) {
    for (let j = 0; j < nextT.Tarr[0].length; j++) {
      if (nextT.Tarr[i][j] === 1) {
        const cell = document.createElement('div')
        cell.classList.add('cell', `${nextT.name}`)
        cell.style.gridRow = i + 1
        cell.style.gridColumn = j + 1
        preview.appendChild(cell)
      }
    }
  }
}

function displayLockedT() {
  lockedT.forEach(t => {
    for (let i = 0; i < t.Tarr.length; i++) {
      for (let j = 0; j < t.Tarr[0].length; j++) {
        if (t.Tarr[i][j] === 1) {
          const cell = document.createElement('div')
          cell.classList.add('cell', 'locked', `${t.name}`)
          cell.style.gridRow = t.row + i + 1
          cell.style.gridColumn = t.column + j + 1
          board.appendChild(cell)
        }
      }  
    }
  })
}

function dropTAnimation() {
  if (posValid(0)) {
    currentT.row = currentT.row + 1
    requestAnimationFrame()
  } else {
    clearFullRows()
    displayLockedT()
    currentT = nextT
    nextT = getNextT()
  }
}

function getNextT() {
  /* at start of game */
  if (TSequence.length === 0) {
    generateRandomT()
    generateRandomT()
  } else {
    generateRandomT()
  }
  return TSequence.splice(0, 1)[0]
}

function generateRandomT() {
  const randomNum = Math.floor(Math.random() * Object.keys(tetrominos).length)
  let randomT = {
    name: Object.keys(tetrominos)[randomNum],
    Tarr: Object.values(tetrominos)[randomNum]
  }
  let row = 0 /* row at which T spawns on board */
  let column /* column at which T spawns on board */
  if (randomT.name === 'O') {
    column = playBoard[0].length / 2 - 1
  } else {
    column = playBoard[0].length / 2 - 2
  }
  randomT.row = row
  randomT.column = column
  TSequence.push(randomT)
}

/* lock the current T position into playBoard */
function lockCurrentT() {
  if (!posValid(0)) { 
    const row = currentT.row
    const column = currentT.column
    const name = currentT.name
    const Tarr = currentT.Tarr
    for (let i = 0; i < currentT.Tarr.length; i++) {
      for (let j = 0; j < currentT.Tarr[0].length; j++) {
        if (currentT.Tarr[i][j] === 1) {
          playBoard[currentT.row + i][currentT.column + j] = 1
          console.log(playBoard)
          console.log(`Row: ${currentT.row}, Column: ${currentT.column}`)
        }
      }
    }
  /* add current T to locked T array */
    lockedT.push({name, row, column, Tarr})
  }
}
  
function clearFullRows() {
  let completedRows = []
  /* check for completed rows - all 1s */
  for (let row = playBoard.length - 1; row >=0; row--) {
    if (playBoard[row].every( column => column === 1)) {
      console.log(`row ${row} is completed`)
      completedRows.push(`${row}`)
      console.log('completed rows:', completedRows)
      for (let ro = row; ro > 0; ro--) {
        for (let col = 0; col < playBoard[ro].length; col++) {
          /* shift the rows above down */  
          playBoard[ro][col] = playBoard[ro - 1][col]
        }
      }
    }
  }
//   completedRows.forEach(row => {
//     LockedCellstoRemove = board.querySelectorAll(`.cell locked ${row}`)
//     console.log(LockedCellstoRemove)
//     LockedCellstoRemove.forEach(cell => board.removeChild(cell))
//   })
}

/* Listen to keyboard events */
function userInput(e) {
  /* Up arrow */
  clearPlayBoard()
  if (e.which === 38) {
    if (posValid(0)) {
      rotateCurrentT(currentT)
    }
  
    /* Down arrow */
  } else if (e.which === 40) {
    if (posValid(0)) {
      currentT.row = currentT.row + 1
    } else {
      lockCurrentT()
      currentT = nextT
      nextT = getNextT()
    }

    /* Left arrow */
  } else if (e.which === 37) {
    if (posValid(-1)) {
      currentT.column = currentT.column - 1
    }

    /* Right arrow */
  } else if (e.which === 39) {
    if (posValid(1)) {
      currentT.column = currentT.column + 1
    }
  }
  render()
    /* Space bar */
  if (e.which === 32) {
    let lastRow = - 1
    for (let row = playBoard.length - 1; row >= 0; row--) {
      if (playBoard[row][currentT.column] === 0) {
        lastRow = row
        break
      }
    }
    while (currentT.row <= lastRow - currentT.Tarr.length) {
      if (posValid(0)) {
        console.log('okay!')
        currentT.row = currentT.row + 1
      } else {
        console.log('not okay')
        // lockCurrentT()
        // currentT = nextT
        // nextT = getNextT()
        // render()
      }
    }
    console.log('last row is', lastRow)
  }
}

function rotateCurrentT() {
  const after = currentT.Tarr.map((row, i) =>
    row.map((column, j) => currentT.Tarr[currentT.Tarr.length - j - 1][i]))
  currentT.Tarr = after
}

function posValid(side) {
  for (let i = 0; i < currentT.Tarr.length; i++) {
    for (let j = 0; j < currentT.Tarr[0].length; j++) {
      if (currentT.Tarr[i][j] === 1) {
        const row = currentT.row + i
        const column = currentT.column + j + side
        /* check if current T is out of playBoard */
        if (row + 1 >= playBoard.length || column < 0 || column >= playBoard[0].length) {
          return false
        }
        /* check if current T collides with an existing T on playBoard */
        if (playBoard[row][column] === 1) {
          return false
        }
      }
    }
  }
  return true
}

function clearPlayBoard() {
  for (let i = 0; i < currentT.Tarr.length; i++) {
    for (let j = 0; j < currentT.Tarr[0].length; j++) {
      if (currentT.Tarr[i][j] === 1) {
        const row = currentT.row + i
        const column = currentT.column + j
        /* clear playBoard value of all cells except for locked Ts */
        if (!lockedT.some(t => t.row === row && t.column === column)) {
          playBoard[row][column] = 0
        }
      }
    }
  }
  /* clear non-locked cells off the visual playBoard */
  const nonLockedCells = board.querySelectorAll('.cell:not(.locked)')
  nonLockedCells.forEach(cell => board.removeChild(cell))
}


