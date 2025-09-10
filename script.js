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


loadMoreContainer.innerHTML = `<button id="loadMoreBtn">Load More</button>`;
document.getElementById("loadMoreBtn").addEventListener("click", loadBatch);


loadBatch();
