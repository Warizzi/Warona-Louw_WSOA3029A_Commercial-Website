// Fetch manga data from MangaDex 
async function fetchMangaData() {
    const response = await fetch('https://api.mangadex.org/manga?limit=100');
    const data = await response.json();
    return data.data;
}

// Counts the number of manga for each genre
function countGenres(mangaList) {
    const genreCounts = {};
    mangaList.forEach(manga => {
        const genres = manga.attributes.tags;
        genres.forEach(genre => {
            const genreName = genre.attributes.name.en;
            genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
        });
    });
    return genreCounts;
}

// Preparing data for D3
function prepareDataForD3(genreCounts) {
    return Object.keys(genreCounts).map(genre => ({
        genre: genre,
        popularity: genreCounts[genre]
    }));
}

// Function to highlight the searched genre
function highlightGenre(searchTerm, genreElements, data) {
    // Reset previous highlights
    genreElements
        .attr('stroke', 'none')
        .attr('stroke-width', 0);

    if (searchTerm) {
        // Apply highlight to matching genres
        genreElements
            .filter(d => d.genre.toLowerCase().includes(searchTerm.toLowerCase()))
            .attr('stroke', 'yellow') // Highlight color
            .attr('stroke-width', 2);
    }
}

// Scatterplot code
function createScatterplot(data) {
    let margin = { top: 50, right: 150, bottom: 100, left: 60 };
    let width = 1200 - margin.left - margin.right;
    let height = 800 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // X-axis
    const x = d3.scaleBand()
        .domain(data.map(d => d.genre))
        .range([0, width])
        .padding(1);

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10, 0) rotate(-45)")
        .style("text-anchor", "end")
        .attr("fill", "white");

    // Y-axis
    const y = d3.scaleLinear()
        .domain([0, Math.max(65, d3.max(data, d => d.popularity))])
        .range([height, 0]);

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("fill", "white");

    // Create a color scale for genres
    const colour = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre));

    // Create scatterplot points
    let dots = svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', height)
        .attr('r', 7)
        .style('fill', d => colour(d.genre));

    // Transition animation
    dots.transition()
        .duration(2000)
        .delay((d, i) => i * 100)
        .attr('cx', d => x(d.genre))
        .attr('cy', d => y(d.popularity));

    // Adding X-axis Label
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width / 2 + margin.left)
        .attr('y', height + margin.top + 20)
        .text('Manga Genres')
        .attr("fill", "white");

    // Adding Y-axis Label
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2 + margin.top)
        .text('Popularity')
        .attr("fill", "white");

    // Adding a legend
    let legend = svg.append('g')
        .attr('transform', `translate(${width - 550}, 0)`);

    let legendPerRow = 14;
    let legendItemWidth = 120;
    let legendItemHeight = 25;
    let legendHeight = Math.min(legendPerRow * legendItemHeight, data.length * legendItemHeight + 40);

    legend.append('rect')
        .attr('width', legendItemWidth * 5.5)
        .attr('height', legendHeight)
        .attr('fill', '#f0f0f0')
        .attr('stroke', '#000')
        .attr('rx', 5)
        .attr('ry', 5);

    data.forEach((d, i) => {
        let column = Math.floor(i / legendPerRow);
        let row = i % legendPerRow;

        let legendItem = legend.append('g')
            .attr('transform', `translate(${column * legendItemWidth},  ${row * legendItemHeight})`);

        legendItem.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 4)
            .style('fill', colour(d.genre));

        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 5)
            .text(d.genre)
            .style('font-size', '12px')
            .attr('alignment-baseline', 'middle');
    });

    // Search functionality
    const searchInput = d3.select('#genreSearch');
    searchInput.on('input', function () {
        const searchTerm = this.value;
        highlightGenre(searchTerm, dots, data);
    });
}

// Fetch data, process it, and create scatterplot
fetchMangaData().then(mangaList => {
    const genreCounts = countGenres(mangaList);
    const scatterplotData = prepareDataForD3(genreCounts);
    createScatterplot(scatterplotData);
});
