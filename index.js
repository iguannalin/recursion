window.addEventListener("load", () => {
  let dictionary = {};
  // the only chengyu (from http://thuocl.thunlp.org/) that start a full grid -- found by running solve() on all 8061
  const phrases = ["千千万万","堂堂正正","血雨腥风","镜花水月","零零星星","腥风血雨","卧虎藏龙","战战兢兢","妙笔生花","洞天福地","剑胆琴心","梦笔生花","琴心剑胆","水月镜花"];
  let debounce = 0;

  function debounceDisplay(letter, i, j) {
    setTimeout(() => {
      const td = document.getElementById(`${i}-${j}`);
      if (td) td.innerHTML = letter ? letter : "";
    }, debounce+=25);
  }

  function solve(grid, r, c) {
    if (r < 3 && c > 3) { r += 1; c = 0 };
    if (r == 3 && c > 3) return grid;
    // console.log(grid);
    let rowStr = grid[r];
    let colStr = "";
    grid.forEach((row) => colStr += (row && row[c]) ? row[c] : "");
    if (rowStr && dictionary[rowStr]) {
      for (let i = 0; i < dictionary[rowStr].length; i++) {
        let match = dictionary[rowStr][i];
        if (dictionary[colStr]?.includes(colStr+match[match.length-1])) {
          grid[r] = match;
          debounceDisplay(grid[r][c], r, c);
          let res = solve(grid, r, c+1);
          if (res) {
            return res;
          } else debounceDisplay(null, r, c+1);
        }
      }
    } else if (colStr && dictionary[colStr]) {
      for (let i = 0; i < dictionary[colStr].length; i++) {
        let match = dictionary[colStr]?.length >= i ? dictionary[colStr][i] : "";
        grid[r] = match.length >= r ? match[r] : "";
        debounceDisplay(grid[r], r, c);
        let res = solve(grid, r, c+1);
        if (res) {
          return res;
        } else debounceDisplay(null, r, c+1);
      }
    }
    return null;
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  function getRandomWord() {
    return phrases[getRandomInt(0, phrases.length)];
  }

  function getPuzzle() {
    const starter = getRandomWord();
    starter.split("").forEach((letter, index) => {debounceDisplay(letter, 0, index);})
    return solve([starter,"","",""], 1, 0);
  }

  function initGrid() {
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const tr = document.createElement("tr");
      for (let j = 0; j < 4; j++) {
        const td = document.createElement("td");
        td.innerHTML = "";
        td.id = `${i}-${j}`;
        tr.appendChild(td);
      }
      grid.appendChild(tr);
    }
  }
  
  fetch("https://annaylin.com/100-days/daisy/dictionary.json").then((f) => f.json()).then((r) => {
    dictionary = r;
    initGrid();
    let count = 0; // for the really bad luck
    let puzzle = getPuzzle();
    while ((!puzzle || puzzle[3]?.length < 4) && count < phrases.length) {
      puzzle = getPuzzle();
      count++;
    }
    if (puzzle) {
      // setTimeout(displayGrid(puzzle), debounce += 10);
      console.log(debounce);
    }
    console.log("Solved: ", puzzle, count);
  });
});