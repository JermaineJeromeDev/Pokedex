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