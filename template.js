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
            data-id="${pokemon.id}"
            tabindex="0"
            role="button"
            aria-label="View details for ${pokemon.name}">
            
            <img
                src="${pokemon.sprites.front_default}"
                alt="Image of ${pokemon.name}"
                class="pokemon-img">
            
            <h2 class="pokemon-name">${pokemon.name.toUpperCase()}</h2>
            
            <p class="pokemon-id">#${pokemon.id}</p>
            
            <div class="pokemon-types">
                ${pokemon.types.map(t => `<span class="type ${t.type.name}">${t.type.name}</span>`).join('')}
            </div>
            
            <div class="meta">
                <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
                <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
            </div>
            
            <div class="pokemon-stats">
                ${pokemon.stats.map(s => `<p><strong>${s.stat.name.toUpperCase()}:</strong> ${s.base_stat}</p>`).join('')}
            </div>
        </article>
    `;
}



function renderOverlay(pokemon) {
    return `
        <div class="overlay" id="overlayContainer" tabindex="0" role="dialog" aria-model="true">
            <div class="overlay-content">
                <article class="pokemon-large-card-type-${pokemon.types[0].type.name}">
                    <h2 class="pokemon-name">${pokemon.name.toUpperCase()}</h2>
                    <p class="pokemon-id">#${pokemon.id}</p>
                    <img src="${pokemon.sprites.front_default}" alt="Image of ${pokemon.name}" class="pokemon-img">
                    <div class="pokemon-tabs">
                        <button class="tab-btn active" data-tab="stats">Stats</button>
                        <button class="tab-btn" data-tab="abilities>Abilities</button>
                        <button class="tab-btn" data-tab="moves">Moves</button>
                    </div>
                    <div class="tab-content hidden" id="tab-abilities">
                        ${pokemon.abilities.map(a => `<p>${a.ability.name}</p>`).join('')}
                    </div>
                    </div>
                    <div class="tab-content hidden" id="tab-moves">
                        ${pokemon.moves.slice(0, 5).map(m => `<p>${m.move.name}</p>`).join('')}
                    </div>
                </article>
            </div>
        </div>
    `;
}