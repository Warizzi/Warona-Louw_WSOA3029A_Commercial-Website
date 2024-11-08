// Fetch Manga data from the MangaDex API
async function fetchMangaData() {
    const response = await fetch('https://api.mangadex.org/manga?limit=100');
    const data = await response.json();
    return data.data;
}

// Count the number of manga for each genre
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

// Prepare data for D3
function prepareDataForD3(genreCounts) {
    return Object.keys(genreCounts).map(genre => ({
        genre: genre,
        popularity: genreCounts[genre]
    }));
}

// Function to highlight the searched genre
function highlightGenre(searchTerm, genreElements) {
    // Reset the previous highlights
    genreElements.attr('stroke', 'none').attr('stroke-width', 0);

    if (searchTerm) {
        // Highlight the matching genre
        genreElements.filter(d => d.genre.toLowerCase().includes(searchTerm.toLowerCase()))
            .attr('stroke', 'blue') //changed to blue highlight
            .attr('stroke-width', 2);
    }
}

// Create the heatmap visualization
function createHeatmap(data) {
    const margin = { top: 50, right: 150, bottom: 150, left: 60 };
    const width = 1200 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define color scale
    const maxPopularity = d3.max(data, d => d.popularity);
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxPopularity]);

    // Define the x scale using d3.scaleBand with increased padding
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.genre))
        .range([0, width])
        .padding(0.5);

    // Append a tooltip div to the body
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Create a heatmap cell for each genre
    const genreElements = svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.genre))
        .attr('y', d => height - (d.popularity * (height / maxPopularity)))
        .attr('width', xScale.bandwidth())
        .attr('height', d => d.popularity * (height / maxPopularity))
        .attr('fill', d => colorScale(d.popularity))
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Genre: ${d.genre}<br/>Popularity: ${d.popularity}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Adding Labels
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width / 2)
        .attr('y', height + margin.top + 40)
        .text('Manga Genres')
        .attr("class", "axis-label")
        .attr('fill', 'white');

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2)
        .text('Popularity')
        .attr("class", "axis-label")
        .attr('fill', 'white');

    // Adding a legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width + 20}, 0)`);

    const legendHeight = 200;
    const legendWidth = 20;

    const legendScale = d3.scaleLinear()
        .domain([0, maxPopularity])
        .range([legendHeight, 0]);

    const legendAxis = d3.axisRight(legendScale)
        .ticks(5)
        .tickFormat(d3.format(".0f"));

    legend.selectAll('rect')
        .data(d3.range(0, maxPopularity, maxPopularity / 10))
        .enter()
        .append('rect')
        .attr('y', d => legendScale(d))
        .attr('width', legendWidth)
        .attr('height', legendHeight / 10)
        .attr('fill', d => colorScale(d));

    legend.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);

    // Adding a search input listener
    const searchInput = d3.select('#genreSearch');
    searchInput.on('input', function() {
        const searchTerm = this.value;
        highlightGenre(searchTerm, genreElements);
    });
}

// Fetch data, process it, and create the heatmap
fetchMangaData().then(mangaList => {
    const genreCounts = countGenres(mangaList);
    const heatmapData = prepareDataForD3(genreCounts);
    createHeatmap(heatmapData);
});

