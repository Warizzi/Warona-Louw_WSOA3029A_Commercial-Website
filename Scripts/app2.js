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

function createHeatmap(data) {
    let margin = { top: 50, right: 150, bottom: 150, left: 60 };
    let width = 1200 - margin.left - margin.right;
    let height = 800 - margin.top - margin.bottom;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define color scale
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(data, d => d.popularity)]);

    // Define the x scale using d3.scaleBand with increased padding
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.genre)) // Use genre names for the scale
        .range([0, width])
        .padding(0.5); // Increased padding for more space

    // Append a tooltip div to the body
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip") // You can style this class in CSS
        .style("opacity", 0);

    // Create a heatmap cell for each genre
    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.genre)) // Use xScale to position rectangles
        .attr('y', d => height - (d.popularity * (height / d3.max(data, d => d.popularity)))) // Adjust height based on popularity
        .attr('width', xScale.bandwidth()) // Use the bandwidth for consistent widths
        .attr('height', d => d.popularity * (height / d3.max(data, d => d.popularity))) // Set height based on popularity
        .attr('fill', d => colorScale(d.popularity))
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Genre: ${d.genre}<br/>Popularity: ${d.popularity}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Adding Labels
    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('x', width / 2 + margin.left)
        .attr('y', height + margin.top + 40)
        .text('Manga Genres')
        .attr("class", "axis-label");

    svg.append('text')
        .attr('text-anchor', 'end')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -height / 2 + margin.top)
        .text('Popularity')
        .attr("class", "axis-label");

    // Adding genre labels on x-axis horizontally
    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.genre) + xScale.bandwidth() / 2) // Center labels in their cells
        .attr('y', 15) // Position the label slightly above the x-axis
        .text(d => d.genre)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px') // Smaller font size
        .attr('fill', '#333'); // Optional: change text color for better visibility

    // Adding a legend (optional)
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 150}, 0)`);

    const legendHeight = 200;
    const legendWidth = 20;

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.popularity)])
        .range([legendHeight, 0]);

    legend.selectAll('rect')
        .data(d3.range(0, d3.max(data, d => d.popularity), d3.max(data, d => d.popularity) / 10))
        .enter()
        .append('rect')
        .attr('y', d => legendScale(d))
        .attr('width', legendWidth)
        .attr('height', legendHeight / 10)
        .attr('fill', d => colorScale(d));

    // Adding labels for legend
    legend.selectAll('text')
        .data(d3.range(0, d3.max(data, d => d.popularity), d3.max(data, d => d.popularity) / 10))
        .enter()
        .append('text')
        .attr('y', d => legendScale(d) + (legendHeight / 20))
        .attr('x', legendWidth + 5)
        .text(d => d.toFixed(0));
}

// Fetch data, process it, and create heatmap
fetchMangaData().then(mangaList => {
    const genreCounts = countGenres(mangaList);
    const heatmapData = prepareDataForD3(genreCounts);
    createHeatmap(heatmapData);
});
