window.addEventListener("load", () => {
  document.getElementById("reveal").onclick = (e) => {
    if (!puzzle) return;
    e.target.innerHTML = "⚉";
    e.target.style.color = "#f9faffde";
    displayGrid(puzzle, true);
    e.target.onclick = null;
  }

  let dictionary = {};
  let phrases = [];
  let tried = [];
  let puzzle;
  let starterFailed = false;
  let lastGrid = [];
  let debounce = 0;
  let throttle = true;

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
  }

  function getRandomWord() {
    return phrases[getRandomInt(0, phrases.length)];
  }

  function solve(grid, r, c) {
    if (r < 3 && c > 3) { r += 1; c = 0 };
    if (r == 3 && c > 3) return grid;
    console.log({grid});
    // if (throttle) setTimeout(() => {
    //   if (grid != lastGrid) displayGrid(grid, true);
    //   lastGrid = grid;
    //   throttle = false;
    // }, debounce+=5);
    let rowStr = grid[r];
    let colStr = "";
    grid.forEach((row) => colStr += (row && row[c]) ? row[c] : "");
    if (rowStr && dictionary[rowStr]) {
      for (let i = 0; i < dictionary[rowStr].length; i++) {
        let match = dictionary[rowStr][i];
        if (dictionary[colStr]?.includes(colStr+match[match.length-1])) {
          grid[r] = match;
          let res = solve(grid, r, c+1);
          if (res) return res;
        }
      }
    } else if (colStr && dictionary[colStr]) {
      for (let i = 0; i < dictionary[colStr].length; i++) {
        let match = dictionary[colStr]?.length >= i ? dictionary[colStr][i] : "";
        grid[r] = match.length >= r ? match[r] : "";
        let res = solve(grid, r, c+1);
        if (res) return res;
      }
    }
    return null;
  }

  function getPuzzle() {
    let starter = "";
    while (!starter || tried.includes(starter) || starter.length < 4) starter = getRandomWord();
    // if (temp != starter && starterFailed) setTimeout(() => {
    //   temp = starter;
    //   starterFailed = false;
    //   fetch(`https://seasons986.pythonanywhere.com/add?phrase=${temp}`).then(() => {
    //   })
    // }, debounce+=500);
    return solve([starter,"","",""], 1, 0);
  }

  function onType(e) {
    let [r, c] = e.target.id.split("-");
    if (e.target.value && e.target.value != puzzle[r][c]) e.target.classList = "red";
    else e.target.classList.remove("red");
  }

   function displayGrid(solution = puzzle, reveal = false) {
     if (!solution) return;
    const chance = (Math.random() > 0.5);
    const grid = document.getElementById("grid");
    grid.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      if (!solution[i]) return;
      const tr = document.createElement("tr");
      solution[i].split("").forEach((letter, j) => {
        const td = document.createElement("td");
        if (reveal) {
          td.innerHTML = letter;
        } else if (chance && ((i == 0 && j == 0) || (i == 1 && j == 1) || (i == 2 && j == 2) || (i == 3 && j == 3))) {
          td.innerHTML = letter;
        } else if (!chance && ((i == 0 && j == 0) || (i == 0 && j == 3) || (i == 3 && j == 0) || (i == 3 && j == 3))) {
          td.innerHTML = letter;
        } else {
          td.innerHTML = `<input type='text' id=${i}-${j} maxlength='1'></input>`;
          td.oninput = onType;
        }
        tr.appendChild(td);
      })
      grid.appendChild(tr);
    }
    throttle = true;
  }
  
  // amazing chengyu data source -- http://thuocl.thunlp.org/
  fetch("https://annaylin.com/100-days/chengyu/THUOCL_chengyu.txt").then((f) => f.text()).then((r) => {
    phrases = r.split(",");
  });

  fetch(`https://seasons986.pythonanywhere.com/check`).then((r) => r.json().then((res) => {
    tried = res;
    fetch("dictionary.json").then((f) => f.json()).then((r) => {
      dictionary = r;
      let count = 0; // for the really bad luck
      puzzle = getPuzzle();
      while ((!puzzle || puzzle[3]?.length < 4) && count < phrases.length) {
        starterFailed = true;
        puzzle = getPuzzle();
        count++;
      }
      if (puzzle) console.log({debounce});
      // if (puzzle) {
      //   displayGrid();
      // } else {
      //   const p = document.createElement("a");
      //   p.innerHTML = "refresh";
      //   p.href = "javascript:window.location.reload(true);";
      //   document.getElementById("container").appendChild(p);
      // }
      console.log("Solved: ", puzzle, count);
    });
  }));
});