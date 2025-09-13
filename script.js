const pokedex = document.getElementById("pokedex");
const loadMoreContainer = document.getElementById("loadMoreContainer");


let startId = 1;
const limit = 40;
const maxPokemon = 151;


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


function showOverlay(pokemon) {
    const overlayContainer = document.getElementById('overlayContainer');
    overlayContainer.innerHTML = renderOverlay(pokemon);
    const overlay = overlayContainer.querySelector('.overlay');
    makeOverlayVisible(overlay);
    addOverlayCloseHandler(overlay, overlayContainer);
    setupTabs(overlay);
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