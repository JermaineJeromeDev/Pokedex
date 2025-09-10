let limit = 20;
let startId = 1;

const pokedex = document.getElementById("pokedex");
const loadMoreContainer = document.getElementById("loadMoreContainer");


async function loadPokemon(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) throw new Error("Failed to fetch Pokémon data");

        const data = await response.json();
        pokedex.innerHTML += renderPokemonCard(data);
    } catch (error) {
        console.error(error);
    }
}


async function loadInitialPokemon() {
    for (let i = startId; i < startId + limit; i++) {
        await loadPokemon(i);
    }
    startId += limit;
}


loadMoreContainer.innerHTML = `<button id="loadMoreBtn">Load More</button>`;


document.getElementById("loadMoreBtn").addEventListener("click", async () => {
    for (let i = startId; i < startId + limit; i++) {
        await loadPokemon(i);
    }
    startId += limit;
});

// Start
loadInitialPokemon();
