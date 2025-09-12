const pokedex = document.getElementById("pokedex");
const loadMoreContainer = document.getElementById("loadMoreContainer");


let startId = 1;
let limit = 40;
const maxPokemon = 151;


async function loadPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error(`Failed to fetch Pokémon with id ${id}`);
        const data = await response.json();
        pokedex.innerHTML += renderPokemonCard(data);
    } catch (error) {
        console.error(error);
    }
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


async function fetchPokemon(id) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch Pokémon ${id}`);
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}


function showOverlay(pokemon) {
    const overlayContainer = document.getElementById('overlayContainer');
    overlayContainer.innerHTML = renderOverlay(pokemon); 
    const overlay = overlayContainer.querySelector('.overlay');
    const content = overlay.querySelector('.overlay-content'); 
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlayContainer.innerHTML = '';
    });
    const tabButtons = overlay.querySelectorAll('.tab-btn');
    const tabContents = overlay.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            btn.classList.add('active');
            overlay.querySelector(`#tab-${btn.dataset.tab}`).classList.remove('hidden');
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