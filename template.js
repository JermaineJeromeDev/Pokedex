function renderHeader() {
    return `
        <div class="logo">
            <img src="assets/img/pokeball.png" alt="Pokéball Logo">
            <h1>Pokédex</h1>
        </div>
        ${renderSearchBar()}
    `;
}


function renderSearchBar() {
    return `
        <form class="search-bar" "role="search" aria-label="Pokémon search">
            <input
                type="search"
                id="searchInput"
                placeholder="Search Pokémon..."
                aria-label="Enter at least 3 characters"
                minlength="3"
            >
            <button type="submit" aria-label="Start search">Search</button>
        </form>
    `;
}


function renderPokemonCard(pokemon) {
    return `
        <article
            class="pokemon-card type-${pokemon.types[0].type.name}"
            tabindex ="0"
            role="button"
            aria-label= "View details for ${pokemon.name}">

            <img
                src="${pokemon.sprites.front_default}"
                alt="Image of ${pokemon.name}"
                class="pokemon-img>

            <h2 class=""pokemon-name">${pokemon.name.toUpperCase()}</h2>

            <p class="pokemon-id>#${pokemon.id}</p>

            <div class="pokemon-types">
                ${pokemon.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join('')}
            </div>
        </article>
    `;
}