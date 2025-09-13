const headerContainer = document.getElementById('headerContainer');
headerContainer.innerHTML = renderHeader();
const pokedex = document.getElementById("pokedex");
const loadMoreContainer = document.getElementById("loadMoreContainer");
const searchInput = document.getElementById('searchInput');
const searchBtn = headerContainer.querySelector('button');
searchBtn.disabled = true;


searchInput.addEventListener('input', () => {
    searchBtn.disabled = searchInput.value.trim().length < 3;
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
});


let startId = 1;
const limit = 40;
const maxPokemon = 151;
let allPokemon = [];
let currentIndex = 0; 


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
}


async function loadBatch() {
    const endId = Math.min(startId + limit - 1, maxPokemon);
    for (let i = startId; i <= endId; i++) {
        await loadPokemon(i);
    }
    startId += limit;
    if (startId > maxPokemon) {
        document.getElementById("loadMoreBtn").style.display = "none";
    }
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
    document.addEventListener('keydown', handleArrowKeys);
}


function handleArrowKeys(e) {
    if (!document.querySelector('.overlay')) return;
    if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + allPokemon.length) % allPokemon.length;
        showOverlayByIndex(currentIndex);
    } else if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % allPokemon.length;
        showOverlayByIndex(currentIndex);
    }
}


pokedex.addEventListener('click', async e => {
    const card = e.target.closest('.pokemon-card');
    if (!card) return;
    const pokemonId = card.dataset.id;
    const data = await fetchPokemon(pokemonId);
    showOverlay(data);
});


loadMoreContainer.innerHTML = `<button id="loadMoreBtn">Load More</button>`;
document.getElementById("loadMoreBtn").addEventListener("click", loadBatch);


loadBatch();

