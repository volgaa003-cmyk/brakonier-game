// ================================================
// game.js
// Основная логика игры "Браконьер — Охота на сердца"
// ================================================

let grid = [];
let selected = null;
let hearts = 0;
let moves = 20;
let cash = 0;
let busy = false;
let tileIdCounter = 0;
let currentLevel = 1;

const SIZE = 8;
const TYPES = [
    {id: 'heart', icon: '🫀'},
    {id: 'bullet', icon: '🔫'},
    {id: 'garlic', icon: '🧄'},
    {id: 'stake', icon: '🗡️'},
    {id: 'vial', icon: '🧪'},
    {id: 'coin', icon: '💰'}
];
const SPECIALS = ['rocketRow', 'rocketCol', 'bomb', 'plane', 'rainbow'];

const SWAP_MS = 240;
const CLEAR_MS = 260;
const FALL_MS = 300;

const boardEl = document.getElementById('board');
boardEl.style.setProperty('--size', SIZE);

const heartsVal = document.getElementById('heartsVal');
const movesVal = document.getElementById('movesVal');
const cashVal = document.getElementById('cashVal');
const toastEl = document.getElementById('toast');
const overlay = document.getElementById('overlay');
const helpOverlay = document.getElementById('helpOverlay');

// ======================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =======================

const isSpecial = t => SPECIALS.includes(t);
const randType = () => TYPES[Math.floor(Math.random() * TYPES.length)].id;
const key = (r, c) => r + ',' + c;
const getType = (r, c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

function iconFor(type) {
    switch(type) {
        case 'bomb': return '💣';
        case 'rocketRow': return '🚀';
        case 'rocketCol': return '🚀';
        case 'plane': return '✈️';
        case 'rainbow': return '🌈';
        default: return TYPES.find(t => t.id === type).icon;
    }
}

function applySpecialClass(t) {
    t.el.classList.remove('bomb', 'rocket-row', 'rocket-col', 'plane', 'rainbow');
    if (t.type === 'bomb') t.el.classList.add('bomb');
    else if (t.type === 'rocketRow') t.el.classList.add('rocket-row');
    else if (t.type === 'rocketCol') t.el.classList.add('rocket-col');
    else if (t.type === 'plane') t.el.classList.add('plane');
    else if (t.type === 'rainbow') t.el.classList.add('rainbow');
}

function setTilePos(el, row, col) {
    el.style.left = (col * 100 / SIZE) + '%';
    el.style.top = (row * 100 / SIZE) + '%';
}

// ======================= СОЗДАНИЕ ФИШЕК =======================

function createTile(row, col, type, spawnRow) {
    const id = 'tile' + (tileIdCounter++);
    const el = document.createElement('div');
    el.className = 'tile';
    el.dataset.id = id;

    const inner = document.createElement('div');
    inner.className = 'tile-inner';
    inner.textContent = iconFor(type);
    el.appendChild(inner);

    el.addEventListener('click', onTileClick);
    boardEl.appendChild(el);

    const tile = { id, type, row, col, el, inner };

    if (spawnRow !== undefined && spawnRow !== row) {
        el.style.transition = 'none';
        setTilePos(el, spawnRow, col);
        void el.offsetWidth;
        el.style.transition = '';
        requestAnimationFrame(() => setTilePos(el, row, col));
    } else {
        setTilePos(el, row, col);
    }

    applySpecialClass(tile);
    return tile;
}

function moveTileTo(tile, row, col) {
    tile.row = row;
    tile.col = col;
    setTilePos(tile.el, row, col);
}

// ======================= ИНИЦИАЛИЗАЦИЯ ПОЛЯ =======================

function buildInitialGrid() {
    boardEl.innerHTML = '';
    grid = [];
    for (let r = 0; r < SIZE; r++) grid.push(new Array(SIZE).fill(null));

    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            let t, guard = 0;
            do {
                t = randType();
                guard++;
            } while (guard < 30 && (
                (c >= 2 && grid[r][c-1] && grid[r][c-2] && grid[r][c-1].type === t && grid[r][c-2].type === t) ||
                (r >= 2 && grid[r-1][c] && grid[r-2][c] && grid[r-1][c].type === t && grid[r-2][c].type === t)
            ));
            grid[r][c] = createTile(r, c, t, r - SIZE - Math.floor(Math.random() * 4));
        }
    }
}

