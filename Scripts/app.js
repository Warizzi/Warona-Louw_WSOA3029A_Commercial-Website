//Fetch manga data from MangaDex 
async function fetchMangaData() {
    const response = await fetch('https://api.mangadex.org/manga?limit=100');
    const data = await response.json();
    return data.data;
}

//Counts the number of manga for each genre
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

//Preparing data for D3
function prepareDataForD3(genreCounts) {
    return Object.keys(genreCounts).map(genre => ({
        genre: genre,
        popularity: genreCounts[genre]
    }));
}

//Scatterplot code
function createScatterplot(data) {
    let margin = { top:50, right: 30, bottom:100, left: 60};
    let width = 800 - margin.left - margin.right;
    let height = 500 - margin.top - margin.bottom;

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
    .attr("transform", "translate(-10, 0) rotate (-45)")
    .style("text-anchor", "end");

    // Y-axis
    const y = d3.scaleLinear()
    .domain([0, Math.max(65, d3.max(data, d => d.popularity))]) // Use 1000 or higher based on data
    .range([height, 0]);

    svg.append('g')
    .call(d3.axisLeft(y));

    // Add scatterplot dots
    svg.append('g')
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => x(d.genre))
    .attr('cy', d => y(d.popularity))
    .attr('r', 7)
    .style('fill', '#23f9c8');

    //Adding Labels
    svg.append('text')
    .attr('text-anchor', 'end')
    .attr('x', width / 2 + margin.left)
    .attr('y', height + margin.top + 20)
    .text('Manga Genres')
    .attr("class", "axis-label")

    svg.append('text')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 15)
    .attr('x', -height / 2 + margin.top)
    .text('Popularity')
    .attr("class", "axis-label");
}

//Fetch data, process it, and create scatterplot
fetchMangaData().then(mangaList => {
    const genreCounts = countGenres(mangaList);
    const scatterplotData = prepareDataForD3(genreCounts);
    createScatterplot(scatterplotData);
});
