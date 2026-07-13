// ================================================
// match3.js
// Движок "Три в ряд" с поддержкой жестов (свайпов) и бонусов
// ================================================

(function() {
    const SIZE = 8;
    const TYPES = [
        {id:'heart', icon:'🫀'},
        {id:'bullet', icon:'🔫'},
        {id:'garlic', icon:'🧄'},
        {id:'stake', icon:'🗡️'},
        {id:'vial', icon:'🧪'},
        {id:'coin', icon:'💰'}
    ];
    const SPECIALS = ['rocketRow','rocketCol','bomb','plane','rainbow'];

    // Тайминги анимации для плавности и быстроты (GPU-friendly)
    const SWAP_MS = 180;  
    const CLEAR_MS = 200; 
    const FALL_MS = 240;  

    let currentLevelId = 1;
    let GOAL_HEARTS = 12;
    let START_MOVES = 20;
    let levelDifficulty = "normal";

    let grid = [];
    let selected = null;
    let hearts = 0, moves = 20;
    let busy = false;
    let tileIdCounter = 0;

    // Вспомогательные переменные для свайпов
    let dragStartX = 0, dragStartY = 0;
    let dragActiveTile = null;

    const boardEl = document.getElementById('board');
    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = document.getElementById('m3MovesText');
    const toastEl = document.getElementById('toast');

    // Находим оверлеи по точным ID из index.html
    const overlayResults = document.getElementById('overlayResults');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementById('resultsText');
    const overlayPreLevel = document.getElementById('overlayPreLevel');
    const preCard = document.getElementById('preLevelCard');

    // Навешиваем слушатели для отслеживания жеста сдвига (свайпа)
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, {passive: false});
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    const isSpecial = t => SPECIALS.includes(t);
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = (r,c) => r+','+c;
    const getType = (r,c) => grid[r] && grid[r][c] ? grid[r][c].type : null;

    function iconFor(type){
        switch(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀';
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
            case 'rainbow': return '🌈';
            default: return TYPES.find(t=>t.id===type).icon;
        }
    }

    function applySpecialClass(t){
        t.el.classList.remove('bomb','rocket-row','rocket-col','plane','rainbow');
        if(t.type==='bomb') t.el.classList.add('bomb');
        else if(t.type==='rocketRow') t.el.classList.add('rocket-row');
        else if(t.type==='rocketCol') t.el.classList.add('rocket-col');
        else if(t.type==='plane') t.el.classList.add('plane');
        else if(t.type==='rainbow') t.el.classList.add('rainbow');
    }

    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.style.top = (row*100/SIZE)+'%';
    }

    // СЧИТЫВАНИЕ ЖЕСТОВ (СВАЙПОВ)
    function handleDragStart(e, tile) {
        if (busy) return;
        dragActiveTile = tile;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;
        dragStartY = clientY;
    }

    function handleDragMove(e) {
        if (!dragActiveTile || busy) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStartX;
        const dy = clientY - dragStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 30) { // Порог жеста свайпа в 30 пикселей
            let targetRow = dragActiveTile.row;
            let targetCol = dragActiveTile.col;

            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) targetCol++; else targetCol--;
            } else {
                if (dy > 0) targetRow++; else targetRow--;
            }

            if (targetRow >= 0 && targetRow < SIZE && targetCol >= 0 && targetCol < SIZE) {
                const partner = grid[targetRow][targetCol];
                if (partner) {
                    dragActiveTile.el.classList.remove('selected');
                    selected = null;
                    performSwap(dragActiveTile, partner);
                }
            }
            dragActiveTile = null; 
        }
    }

    function handleDragEnd() {
        dragActiveTile = null;
    }

    function createTile(row, col, type, spawnRow){
        const id = 'tile'+(tileIdCounter++);
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.id = id;
        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        inner.textContent = iconFor(type);
        el.appendChild(inner);

        // Сначала гарантированно создаем объект фишки
        const tile = {id, type, row, col, el, inner};

        // Привязываем все события
        el.addEventListener('mousedown', (e) => handleDragStart(e, tile));
        el.addEventListener('touchstart', (e) => handleDragStart(e, tile), {passive: true});
        el.addEventListener('click', onTileClick);

        if(spawnRow !== undefined && spawnRow !== row){
            el.style.transition = 'none';
            setTilePos(el, spawnRow, col);
        } else {
            setTilePos(el, row, col);
        }

        boardEl.appendChild(el);

        if(spawnRow !== undefined && spawnRow !== row){
            setTimeout(() => {
                el.style.transition = '';
                setTilePos(el, row, col);
            }, 16); 
        }
        
        applySpecialClass(tile);
        return tile;
    }

    function moveTileTo(tile, row, col){
        tile.row = row; tile.col = col;
        setTilePos(tile.el, row, col);
    }

    function buildInitialGrid(){
        boardEl.innerHTML = '';
        grid = [];
        for(let r=0;r<SIZE;r++) grid.push(new Array(SIZE).fill(null));
        
        for(let r=0;r<SIZE;r++){
            for(let c=0;c<SIZE;c++){
                let t, guard=0;
                do{ t=randType(); guard++; } 
                while(guard<30 && (
                    (c>=2 && grid[r][c-1] && grid[r][c-2] && grid[r][c-1].type===t && grid[r][c-2].type===t) ||
                    (r>=2 && grid[r-1][c] && grid[r-2][c] && grid[r-1][c].type===t && grid[r-2][c].type===t)
                ));
                grid[r][c] = createTile(r, c, t, r - SIZE - Math.floor(Math.random()*4));
            }
        }
    }

    function findTileById(id){
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            const t = grid[r][c];
            if(t && t.id===id) return t;
        }
        return null;
    }

    function onTileClick(e){
        if(busy) return;
        const tile = findTileById(e.currentTarget.dataset.id);
        if(!tile) return;
        if(selected === null){
            if(isSpecial(tile.type)) { activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        if(selected === tile){
            tile.el.classList.remove('selected');
            selected = null;
            return;
        }
        const adjacent = Math.abs(selected.row-tile.row) + Math.abs(selected.col-tile.col) === 1;
        selected.el.classList.remove('selected');
        if(!adjacent){
            if(isSpecial(tile.type)){ selected=null; activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        const a = selected, b = tile;
        selected = null;
        performSwap(a,b);
    }

    function swapInGrid(a,b){
        const ar=a.row, ac=a.col, br=b.row, bc=b.col;
        grid[ar][ac]=b; grid[br][bc]=a;
        a.row=br; a.col=bc;
        b.row=ar; b.col=ac;
    }

    function performSwap(a,b){
        busy = true;
        swapInGrid(a,b);
        moveTileTo(a, a.row, a.col);
        moveTileTo(b, b.row, b.col);
        
        setTimeout(()=>{
            const aSpecial = isSpecial(a.type), bSpecial = isSpecial(b.type);
            if(aSpecial && bSpecial){
                moves--; updateMatch3HUD();
                const cells = comboFootprint(a,b);
                clearAndContinue(cells, []);
                return;
            }
            if(aSpecial || bSpecial){
                const special = aSpecial ? a : b;
                const partner = aSpecial ? b : a;
                moves--; updateMatch3HUD();
                let cells;
                if(special.type === 'rainbow'){
                    cells = cellsOfColor(partner.type);
                    cells.add(key(special.row, special.col));
                } else {
                    cells = computeActivationFootprint(special);
                }
                clearAndContinue(cells, []);
                return;
            }
            const result = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
            if(!hasMatch){
                swapInGrid(a,b);
                moveTileTo(a, a.row, a.col);
                moveTileTo(b, b.row, b.col);
                a.el.classList.add('shake');
                b.el.classList.add('shake');
                setTimeout(()=>{
                    a.el.classList.remove('shake');
                    b.el.classList.remove('shake');
                    busy = false;
                }, 220);
                pulseToast('Нет совпадения');
                return;
            }
            moves--; updateMatch3HUD();
            applyResolutionFull(result);
        }, SWAP_MS);
    }

    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){
            let runStart=0;
            for(let c=1;c<=SIZE;c++){
                const cur = c<SIZE ? getType(r,c) : null;
                const prev = getType(r,c-1);
                if(cur!==null && cur===prev && !isSpecial(cur)) continue;
                const len = c - runStart;
                if(len>=3 && !isSpecial(prev)){
                    const cells=[]; 
                    for(let k=runStart;k<c;k++) cells.push([r,k]);
                    runs.push({cells, dir:'h', length:len, type:prev, used:false});
                }
                runStart = c;
            }
        }
        for(let c=0;c<SIZE;c++){
            let runStart=0;
            for(let r=1;r<=SIZE;r++){
                const cur = r<SIZE ? getType(r,c) : null;
                const prev = getType(r-1,c);
                if(cur!==null && cur===prev && !isSpecial(cur)) continue;
                const len = r - runStart;
                if(len>=3 && !isSpecial(prev)){
                    const cells=[]; 
                    for(let k=runStart;k<r;k++) cells.push([k,c]);
                    runs.push({cells, dir:'v', length:len, type:prev, used:false});
                }
                runStart = r;
            }
        }
        return runs;
    }

    function dedupeCells(cells){
        const seen = new Set(); 
        const out=[];
        cells.forEach(c=>{ 
            const k=key(c[0],c[1]); 
            if(!seen.has(k)){ seen.add(k); out.push(c); } 
        });
        return out;
    }

    function analyzeMatches(){
        const runs = collectRuns();
        const matchedByLine = new Set();
        runs.forEach(r=> r.cells.forEach(c=> matchedByLine.add(key(c[0],c[1]))));

        const squares = [];
        const usedSquareCells = new Set();
        for(let r=0;r<SIZE-1;r++){
            for(let c=0;c<SIZE-1;c++){
                const cells = [[r,c],[r,c+1],[r+1,c],[r+1,c+1]];
                if(cells.some(cc=> matchedByLine.has(key(cc[0],cc[1])) || usedSquareCells.has(key(cc[0],cc[1])))) continue;
                const t0 = getType(r,c);
                if(!t0 || isSpecial(t0)) continue;
                if(cells.every(cc=> getType(cc[0],cc[1])===t0)){
                    squares.push({type:'plane', at:[r,c], cells});
                    cells.forEach(cc=> usedSquareCells.add(key(cc[0],cc[1])));
                }
            }
        }

        const hRuns = runs.filter(r=>r.dir==='h');
        const vRuns = runs.filter(r=>r.dir==='v');
        const bombs = [];
        hRuns.forEach(h=>{
            if(h.used) return;
            for(const v of vRuns){
                if(v.used || v.type!==h.type) continue;
                const shared = h.cells.find(hc=> v.cells.some(vc=> vc[0]===hc[0] && vc[1]===hc[1]));
                if(shared){
                    h.used=true; v.used=true;
                    bombs.push({type:'bomb', at:shared, cells: dedupeCells(h.cells.concat(v.cells))});
                    break;
                }
            }
        });

        const rockets = [], rainbows = [];
        const normalCells = new Set();
        runs.forEach(run=>{
            if(run.used) return;
            if(run.length>=5){
                rainbows.push({type:'rainbow', at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells});
            } else if(run.length===4){
                const spType = run.dir==='h' ? 'rocketCol' : 'rocketRow';
                rockets.push({type: spType, at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells});
            } else {
                run.cells.forEach(c=> normalCells.add(key(c[0],c[1])));
            }
        });

        return {bombs, rockets, rainbows, squares, normalCells};
    }

    function footprintFor(tile){
        const cells = [];
        if(tile.type==='bomb'){
            for(let dr=-2;dr<=2;dr++) for(let dc=-2;dc<=2;dc++){
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            }
        } else if(tile.type==='rocketRow'){
            for(let c=0;c<SIZE;c++) cells.push([tile.row,c]);
        } else if(tile.type==='rocketCol'){
            for(let r=0;r<SIZE;r++) cells.push([r,tile.col]);
        } else if(tile.type==='plane'){
            cells.push([tile.row,tile.col]);
            [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            });
            const candidates = [];
            for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
                if(grid[r][c] && !(r===tile.row && c===tile.col)) candidates.push([r,c]);
            }
            if(candidates.length) cells.push(candidates[Math.floor(Math.random()*candidates.length)]);
        } else if(tile.type==='rainbow'){
            cells.push([tile.row,tile.col]);
        }
        return cells;
    }

    function computeActivationFootprint(startTile){
        const visited = new Set([startTile.id]);
        const footprint = new Set();
        const queue = [startTile];
        while(queue.length){
            const t = queue.shift();
            footprintFor(t).forEach(([r,c]) => {
                footprint.add(key(r, c));
                const other = grid[r] && grid[r][c];
                if(other && isSpecial(other.type) && !visited.has(other.id)){
                    visited.add(other.id);
                    queue.push(other);
                }
            });
        }
        return footprint;
    }

    function cellsOfColor(type){
        const s = new Set();
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            if(grid[r][c] && grid[r][c].type===type) s.add(key(r,c));
        }
        return s;
    }

    function presentColors(){
        const set = new Set();
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            if(grid[r][c] && !isSpecial(grid[r][c].type)) set.add(grid[r][c].type);
        }
        return Array.from(set);
    }

    function comboFootprint(a, b){
        const cells = new Set();
        const kinds = [a.type, b.type];
        const has = t => kinds.includes(t);
        const isRocket = t => t === 'rocketRow' || t === 'rocketCol';
        
        if(has('bomb') && has('bomb')){
            const center = a;
            for(let dr=-3;dr<=3;dr++) for(let dc=-3;dc<=3;dc++){
                const rr=center.row+dr, cc=center.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.add(key(rr,cc));
            }
            pulseToast('💥 Ультра-бомба 7×7!');
            return cells;
        }
        if(has('bomb') && (has('rocketRow')||has('rocketCol'))){
            const rocket = isRocket(a.type) ? a : b;
            for(let dr=-1;dr<=1;dr++){ 
                const rr=rocket.row+dr; 
                if(rr>=0&&rr<SIZE) for(let c=0;c<SIZE;c++) cells.add(key(rr,c)); 
            }
            for(let dc=-1;dc<=1;dc++){ 
                const cc=rocket.col+dc; 
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
        if(has('rainbow') && has('rainbow')){
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
        result.normalCells.forEach(k=>scoreSet.add(k));
        
        const atKeys = new Set(specialSpawns.map(s=>key(s.at[0], s.at[1])));
        const clearSet = new Set();
        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearSet.add(k); });
        
        if(specialSpawns.length) pulseToast(specialSpawns.length>1 ? 'Комбо бонусов!' : 'Новый бонус!');
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

    function clearAndContinue(clearSet, specialSpawns, scoreSet){
        specialSpawns = specialSpawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(!t) return;
            if(t.type==='heart') heartsGained++;
        });
        clearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('clearing');
        });
        hearts += heartsGained;
        
        // Обновляем счетчик на игровом экране
        if (m3GoalText) m3GoalText.textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        
        if(heartsGained>0) pulseToast('+'+heartsGained+' ❤️');
        
        setTimeout(()=>{
            clearSet.forEach(k=>{
                const [r,c] = k.split(',').map(Number);
                const t = grid[r] && grid[r][c];
                if(t){ t.el.remove(); grid[r][c]=null; }
            });
            specialSpawns.forEach(s=>{
                const [r,c] = s.at;
                if(!grid[r]) return;
                let t = grid[r][c];
                if(!t){
                    t = createTile(r,c,s.type,r);
                    grid[r][c] = t;
                } else {
                    t.type = s.type;
                    t.inner.textContent = iconFor(s.type);
                    applySpecialClass(t);
                }
            });
            applyGravityAndRefill();
            setTimeout(()=>{
                const result = analyzeMatches();
                const hasMore = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
                if(!hasMore){
                    busy = false;
                    checkEndConditions();
                } else {
                    applyResolutionFull(result);
                }
            }, FALL_MS + 20); 
        }, CLEAR_MS);
    }

    function applyGravityAndRefill(){
        for(let c=0;c<SIZE;c++){
            let pointer = SIZE-1;
            for(let r=SIZE-1;r>=0;r--){
                if(grid[r][c] !== null){
                    const t = grid[r][c];
                    if(pointer !== r){
                        grid[pointer][c] = t;
                        grid[r][c] = null;
                        moveTileTo(t, pointer, c);
                    }
                    pointer--;
                }
            }
            let spawnOffset = 1;
            for(let r=pointer;r>=0;r--){
                grid[r][c] = createTile(r, c, randType(), -spawnOffset);
                spawnOffset++;
            }
        }
    }

    // ВЫЧИСЛЕНИЕ НАГРАДЫ
    function getRewards(diff) {
        let starsGained = 1;
        let baseCoins = 100;

        if (diff === "medium") {
            baseCoins = 150;
        } else if (diff === "hard") {
            baseCoins = 250;
        } else if (diff === "extreme") {
            baseCoins = 400;
        } else if (diff === "challenge") {
            starsGained = 3;
            baseCoins = 300;
        }

        let bonusCoins = moves * 10; 
        let totalCoins = baseCoins + bonusCoins;

        return { stars: starsGained, coins: totalCoins, base: baseCoins, bonus: bonusCoins };
    }

    function updateMatch3HUD() {
        if (m3MovesText) m3MovesText.textContent = moves;
    }

    // 5. МЕТОД ОТКРЫТИЯ СТАРТОВОГО ОКНА УРОВНЯ
    function openPreLevelScreen(levelId) {
        // Гарантированно берем window.LEVELS
        const levelData = window.LEVELS ? window.LEVELS[levelId - 1] : null;
        if (!levelData) {
            console.error("Не удалось найти данные уровня в window.LEVELS:", levelId);
            return;
        }

        currentLevelId = levelId;
        GOAL_HEARTS = levelData.heartsGoal;
        START_MOVES = levelData.moves;
        levelDifficulty = levelData.difficulty;

        // Настройка цветности карточки в стиле Homescapes
        if (preCard) {
            preCard.className = 'pre-card';
            let diffClass = 'diff-normal';
            let diffName = 'Обычная сложность 🟡';
            if (levelDifficulty === 'medium') { diffClass = 'diff-medium'; diffName = 'Сложная охота 🔵'; }
            else if (levelDifficulty === 'hard') { diffClass = 'diff-hard'; diffName = 'Опасный бой 🔴'; }
            else if (levelDifficulty === 'extreme') { diffClass = 'diff-extreme'; diffName = 'Ультра-сложная чистка 🟢'; }
            else if (levelDifficulty === 'challenge') { diffClass = 'diff-challenge'; diffName = 'Сюжетное испытание! 🟠'; }

            preCard.classList.add(diffClass);
            
            const badge = document.getElementById('preLevelDiffBadge');
            if (badge) badge.textContent = diffName;
        }

        const title = document.getElementById('preLevelTitle');
        if (title) title.textContent = `Уровень ${currentLevelId}`;

        const goalVal = document.getElementById('preGoalVal');
        if (goalVal) goalVal.textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец`;

        const rewards = getRewards(levelDifficulty);
        const preStars = document.getElementById('preRewardStars');
        if (preStars) preStars.textContent = `⭐ +${rewards.stars}`;

        const preCoins = document.getElementById('preRewardCoins');
        if (preCoins) preCoins.textContent = `💰 +${rewards.base}₽`;

        // Теперь открываем по правильному ID — "overlayPreLevel"
        if (overlayPreLevel) overlayPreLevel.classList.remove('hidden');
    }

    // Клик "Отмена" на пре-карточке
    const btnCancelPreLevel = document.getElementById('btnCancelPreLevel');
    if (btnCancelPreLevel) {
        btnCancelPreLevel.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            if (window.showScreen) window.showScreen('screenMap');
        });
    }

    // Клик "В бой" на пре-карточке
    const btnStartMatch3 = document.getElementById('btnStartMatch3');
    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            
            // Открываем игровой экран
            if (window.showScreen) {
                window.showScreen('screenMatch3');
            }

            // Сбрасываем счетчики уровня
            hearts = 0;
            moves = START_MOVES;
            updateMatch3HUD();
            if (m3GoalText) m3GoalText.textContent = `0/${GOAL_HEARTS} ❤️`;

            // Выстраиваем сетку
            buildInitialGrid();

            // Проверяем наличие диалога перед боем через window.gameDialogs
            const dialogueIntro = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].intro : null;
            if (window.NovelEngine && dialogueIntro) {
                if (boardEl) boardEl.style.opacity = "0.2"; // Слегка приглушаем поле
                window.NovelEngine.run(dialogueIntro, () => {
                    if (boardEl) boardEl.style.opacity = "1"; // Делаем ярким для игры
                });
            } else {
                if (boardEl) boardEl.style.opacity = "1";
            }
        });
    }

    // 6. ПРОВЕРКА КОНЦА ИГРЫ И ОБНОВЛЕНИЕ БАЛАНСОВ
    function checkEndConditions(){
        if(hearts >= GOAL_HEARTS){
            const rewards = getRewards(levelDifficulty);
            
            // Начисляем балансы в GameState
            if (window.GameState) {
                window.GameState.addStars(rewards.stars);
                window.GameState.addCash(rewards.coins);
            }

            // Проверяем выигрышный диалог через window.gameDialogs
            const dialogueWin = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].win : null;
            
            const winText = `Заказ выполнен!\n\nВы получили: ⭐ +${rewards.stars}\nБазовая награда: 💰 +${rewards.base}₽\nБонус за ходы (${moves} шт.): 💰 +${rewards.bonus}₽\nИтого: +${rewards.coins}₽`;

            if (window.NovelEngine && dialogueWin) {
                window.NovelEngine.run(dialogueWin, () => {
                    showOverlay('Успешный улов!', winText);
                });
            } else {
                showOverlay('Успешный улов!', winText);
            }
            return;
        }

        if(moves <= 0){
            if (window.GameState) {
                window.GameState.loseLife(); // Списываем жизнь
            }

            // Проверяем диалог проигрыша через window.gameDialogs
            const dialogueLose = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].lose : null;

            const loseText = `Тебе не хватило ходов. Было собрано всего ${hearts} из ${GOAL_HEARTS} сердец.\n\nЖизнь: -1 ❤️`;

            if (window.NovelEngine && dialogueLose) {
                window.NovelEngine.run(dialogueLose, () => {
                    showOverlay('Слитый бой...', loseText);
                });
            } else {
                showOverlay('Слитый бой...', loseText);
            }
        }
    }

    // Теперь открываем по верному ID — "overlayResults"
    function showOverlay(title, text) {
        if (overlayResults) {
            if (resultsTitle) resultsTitle.textContent = title;
            if (resultsText) resultsText.textContent = text;
            overlayResults.classList.remove('hidden');
        }
    }

    function pulseToast(msg) {
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.add('show');
            clearTimeout(pulseToast._t);
            pulseToast._t = setTimeout(() => toastEl.classList.remove('show'), 1200);
        }
    }

    // Клик на кнопку завершения уровня на экране результатов
    const btnResultsClose = document.getElementById('btnResultsClose');
    if (btnResultsClose) {
        btnResultsClose.addEventListener('click', () => {
            if (overlayResults) overlayResults.classList.add('hidden');
            
            if (hearts >= GOAL_HEARTS) {
                if (window.GameState) {
                    window.GameState.nextLevel(); // Повышаем уровень в сохранениях
                }
            }

            if (window.showScreen) {
                window.showScreen('screenMap'); // Возвращаем игрока на карту
            }
        });
    }

    // Экспортируем функцию открытия старта уровня в глобальную область
    window.openPreLevelScreen = openPreLevelScreen;

    console.log("match3.js: Оптимизированный тач-движок игры успешно подключен!");
})();
