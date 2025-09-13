const body = document.querySelector('body');
const loadingOverlay = document.getElementById('loadingOverlay');
const headerContainer = document.getElementById('headerContainer');
headerContainer.innerHTML = renderHeader();
const pokedex = document.getElementById("pokedex");
const loadMoreContainer = document.getElementById("loadMoreContainer");
const searchInput = document.getElementById('searchInput');
const searchBtn = headerContainer.querySelector('button');
searchBtn.disabled = true;


let startId = 1;
const limit = 40;
const maxPokemon = 151;
let allPokemon = [];
let currentIndex = 0; 


searchInput.addEventListener('input', () => {
    searchBtn.disabled = searchInput.value.trim().length < 3 && searchInput.value.trim().length !== 0;
    if (searchInput.value.trim() === '') {
        renderAllPokemon();
    }
});


headerContainer.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 3) return;
    for (let id = 1; id <= 151; id++) {
        if (!allPokemon.some(p => p.id === id)) {
            const data = await fetchPokemon(id);
            if (data) allPokemon.push(data);
        }
    }
    const filtered = allPokemon
        .filter(p => p.name.toLowerCase().includes(query))
        .map(prepareCardData);
    pokedex.innerHTML = filtered.map(renderPokemonCard).join('');
    setupPokemonCardClick();
});


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


async function fetchPokemon(id) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`);
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}


async function loadPokemon(id) {
    const data = await fetchPokemon(id);
    if (!data) return;
    const cardData = prepareCardData(data);
    allPokemon.push(data); 
    pokedex.innerHTML += renderPokemonCard(cardData);
    setupPokemonCardClick();
}


async function loadBatch() {
    const btn = document.getElementById("loadMoreBtn");
    const start = Date.now();
    startLoading(btn);
    try {
        await fetchAndRenderNextBatch();
        checkMaxPokemon(btn);
    } catch (e) {
        console.error(e);
    } finally {
        finishLoading(btn, start);
    }
}


function startLoading(btn) {
    btn.disabled = true;
    showLoading();
}


function renderSinglePokemon(p) {
    if (!p || allPokemon.some(a => a.id === p.id)) return;
    allPokemon.push(p);
    pokedex.innerHTML += renderPokemonCard(prepareCardData(p));
    setupPokemonCardClick();
}


function finishLoading(btn, startTime) {
    const elapsed = Date.now() - startTime;
    setTimeout(() => {
        btn.disabled = false;
        hideLoading();
    }, Math.max(0, 1000 - elapsed));
}

function checkMaxPokemon(btn) {
    if (startId > maxPokemon) btn.style.display = "none";
}


async function fetchAndRenderNextBatch() {
    const ids = getIdsToLoad(startId, limit, maxPokemon);
    if (!ids.length) return;
    const batch = await fetchPokemonBatch(ids);
    batch.forEach(p => renderSinglePokemon(p));
    startId += limit;
}


function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
}


function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
}


function getIdsToLoad(start, limit, max) {
    const endId = Math.min(start + limit - 1, max);
    const ids = [];
    for (let i = start; i <= endId; i++) {
        if (!allPokemon.some(p => p.id === i)) ids.push(i);
    }
    return ids;
}


async function fetchPokemonBatch(ids) {
    const fetches = ids.map(id => fetchPokemon(id));
    return await Promise.all(fetches); 
}


function setupPokemonCardClick() {
    pokedex.querySelectorAll('.pokemon-card').forEach(card => {
        card.addEventListener('click', e => {
            const pokemonId = card.dataset.id;
            const data = allPokemon.find(p => p.id == pokemonId);
            if (!data) return;
            showOverlay(data);
        });
    });
}


function renderAllPokemon() {
    pokedex.innerHTML = allPokemon.map(p => renderPokemonCard(prepareCardData(p))).join('');
    setupPokemonCardClick();
}


function showOverlayByIndex(index) {
    currentIndex = index;
    const overlayContainer = document.getElementById('overlayContainer');
    overlayContainer.innerHTML = renderOverlay(allPokemon[currentIndex]);
    const overlay = overlayContainer.querySelector('.overlay');
    makeOverlayVisible(overlay);
    addOverlayCloseHandler(overlay, overlayContainer);
    setupTabs(overlay);
    setupOverlayNavigation(overlay);
}


function showOverlay(pokemon) {
    const index = allPokemon.findIndex(p => p.id == pokemon.id);
    if (index >= 0) showOverlayByIndex(index);
}


function makeOverlayVisible(overlay) {
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });
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
    overlay.querySelector(`#tab-${activeBtn.dataset.tab}`).classList.remove('hidden');
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


function setupOverlayNavigation(overlay) {
    overlay.querySelector('.nav-arrow.left').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
        showOverlayByIndex(currentIndex);
    });
    overlay.querySelector('.nav-arrow.right').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % allPokemon.length;
        showOverlayByIndex(currentIndex);
    });
}


loadMoreContainer.innerHTML = `<button id="loadMoreBtn">Load More</button>`;
document.getElementById("loadMoreBtn").addEventListener("click", loadBatch);


loadBatch();