// ======================= ВЗАИМОДЕЙСТВИЕ =======================

function findTileById(id) {
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const t = grid[r][c];
            if (t && t.id === id) return t;
        }
    }
    return null;
}

function onTileClick(e) {
    if (busy) return;
    const tile = findTileById(e.currentTarget.dataset.id);
    if (!tile) return;

    if (selected === null) {
        if (isSpecial(tile.type)) { activateStandalone(tile); return; }
        selected = tile;
        tile.el.classList.add('selected');
        return;
    }

    if (selected === tile) {
        tile.el.classList.remove('selected');
        selected = null;
        return;
    }

    const adjacent = Math.abs(selected.row - tile.row) + Math.abs(selected.col - tile.col) === 1;
    selected.el.classList.remove('selected');

    if (!adjacent) {
        if (isSpecial(tile.type)) { selected = null; activateStandalone(tile); return; }
        selected = tile;
        tile.el.classList.add('selected');
        return;
    }

    const a = selected;
    const b = tile;
    selected = null;
    performSwap(a, b);
}

function swapInGrid(a, b) {
    const ar = a.row, ac = a.col, br = b.row, bc = b.col;
    grid[ar][ac] = b;
    grid[br][bc] = a;
    a.row = br; a.col = bc;
    b.row = ar; b.col = ac;
}

function performSwap(a, b) {
    busy = true;
    swapInGrid(a, b);
    moveTileTo(a, a.row, a.col);
    moveTileTo(b, b.row, b.col);

    setTimeout(() => {
        const aSpecial = isSpecial(a.type);
        const bSpecial = isSpecial(b.type);

        if (aSpecial && bSpecial) {
            moves--;
            movesVal.textContent = moves;
            const cells = comboFootprint(a, b);
            clearAndContinue(cells, []);
            return;
        }

        if (aSpecial || bSpecial) {
            const special = aSpecial ? a : b;
            const partner = aSpecial ? b : a;
            moves--;
            movesVal.textContent = moves;
            let cells = special.type === 'rainbow' 
                ? cellsOfColor(partner.type) 
                : computeActivationFootprint(special);
            cells.add(key(special.row, special.col));
            clearAndContinue(cells, []);
            return;
        }

        const result = analyzeMatches();
        const hasMatch = result.bombs.length || result.rockets.length || result.rainbows.length || 
                        result.squares.length || result.normalCells.size;

        if (!hasMatch) {
            swapInGrid(a, b);
            moveTileTo(a, a.row, a.col);
            moveTileTo(b, b.row, b.col);
            a.el.classList.add('shake');
            b.el.classList.add('shake');
            setTimeout(() => {
                a.el.classList.remove('shake');
                b.el.classList.remove('shake');
                busy = false;
            }, 320);
            pulseToast('Нет совпадения');
            return;
        }

        moves--;
        movesVal.textContent = moves;
        applyResolutionFull(result);
    }, SWAP_MS);
}

// ======================= ПОИСК СОВПАДЕНИЙ =======================

function collectRuns() {
    const runs = [];
    // Горизонтальные линии
    for (let r = 0; r < SIZE; r++) {
        let runStart = 0;
        for (let c = 1; c <= SIZE; c++) {
            const cur = c < SIZE ? getType(r, c) : null;
            const prev = getType(r, c - 1);
            if (cur !== null && cur === prev && !isSpecial(cur)) continue;
            const len = c - runStart;
            if (len >= 3 && !isSpecial(prev)) {
                const cells = [];
                for (let k = runStart; k < c; k++) cells.push([r, k]);
                runs.push({cells, dir: 'h', length: len, type: prev, used: false});
            }
            runStart = c;
        }
    }
    // Вертикальные линии
    for (let c = 0; c < SIZE; c++) {
        let runStart = 0;
        for (let r = 1; r <= SIZE; r++) {
            const cur = r < SIZE ? getType(r, c) : null;
            const prev = getType(r - 1, c);
            if (cur !== null && cur === prev && !isSpecial(cur)) continue;
            const len = r - runStart;
            if (len >= 3 && !isSpecial(prev)) {
                const cells = [];
                for (let k = runStart; k < r; k++) cells.push([k, c]);
                runs.push({cells, dir: 'v', length: len, type: prev, used: false});
            }
            runStart = r;
        }
    }
    return runs;
}

