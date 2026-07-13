// ================================================
// match3.js
// Игровой движок "три в ряд" со свайпами и бонушку в сторону более чем на 30 пикселей, игра определяет направление жеста и мгновенно делает обмен фисами
// ================================================

(function() {
    const SIZE = 8;
    const TYPESшками.
2. **Алгоритм поиска комбинаций (Analyze Engine):** 
   * Ищет  = [
        {id:'heart', icon:'🫀'},
        {id:'bullet', icon:'🔫'},
        {id:'garlic', icon:'🧄'},
        {id:'stake', icon:'🗡️'},
        {id:'vial', icon:'🧪'},
        {id:'coin', icon:'3 в ряд (обычный сбор).
   * Ищет 4 в ряд ➔ спавнит **Ракету** 💰'}
    ];
    const SPECIALS = ['rocketRow','rocketCol','bomb','plane','rainbow'];

    //🚀 (вертикальную или горизонтальную).
   * Ищет уголком 5 фишек ➔ спавнит **Бомбу** 💣.
   * Ищет квадрат 2х2 ➔ спавнит **Са Сверхбыстрые тайминги для сочной и отзывчивой динамики боя
    const SWAP_MS =молётик** ✈️.
   * Ищет 5 в ряд ➔ спавнит ** 180;  
    const CLEAR_MS = 200; 
    const FALL_MS = 240;  

    let currentLevelId = 1;
    let GOAL_HEARTS = 12;
    let START_MOVES = 20;
    let levelDifficultyРадужную фишку** 🌈.
3. **Гравитация и заполнение (Cascade & Gravity):** В = "normal";

    let grid = [];
    let selected = null;
    let hearts = 0, moves = 20;
    let busy = false;
    let tileIdCounter = 0;

    // Координаты для распознавания жестов (СВАЙПОВ)
    let dragStartX = 0, dragзрывает совпадения, опускает верхние фишки вниз и плавно насыпает сверху новые. ЗаStartY = 0;
    let dragActiveTile = null;

    const boardEl = document.getElementById('пускает цепную реакцию лавинных взрывов.
4. **Комбо-эффекты:** Раboard');
    const heartsVal = document.getElementById('hudHearts');
    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = document.getElementById('m3MovesText');
    
    // Оверлеиссчитывает мощные взрывы при перетаскивании двух спец-фишек друг на друга (Ракета +
    const overlayResults = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
 Бомба, Радужная + Радужная и т.д.).
5. **Связь с профилем игро    const resultsText = document.getElementById('resultsText');
    const preLevelOverlay = document.getElementById('overlayка:** За победу начисляет Звезды ⭐ и валюту 💰 в `state.js`, переводPreLevel');
    const preCard = document.getElementById('preLevelCard');

    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random() * TYPES.length)].я игрока на следующий уровень. При проигрыше — списывает Жизнь ❤️.

---

### Шагid;
    const key = (r, c) => r + ',' + c;
    const getType = 7. Создание файла `match3.js`

Создай в своей папке новый файл с именем ** (r, c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

    function iconFor(type) {
        switch(type) {
            case 'bomb': return '💣';
            case 'rocketRow': return`match3.js`** и скопируй туда этот код целиком, без каких-либо сокращений:

```javascript
// = '🚀';
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow': return '🌈';
            default: return TYPES.find(t => t.===============================================
// match3.js
// Движок "Три в ряд" с поддержкой жестов (сid === type).icon;
        }
    }

    function applySpecialClass(t) {
        t.el.classListвайпов) и бонусов
// ================================================

(function() {
    const SIZE = 8;
    const TYPES.remove('bomb', 'rocket-row', 'rocket-col', 'plane', 'rainbow');
        if (t.type === ' =bomb') t.el.classList.add('bomb');
        else if (t.type === 'rocketRow') t.el.classList.add('rocket-row');
        else if (t.type === 'rocketCol') t.el.classList.add('rocket-col');
        else if (t.type === ' [
        {id:'heart', icon:'🫀'},
        {id:'bullet', icon:'🔫'},
        {id:'garlic', icon:'🧄'},
        {id:'stake', icon:'🗡️'},
        {id:'vial', icon:'🧪'},
        {id:'coin', icon:'💰'}
    ];
    const SPECIALS =plane') t.el.classList.add('plane');
        else if (t.type === 'rainbow') t.el.classList.add('rainbow');
    }

    function setTilePos(el, row, ['rocketRow','rocketCol','bomb','plane','rainbow'];

    // Тайминги анимации для плавности и быстроты (GPU-friendly)
    const SWAP_MS col) {
        el.style.left = (col * 100 / SIZE) + '%'; = 180;  
    const CLEAR_MS = 200; 
    const FALL
        el.style.top = (row * 100 / SIZE) + '%';
    }_MS = 240;  

    let currentLevelId = 1;
    let GOAL

    // ==================== 1. РАСПОЗНАВАНИЕ СВАЙПОВ (ТАЧ И М_HEARTS = 12;
    let START_MOVES = 20;
    let levelЫШЬ) ====================
    function handleDragStart(e, tile) {
        if (busy) return;Difficulty = "normal";

    let grid = [];
    let selected = null;
    let hearts = 0, moves = 2
        dragActiveTile = tile;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;0;
    let busy = false;
    let tileIdCounter = 0;

    // Вспо
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;могательные переменные для свайпов
    let dragStartX = 0, dragStartY = 0;
    let dragActiveTile = null
        dragStartY = clientY;
    }

    function handleDragMove(e) {
        if;

    const boardEl = document.getElementById('board');
    const heartsVal = document.getElementById('hearts (!dragActiveTile || busy) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;Val');
    const movesVal = document.getElementById('movesVal');
    const m3GoalText = document.getElementById('m3Goal
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        const dist = Math.sqrt(dxText');
    const m3MovesText = document.getElementById('m3MovesText');

    const overlayResults * dx + dy * dy);

        if (dist > 30) { // Порог жеста с = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementByIdвайпа в пикселях
            let targetRow = dragActiveTile.row;
            let targetCol = dragActiveTile.col;

            if (Math.abs(dx) > Math.abs(dy)) {('resultsText');

    // Навешиваем слушатели для отслеживания жеста сдвига (свайпа)
                if (dx > 0) targetCol++; else targetCol--;
            } else {
                if (dy > 
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, {passive0) targetRow++; else targetRow--;
            }

            if (targetRow >= 0 && targetRow: false});
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = (r,c) => r+','+c; < SIZE && targetCol >= 0 && targetCol < SIZE) {
                const partner = grid[targetRow][targetCol];
                if (partner) {
                    dragActiveTile.el.classList.remove('selected');
                    selected = null
    const getType = (r,c) => grid[r] && grid[r][c] ? grid;
                    performSwap(dragActiveTile, partner);
                }
            }
            dragActiveTile =[r][c].type : null;

    function iconFor(type){
        switch(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀';
            case ' null; 
        }
    }

    function handleDragEnd() {
        dragActiveTile = nullrocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow':;
    }

    // Глобальные прослушиватели событий для свайпов
    window.addEventListener return '🌈';
            default: return TYPES.find(t=>t.id===type).icon;
('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, {passive: false});
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    // ==================== 2. СОЗДАНИЕ И ОБНОВЛЕНИЕ ФИШЕК ====================
            }
    }

    function applySpecialClass(t){
        t.el.classList.remove('function createTile(row, col, type, spawnRow) {
        const id = 'tile' + (bomb','rocket-row','rocket-col','plane','rainbow');
        if(t.type==='bombtileIdCounter++);
        const el = document.createElement('div');
        el.className = 'tile';') t.el.classList.add('bomb');
        else if(t.type==='rocketRow')
        el.dataset.id = id;
        const inner = document.createElement('div');
        inner t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol.className = 'tile-inner';
        inner.textContent = iconFor(type);
        el.appendChild') t.el.classList.add('rocket-col');
        else if(t.type==='plane(inner);

        // Объект фишки
        const tile = {id, type, row, col, el, inner') t.el.classList.add('plane');
        else if(t.type==='rainbow') t};

        // Навешиваем свайпы и клики
        el.addEventListener('mousedown', (e) => handleDragStart(e, tile));
        el.addEventListener('touchstart', (e) => handleDragStart.el.classList.add('rainbow');
    }

    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.(e, tile), {passive: true});
        el.addEventListener('click', onTileClick);

        style.top = (row*100/SIZE)+'%';
    }

    // 1.if (spawnRow !== undefined && spawnRow !== row) {
            el.style.transition = 'none';
            setTilePos(el, spawnRow, col);
        } else {
            setTilePos( СЧИТЫВАНИЕ ЖЕСТОВ (СВАЙПОВ)
    function handleDragStart(eel, row, col);
        }

        boardEl.appendChild(el);

        if (spawnRow, tile) {
        if (busy) return;
        dragActiveTile = tile;
        const client !== undefined && spawnRow !== row) {
            setTimeout(() => {
                el.style.transition = '';
                setTilePos(elX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY =, row, col);
            }, 16); 
        }
        
        applySpecialClass(tile);
        return tile;
    }

    function moveTileTo(tile, row, col) { e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;
        tile.row = row; tile.col = col;
        setTilePos(tile.el,
        dragStartY = clientY;
    }

    function handleDragMove(e) {
        if row, col);
    }

    function buildInitialGrid() {
        boardEl.innerHTML = '';
 (!dragActiveTile || busy) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;        grid = [];
        for (let r = 0; r < SIZE; r++) grid.push(new Array(SIZE).fill(
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX -null));
        
        for (let r = 0; r < SIZE; r++) {
            for (let c dragStartX;
        const dy = clientY - dragStartY;
        const dist = Math.sqrt(dx = 0; c < SIZE; c++) {
                let t, guard = 0;
                do * dx + dy * dy);

        if (dist > 30) { // Порог свайпа в 30 пи { t = randType(); guard++; } 
                while (guard < 30 && (
                    (c >= 2 && gridкселей
            let targetRow = dragActiveTile.row;
            let targetCol = dragActiveTile.[r][c-1] && grid[r][c-2] && grid[r]col;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) targetCol[c-1].type === t && grid[r][c-2].type === t) ||
                    (r >= ++; else targetCol--;
            } else {
                if (dy > 0) targetRow++; else targetRow--;2 && grid[r-1][c] && grid[r-2][c] && grid
            }

            if (targetRow >= 0 && targetRow < SIZE && targetCol >= 0 && targetCol < SIZE)[r-1][c].type === t && grid[r-2][c].type === t)
                ));
 {
                const partner = grid[targetRow][targetCol];
                if (partner) {
                    drag                grid[r][c] = createTile(r, c, t, r - SIZE - Math.floor(Math.randomActiveTile.el.classList.remove('selected');
                    selected = null;
                    performSwap(dragActive() * 4));
            }
        }
    }

    function findTileById(id) {
Tile, partner);
                }
            }
            dragActiveTile = null; 
        }
            for (let r = 0; r < SIZE; r++) {
            for (let c = }

    function handleDragEnd() {
        dragActiveTile = null;
    }

    // 0; c < SIZE; c++) {
                const t = grid[r][c];
                if (t && t.id === id) return t;
            }
        }
        return null;
    }

    function onTileClick(e) {
        if (busy) return;
        const tile =2. СОЗДАНИЕ ОПТИМИЗИРОВАННЫХ ФИШЕК
    function create findTileById(e.currentTarget.dataset.id);
        if (!tile) return;
        if (Tile(row, col, type, spawnRow){
        const id = 'tile'+(tileIdCounter++);
        const el = document.createElement('div');
        el.className = 'tile';
        el.selected === null) {
            if (isSpecial(tile.type)) { activateStandalone(tile); return; }
            selected = tile;dataset.id = id;
        const inner = document.createElement('div');
        inner.className = '
            tile.el.classList.add('selected');
            return;
        }
        if (selectedtile-inner';
        inner.textContent = iconFor(type);
        el.appendChild(inner);

 === tile) {
            tile.el.classList.remove('selected');
            selected = null;
                    const tile = {id, type, row, col, el, inner};

        el.addEventListener('mousedownreturn;
        }
        const adjacent = Math.abs(selected.row - tile.row) + Math.abs(selected.col', (e) => handleDragStart(e, tile));
        el.addEventListener('touchstart', (e) - tile.col) === 1;
        selected.el.classList.remove('selected');
        if (!adjacent) {
 => handleDragStart(e, tile), {passive: true});
        el.addEventListener('click', onTileClick);

        if(            if (isSpecial(tile.type)) { selected = null; activateStandalone(tile); return; }
spawnRow !== undefined && spawnRow !== row){
            el.style.transition = 'none';
            set            selected = tile;
            tile.el.classList.add('selected');
            return;
        }TilePos(el, spawnRow, col);
        } else {
            setTilePos(el, row
        const a = selected, b = tile;
        selected = null;
        performSwap(a,, col);
        }

        boardEl.appendChild(el);

        if(spawnRow !== undefined && b);
    }

    function swapInGrid(a, b) {
        const ar = a. spawnRow !== row){
            setTimeout(() => {
                el.style.transition = '';
                setTilePos(el, row,row, ac = a.col, br = b.row, bc = b.col;
        grid[ar][ac] = b; col);
            }, 16); 
        }
        
        applySpecialClass(tile);
        return tile;
    }

    function moveTileTo(tile, row, col){
        tile. grid[br][bc] = a;
        a.row = br; a.col = bc;
        b.row = ar; b.col = ac;
    }

    function performSwap(a, b) {
        busy = truerow = row; tile.col = col;
        setTilePos(tile.el, row, col);;
        swapInGrid(a, b);
        moveTileTo(a, a.row, a
    }

    // 3. ПОСТРОЕНИЕ НАЧАЛЬНОЙ СЕТКИ
    function buildInitialGrid(){.col);
        moveTileTo(b, b.row, b.col);
        
        setTimeout(() => {
            const aSpecial = isSpecial(a.type), bSpecial = isSpecial(b.
        boardEl.innerHTML = '';
        grid = [];
        for(let r=0;r<type);
            if (aSpecial && bSpecial) {
                moves--; if (m3MovesText)SIZE;r++) grid.push(new Array(SIZE).fill(null));
        
        for(let m3MovesText.textContent = moves;
                const cells = comboFootprint(a, b);
                 r=0;r<SIZE;r++){
            for(let c=0;c<SIZE;cclearAndContinue(cells, []);
                return;
            }
            if (aSpecial || bSpecial) {
                const special = aSpecial ? a : b;
                const partner = aSpecial ? b : a++){
                let t, guard=0;
                do{ t=randType(); guard++; } 
                while(guard<30 && (
                    (c>=2 && grid[r][c-1];
                moves--; if (m3MovesText) m3MovesText.textContent = moves;
                let && grid[r][c-2] && grid[r][c-1].type===t && grid cells;
                if (special.type === 'rainbow') {
                    cells = cellsOfColor(partner.[r][c-2].type===t) ||
                    (r>=2 && grid[r-1]type);
                    cells.add(key(special.row, special.col));
                } else {
                    cells = computeActivationFootprint[c] && grid[r-2][c] && grid[r-1][c].type===t &&(special);
                }
                clearAndContinue(cells, []);
                return;
            }
             grid[r-2][c].type===t)
                ));
                grid[r][c] =const result = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
            if (!hasMatch) {
                swapInGrid(a, b);
                moveTileTo(a, a createTile(r, c, t, r - SIZE - Math.floor(Math.random()*4));
            }
        }
    }

    function findTileById(id){
        for(let r=.row, a.col);
                moveTileTo(b, b.row, b.col);
                a.el.classList0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            const t = grid.add('shake');
                b.el.classList.add('shake');
                setTimeout(() => {
[r][c];
            if(t && t.id===id) return t;
        }
        return null;
    }

                        a.el.classList.remove('shake');
                    b.el.classList.remove('shake');
                    busy = false;
                }, 220);
                pulseToast('Нет совпадения');
function onTileClick(e){
        if(busy) return;
        const tile = findTileById(                return;
            }
            moves--; if (m3MovesText) m3MovesText.textContent = moves;
            applyResolutione.currentTarget.dataset.id);
        if(!tile) return;
        if(selected === null){Full(result);
        }, SWAP_MS);
    }

    // ==================== 3.
            if(isSpecial(tile.type)){ activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        if(selected === tile){
            tile.el.classList.remove('selected');
            selected = null;
            return;
         АЛГОРИТМ ПОИСКА СОВПАДЕНИЙ (MATCHING) ====================
    function collect}
        const adjacent = Math.abs(selected.row-tile.row) + Math.abs(selectedRuns() {
        const runs = [];
        for (let r = 0; r < SIZE; r.col-tile.col) === 1;
        selected.el.classList.remove('selected');
        if(!adjacent){
            ++) {
            let runStart = 0;
            for (let c = 1; c <= SIZEif(isSpecial(tile.type)){ selected=null; activateStandalone(tile); return; }
            selected; c++) {
                const cur = c < SIZE ? getType(r, c) : null;
                const prev = getType(r, c - 1);
                if (cur !== null && cur === prev && = tile;
            tile.el.classList.add('selected');
            return;
        }
        const a = selected, b = tile;
        selected = null;
        performSwap(a,b); !isSpecial(cur)) continue;
                const len = c - runStart;
                if (len >=
    }

    function swapInGrid(a,b){
        const ar=a.row, ac 3 && !isSpecial(prev)) {
                    const cells = []; 
                    for (let k = run=a.col, br=b.row, bc=b.col;
        grid[ar][ac]=b; gridStart; k < c; k++) cells.push([r, k]);
                    runs.push({cells,[br][bc]=a;
        a.row=br; a.col=bc;
        b.row=ar; dir: 'h', length: len, type: prev, used: false});
                }
                runStart b.col=ac;
    }

    function performSwap(a,b){
        busy = true = c;
            }
        }
        for (let c = 0; c < SIZE; c;
        swapInGrid(a,b);
        moveTileTo(a, a.row, a.col);
        moveTileTo(b, b.row, b.col);
        
        setTimeout++) {
            let runStart = 0;
            for (let r = 1; r <= SIZE; r++) {
                const cur = r < SIZE ? getType(r, c) : null;
                (()=>{
            const aSpecial = isSpecial(a.type), bSpecial = isSpecial(b.type);const prev = getType(r - 1, c);
                if (cur !== null && cur === prev &&
            if(aSpecial && bSpecial){
                moves--; updateMatch3HUD();
                const cells = comboFoot !isSpecial(cur)) continue;
                const len = r - runStart;
                if (len >= 3 && !isSpecial(prev)) {
                    const cells = []; 
                    for (let k =print(a,b);
                clearAndContinue(cells, []);
                return;
            }
             runStart; k < r; k++) cells.push([k, c]);
                    runs.push({cells, dir: 'v',if(aSpecial || bSpecial){
                const special = aSpecial ? a : b;
                const partner length: len, type: prev, used: false});
                }
                runStart = r;
             = aSpecial ? b : a;
                moves--; updateMatch3HUD();
                let cells;
                }
        }
        return runs;
    }

    function dedupeCells(cells) {
        if(special.type === 'rainbow'){
                    cells = cellsOfColor(partner.type);
                    cells.add(key(special.row, special.col));
                } else {
                    cells = computeActivationconst seen = new Set(); 
        const out = [];
        cells.forEach(c => { 
            const k = key(cFootprint(special);
                }
                clearAndContinue(cells, []);
                return;
            }[0], c[1]); 
            if (!seen.has(k)) { seen.add(k); out.push(c
            const result = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets); } 
        });
        return out;
    }

    function analyzeMatches() {
        const runs = collectRuns();
        const matchedByLine = new Set();
        runs.forEach(r => r.length || result.rainbows.length || result.squares.length || result.normalCells.size;
            if(!hasMatch){
                swapInGrid(a,b);
                moveTileTo(a,.cells.forEach(c => matchedByLine.add(key(c[0], c[1]))));

        // Самолётик a.row, a.col);
                moveTileTo(b, b.row, b.col);
                a.el.classList 2x2
        const squares = [];
        const usedSquareCells = new Set();
        for (.add('shake');
                b.el.classList.add('shake');
                setTimeout(()=>{
                    a.el.classList.let r = 0; r < SIZE - 1; r++) {
            for (let c = 0; c < SIZE - remove('shake');
                    b.el.classList.remove('shake');
                    busy = false;
                1; c++) {
                const cells = [[r,c],[r,c+1],}, 220);
                pulseToast('Нет совпадения');
                return;
            }
[r+1,c],[r+1,c+1]];
                if (cells.some(cc => matchedByLine.has(key(cc[0],cc[1])) || usedSquareCells.has(key(cc            moves--; updateMatch3HUD();
            applyResolutionFull(result);
        }, SWAP_MS);
    }

    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){
            let runStart=[0],cc[1])))) continue;
                const t0 = getType(r, c);
                if0;
            for(let c=1;c<=SIZE;c++){
                const cur = c< (!t0 || isSpecial(t0)) continue;
                if (cells.every(cc => getType(SIZE ? getType(r,c) : null;
                const prev = getType(r,c-1);
                if(cur!==cc[0], cc[1]) === t0)) {
                    squares.push({type: 'plane', at: [r, c], cells});
                    cells.forEach(cc => usedSquareCells.add(keynull && cur===prev && !isSpecial(cur)) continue;
                const len = c - runStart;(cc[0], cc[1])));
                }
            }
        }

        // Бомбы
                if(len>=3 && !isSpecial(prev)){
                    const cells=[]; 
                    for(let k=runStart; (Уголки L и T)
        const hRuns = runs.filter(r => r.dir === 'h');
        constk<c;k++) cells.push([r,k]);
                    runs.push({cells, dir:'h', length:len, type vRuns = runs.filter(r => r.dir === 'v');
        const bombs = [];
        :prev, used:false});
                }
                runStart = c;
            }
        }
        for(let c=0;c<SIZE;c++){
            let runStart=0;
            hRuns.forEach(h => {
            if (h.used) return;
            for (const vfor(let r=1;r<=SIZE;r++){
                const cur = r<SIZE ? getType( of vRuns) {
                if (v.used || v.type !== h.type) continue;
r,c) : null;
                const prev = getType(r-1,c);
                if(cur!==null && cur===prev && !isSpecial(cur)) continue;
                const len = r - run                const shared = h.cells.find(hc => v.cells.some(vc => vc[0] === hc[0] && vc[1] === hc[1]));
                if (shared) {
                    Start;
                if(len>=3 && !isSpecial(prev)){
                    const cells=[]; 
                    h.used = true; v.used = true;
                    bombs.push({type: 'bomb', at: shared, cells: dedufor(let k=runStart;k<r;k++) cells.push([k,c]);
                    peCells(h.cells.concat(v.cells))});
                    break;
                }
            }runs.push({cells, dir:'v', length:len, type:prev, used:false});
                }
                runStart = r;
            }
        }
        return runs;
    }

    function dedupeCells(cells){
        });

        const rockets = [], rainbows = [];
        const normalCells = new Set();
        runs.forEach(run
        const seen = new Set(); 
        const out=[];
        cells.forEach(c=>{ 
 => {
            if (run.used) return;
            if (run.length >= 5) {            const k=key(c[0],c[1]); 
            if(!seen.has(k)){ seen.add(k
                rainbows.push({type: 'rainbow', at: run.cells); out.push(c); } 
        });
        return out;
    }

    function analyzeMatches(){
        const runs = collectRuns();
        const matchedByLine = new Set();
        runs.[Math.floor(run.cells.length / 2)], cells: run.cells});
            } else if (run.length === 4) {
                const spType = run.dir === 'h' ? 'rocketCol' : 'rocketRow';
                rockets.push({type: spType, at: run.cellsforEach(r=> r.cells.forEach(c=> matchedByLine.add(key(c[0],c[1]))[Math.floor(run.cells.length / 2)], cells: run.cells});
            } else {
                run.cells.forEach(c => normal));

        const squares = [];
        const usedSquareCells = new Set();
        for(let r=Cells.add(key(c[0], c[1])));
            }
        });

        return {0;r<SIZE-1;r++){
            for(let c=0;c<SIZE-1;cbombs, rockets, rainbows, squares, normalCells};
    }

    // ==================== 4.++){
                const cells = [[r,c],[r,c+1],[r+1,c], ЛОГИКА БОНУСОВ И СУПЕР-КОМБО ====================
    function footprintFor([r+1,c+1]];
                if(cells.some(cc=> matchedByLine.has(key(tile) {
        const cells = [];
        if (tile.type === 'bomb') {
            forcc[0],cc[1])) || usedSquareCells.has(key(cc[0],cc[1])))) continue;
                const t0 = getType(r,c);
                if(!t0 || isSpecial(t0 (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
)) continue;
                if(cells.every(cc=> getType(cc[0],cc[1])===t0)){                const rr = tile.row + dr, cc = tile.col + dc;
                if (rr >=
                    squares.push({type:'plane', at:[r,c], cells});
                    cells.forEach(cc=> usedSquareCells.add(key(cc[0],cc[1])));
                }
            } 0 && rr < SIZE && cc >= 0 && cc < SIZE) cells.push([rr, cc]);
            }
        }
        }

        const hRuns = runs.filter(r=>r.dir==='h');
        const vRuns = runs.filter else if (tile.type === 'rocketRow') {
            for (let c = 0; c < SIZE; c++) cells.push([tile.row, c]);
        } else if (tile.type ===(r=>r.dir==='v');
        const bombs = [];
        hRuns.forEach(h=>{
            if 'rocketCol') {
            for (let r = 0; r < SIZE; r++) cells.push(h.used) return;
            for(const v of vRuns){
                if(v.used || v.type!==h.([r, tile.col]);
        } else if (tile.type === 'plane') {
            cellstype) continue;
                const shared = h.cells.find(hc=> v.cells.some(vc.push([tile.row, tile.col]);
            [[-1,0],[1,0],=> vc[0]===hc[0] && vc[1]===hc[1]));
                if([0,-1],[0,1]].forEach(([dr,dc]) => {
                const rr = tile.row + dr, cc = tileshared){
                    h.used=true; v.used=true;
                    bombs.push({type.col + dc;
                if (rr >= 0 && rr < SIZE && cc >= 0 && cc:'bomb', at:shared, cells: dedupeCells(h.cells.concat(v.cells))});
                    break;
                }
            }
        });

        const rockets = [], rainbows = [];
        const normalCells = < SIZE) cells.push([rr, cc]);
            });
            const candidates = [];
            for ( new Set();
        runs.forEach(run=>{
            if(run.used) return;
            iflet r = 0; r < SIZE; r++) for (let c = 0; c < SIZE;(run.length>=5){
                rainbows.push({type:'rainbow', at: run.cells c++) {
                if (grid[r][c] && !(r === tile.row && c === tile.col)) candidates.[Math.floor(run.cells.length/2)], cells: run.cells});
            } else if(run.push([r, c]);
            }
            if (candidates.length) cells.push(candidateslength===4){
                const spType = run.dir==='h' ? 'rocketCol' : 'rocketRow';
                rockets.push({type: spType, at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells});[Math.floor(Math.random() * candidates.length)]);
        } else if (tile.type === 'rainbow') {
            cells.push([tile.row, tile.col]);
        }
        return cells;
    }


            } else {
                run.cells.forEach(c=> normalCells.add(key(c    function computeActivationFootprint(startTile) {
        const visited = new Set([startTile.id]);[0],c[1])));
            }
        });

        return {bombs, rockets, rainbows, squares
        const footprint = new Set();
        const queue = [startTile];
        while (queue.length, normalCells};
    }

    function footprintFor(tile){
        const cells = [];
        if(tile.type==='bomb'){
            for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc) {
            const t = queue.shift();
            footprintFor(t).forEach(([r, c]) => {
                footprint.add(key(r, c));
                const other = grid[r] && grid[r]<=2;dc++){
                const rr=tile.row+dr, cc=tile.col+dc;[c];
                if (other && isSpecial(other.type) && !visited.has(other.id)) {
                    visited.add
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            }
        } else if(tile.type==='rocketRow'){
            for(let c(other.id);
                    queue.push(other);
                }
            });
        }
        =0;c<SIZE;c++) cells.push([tile.row,c]);
        } else ifreturn footprint;
    }

    function cellsOfColor(type) {
        const s = new Set();(tile.type==='rocketCol'){
            for(let r=0;r<SIZE;r++)
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
            if (grid[r][c] && grid[r][c]. cells.push([r,tile.col]);
        } else if(tile.type==='plane'){
            cells.push([tile.row,tile.col]);
            [[-1,0],type === type) s.add(key(r, c));
        }
        return s;
    [1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{
                const rr=tile.row+dr, cc=tile.}

    function presentColors() {
        const set = new Set();
        for (let r = col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE)0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
 cells.push([rr,cc]);
            });
            const candidates = [];
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
                if(grid[r][c]            if (grid[r][c] && !isSpecial(grid[r][c].type)) set.add(grid[r][c].type);
        }
        return Array.from(set);
     && !(r===tile.row && c===tile.col)) candidates.push([r,c]);
            }

    function comboFootprint(a, b) {
        const cells = new Set();
        const}
            if(candidates.length) cells.push(candidates[Math.floor(Math.random()*candidates.length)]);
        } else kinds = [a.type, b.type];
        const has = t => kinds.includes(t); if(tile.type==='rainbow'){
            cells.push([tile.row,tile.col]);
        }
        return cells;
    }

    function computeActivationFootprint(startTile){
        const visited = new Set(
        const isRocket = t => t === 'rocketRow' || t === 'rocketCol';
        
        if (has('bomb') && has('bomb')) {
            const center = a;
            for (let dr = -3; dr <= 3; dr[startTile.id]);
        const footprint = new Set();
        const queue = [startTile];
        while++) for (let dc = -3; dc <= 3; dc++) {
                const rr = center.(queue.length){
            const t = queue.shift();
            footprintFor(t).forEach((row + dr, cc = center.col + dc;
                if (rr >= 0 && rr < SIZE && cc >= 0 && cc < SIZE) cells.add(key(rr, cc));
            }
[r, c]) => {
                footprint.add(key(r, c));
                const other = grid            pulseToast('💥 Ультра-бомба 7×7!');
            return cells;
        }
[r] && grid[r][c];
                if (other && isSpecial(other.type) && !visited.has(other.id)) {
                    visited.add(other.id);
                    queue.push(other);
                }
        if (has('bomb') && (has('rocketRow') || has('rocketCol'))) {
            const rocket =            });
        }
        return footprint;
    }

    function cellsOfColor(type){
        const s = new Set();
 isRocket(a.type) ? a : b;
            for (let dr = -1; dr <=        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            if 1; dr++) { 
                const rr = rocket.row + dr; 
                if (rr >= 0 && rr < SIZE) for (let c = 0; c < SIZE; c++) cells.add(key(rr,(grid[r][c] && grid[r][c].type===type) s.add(key(r,c));
        }
        return s;
    }

    function presentColors(){
        const c)); 
            }
            for (let dc = -1; dc <= 1; dc++) { 
                const cc = rocket set = new Set();
        for(let r=0;r<SIZE;r++) for(let c.col + dc; 
                if (cc >= 0 && cc < SIZE) for (let r ==0;c<SIZE;c++){
            if(grid[r][c] && !isSpecial(grid[r][c].type)) set.add(grid[r][c].type);
        }
 0; r < SIZE; r++) cells.add(key(r, cc)); 
            }
            pulseToast('🧨 Тройные полосы!');
            return cells;
        }
        if (has        return Array.from(set);
    }

    function comboFootprint(a, b){
        const cells = new Set();
        const kinds = [a.type, b.type];
        const has('rocketRow') || has('rocketCol')) {
            for (let i = 0; i < SIZE; i++) {
                cells.add(key(a.row, i));
                cells.add( = t => kinds.includes(t);
        const isRocket = t => t === 'rocketRow' ||key(i, a.col));
            }
            pulseToast('🚀 Крестообразный удар!');
 t === 'rocketCol';
        
        if(has('bomb') && has('bomb')){
            const center = a;            return cells;
        }
        if (has('plane')) {
            const plane = a.type
            for(let dr=-3;dr<=3;dr++) for(let dc=-3;dc<=3;dc++){
                const === 'plane' ? a : b;
            footprintFor(plane).forEach(([r, c]) => rr=center.row+dr, cc=center.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.add(key(rr,cc));
             cells.add(key(r, c)));
            pulseToast('✈️ Самолётик активирован!');
            return cells;
        }
        if (has('rainbow') && has('rainbow')) {
            }
            pulseToast('💥 Ультра-бомба 7×7!');
            return cells;
        for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (}
        if(has('bomb') && (has('rocketRow')||has('rocketCol'))){
            const rocket = isRocket(a.type) ? a : b;
            for(let dr=-1grid[r][c]) cells.add(key(r, c));
            pulseToast('🌈 Полная зачистка!');
            return cells;
        }
        if (has('rainbow')) {
            const rainbow = a.type === 'rainbow' ? a : b;
            const other = rainbow === a ? b : a;
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random() * colors.length)] : null;
            if (color) {
                for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
                    if (grid[r][c] && grid[r][c].type === color) cells.add(key(r, c));
                }
            }
            pulseToast('🌈 Радужный шар сработал!');
            return cells;
        }
        footprintFor(a).forEach(([r, c]) => cells.add(key(r, c)));
        footprintFor(b).forEach(([r, c]) => cells.add(key(r, c)));
        return cells;
    }

    function activateStandalone(tile) {
        busy = true;
        moves--; if (m3MovesText) m3MovesText.textContent = moves;
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

    function applyResolutionFull(result) {
        const specialSpawns = [];
        const scoreSet = new Set();
        result.bombs.forEach(b => { b.cells.forEach(c => scoreSet.add(key(c[0], c[1]))); specialSpawns.push({at: b.at, type: 'bomb'}); });
        result.rockets.forEach(rk => { rk.cells.forEach(c => scoreSet.add(key(c[0], c[1]))); specialSpawns.push({at: rk.at, type: rk.type}); });
        result.rainbows.forEach(rb => { rb.cells.forEach(c => scoreSet.add(key(c[0], c[1]))); specialSpawns.push({at: rb.at, type: 'rainbow'}); });
        result.squares.forEach(sq => { sq.cells.forEach(c => scoreSet.add(key(c[0], c[1]))); specialSpawns.push({at: sq.at, type: 'plane'}); });
        result.normalCells.forEach(k => scoreSet.add(k));
        
        const atKeys = new Set(specialSpawns.map(s => key(s.at[0], s.at[1])));
        const clearSet = new Set();
        scoreSet.forEach(k => { if (!atKeys.has(k)) clearSet.add(k); });
        
        if (specialSpawns.length) pulseToast(specialSpawns.length > 1 ? 'Комбо бонусов!' : 'Новый бонус!');
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

    // ==================== 5. СЮЖЕТНАЯ НАГРАДА И ВЫЧИСЛЕНИЯ ====================
    function getRewards(diff) {
        let starsGained = 1;
        let baseCoins = 100;

        if (diff === "medium") {
            baseCoins = 150;
        } else if (diff === "hard") {;dr<=1;dr++){ 
                const rr=rocket.row+dr; 
                if(rr>=0&&rr<SIZE) for(let c=0;c<SIZE;c++) cells.add(key(rr,c)); 
            }
            for(let dc=-1;dc<=1;dc++){ 
                const cc=rocket.
            baseCoins = 250;
        } else if (diff === "extreme") {
            baseCoins = 400;
        } else if (diff === "challenge") {
            starsGcol+dc; 
                if(cc>=0&&cc<SIZE) for(let r=0;r<SIZE;r++) cells.add(key(r,cc)); 
            }
            pulseToast('🧨 Тройные полосы!');
            return cells;
        }
        if(has('rocketRow') || has('rocketCol')){
            for(let i=0; i<SIZE; i++){
                cells.add(key(a.row, i));
                cells.add(key(i, a.col));
            }
            pulseToast('🚀 Крестообразный удар!');
            return cells;
        }
        if(has('plane')){
            const plane = a.type==='plane' ? a : b;
            footprintFor(plane).forEach(([r,c])=>cells.add(key(r,c)));
            pulseToast('✈️ Самолётик активирован!');
            return cells;
        }
        if(hasained = 3;
            baseCoins = 300;
        }

        let bonusCoins = moves * 10('rainbow') && has('rainbow')){
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]) cells.add(key(r,c));
            pulseToast('🌈 Полная зачистка!');
            return cells;
        }
        if(has('rainbow')){
            const rainbow = a.type==='rainbow' ? a : b;
            const other = rainbow===a ? b : a;
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random()*colors.length)] : null;
            if(color){
                for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
                    if(grid[r][c] && grid[r][c].type===color) cells.add(key(r,c));
                }
            }
            pulseToast('🌈 Радужный шар сработал!');
            return cells;
        }
        footprintFor(a).forEach(([r,c])=>cells.add(key(r,c)));
        footprintFor(b).forEach(([r,c])=>cells.add(key(r,c)));
        return cells;
    }

    function activateStandalone(tile){
        busy = true;
        moves--; updateMatch3HUD();
        let cells;
        if(tile.type==='rainbow'){
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random()*colors.length)] : null;
            cells = color ? cellsOfColor(color) : new Set();
            cells.add(key(tile.row,tile.col));
        } else {
            cells = computeActivationFootprint(tile);
        }
        clearAndContinue(cells, []);
    }

    function applyResolutionFull(result){
        const specialSpawns = [];
        const scoreSet = new Set();
        result.bombs.forEach(b=>{ b.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:b.at, type:'bomb'}); });
        result.rockets.forEach(rk=>{ rk.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rk.at, type:rk.type}); });
        result.rainbows.forEach(rb=>{ rb.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rb.at, type:'rainbow'}); });
        result.squares.forEach(sq=>{ sq.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:sq.at, type:'plane'}); });
        result.normalCells.forEach(k=>scoreSet.add(; 
        let totalCoins = baseCoins + bonusCoins;

        return { stars: starsGained,k));
        
        const atKeys = new Set(specialSpawns.map(s=>key(s.at[0], coins: totalCoins, base: baseCoins, bonus: bonusCoins };
    }

    // ==================== 6. ОТs.at[1])));
        const clearSet = new Set();
        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearSet.add(k); });
        
        if(specialКРЫТИЕ ПРЕ-КАРТОЧКИ НАЧАЛА УРОВНЯ ====================
    function openPreSpawns.length) pulseToast(specialSpawns.length>1 ? 'Комбо бонусов!' : 'НоLevelScreen(levelId) {
        const levelData = gameLevels ? gameLevelsвый бонус!');
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

[levelId - 1] : null;
        if (!levelData) return;

        currentLevelId = levelId;
            function clearAndContinue(clearSet, specialSpawns, scoreSet){
        specialSpawns = specialSpawns ||GOAL_HEARTS = levelData.heartsGoal;
        START_MOVES = levelData.moves; [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(Number);

        levelDifficulty = levelData.difficulty;

        // Настраиваем цветовую тему Homescapes
        if (preCard            const t = grid[r] && grid[r][c];
            if(!t) return;
            if() {
            preCard.className = 'pre-card';
            let diffName = "Обычный уровень";
            if (levelDifficulty === "normal") {
                preCard.classList.add('diff-normal');t.type==='heart') heartsGained++;
        });
        clearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid
                diffName = "Обычный уровень 🟡";
            } else if (levelDifficulty === "medium") {
                preCard.classList.add('diff-medium');
                diffName = "Сложный[r] && grid[r][c];
            if(t) t.el.classList.add('clearing');
        });
         уровень 🔵";
            } else if (levelDifficulty === "hard") {
                preCard.classList.hearts += heartsGained;
        
        // Обновляем счетчики реалтайм
        if (add('diff-hard');
                diffName = "Очень сложный уровень 🔴";
            } else ifheartsVal) heartsVal.textContent = hearts;
        if (m3GoalText) m3GoalText.textContent = `${ (levelDifficulty === "extreme") {
                preCard.classList.add('diff-extreme');
                diffName = "Ультра-сложный уровень 🟢🔵";
            } else if (levelDifficulty === "challengehearts}/${GOAL_HEARTS} ❤️`;
        
        if(heartsGained>0) pulseToast('+'+heartsGained+' ❤️');
        
        setTimeout(()=>{
            clearSet.forEach(k=>{
                const") {
                preCard.classList.add('diff-challenge');
                diffName = "Испытание! 🟠";
            }

            document.getElementById('preLevelTitle').textContent = `Уровень ${ [r,c] = k.split(',').map(Number);
                const t = grid[r] && gridcurrentLevelId}`;
            document.getElementById('preLevelDiffBadge').textContent = diffName;
            document.getElementById('preLevelGoalVal').textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец[r][c];
                if(t){ t.el.remove(); grid[r][c]=null; }
            });
            specialSpawns.forEach(s=>{
                const [r,c] = s.at`;
            
            const r = getRewards(levelDifficulty);
            document.getElementById('preRewardStars').textContent = `⭐ +${r.stars}`;
            document.getElementById('preRewardCoins').textContent = `💰;
                if(!grid[r]) return;
                let t = grid[r][c];
                 +${r.base}₽`;
        }

        if (preLevelOverlay) preLevelOverlay.classList.remove('hidden');
    if(!t){
                    t = createTile(r,c,s.type,r);
                    grid[r][c] = t;
                } else {
                    t.type = s.type;
                    t.inner.textContent =}

    // Клик "Отмена" на пре-карточке
    const btnCancelPreLevel = document.getElementById(' iconFor(s.type);
                    applySpecialClass(t);
                }
            });
            applyGravityAndRefill();
            setTimeout(()=>{
                const result = analyzeMatches();
                const hasMore = resultbtnCancelPreLevel');
    if (btnCancelPreLevel) {
        btnCancelPreLevel.addEventListener('click', () => {
.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.            if (preLevelOverlay) preLevelOverlay.classList.add('hidden');
        });
    }

    // Клик "В бойsize;
                if(!hasMore){
                    busy = false;
                    checkEndConditions();
                } else {
                    applyResolutionFull(result);
                }
            }, FALL_MS + 20);" на пре-карточке
    const btnStartMatch3 = document.getElementById('btnStartMatch3');
    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            if (preLevelOverlay 
        }, CLEAR_MS);
    }

    function applyGravityAndRefill(){
        for(let c=0;c) preLevelOverlay.classList.add('hidden');
            if (window.showScreen) window.showScreen<SIZE;c++){
            let pointer = SIZE-1;
            for(let r=SIZE-1;r>=0;r--){
                if(grid[r][c] !== null){
                    const t = grid('screenMatch3');

            // Сбрасываем счетчики уровня
            hearts = 0;
            moves = START_MOVES;
            if (heartsVal) heartsVal.textContent = 0;
            if (m3MovesText) m3MovesText.[r][c];
                    if(pointer !== r){
                        grid[pointer][c] = t;
                        grid[r][c] =textContent = moves;
            if (m3GoalText) m3GoalText.textContent = `${GOAL_ null;
                        moveTileTo(t, pointer, c);
                    }
                    pointer--;
                }
            }
            let spawnOffset = 1;
            for(let r=pointer;r>=0;r--){
                HEARTS} ❤️`;

            // Сначала выстраиваем фишки в фоновом режиме
            buildInitialgrid[r][c] = createTile(r, c, randType(), -spawnOffset);
                spawnGrid();

            // Если есть вводный диалог уровня — запускаем его поверх игрового поля
            const currentOffset++;
            }
        }
    }

    // 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВЫЧИСЛЕНИЯ РЕЗУЛЬТАТОВ
    function getRewards(diff) {DialogData = gameDialogs ? gameDialogs[currentLevelId] : null;
            if (window.NovelEngine && currentDialogData &&
        let starsGained = 1;
        let baseCoins = 100;

        if (diff === "medium") {
            baseCoins = 150;
        } else if (diff currentDialogData.intro) {
                if (boardEl) boardEl.style.opacity = "0.2"; // Слегка приглушаем поле
                window.NovelEngine.run(currentDialogData.intro, () => {
                     === "hard") {
            baseCoins = 250;
        } else if (diff === "if (boardEl) boardEl.style.opacity = "1"; // Делаем ярким для игры
                });
            } elseextreme") {
            baseCoins = 400;
        } else if (diff === "challenge") {
            starsGained = 3;
            baseCoins = 300;
        }

 {
                if (boardEl) boardEl.style.opacity = "1";
            }
        });
    }

    // ==================== 7. ПРОВЕРКА КОНЦА ИГР        let bonusCoins = moves * 10; 
        let totalCoins = baseCoins + bonusCoins;Ы И НАЧИСЛЕНИЕ НАГРАД ====================
    function checkEndConditions() {
        //

        return { stars: starsGained, coins: totalCoins, base: baseCoins, bonus: bonusCoins };
    }

    function updateMatch3HUD() {
        if (movesVal) movesVal.textContent = moves;
        if (m3MovesText) m Условие 1: ПОБЕДА!
        if (hearts >= GOAL_HEARTS) {
            const r3MovesText.textContent = moves;
    }

    // 5. ГЛОБАЛЬНЫЙ МЕТОД: = getRewards(levelDifficulty);
            
            // Записываем данные в state.js
            if (window. ОТКРЫТИЕ СТАРТОВОГО ОКНА УРОВНЯ
    window.openPreLevelScreen = function(GameState) {
                window.GameState.addStars(r.stars);
                window.GameState.addCashlevelId) {
        const levelData = window.gameLevels ? window.gameLevels[levelId - 1] : null;
        if (!levelData) return;

        currentLevelId = levelId;
        GOAL_HEARTS =(r.coins);
            }

            const winText = `Заказ выполнен!\n\nВы получили: ⭐ +${r.stars levelData.heartsGoal;
        START_MOVES = levelData.moves;
        levelDifficulty = level}\nБазовая награда: 💰 +${r.base}₽\nБонус за ходы (${moves} штData.difficulty;

        // Настройка цветности карточки в стиле Homescapes
        const preCard =.): 💰 +${r.bonus}₽\nИтого: +${r.coins}₽`;

            const currentDialogData = gameDialogs ? gameDialogs[currentLevelId] : null;

            // Если у уровня document.getElementById('preLevelCard');
        if (preCard) {
            preCard.className = 'pre-card';
            let diffClass = 'diff-normal';
            let diffName = 'Обычная сложность 🟡';
            if (levelDifficulty === 'medium') { diffClass = 'diff-medium'; diffName = 'Сложная охота 🔵'; }
            else if (levelDifficulty === 'hard') { diffClass = 'diff-hard'; diffName = 'Опасный бой 🔴'; }
            else if (levelDifficulty === 'extreme') { diffClass = 'diff- есть победный диалог
            if (window.NovelEngine && currentDialogData && currentDialogData.win) {
                window.NovelEngine.run(currentDialogData.win, () => {
                    showOverlay('Успешный улов!', winText);
                });
            } else {
                showOverlay('Успешный улов!', winText);
            }
            return;
        }

        // Условие 2: ПОРАЖЕНИЕ (Кончились ходы)
        if (moves <= 0) {
            if (window.GameState) {
                window.GameState.loseLife(); // Списываем одну жизнь
            }

            const currentDialogData = gameextreme'; diffName = 'Ультра-сложная чистка 🟢'; }
            else if (levelDifficulty === 'challenge')Dialogs ? gameDialogs[currentLevelId] : null;

            if (window.NovelEngine && currentDialogData && currentDialogData. { diffClass = 'diff-challenge'; diffName = 'Сюжетное испытание! 🟠'; }
lose) {
                window.NovelEngine.run(currentDialogData.lose, () => {
                    show            preCard.classList.add(diffClass);
            
            const badge = document.getElementById('preLevelDiffBadge');
            if (badge) badge.textContent = diffName;
        }

        const title = document.getElementById('preLevelTitle');
        if (title) title.textContent = `Уровень ${currentLevelOverlay('Слитый бой...', `Тебе не хватило ходов. Было собрано всего ${hearts} из ${GOAL_Id}`;

        const goalVal = document.getElementById('preGoalVal');
        if (goalVal) goalHEARTS} сердец.\n\nЖизнь: -1 ❤️`);
                });
            } elseVal.textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец`;

        const rewards {
                showOverlay('Слитый бой...', `Тебе не хватило ходов. Было собрано всего ${hearts} из ${GOAL_HEARTS} сердец.\n\nЖизнь: -1 = getRewards(levelDifficulty);
        const preStars = document.getElementById('preRewardStars');
        if (preStars) preStars.textContent = `⭐ +${rewards.stars}`;

        const preCoins = document ❤️`);
            }
        }
    }

    function showOverlay(title, text) {
        .getElementById('preRewardCoins');
        if (preCoins) preCoins.textContent = `💰 +${rewards.base}₽`;

        const preLevelOverlay = document.getElementById('preLevelOverlay');
        if (if (overlay) {
            if (resultsTitle) resultsTitle.textContent = title;
            if (resultsText) resultsText.textContent = text;
            overlay.classList.remove('hidden');
        }
    }

    functionpreLevelOverlay) preLevelOverlay.classList.remove('hidden');
    };

    // Нажатие кнопки "В pulseToast(msg) {
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            clearTimeout(pulseToast._t);
            pulseToast бой" на пре-карточке
    const btnStartMatch3 = document.getElementById('btnStartMatch3');
    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            const preLevelOverlay = document.._t = setTimeout(() => toastEl.classList.remove('show'), 1200);
        }getElementById('preLevelOverlay');
            if (preLevelOverlay) preLevelOverlay.classList.add('hidden');
            
            // От
    }

    // Клик на кнопку завершения уровня на экране результатов
    const btnResultsClose = document.getElementById('btnResultsClose');
    if (btnResultsClose) {
        btnResultsClose.addEventListener('click', () => {
            if (overlay) overlay.classList.add('hidden');
            if (window.showScreen) window.крываем игровой экран
            if (window.showScreen) {
                window.showScreen('gameScreen');
            }

            showScreen('mapScreen'); // Возвращаем игрока на карту

            if (hearts >= GOAL_HEARTS &&hearts = 0;
            moves = START_MOVES;
            updateMatch3HUD();
            if (m3GoalText) window.GameState) {
                // Если выиграл — продвигаем уровень вперед в state.js
                window.GameState. m3GoalText.textContent = `0/${GOAL_HEARTS} ❤️`;

            // Выстраиваем сетку
            buildInitialGrid();

            // Проверяем наличие диалога перед боем
            const dialogueIntronextLevel();
            }
        });
    }

    // Экспортируем функцию открытия старта уровня в систему карты
     = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].intro : null;
            if (window.NovelEngine && dialogueIntro) {
                boardwindow.openPreLevelScreen = openPreLevelScreen;

    console.log("match3.js: ОEl.style.opacity = "0.2"; 
                window.NovelEngine.run(dialogueIntro, () => {
                    boardEl.style.opacity = "1"; 
                });
            } else {
                boardEl.style.opacity = "1";
            }
        });
    }

    птимизированный тач-движок игры успешно подключен!");
})();
