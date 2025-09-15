function renderHeader() {
    return `
        <div class="logo">
            <img src="assets/img/pokeball.png" alt="Pokéball Logo">
            <h1>Pokédex</h1>
        </div>
        <nav class="nav-links">
            ${renderSearchBar()}
        </nav>
        <div class="burger-menu" id="burgerMenu" aria-label="Open menu">
            <div></div>
            <div></div>
            <div></div>
        </div>
    `;
}


function renderSearchBar() {
    return `
        <form class="search-bar" role="search" aria-label="Pokémon search">
            <input
                type="search"
                id="searchInput"
                placeholder="Search Pokémon..."
                aria-label="Enter at least 3 characters"
                minlength="3"
            >
            <button type="submit" aria-label="Start search">Search</button>
            <p id="searchHint" class="search-hint">Enter at least 3 letters</p>
        </form>
    `;
}



function renderPokemonCard(pokemon) {
    return `
        <article
            class="pokemon-card type-${pokemon.types[0]}"
            data-id="${pokemon.id}"
            tabindex="0"
            role="button"
            aria-label="View details for ${pokemon.name}">
            <div class="pokemon-img-wrapper">
                <img src="assets/img/blackgrey.png" class="pokeball-bg small" alt="">
                <img src="${pokemon.sprite}" alt="Image of ${pokemon.name}" class="pokemon-img">
            </div>
            <h2 class="pokemon-name">${pokemon.name.toUpperCase()}</h2>
            <div class="pokemon-types">
                ${pokemon.types.map(t => `<span class="type ${t}">${t}</span>`).join('')}
            </div>
            <div class="pokemon-mini-stats">
                <div class="stat-box">HP ${pokemon.hp}</div>
                <div class="stat-box">ATK ${pokemon.atk}</div>
                <div class="stat-box">DEF ${pokemon.def}</div>
            </div>
        </article>
    `;
}


function renderOverlay(pokemon) {
    return `
        <div class="overlay">
            <div class="overlay-content">
                <article class="pokemon-large-card type-${pokemon.types[0].type.name}">
                    <h2 class="pokemon-name">${pokemon.name.toUpperCase()}</h2>
                    <p class="pokemon-id">#${pokemon.id}</p>                
                    <div class="pokemon-img-wrapper">
                        <img src="assets/img/black.png" class="pokeball-bg large" alt="">
                        <img src="${pokemon.sprites.front_default}" alt="Image of ${pokemon.name}" class="pokemon-img">
                    </div>
                    <div class="tab-container">
                        <div class="pokemon-tabs">
                            <button class="tab-btn active" data-tab="about">About</button>
                            <button class="tab-btn" data-tab="stats">Base Stats</button>
                            <button class="tab-btn" data-tab="moves">Moves</button>
                        </div>
                        <div class="tab-content" id="tab-about">
                            <h3>About</h3>
                            <p><strong>Species:</strong> ${pokemon.species.name}</p>
                            <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
                            <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
                            <p><strong>Abilities:</strong> 
                                ${pokemon.abilities.map(a => a.ability.name).join(", ")}
                            </p>
                            <h4>Breading</h4>
                            <p><strong>Gender:</strong> ♂ 50% / ♀ 50%</p>
                            <p><strong>Egg Groups:</strong> Unknown</p>
                            <p><strong>Egg Cycle:</strong> Unknown</p>
                        </div>
                        <div class="tab-content hidden" id="tab-stats">
                            <h3>Base Stats</h3>
                            ${pokemon.stats.map(s => `
                                <div class="stat-row">
                                    <span class="stat-name">${s.stat.name.toUpperCase()}</span>
                                    <span class="stat-value">${s.base_stat}</span>
                                    <div class="stat-bar">
                                        <!-- width + color setzen wir per JS -->
                                        <div class="stat-fill" data-value="${s.base_stat}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="tab-content hidden" id="tab-moves">
                            <h3>Moves</h3>
                            ${pokemon.moves.slice(0, 10).map(m => `<p>${m.move.name}</p>`).join('')}
                        </div>
                    </div>
                </article>
                <div class="nav-arrow left">&#10094;</div>
                <div class="nav-arrow right">&#10095;</div>
            </div>
        </div>
    `;
}


function renderStat(statName, value) {
    return `
        <div class="stat">
            <div class="stat-name">${statName}</div>
            <div class="stat-value">${value}</div>
            <div class="stat-bar">
                <div class="stat-fill" data-value="${value}"></div>
            </div>
        </div>
    `;
}


function renderFooter() {
    return `
        <footer class="footer">
            <div class="footer-left">&copy; YEAR Jermaine Jérôme</div>
            <div class="footer-right">
                <a href="impressum.html" target="_blank">Impressum</a> | 
                <a href="datenschutz.html" target="_blank">Datenschutz</a>
            </div>
        </footer>
    `;
}