function dedupeCells(cells) {
    const seen = new Set();
    const out = [];
    cells.forEach(c => {
        const k = key(c[0], c[1]);
        if (!seen.has(k)) {
            seen.add(k);
            out.push(c);
        }
    });
    return out;
}

function analyzeMatches() {
    const runs = collectRuns();
    const matchedByLine = new Set();
    runs.forEach(r => r.cells.forEach(c => matchedByLine.add(key(c[0], c[1]))));

    // Квадраты 2x2 → Самолётик
    const squares = [];
    const usedSquareCells = new Set();
    for (let r = 0; r < SIZE - 1; r++) {
        for (let c = 0; c < SIZE - 1; c++) {
            const cells = [[r,c],[r,c+1],[r+1,c],[r+1,c+1]];
            if (cells.some(cc => matchedByLine.has(key(cc[0],cc[1])) || usedSquareCells.has(key(cc[0],cc[1])))) continue;
            const t0 = getType(r, c);
            if (!t0 || isSpecial(t0)) continue;
            if (cells.every(cc => getType(cc[0], cc[1]) === t0)) {
                squares.push({type: 'plane', at: [r, c], cells});
                cells.forEach(cc => usedSquareCells.add(key(cc[0], cc[1])));
            }
        }
    }

    // Уголки → Бомба
    const hRuns = runs.filter(r => r.dir === 'h');
    const vRuns = runs.filter(r => r.dir === 'v');
    const bombs = [];
    hRuns.forEach(h => {
        if (h.used) return;
        for (const v of vRuns) {
            if (v.used || v.type !== h.type) continue;
            const shared = h.cells.find(hc => v.cells.some(vc => vc[0] === hc[0] && vc[1] === hc[1]));
            if (shared) {
                h.used = true;
                v.used = true;
                bombs.push({type: 'bomb', at: shared, cells: dedupeCells(h.cells.concat(v.cells))});
                break;
            }
        }
    });

    const rockets = [], rainbows = [];
    const normalCells = new Set();
    runs.forEach(run => {
        if (run.used) return;
        if (run.length >= 5) {
            rainbows.push({type: 'rainbow', at: run.cells[Math.floor(run.cells.length / 2)], cells: run.cells});
        } else if (run.length === 4) {
            const spType = run.dir === 'h' ? 'rocketCol' : 'rocketRow';
            rockets.push({type: spType, at: run.cells[Math.floor(run.cells.length / 2)], cells: run.cells});
        } else {
            run.cells.forEach(c => normalCells.add(key(c[0], c[1])));
        }
    });

    return {bombs, rockets, rainbows, squares, normalCells};
}

// ======================= БОНУСЫ И КОМБО =======================

function footprintFor(tile) {
    const cells = [];
    if (tile.type === 'bomb') {
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                const rr = tile.row + dr;
                const cc = tile.col + dc;
                if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) cells.push([rr, cc]);
            }
        }
    } else if (tile.type === 'rocketRow') {
        for (let c = 0; c < SIZE; c++) cells.push([tile.row, c]);
    } else if (tile.type === 'rocketCol') {
        for (let r = 0; r < SIZE; r++) cells.push([r, tile.col]);
    } else if (tile.type === 'plane') {
        cells.push([tile.row, tile.col]);
        [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc]) => {
            const rr = tile.row + dr;
            const cc = tile.col + dc;
            if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) cells.push([rr, cc]);
        });
    } else if (tile.type === 'rainbow') {
        cells.push([tile.row, tile.col]);
    }
    return cells;
}

function computeActivationFootprint(startTile) {
    const visited = new Set([startTile.id]);
    const footprint = new Set();
    const queue = [startTile];
    while (queue.length) {
        const t = queue.shift();
        footprintFor(t).forEach(([r, c]) => {
            footprint.add(key(r, c));
            const other = grid[r] && grid[r][c];
            if (other && isSpecial(other.type) && !visited.has(other.id)) {
                visited.add(other.id);
                queue.push(other);
            }
        });
    }
    return footprint;
}

function cellsOfColor(type) {
    const s = new Set();
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] && grid[r][c].type === type) s.add(key(r, c));
        }
    }
    return s;
}

