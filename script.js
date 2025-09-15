const body = document.querySelector('body');
const loadingOverlay = document.getElementById('loadingOverlay');
const headerContainer = document.getElementById('headerContainer');
headerContainer.innerHTML = renderHeader();
const pokedex = document.getElementById("pokedex");
const loadMoreContainer = document.getElementById("loadMoreContainer");
const searchInput = document.getElementById('searchInput');
const searchBtn = headerContainer.querySelector('button');
searchBtn.disabled = true;
const searchHint = document.getElementById('searchHint');
searchHint.style.display = 'none';


const burgerMenu = document.getElementById('burgerMenu');
const navLinks = headerContainer.querySelector('.nav-links');

burgerMenu.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    burgerMenu.classList.toggle('open');
});


let startId = 1;
const limit = 40;
const maxPokemon = 151;
let allPokemon = [];
let pokemonIndex = null; 
let currentIndex = 0;


function debounce(fn, ms = 250) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}


function ensureSpinnerImg() {
    if (!loadingOverlay) return;
    if (!loadingOverlay.innerHTML.trim()) {
        loadingOverlay.innerHTML = '<img src="assets/img/pokeball.png" alt="Loading..." class="spinner">';
    }
}


function showLoading() {
    ensureSpinnerImg();
    loadingOverlay.classList.remove('hidden');
    loadingOverlay.style.display = 'flex';
}


function hideLoading() {
    loadingOverlay.classList.add('hidden');
    loadingOverlay.style.display = 'none';
}


async function ensurePokemonIndex() {
    if (pokemonIndex) return;
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${maxPokemon}`);
        if (!res.ok) throw new Error('Failed to load pokemon index');
        const json = await res.json();
        pokemonIndex = json.results || [];
    } catch (err) {
        console.error('Could not load pokemon index:', err);
        pokemonIndex = [];
    }
}


async function fetchPokemon(idOrName) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
        if (!res.ok) throw new Error(`Failed to fetch Pokémon ${idOrName}`);
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
}


function prepareCardData(pokemon) {
    const hp = pokemon.stats.find(s => s.stat.name === 'hp').base_stat;
    const atk = pokemon.stats.find(s => s.stat.name === 'attack').base_stat;
    const def = pokemon.stats.find(s => s.stat.name === 'defense').base_stat;
    return {
        id: pokemon.id,
        name: pokemon.name,
        type: pokemon.types[0].type.name,
        types: pokemon.types.map(t => t.type.name),
        sprite: pokemon.sprites.front_default,
        hp,
        atk,
        def
    };
}


function renderAllPokemon() {
    pokedex.innerHTML = allPokemon
        .slice()
        .sort((a, b) => a.id - b.id)
        .map(p => renderPokemonCard(prepareCardData(p)))
        .join('');
    setupPokemonCardClick();
}


function renderFilteredPokemons(results) {
    pokedex.innerHTML = results
        .map(p => renderPokemonCard(prepareCardData(p)))
        .join('');
    setupPokemonCardClick();
}


async function performSearch(query) {
    query = query.trim().toLowerCase();
    if (query === '') return renderAllPokemon();
    if (query.length < 3) return;
    showLoading();
    try {
        await ensurePokemonIndex();
        const matches = findMatchingPokemon(query);
        if (!matches.length) return renderNoResults();
        const results = await buildSearchResults(matches);
        renderFilteredPokemons(results);
    } catch (err) {
        handleSearchError(err);
    } finally {
        hideLoading();
    }
}


function findMatchingPokemon(query) {
    if (!pokemonIndex || pokemonIndex.length === 0) {
        pokedex.innerHTML = `<p>Search temporarily unavailable.</p>`;
        return [];
    }
    return pokemonIndex.filter(r => r.name.includes(query));
}


function renderNoResults() {
    pokedex.innerHTML = `<p>No Pokémon found.</p>`;
}


async function buildSearchResults(matches) {
    const results = [];
    const namesToFetch = [];
    matches.slice(0, 40).forEach(m => {
        const stored = allPokemon.find(p => p.name === m.name);
        if (stored) results.push(stored);
        else namesToFetch.push(m.name);
    });
    if (namesToFetch.length) {
        const fetched = await Promise.all(namesToFetch.map(n => fetchPokemon(n)));
        fetched.forEach(p => {
            if (!p) return;
            if (!allPokemon.some(a => a.id === p.id)) allPokemon.push(p);
            if (!results.some(r => r.id === p.id)) results.push(p);
        });
    }
    return results.sort((a, b) => a.id - b.id);
}


function handleSearchError(err) {
    console.error('Search error:', err);
    pokedex.innerHTML = `<p>Error during search.</p>`;
}


const debouncedSearch = debounce((val) => performSearch(val), 250);


searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    searchBtn.disabled = val.length < 3 && val.length !== 0;
    if (val.length > 0 && val.length < 3) {
        searchHint.style.display = 'block';
    } else {
        searchHint.style.display = 'none';
    }
    if (val === '') {
        renderAllPokemon();
        return;
    }
    debouncedSearch(val);
});



headerContainer.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 3) {
        searchHint.style.display = 'block';
        searchInput.focus();
        return;
    }
    searchHint.style.display = 'none';
    await performSearch(q);
});


searchBtn.addEventListener('click', async (e) => {
    const q = searchInput.value.trim().toLowerCase();
    if (q.length < 3) {
        searchHint.style.display = 'block';
        searchInput.focus();
        return;
    }
    searchHint.style.display = 'none';
    await performSearch(q);
});


async function fetchPokemonBatch(ids) {
    const fetches = ids.map(id => fetchPokemon(id));
    return await Promise.all(fetches);
}


function getIdsToLoad(start, limit, max) {
    const endId = Math.min(start + limit - 1, max);
    const ids = [];
    for (let i = start; i <= endId; i++) {
        if (!allPokemon.some(p => p.id === i)) ids.push(i);
    }
    return ids;
}


function renderSinglePokemon(p) {
    if (!p || allPokemon.some(a => a.id === p.id)) return;
    allPokemon.push(p);
    pokedex.innerHTML += renderPokemonCard(prepareCardData(p));
    setupPokemonCardClick();
}


async function fetchAndRenderNextBatch() {
    const ids = getIdsToLoad(startId, limit, maxPokemon);
    if (!ids.length) return;
    const batch = await fetchPokemonBatch(ids);
    batch.forEach(p => { if (p) renderSinglePokemon(p); });
    startId += limit;
}


function startLoadingBtn(btn) {
    btn.disabled = true;
    showLoading();
}


function finishLoadingBtn(btn, startTime) {
    const elapsed = Date.now() - startTime;
    setTimeout(() => {
        btn.disabled = false;
        hideLoading();
    }, Math.max(0, 1000 - elapsed));
}


async function loadBatch() {
    const btn = document.getElementById("loadMoreBtn");
    const start = Date.now();
    startLoadingBtn(btn);
    try {
        await fetchAndRenderNextBatch();
        if (startId > maxPokemon) btn.style.display = "none";
    } catch (e) {
        console.error(e);
    } finally {
        finishLoadingBtn(btn, start);
    }
}


function setupPokemonCardClick() {
    pokedex.querySelectorAll('.pokemon-card').forEach(card => {
        if (card._hasClick) return;
        card._hasClick = true;
        card.addEventListener('click', () => {
            const pokemonId = card.dataset.id;
            const data = allPokemon.find(p => p.id == pokemonId);
            if (!data) return;
            showOverlay(data);
        });
    });
}


function showOverlayByIndex(index) {
    currentIndex = index;
    const overlayContainer = document.getElementById('overlayContainer');
    overlayContainer.innerHTML = renderOverlay(allPokemon[currentIndex]);
    const overlay = overlayContainer.querySelector('.overlay');
    requestAnimationFrame(() => overlay.classList.add('show'));
    addOverlayCloseHandler(overlay, overlayContainer);
    setupTabs(overlay);
    setupOverlayNavigation(overlay);
}


function showOverlay(pokemon) {
    const index = allPokemon.findIndex(p => p.id == pokemon.id);
    if (index >= 0) showOverlayByIndex(index);
}


function addOverlayCloseHandler(overlay, overlayContainer) {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlayContainer.innerHTML = '';
    });
}


function switchTab(activeBtn, tabButtons, tabContents, overlay) {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('hidden'));
    activeBtn.classList.add('active');
    const target = overlay.querySelector(`#tab-${activeBtn.dataset.tab}`);
    if (target) target.classList.remove('hidden');
    if (activeBtn.dataset.tab === 'stats') {
        setTimeout(() => {
            fillStatBars(overlay);
        }, 40);
    }
}


