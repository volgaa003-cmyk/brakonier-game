// ================================================
// match3.js (ИСПРАВЛЕННЫЙ И СТАБИЛЬНЫЙ)
// Движок "Три в ряд" с поддержкой жестов ([r-2][c] && grid[r-1][c].type===t && grid[r-2][c].type===t)
                ));
                grid[r][c] = createTile(r, c, tсвайпов) и бонусов
// ================================================

(function() {
    const SIZE = , r - SIZE - Math.floor(Math.random()*4));
            }
        }
    }

    function findTile8;
    const TYPES =ById(id){
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            const t = grid[r][c];
            if(t && t.id===id) return t;
        }
        return null;
    }

    function [
        {id:'heart', icon:'🫀'},
        {id:'bullet', icon:'🔫'},
        {id:'garlic', icon:'🧄'},
        {id:'stake', icon:'🗡️'},
        {id:'vial', icon:'🧪'},
        {id:'coin', icon:'💰'}
    ];
    const SPECIALS = onTileClick(e){
        if(busy) return;
        const tile = findTileById(e ['rocketRow','rocketCol','bomb','plane','rainbow'];

    // Тайминги анимации для плавности и быстроты (GPU-friendly)
    const SW.currentTarget.dataset.id);
        if(!tile) return;
        if(selected === null){
AP_MS = 180;  
    const CLEAR_MS = 200; 
            if(isSpecial(tile.type)) { activateStandalone(tile); return; }
            selected = tile    const FALL_MS = 240;  

    let currentLevelId = 1;
    ;
            tile.el.classList.add('selected');
            return;
        }
        if(let GOAL_HEARTS = 12;
    let START_MOVES = 20;
selected === tile){
            tile.el.classList.remove('selected');
            selected = null;
            return;
            let levelDifficulty = "normal";

    let grid = [];
    let selected = null;
    let hearts = 0, moves = 20;
    let busy = false;
    let tileIdCounter = 0;

    }
        const adjacent = Math.abs(selected.row-tile.row) + Math.abs(selected// Вспомогательные переменные для свайпов
    let dragStartX = 0, dragStartY = .col-tile.col) === 1;
        selected.el.classList.remove('selected');
        if(!adjacent){
            0;
    let dragActiveTile = null;

    const boardEl = document.getElementById('board');
if(isSpecial(tile.type)){ selected=null; activateStandalone(tile); return; }
            selected    const m3GoalText = document.getElementById('m3GoalText');
    const m3MovesText = = tile;
            tile.el.classList.add('selected');
            return;
        }
         document.getElementById('m3MovesText');
    const toastEl = document.getElementById('toast');

    //const a = selected, b = tile;
        selected = null;
        performSwap(a,b); Находим оверлеи по точным ID из index.html
    const overlayResults = document.getElementById('overlayResults');
    const results
    }

    function swapInGrid(a,b){
        const ar=a.row, ac=a.colTitle = document.getElementById('resultsTitle');
    const resultsText = document.getElementById('resultsText');
    const overlayPreLevel = document.getElementById('overlayPreLevel');
    const preCard = document.getElementById('pre, br=b.row, bc=b.col;
        grid[ar][ac]=b; grid[br]LevelCard');

    // Навешиваем слушатели для отслеживания жеста сдвига (свай[bc]=a;
        a.row=br; a.col=bc;
        b.row=ar; b.col=ac;па)
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove, {passive: false});
    window.addEventListener('mouseup', handleDragEnd);
    window.
    }

    function performSwap(a,b){
        busy = true;
        swapInGridaddEventListener('touchend', handleDragEnd);

    const isSpecial = t => SPECIALS.includes(t);(a,b);
        moveTileTo(a, a.row, a.col);
        moveTileTo(b, b.row, b.col);
        
        setTimeout(()=>{
            const aSpecial
    const randType = () => TYPES[Math.floor(Math.random()*TYPES.length)].id;
    const key = ( = isSpecial(a.type), bSpecial = isSpecial(b.type);
            if(aSpecialr,c) => r+','+c;
    const getType = (r,c) => grid && bSpecial){
                moves--; updateMatch3HUD();
                const cells = comboFootprint(a,[r] && grid[r][c] ? grid[r][c].type : null;

    function iconFor(type){
        switchb);
                clearAndContinue(cells, []);
                return;
            }
            if(aSpecial(type){
            case 'bomb': return '💣';
            case 'rocketRow': return '🚀'; || bSpecial){
                const special = aSpecial ? a : b;
                const partner = aSpecial ?
            case 'rocketCol': return '🚀';
            case 'plane': return '✈️';
             b : a;
                moves--; updateMatch3HUD();
                let cells;
                if(special.case 'rainbow': return '🌈';
            default: return TYPES.find(t=>t.id===typetype === 'rainbow'){
                    cells = cellsOfColor(partner.type);
                    cells.add(key).icon;
        }
    }

    function applySpecialClass(t){
        t.el.(special.row, special.col));
                } else {
                    cells = computeActivationFootprint(specialclassList.remove('bomb','rocket-row','rocket-col','plane','rainbow');
        if(t.type==='bomb') t.);
                }
                clearAndContinue(cells, []);
                return;
            }
            const resultel.classList.add('bomb');
        else if(t.type==='rocketRow') t.el = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets.length || result.classList.add('rocket-row');
        else if(t.type==='rocketCol') t..rainbows.length || result.squares.length || result.normalCells.size;
            if(!hasMatch){
                swapInGridel.classList.add('rocket-col');
        else if(t.type==='plane') t.(a,b);
                moveTileTo(a, a.row, a.col);
                moveel.classList.add('plane');
        else if(t.type==='rainbow') t.el.TileTo(b, b.row, b.col);
                a.el.classList.add('shakeclassList.add('rainbow');
    }

    function setTilePos(el, row, col){
        el.style.left = (col*100/SIZE)+'%';
        el.style.top');
                b.el.classList.add('shake');
                setTimeout(()=>{
                    a.el.classList.remove('shake = (row*100/SIZE)+'%';
    }

    // 1. СЧИТ');
                    b.el.classList.remove('shake');
                    busy = false;
                }, 220);
                pulseToast('Нет совпадения');
                return;
            }
            moves--;ЫВАНИЕ ЖЕСТОВ (СВАЙПОВ)
    function handleDragStart(e, tile) {
        if (busy) return;
        dragActiveTile = tile;
        const clientX = e. updateMatch3HUD();
            applyResolutionFull(result);
        }, SWAP_MS);
    }

    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){
            lettouches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        dragStartX = clientX;
        dragStartY = clientY; runStart=0;
            for(let c=1;c<=SIZE;c++){
                const cur
    }

    function handleDragMove(e) {
        if (!dragActiveTile || busy) return = c<SIZE ? getType(r,c) : null;
                const prev = getType(r,c-1;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.);
                if(cur!==null && cur===prev && !isSpecial(cur)) continue;
                consttouches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - dragStartX;
        const dy = len = c - runStart;
                if(len>=3 && !isSpecial(prev)){
                    const cells=[]; 
                     clientY - dragStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > for(let k=runStart;k<c;k++) cells.push([r,k]);
                    runs.push({cells30) { // Порог свайпа в 30 пикселей
            let targetRow = drag, dir:'h', length:len, type:prev, used:false});
                }
                runStart =ActiveTile.row;
            let targetCol = dragActiveTile.col;

            if (Math.abs c;
            }
        }
        for(let c=0;c<SIZE;c++){
            let runStart=0;
            for(let r=1;r<=SIZE;r++){
                (dx) > Math.abs(dy)) {
                if (dx > 0) targetCol++; else targetCol--;
            } else {
                if (dy > 0) targetRow++; else targetRow--;const cur = r<SIZE ? getType(r,c) : null;
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
            if(!seen
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

.has(k)){ seen.add(k); out.push(c); } 
        });
            function handleDragEnd() {
        dragActiveTile = null;
    }

    // 2. СОЗДАНИЕ ОПТИМИЗИРОВАННЫХ ФИШЕК
    function createTile(row, col, type, spawnRow){
        const id = 'tile'+(tileIdCounter++);
        const el = document.createElement('div');
        el.className = 'tile';
        el.dataset.id = id;
        const inner = document.createElement('div');
        inner.className = 'tile-inner';
        inner.textContent =return out;
    }

    function analyzeMatches(){
        const runs = collectRuns();
        const matched iconFor(type);
        el.appendChild(inner);

        const tile = {id, type, rowByLine = new Set();
        runs.forEach(r=> r.cells.forEach(c=> matchedByLine.add(key(, col, el, inner};

        el.addEventListener('mousedown', (e) => handleDragStart(ec[0],c[1]))));

        const squares = [];
        const usedSquareCells = new Set();
        for(, tile));
        el.addEventListener('touchstart', (e) => handleDragStart(e, tile), {let r=0;r<SIZE-1;r++){
            for(let c=0;c<passive: true});
        el.addEventListener('click', onTileClick);

        if(spawnRow !== undefined && spawnRow !== row){
            el.style.transition = 'none';
            setTilePos(elSIZE-1;c++){
                const cells = [[r,c],[r,c+1],[r+1,c],, spawnRow, col);
        } else {
            setTilePos(el, row, col);
[r+1,c+1]];
                if(cells.some(cc=> matchedByLine.has(key(        }

        boardEl.appendChild(el);

        if(spawnRow !== undefined && spawnRow !== rowcc[0],cc[1])) || usedSquareCells.has(key(cc[0],cc){
            setTimeout(() => {
                el.style.transition = '';
                setTilePos(el,[1])))) continue;
                const t0 = getType(r,c);
                if(!t0 || is row, col);
            }, 16); 
        }
        
        applySpecialClass(tile);
        return tile;Special(t0)) continue;
                if(cells.every(cc=> getType(cc[0],cc
    }

    function moveTileTo(tile, row, col){
        tile.row = row;[1])===t0)){
                    squares.push({type:'plane', at:[r,c], cells tile.col = col;
        setTilePos(tile.el, row, col);
    }

});
                    cells.forEach(cc=> usedSquareCells.add(key(cc[0],cc    function buildInitialGrid(){
        boardEl.innerHTML = '';
        grid = [];
        for(let r=[1])));
                }
            }
        }

        const hRuns = runs.filter(r=>r.0;r<SIZE;r++) grid.push(new Array(SIZE).fill(null));
        
dir==='h');
        const vRuns = runs.filter(r=>r.dir==='v');
        const bombs = [];
        hRuns.forEach(h=>{
            if(h.used) return        for(let r=0;r<SIZE;r++){
            for(let c=0;c<SIZE;c++){
;
            for(const v of vRuns){
                if(v.used || v.type!==h                let t, guard=0;
                do{ t=randType(); guard++; } 
                while.type) continue;
                const shared = h.cells.find(hc=> v.cells.some((guard<30 && (
                    (c>=2 && grid[r][c-1] && gridvc=> vc[0]===hc[0] && vc[1]===hc[1]));
                if[r][c-2] && grid[r][c-1].type===t && grid[r](shared){
                    h.used=true; v.used=true;
                    bombs.push({[c-2].type===t) ||
                    (r>=2 && grid[r-1][c] && grid[r-2][c] && grid[r-1][c].type===t && gridtype:'bomb', at:shared, cells: dedupeCells(h.cells.concat(v.cells))});
                    break;
                }
            }
        });

        const rockets = [], rainbows = [];
        const[r-2][c].type===t)
                ));
                grid[r][c] = createTile(r normalCells = new Set();
        runs.forEach(run=>{
            if(run.used) return;, c, t, r - SIZE - Math.floor(Math.random()*4));
            }
        }
            if(run.length>=5){
                rainbows.push({type:'rainbow', at: run
    }

    function findTileById(id){
        for(let r=0;r<SIZE;r++).cells[Math.floor(run.cells.length/2)], cells: run.cells});
            } else if(run. for(let c=0;c<SIZE;c++){
            const t = grid[r][c];
            if(t && t.id===id) return t;
        }
        return null;
length===4){
                const spType = run.dir==='h' ? 'rocketCol' : 'rocketRow';
                rockets.    }

    function onTileClick(e){
        if(busy) return;
        const tile =push({type: spType, at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells}); findTileById(e.currentTarget.dataset.id);
        if(!tile) return;
        if(
            } else {
                run.cells.forEach(c=> normalCells.add(key(c[0],c[1])));
            }
        });

        return {bombs, rockets, rainbows, squaresselected === null){
            if(isSpecial(tile.type)) { activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList.add('selected');
            return;
        }
        if(selected ===, normalCells};
    }

    function footprintFor(tile){
        const cells = [];
        if tile){
            tile.el.classList.remove('selected');
            selected = null;
            return;
        }
        const adjacent(tile.type==='bomb'){
            for(let dr=-2;dr<=2;dr++) for( = Math.abs(selected.row-tile.row) + Math.abs(selected.col-tile.col) === 1let dc=-2;dc<=2;dc++){
                const rr=tile.row+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells;
        selected.el.classList.remove('selected');
        if(!adjacent){
            if(isSpecial(tile.type)){ selected.push([rr,cc]);
            }
        } else if(tile.type==='rocketRow'){=null; activateStandalone(tile); return; }
            selected = tile;
            tile.el.classList
            for(let c=0;c<SIZE;c++) cells.push([tile.row,c]);
        .add('selected');
            return;
        }
        const a = selected, b = tile;
        selected = null;
        } else if(tile.type==='rocketCol'){
            for(let r=0;r<SIZEperformSwap(a,b);
    }

    function swapInGrid(a,b){
        const;r++) cells.push([r,tile.col]);
        } else if(tile.type===' ar=a.row, ac=a.col, br=b.row, bc=b.col;
        grid[ar]plane'){
            cells.push([tile.row,tile.col]);
            [[-1,0],[1,0],[ac]=b; grid[br][bc]=a;
        a.row=br; a.col=bc;
        b.row=ar; b.col=ac;
    }

    function performSwap([0,-1],[0,1]].forEach(([dr,dc])=>{
                const rr=tile.row+dr, cc=tile.col+a,b){
        busy = true;
        swapInGrid(a,b);
        moveTiledc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
To(a, a.row, a.col);
        moveTileTo(b, b.row,            });
            const candidates = [];
            for(let r=0;r<SIZE;r++) for(let c=0;c b.col);
        
        setTimeout(()=>{
            const aSpecial = isSpecial(a.type), bSpecial = isSpecial(<SIZE;c++){
                if(grid[r][c] && !(r===tile.row && cb.type);
            if(aSpecial && bSpecial){
                moves--; updateMatch3HUD();
                const cells = comboFootprint(a,b);
                clearAndContinue(cells, []);
                return===tile.col)) candidates.push([r,c]);
            }
            if(candidates.length) cells;
            }
            if(aSpecial || bSpecial){
                const special = aSpecial ? a :.push(candidates[Math.floor(Math.random()*candidates.length)]);
        } else if(tile b;
                const partner = aSpecial ? b : a;
                moves--; updateMatch3HUD();
.type==='rainbow'){
            cells.push([tile.row,tile.col]);
        }
        return cells;
    }

    function computeActivationFootprint(startTile){
        const visited = new Set                let cells;
                if(special.type === 'rainbow'){
                    cells = cellsOfColor(partner.type);
                    cells.([startTile.id]);
        const footprint = new Set();
        const queue = [startTile];
add(key(special.row, special.col));
                } else {
                    cells = computeActivationFootprint(special);
                }
                clearAndContinue(cells, []);
                return;
            }
        while(queue.length){
            const t = queue.shift();
            footprintFor(t).forEach(([r,c]) => {
                footprint.add(key(r, c));
                const other = grid            const result = analyzeMatches();
            const hasMatch = result.bombs.length || result.rockets.length || result.rainbow[r] && grid[r][c];
                if(other && isSpecial(other.type) &&s.length || result.squares.length || result.normalCells.size;
            if(!hasMatch){
                swapInGrid(a,b);
                moveTileTo(a, a.row, a.col);
                move !visited.has(other.id)){
                    visited.add(other.id);
                    queue.push(TileTo(b, b.row, b.col);
                a.el.classList.add('shakeother);
                }
            });
        }
        return footprint;
    }

    function cellsOfColor(type){
        const s = new Set();
        for(let r=0;r<SIZE');
                b.el.classList.add('shake');
                setTimeout(()=>{
                    a.el.classList.remove('shake;r++) for(let c=0;c<SIZE;c++){
            if(grid[r]');
                    b.el.classList.remove('shake');
                    busy = false;
                }, 220);
                pulseToast('Нет совпадения');
                return;
            }
            moves--;[c] && grid[r][c].type===type) s.add(key(r,c));
        }
 updateMatch3HUD();
            applyResolutionFull(result);
        }, SWAP_MS);
    }

    function collectRuns(){
        const runs = [];
        for(let r=0;r<SIZE;r++){        return s;
    }

    // ЛОГИКА СУПЕР-КОМБО
    function comboFootprint(a, b){
        const cells = new Set();
        const kinds =
            let runStart=0;
            for(let c=1;c<=SIZE;c++){
                const cur = c< [a.type, b.type];
        const has = t => kinds.includes(t);
        const isRocket = t => tSIZE ? getType(r,c) : null;
                const prev = getType(r,c-1);
                if(cur!== === 'rocketRow' || t === 'rocketCol';
        
        if(has('bomb') && hasnull && cur===prev && !isSpecial(cur)) continue;
                const len = c - runStart;('bomb')){
            const center = a;
            for(let dr=-3;dr<=3;dr
                if(len>=3 && !isSpecial(prev)){
                    const cells=[]; 
                    for(let k=++) for(let dc=-3;dc<=3;dc++){
                const rr=center.row+drrunStart;k<c;k++) cells.push([r,k]);
                    runs.push({cells,, cc=center.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc< dir:'h', length:len, type:prev, used:false});
                }
                runStart =SIZE) cells.add(key(rr,cc));
            }
            pulseToast('💥 Ультра-бомба 7×7!');
            return cells;
        }
        if(has('bomb') && c;
            }
        }
        for(let c=0;c<SIZE;c++){
            let runStart=0; (has('rocketRow')||has('rocketCol'))){
            const rocket = isRocket(a.type
            for(let r=1;r<=SIZE;r++){
                const cur = r<SIZE ? getType(r,c) :) ? a : b;
            for(let dr=-1;dr<=1;dr++){ 
                const rr=rocket. null;
                const prev = getType(r-1,c);
                if(cur!==null && currow+dr; 
                if(rr>=0&&rr<SIZE) for(let c=0;===prev && !isSpecial(cur)) continue;
                const len = r - runStart;
                if(c<SIZE;c++) cells.add(key(rr,c)); 
            }
            for(let dc=-1;dclen>=3 && !isSpecial(prev)){
                    const cells=[]; 
                    for(let k=runStart;<=1;dc++){ 
                const cc=rocket.col+dc; 
                if(cc>=0&&cc<SIZE) for(let r=0;r<SIZE;r++) cells.add(keyk<r;k++) cells.push([k,c]);
                    runs.push({cells, dir:'v', length:len, type:prev, used:false});
                }
                runStart = r;
            }
        }(r,cc)); 
            }
            pulseToast('🧨 Тройные полосы!');
            return
        return runs;
    }

    function dedupeCells(cells){
        const seen = new Set cells;
        }
        if(has('rocketRow') || has('rocketCol')){
            for(let i=0; i<SIZE; i++){
                cells.add(key(a.row, i));
                (); 
        const out=[];
        cells.forEach(c=>{ 
            const k=key(c[0],c[1]); 
            if(!seen.has(k)){ seen.add(k); out.push(ccells.add(key(i, a.col));
            }
            pulseToast('🚀 Крестообраз); } 
        });
        return out;
    }

    function analyzeMatches(){
        const runsный удар!');
            return cells;
        }
        if(has('plane')){
            const plane = a.type==='plane' ? a : b;
            footprintFor(plane).forEach(( = collectRuns();
        const matchedByLine = new Set();
        runs.forEach(r=> r.cells.forEach(c=>[r,c])=>cells.add(key(r,c)));
            pulseToast('✈️ Самолётик matchedByLine.add(key(c[0],c[1]))));

        const squares = [];
        const usedSquareCells = new Set();
        for(let r=0;r<SIZE-1; активирован!');
            return cells;
        }
        if(has('rainbow') && has('rainbow')){
            r++){
            for(let c=0;c<SIZE-1;c++){
                const cells =for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(grid[r][c]) cells.add(key(r,c));
            pulseToast [[r,c],[r,c+1],[r+1,c],[r+1,c+1]];
                if(cells.('🌈 Полная зачистка!');
            return cells;
        }
        if(has('rainbow')){some(cc=> matchedByLine.has(key(cc[0],cc[1])) || usedSquareCells.has(key(cc[0],cc[1])))) continue;
                const t0 = getType(
            const rainbow = a.type==='rainbow' ? a : b;
            const other = rainbow===ar,c);
                if(!t0 || isSpecial(t0)) continue;
                if(cells ? b : a;
            const colors = presentColors();
            const color = colors.length ? colors.every(cc=> getType(cc[0],cc[1])===t0)){
                    squares.push({type:'plane[Math.floor(Math.random()*colors.length)] : null;
            if(color){
                for(let r=0;r', at:[r,c], cells});
                    cells.forEach(cc=> usedSquareCells.add(key<SIZE;r++) for(let c=0;c<SIZE;c++){
                    if(grid[r][c] && grid[r][c].type===color) cells.add(key(r,c(cc[0],cc[1])));
                }
            }
        }

        const hRuns = runs.filter));
                }
            }
            pulseToast('🌈 Радужный шар сработал!');
            return(r=>r.dir==='h');
        const vRuns = runs.filter(r=>r.dir==='v');
         cells;
        }
        footprintFor(a).forEach(([r,c])=>cells.add(const bombs = [];
        hRuns.forEach(h=>{
            if(h.used) return;
            for(const v of vRuns){
                if(v.used || v.type!==h.type) continue;
                const shared = h.cells.find(hc=> v.cells.some(vc=>key(r,c)));
        footprintFor(b).forEach(([r,c])=>cells.add(key(r,c)));
        return cells;
    }

    function activateStandalone(tile){
 vc[0]===hc[0] && vc[1]===hc[1]));
                if(shared){
                    h.used=true; v.used=true;
                    bombs.push({type:'        busy = true;
        moves--; updateMatch3HUD();
        let cells;
        if(tile.type==='rainbow'){
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random()*colors.length)] : null;
            cells = color ? cellsOfColorbomb', at:shared, cells: dedupeCells(h.cells.concat(v.cells))});
                    break;
                }(color) : new Set();
            cells.add(key(tile.row,tile.col));
        } else {
            }
        });

        const rockets = [], rainbows = [];
        const normalCells = new Set();
        runs.forEach(
            cells = computeActivationFootprint(tile);
        }
        clearAndContinue(cells, []);
    }

    function applyResolutionFull(result){
        const specialSpawns = [];
        const scorerun=>{
            if(run.used) return;
            if(run.length>=5){
                rainbowsSet = new Set();
        result.bombs.forEach(b=>{ b.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:b.at, type:'.push({type:'rainbow', at: run.cells[Math.floor(run.cells.length/2)], cells: run.cells});
            } else if(run.length===4){
                const spType = run.dir==='h' ? 'rocketCol' :bomb'}); });
        result.rockets.forEach(rk=>{ rk.cells.forEach(c=>scoreSet 'rocketRow';
                rockets.push({type: spType, at: run.cells.add(key(c[0],c[1]))); specialSpawns.push({at:rk.at, type:rk.type}); });
        result.rainbows.forEach(rb=>{ rb.cells.[Math.floor(run.cells.length/2)], cells: run.cells});
            } else {
                run.cells.forEach(c=> normalforEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.Cells.add(key(c[0],c[1])));
            }
        });

        return {push({at:rb.at, type:'rainbow'}); });
        result.squares.forEach(sq=>{ sqbombs, rockets, rainbows, squares, normalCells};
    }

    function footprintFor(tile){
.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSp        const cells = [];
        if(tile.type==='bomb'){
            for(let dr=-2;dr<=2;dr++)awns.push({at:sq.at, type:'plane'}); });
        result.normalCells.forEach(k=>scoreSet for(let dc=-2;dc<=2;dc++){
                const rr=tile.row+dr,.add(k));
        
        const atKeys = new Set(specialSpawns.map(s cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.push([rr,cc]);
            }
        } else if(tile.type==='rocketRow'){
=>key(s.at[0], s.at[1])));
        const clearSet = new Set();
            for(let c=0;c<SIZE;c++) cells.push([tile.row,c]);
        } else if(tile.type==='rocketCol'){
            for(let r=0;r<SIZE;r++) cells.push([r,tile.col]);
        } else if(tile.type        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearSet.add(k); });
        
        if(specialSpawns.length) pulseToast(specialSpawns.length>1 ? 'Ком==='plane'){
            cells.push([tile.row,tile.col]);
           бо бонусов!' : 'Новый бонус!');
        clearAndContinue(clearSet, specialSpawns, scoreSet);
    }

    function clearAndContinue(clearSet, specialSpawns, scoreSet){
        specialSpawns = specialSp [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{
                const rr=tile.rowawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;+dr, cc=tile.col+dc;
                if(rr>=0&&rr<SIZE&&cc
        scoring.forEach(k=>{
            const [r,c] = k.split(',').map(>=0&&cc<SIZE) cells.push([rr,cc]);
            });
            const candidates = [];
            forNumber);
            const t = grid[r] && grid[r][c];
            if(!t) return;
            if((let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
                if(grid[r][c] && !(r===tile.row && c===tile.col)) candidates.push(t.type==='heart') heartsGained++;
        });
        clearSet.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('cle[r,c]);
            }
            if(candidates.length) cells.push(candidates[Math.floor(Math.random()*candidates.length)]);
        } else if(tile.type==='rainbow'){
            aring');
        });
        hearts += heartsGained;
        
        // Обновляем счетчик на игровом экране (ИСПРАВЛЕНО!)
        if (m3GoalText) m3GoalText.cells.push([tile.row,tile.col]);
        }
        return cells;
    }

textContent = `${hearts}/${GOAL_HEARTS} ❤️`;
        
        if(heartsGained>0    // РАСЧЕТ ЦЕПНОЙ РЕАКЦИИ
    function computeActivationFootprint(startTile){) pulseToast('+'+heartsGained+' ❤️');
        
        setTimeout(()=>{
            clearSet.forEach(
        const visited = new Set([startTile.id]);
        const footprint = new Set();
        constk=>{
                const [r,c] = k.split(',').map(Number);
                const t = grid[r] && grid[r][c];
                if(t){ t.el.remove(); grid[r][c]=null; }
            });
            specialSpawns.forEach(s=>{
 queue = [startTile];
        while(queue.length){
            const t = queue.shift();
            foot                const [r,c] = s.at;
                if(!grid[r]) return;
                let t = grid[r][c];
                if(!t){
                    t = createTile(r,c,s.typeprintFor(t).forEach(([r,c]) => {
                footprint.add(key(r, c));
                const other = grid[r] && grid[r][c];
                if(other &&,r);
                    grid[r][c] = t;
                } else {
                    t.type isSpecial(other.type) && !visited.has(other.id)){
                    visited.add(other. = s.type;
                    t.inner.textContent = iconFor(s.type);
                    applySpecialid);
                    queue.push(other);
                }
            });
        }
        return footprint;Class(t);
                }
            });
            applyGravityAndRefill();
            setTimeout(()=>{
                const result = analyzeMatches();
                const hasMore = result.bombs.length || result.rockets.length
    }

    function cellsOfColor(type){
        const s = new Set();
        for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){
            if || result.rainbows.length || result.squares.length || result.normalCells.size;
                if(grid[r][c] && grid[r][c].type===type) s.add(key(r,c));
        }
        return s;
    }

    function presentColors(){
        const(!hasMore){
                    busy = false;
                    checkEndConditions();
                } else {
                    applyResolutionFull(result);
                 set = new Set();
        for(let r=0;r<SIZE;r++) for(let c}
            }, FALL_MS + 20); 
        }, CLEAR_MS);
    }

=0;c<SIZE;c++){
            if(grid[r][c] && !isSpecial(grid[r][c].type)) set.add(grid[r][c].type);
        }
    function applyGravityAndRefill(){
        for(let c=0;c<SIZE;c++){
            let pointer = SIZE-1;
            for(let r=SIZE-1;r>=0;r--){
                if(grid        return Array.from(set);
    }

    function comboFootprint(a, b){
        [r][c] !== null){
                    const t = grid[r][c];
                    if(pointerconst cells = new Set();
        const kinds = [a.type, b.type];
        const has !== r){
                        grid[pointer][c] = t;
                        grid[r][c] = null = t => kinds.includes(t);
        const isRocket = t => t === 'rocketRow' ||;
                        moveTileTo(t, pointer, c);
                    }
                    pointer--;
                }
 t === 'rocketCol';
        
        if(has('bomb') && has('bomb')){
            const            }
            let spawnOffset = 1;
            for(let r=pointer;r>=0; center = a;
            for(let dr=-3;dr<=3;dr++) for(let dc=-r--){
                grid[r][c] = createTile(r, c, randType(), -spawnOffset);
3;dc<=3;dc++){
                const rr=center.row+dr, cc=center.col                spawnOffset++;
            }
        }
    }

    // ВЫЧИСЛЕНИЕ НАГ+dc;
                if(rr>=0&&rr<SIZE&&cc>=0&&cc<SIZE) cells.add(key(rr,РАДЫ
    function getRewards(diff) {
        let starsGained = 1;
        letcc));
            }
            pulseToast('💥 Ультра-бомба 7×7!');
            return baseCoins = 100;

        if (diff === "medium") {
            baseCoins =  cells;
        }
        if(has('bomb') && (has('rocketRow')||has('rocket150;
        } else if (diff === "hard") {
            baseCoins = 25Col'))){
            const rocket = isRocket(a.type) ? a : b;
            for(0;
        } else if (diff === "extreme") {
            baseCoins = 400;let dr=-1;dr<=1;dr++){ 
                const rr=rocket.row+dr; 
                if
        } else if (diff === "challenge") {
            starsGained = 3;
            base(rr>=0&&rr<SIZE) for(let c=0;c<SIZE;c++) cells.add(key(rrCoins = 300;
        }

        let bonusCoins = moves * 10; 
        let totalCoins = baseCoins + bonusCoins;

        return { stars: starsGained, coins: total,c)); 
            }
            for(let dc=-1;dc<=1;dc++){ 
                const cc=rocket.Coins, base: baseCoins, bonus: bonusCoins };
    }

    // Обновляем счетчик хоcol+dc; 
                if(cc>=0&&cc<SIZE) for(let r=0;r<SIZE;r++) cells.add(key(r,cc)); 
            }
            pulseToastдов на игровом экране (ИСПРАВЛЕНО!)
    function updateMatch3HUD() {
        if (m3MovesText('🧨 Тройные полосы!');
            return cells;
        }
        if(has('rocketRow) m3MovesText.textContent = moves;
    }

    // 5. МЕТОД ОТКРЫТИЯ СТАРТОВОГО ОКНА УРОВНЯ
    function openPreLevelScreen(levelId) {') || has('rocketCol')){
            for(let i=0; i<SIZE; i++){
                cells.add(key(
        // Гарантированно берем window.LEVELS
        const levelData = window.LEVELS ? window.LEVELa.row, i));
                cells.add(key(i, a.col));
            }
S[levelId - 1] : null;
        if (!levelData) {
            console.error            pulseToast('🚀 Крестообразный удар!');
            return cells;
        }
        if(has('plane')){
            const plane = a.type==='plane' ? a : b;
            footprint("Не удалось найти данные уровня в window.LEVELS:", levelId);
            return;
        }

        currentLevelId = levelId;
        GOAL_HEARTS = levelData.heartsGoal;
        STARTFor(plane).forEach(([r,c])=>cells.add(key(r,c)));
            pulseToast('_MOVES = levelData.moves;
        levelDifficulty = levelData.difficulty;

        // Настройка✈️ Самолётик активирован!');
            return cells;
        }
        if(has('rainbow цветности карточки в стиле Homescapes
        if (preCard) {
            preCard.className = 'pre-card';
            let diffClass = 'diff-normal';
            let diffName = 'О') && has('rainbow')){
            for(let r=0;r<SIZE;r++) for(let c=0;cбычная сложность 🟡';
            if (levelDifficulty === 'medium') { diffClass = 'diff-<SIZE;c++) if(grid[r][c]) cells.add(key(r,c));
            pulseToast('🌈 Полная зачистка!');
            return cells;
        }
        if(hasmedium'; diffName = 'Сложная охота 🔵'; }
            else if (levelDifficulty === 'hard') { diffClass = 'diff-hard'; diffName = 'Опасный бой 🔴'; }
('rainbow')){
            const rainbow = a.type==='rainbow' ? a : b;
            const other = rainbow===a            else if (levelDifficulty === 'extreme') { diffClass = 'diff-extreme'; diffName = 'У ? b : a;
            const colors = presentColors();
            const color = colors.length ? colors[Math.floor(Math.random()*colors.length)] : null;
            if(color){
                forльтра-сложная чистка 🟢'; }
            else if (levelDifficulty === 'challenge') { diffClass = 'diff-challenge'; diffName = 'Сюжетное испытание! 🟠'; }

            pre(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;cCard.classList.add(diffClass);
            
            const badge = document.getElementById('preLevelDiffBadge');
            if (badge) badge.textContent = diffName;
        }

        const title = document.++){
                    if(grid[r][c] && grid[r][c].type===color) cells.getElementById('preLevelTitle');
        if (title) title.textContent = `Уровень ${currentLevelId}`;add(key(r,c));
                }
            }
            pulseToast('🌈 Радужный шар сработал!');
            return

        const goalVal = document.getElementById('preGoalVal');
        if (goalVal) goalVal. cells;
        }
        footprintFor(a).forEach(([r,c])=>cells.add(key(r,c)));
        footprintFor(b).forEach(([r,c])=>cells.add(key(r,textContent = `${GOAL_HEARTS} ❤️ Вампирских Сердец`;

        const rewards = getRewards(levelDifficulty);
        const preStars = document.getElementById('preRewardStars');
        if (preStars) preStars.textContent = `⭐ +${rewards.c)));
        return cells;
    }

    function activateStandalone(tile){
        busy = true;stars}`;

        const preCoins = document.getElementById('preRewardCoins');
        if (preCoins) preCoins.textContent = `💰 +${rewards.base}₽`;

        // ИСПРАВЛЕНО:
        moves--; updateMatch3HUD();
        let cells;
        if(tile.type==='rainbow'){
            const colors = presentColors();
            const color = colors.length ? colors Теперь открываем по правильному ID — "overlayPreLevel"
        if (overlayPreLevel) overlayPreLevel.classList.remove('[Math.floor(Math.random()*colors.length)] : null;
            cells = color ? cellsOfColor(color) : new Set();
            cells.hidden');
    }

    // Клик "Отмена" на пре-карточке
    const btnadd(key(tile.row,tile.col));
        } else {
            cells = computeActivationFootprint(tile);
        }
        clearAndContinue(cells, []);
    }

    function applyResolutionFullCancelPreLevel = document.getElementById('btnCancelPreLevel');
    if (btnCancelPreLevel) {
(result){
        const specialSpawns = [];
        const scoreSet = new Set();
        result        btnCancelPreLevel.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            if (window.showScreen) window.showScreen('screenMap');
        });
    .bombs.forEach(b=>{ b.cells.forEach(c=>scoreSet.add(key(c}

    // Клик "В бой" на пре-карточке (ИСПРАВЛЕНЫ СТАРТ[0],c[1]))); specialSpawns.push({at:b.at, type:'bomb'}); });
        result.rocketsОВЫЕ СБРОСЫ И ОВЕРЛЕИ)
    const btnStartMatch3 = document.getElementById('.forEach(rk=>{ rk.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rk.at, type:rk.type});btnStartMatch3');
    if (btnStartMatch3) {
        btnStartMatch3.addEventListener('click', () => {
            if (overlayPreLevel) overlayPreLevel.classList.add('hidden');
            
            // Откры });
        result.rainbows.forEach(rb=>{ rb.cells.forEach(c=>scoreSet.add(key(c[0],c[1]))); specialSpawns.push({at:rb.at,ваем игровой экран
            if (window.showScreen) {
                window.showScreen('screenMatch3'); type:'rainbow'}); });
        result.squares.forEach(sq=>{ sq.cells.forEach(c=>scoreSet.
            }

            // Сбрасываем счетчики уровня
            hearts = 0;
            moves = START_MOVES;
            updateMatch3HUD();
            if (m3GoalText) m3GoalText.textContent = add(key(c[0],c[1]))); specialSpawns.push({at:sq.at, type:'plane'}); });
        result.normalCells.forEach(k=>scoreSet.add(k));
        
        const`0/${GOAL_HEARTS} ❤️`;

            // Выстраиваем сетку
            buildInitialGrid();

            // Проверяем atKeys = new Set(specialSpawns.map(s=>key(s.at[0], s.at[1])));
         наличие диалога перед боем через window.gameDialogs
            const dialogueIntro = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].intro : null;
            const clearSet = new Set();
        scoreSet.forEach(k=>{ if(!atKeys.has(k)) clearif (window.NovelEngine && dialogueIntro) {
                if (boardEl) boardEl.style.opacitySet.add(k); });
        
        if(specialSpawns.length) pulseToast(specialSpawns.length = "0.2"; // Слегка приглушаем поле
                window.NovelEngine.run(dialogueIntro, () => {
                    if (boardEl) boardEl.style.opacity = "1"; // Делаем ярким для>1 ? 'Комбо бонусов!' : 'Новый бонус!');
        clearAndContinue(clearSet, specialSpawns игры
                });
            } else {
                if (boardEl) boardEl.style.opacity = ", scoreSet);
    }

    function clearAndContinue(clearSet, specialSpawns, scoreSet){
        specialSpawns = specialSpawns || [];
        const scoring = scoreSet || clearSet;
        let heartsGained=0;
        scoring1";
            }
        });
    }

    // 6. ПРОВЕРКА КОНЦА ИГРЫ И ОБНОВЛЕНИЕ БАЛАНСОВ
    function checkEndConditions(){.forEach(k=>{
            const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(!t) return;

        if(hearts >= GOAL_HEARTS){
            const rewards = getRewards(levelDifficulty);
            
            // Начисляем балансы в GameState
            if (window.GameState) {
                window            if(t.type==='heart') heartsGained++;
        });
        clearSet.forEach(k=>{
            .GameState.addStars(rewards.stars);
                window.GameState.addCash(rewards.coins);
const [r,c] = k.split(',').map(Number);
            const t = grid[r] && grid[r][c];
            if(t) t.el.classList.add('clearing            }

            // Проверяем выигрышный диалог через window.gameDialogs
            const dialogueWin = window.gameDialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs');
        });
        hearts += heartsGained;
        
        // Обновляем счетчики реалтайм
        if (m3GoalText) m3GoalText.textContent = `${hearts}/${GOAL_[currentLevelId].win : null;
            
            const winText = `Заказ выполнен!\n\nВы получили: ⭐ +${rewards.stars}\nБазовая награда: 💰 +${rewards.baseHEARTS} ❤️`;
        
        if(heartsGained>0) pulseToast('+'+heartsGained}₽\nБонус за ходы (${moves} шт.): 💰 +${rewards.bonus}₽\nИтого: +${+' ❤️');
        
        setTimeout(()=>{
            clearSet.forEach(k=>{
                const [r,c] = k.split(',').map(Number);
                const t = grid[r] && gridrewards.coins}₽`;

            if (window.NovelEngine && dialogueWin) {
                window.NovelEngine.run(dialogueWin, () => {
                    showOverlay('Успешный улов!', winText);
                });
            } else {
                showOverlay('Успешный улов!', winText[r][c];
                if(t){ t.el.remove(); grid[r][c]=null; }
            });
            specialSpawns.forEach(s=>{
                const [r,c] = s.at;
                );
            }
            return;
        }

        if(moves <= 0){
            if (if(!grid[r]) return;
                let t = grid[r][c];
                if(!twindow.GameState) {
                window.GameState.loseLife(); // Списываем жизнь
            }

            // Проверяем диалог проигрыша через window.gameDialogs
            const dialogueLose = window.game){
                    t = createTile(r,c,s.type,r);
                    grid[r][c] = t;
                } else {
                    t.type = s.type;
                    t.Dialogs && window.gameDialogs[currentLevelId] ? window.gameDialogs[currentLevelId].lose : null;

            const loseText = `Тебе не хватило ходов. Было собрано всегоinner.textContent = iconFor(s.type);
                    applySpecialClass(t);
                }
            });
            applyGravityAndRefill();
            setTimeout(()=>{
                const result = analyzeMatches();
                const ${hearts} из ${GOAL_HEARTS} сердец.\n\nЖизнь: -1 ❤️`;

            if (window.NovelEngine && dialogueLose) {
                window.NovelEngine.run(dialog hasMore = result.bombs.length || result.rockets.length || result.rainbows.length || result.squares.length || result.normalCells.size;
                if(!hasMore){
                    busy = false;
                    checkEndConditions();
                } else {
                    applyResolutionFull(result);
                }
            }, FALL_MS + 20); 
        }, CLEAR_MS);
    }

    functionueLose, () => {
                    showOverlay('Слитый бой...', loseText);
                });
            } else {
                showOverlay('Слитый бой...', loseText);
            }
        }
    }

    // ИСПРАВЛЕНО: Теперь открываем по верному ID — "overlayResults"
 applyGravityAndRefill(){
        for(let c=0;c<SIZE;c++){
            let    function showOverlay(title, text) {
        if (overlayResults) {
            if (resultsTitle) resultsTitle.textContent = title;
            if (resultsText) resultsText.textContent = text;
             pointer = SIZE-1;
            for(let r=SIZE-1;r>=0;r--){
                if(gridoverlayResults.classList.remove('hidden');
        }
    }

    function pulseToast(msg) {[r][c] !== null){
                    const t = grid[r][c];
                    if(pointer !== r){
                        grid[pointer][c] = t;
                        grid[r][c] = null
        if (toastEl) {
            toastEl.textContent = msg;
            toastEl.classList.;
                        moveTileTo(t, pointer, c);
                    }
                    pointer--;
                }
add('show');
            clearTimeout(pulseToast._t);
            pulseToast._t = setTimeout(() => toastEl.classList.remove('show'), 1200);
        }
    }

    // Клик на кнопку завершения уровня на экране результатов
    const btnResultsClose = document.getElementById('btnResultsClose');
    if (btnResults            }
            let spawnOffset = 1;
            for(let r=pointer;r>=0;r--){
                grid[r][c] = createTile(r, c, randType(), -spawnOffsetClose) {
        btnResultsClose.addEventListener('click', () => {
            if (overlayResults) overlay);
                spawnOffset++;
            }
        }
    }

    // ВЫЧИСЛЕНИЕ НАГРАResults.classList.add('hidden');
            
            if (hearts >= GOAL_HEARTS) {
ДЫ
    function getRewards(diff) {
        let starsGained = 1;
        let baseCoins = 100;

        if (diff === "medium") {
            baseCoins =                 if (window.GameState) {
                    window.GameState.nextLevel(); // Повышаем уровень в сохранениях
                }
            }

            if (window.showScreen) {
                window.showScreen('150;
        } else if (diff === "hard") {
            baseCoins = 250;
        } else if (diff === "extreme") {
            baseCoins = 400;
        } else if (diff === "challenge") {
            starsGained = 3;
            baseCoins = 300;
        }

        let bonusCoins = moves * 10; 
screenMap'); // Возвращаем игрока на карту
            }
        });
    }

    // Экспортируем функцию открытия старта уровня в глобальную область
    window.openPreLevelScreen = openPreLevelScreen;

    console.log("match3.js: Оптимизированный тач-движок игры успешно подключен!");
})();        let totalCoins = baseCoins + bonusCoins;

        return { stars: starsGained, coins: total