function presentColors() {
    const set = new Set();
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] && !isSpecial(grid[r][c].type)) set.add(grid[r][c].type);
        }
    }
    return Array.from(set);
}

function comboFootprint(a, b) {
    const cells = new Set();
    const kinds = [a.type, b.type];
    const has = t => kinds.includes(t);
    const isRocket = t => t === 'rocketRow' || t === 'rocketCol';

    if (has('bomb') && has('bomb')) {
        const center = a;
        for (let dr = -3; dr <= 3; dr++) {
            for (let dc = -3; dc <= 3; dc++) {
                const rr = center.row + dr;
                const cc = center.col + dc;
                if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) cells.add(key(rr, cc));
            }
        }
        pulseToast('💥 Ультра-бомба 7×7!');
        return cells;
    }

    if (has('bomb') && (has('rocketRow') || has('rocketCol'))) {
        const rocket = isRocket(a.type) ? a : b;
        for (let dr = -1; dr <= 1; dr++) {
            const rr = rocket.row + dr;
            if (rr >= 0 && rr < SIZE) {
                for (let c = 0; c < SIZE; c++) cells.add(key(rr, c));
            }
        }
        for (let dc = -1; dc <= 1; dc++) {
            const cc = rocket.col + dc;
            if (cc >= 0 && cc < SIZE) {
                for (let r = 0; r < SIZE; r++) cells.add(key(r, cc));
            }
        }
        pulseToast('🧨 Тройные полосы!');
        return cells;
    }

    if (has('rocketRow') || has('rocketCol')) {
        for (let i = 0; i < SIZE; i++) {
            cells.add(key(a.row, i));
            cells.add(key(i, a.col));
        }
        pulseToast('🚀 Крестообразный удар!');
        return cells;
    }

    if (has('rainbow') && has('rainbow')) {
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c]) cells.add(key(r, c));
            }
        }
        pulseToast('🌈 Полная зачистка!');
        return cells;
    }

    if (has('rainbow')) {
        const colors = presentColors();
        const color = colors.length ? colors[Math.floor(Math.random() * colors.length)] : null;
        if (color) {
            for (let r = 0; r < SIZE; r++) {
                for (let c = 0; c < SIZE; c++) {
                    if (grid[r][c] && grid[r][c].type === color) cells.add(key(r, c));
                }
            }
        }
        pulseToast('🌈 Радужный шар!');
        return cells;
    }

    footprintFor(a).forEach(([r,c]) => cells.add(key(r,c)));
    footprintFor(b).forEach(([r,c]) => cells.add(key(r,c)));
    return cells;
}

function activateStandalone(tile) {
    busy = true;
    moves--;
    movesVal.textContent = moves;
    let cells;
    if (tile.type === 'rainbow') {
        const colors = presentColors();
        const color = colors.length ? colors[Math.floor(Math.random() * colors.length)] : null;
        cells = color ? cellsOfColor(color) : new Set();
        cells.add(key(tile.row, tile.col));
    } else {
        cells = computeActivationFootprint(tile);
    }
    clearAndContinue(cells, []);
}

// ======================= ЗАЧИСТКА И ГРАВИТАЦИЯ =======================

function applyResolutionFull(result) {
    const specialSpawns = [];
    const scoreSet = new Set();

    result.bombs.forEach(b => {
        b.cells.forEach(c => scoreSet.add(key(c[0], c[1])));
        specialSpawns.push({at: b.at, type: 'bomb'});
    });
    result.rockets.forEach(rk => {
        rk.cells.forEach(c => scoreSet.add(key(c[0], c[1])));
        specialSpawns.push({at: rk.at, type: rk.type});
    });
    result.rainbows.forEach(rb => {
        rb.cells.forEach(c => scoreSet.add(key(c[0], c[1])));
        specialSpawns.push({at: rb.at, type: 'rainbow'});
    });
    result.squares.forEach(sq => {
        sq.cells.forEach(c => scoreSet.add(key(c[0], c[1])));
        specialSpawns.push({at: sq.at, type: 'plane'});
    });
    result.normalCells.forEach(k => scoreSet.add(k));

    const atKeys = new Set(specialSpawns.map(s => key(s.at[0], s.at[1])));
    const clearSet = new Set();
    scoreSet.forEach(k => { if (!atKeys.has(k)) clearSet.add(k); });

    if (specialSpawns.length) pulseToast(specialSpawns.length > 1 ? 'Комбо бонусов!' : 'Новый бонус!');
    clearAndContinue(clearSet, specialSpawns, scoreSet);
}