function setupTabs(overlay) {
    const tabButtons = overlay.querySelectorAll('.tab-btn');
    const tabContents = overlay.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn, tabButtons, tabContents, overlay);
        });
    });
}


function fillStatBars(overlay) {
    if (!overlay) overlay = document;
    const fills = overlay.querySelectorAll('.stat-fill, .fill');
    fills.forEach(el => {
        const raw = Number(el.dataset.value) || 0;
        const perc = Math.round(Math.min(100, (raw / 255) * 100));
        el.style.width = perc + '%';
        const color = getStatColor(raw);
        el.style.background = color;
    });
}


function setupOverlayNavigation(overlay) {
    overlay.querySelector('.nav-arrow.left').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
        showOverlayByIndex(currentIndex);
    });
    overlay.querySelector('.nav-arrow.right').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % allPokemon.length;
        showOverlayByIndex(currentIndex);
    });
    document.addEventListener('keydown', (e) => {
        if (!document.querySelector('.overlay')) return;
        if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
            showOverlayByIndex(currentIndex);
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % allPokemon.length;
            showOverlayByIndex(currentIndex);
        }
    });
}


function getStatColor(value) {
    if (value < 60) return "#ff4d4d";       
    if (value < 100) return "#ffb84d";     
    if (value < 140) return "#ffe24d";      
    return "#4cd964";                      
}


loadMoreContainer.innerHTML = `<button id="loadMoreBtn">Load More</button>`;
document.getElementById("loadMoreBtn").addEventListener("click", loadBatch);


ensureSpinnerImg();
loadBatch();