function clearAndContinue(clearSet, specialSpawns, scoreSet) {
    specialSpawns = specialSpawns || [];
    const scoring = scoreSet || clearSet;

    let heartsGained = 0, cashGained = 0;
    scoring.forEach(k => {
        const [r, c] = k.split(',').map(Number);
        const t = grid[r] && grid[r][c];
        if (!t) return;
        if (t.type === 'heart') heartsGained++;
        if (t.type === 'coin') cashGained += 5;
    });

    clearSet.forEach(k => {
        const [r, c] = k.split(',').map(Number);
        const t = grid[r] && grid[r][c];
        if (t) t.el.classList.add('clearing');
    });

    hearts += heartsGained;
    cash += cashGained + heartsGained * 15;
    heartsVal.textContent = hearts;
    cashVal.textContent = cash + '₽';

    if (heartsGained > 0) pulseToast('+' + heartsGained + ' ❤️');

    setTimeout(() => {
        clearSet.forEach(k => {
            const [r, c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if (t) {
                t.el.remove();
                grid[r][c] = null;
            }
        });

        specialSpawns.forEach(s => {
            const [r, c] = s.at;
            if (!grid[r]) return;
            let t = grid[r][c];
            if (!t) {
                t = createTile(r, c, s.type, r);
                grid[r][c] = t;
            } else {
                t.type = s.type;
                t.inner.textContent = iconFor(s.type);
                applySpecialClass(t);
            }
        });

        applyGravityAndRefill();

        setTimeout(() => {
            const result = analyzeMatches();
            const hasMore = result.bombs.length || result.rockets.length || result.rainbows.length || 
                           result.squares.length || result.normalCells.size;
            if (!hasMore) {
                busy = false;
                checkEndConditions();
            } else {
                applyResolutionFull(result);
            }
        }, FALL_MS + 40);
    }, CLEAR_MS);
}

function applyGravityAndRefill() {
    for (let c = 0; c < SIZE; c++) {
        let pointer = SIZE - 1;
        for (let r = SIZE - 1; r >= 0; r--) {
            if (grid[r][c] !== null) {
                const t = grid[r][c];
                if (pointer !== r) {
                    grid[pointer][c] = t;
                    grid[r][c] = null;
                    moveTileTo(t, pointer, c);
                }
                pointer--;
            }
        }
        let spawnOffset = 1;
        for (let r = pointer; r >= 0; r--) {
            grid[r][c] = createTile(r, c, randType(), -spawnOffset);
            spawnOffset++;
        }
    }
}

function pulseToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(pulseToast._t);
    pulseToast._t = setTimeout(() => toastEl.classList.remove('show'), 1400);
}

function checkEndConditions() {
    const level = LEVELS[currentLevel - 1];
    if (hearts >= level.heartsGoal) {
        level.completed = true;
        showOverlay('Уровень пройден!', `Отличная работа! Собрано ${hearts} сердец.`);
    } else if (moves <= 0) {
        showOverlay('Ходы закончились', `Собрано ${hearts} из ${level.heartsGoal} сердец.`);
    }
}

function showOverlay(title, text) {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayText').textContent = text;
    overlay.classList.remove('hidden');
}

// ======================= ИНИЦИАЛИЗАЦИЯ =======================

function resetGame() {
    hearts = 0;
    cash = 0;
    busy = false;
    tileIdCounter = 0;
    heartsVal.textContent = 0;
    cashVal.textContent = '0₽';
}

document.getElementById('overlayBtn').addEventListener('click', () => {
    overlay.classList.add('hidden');
    currentLevel++;
    if (currentLevel > 300) currentLevel = 300;
    startLevel(currentLevel);
});

document.getElementById('helpBtn').addEventListener('click', () => helpOverlay.classList.remove('hidden'));
document.getElementById('closeHelpBtn').addEventListener('click', () => helpOverlay.classList.add('hidden'));

console.log("game.js загружен успешно");
