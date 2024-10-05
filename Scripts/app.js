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
        .attr("transform", "translate(-10, 0) rotate (-45)")
        .style("text-anchor", "end");

    // Y-axis
    const y = d3.scaleLinear()
        .domain([0, Math.max(65, d3.max(data, d => d.popularity))]) // Use 65 or higher based on data
        .range([height, 0]);

    svg.append('g')
        .call(d3.axisLeft(y));

    //Create a colour scale for genres
    const colour = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre))

    // Create Scatterplots with initial position x=0, y=height
    let dots = svg.append('g')
        .selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', 0) //Starts scatttering at x=0 from the left
        .attr('cy', height) //Begins at the bottom of the chart
        .attr('r', 7)
        .style('fill', d => colour(d.genre)); //Assigns colour based on genre


    // Transition animation: moving points from the start to their final positions
    dots.transition()
        .duration(2000)  // Duration of the animation (1.5 seconds)
        .delay((d, i) => i * 100)  // Delay for each point (to create shooting effect)
        .attr('cx', d => x(d.genre))  // Move to final x position based on genre
        .attr('cy', d => y(d.popularity));  // Move to final y position based on popularity

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

    //Adding a legend 
    let legend = svg.append('g')
        .attr('transform', `translate(${width - 550}, 0)`); //Positions the legend to the right

    // Calculate the size of the legend box
    let legendPerRow = 14; // # items per column
    let legendItemWidth = 120; //Width of each column
    let legendItemHeight = 25; // Height of each item (increased for better readability)

    // Calculate the size of the legend box
    let legendHeight = Math.min(legendPerRow * legendItemHeight, data.length * legendItemHeight + 40);

    // Append a rectangle as the background for the legend
    legend.append('rect')
        .attr('width', legendItemWidth * 5.5) //Adjusting width for 2 columns
        .attr('height', legendHeight)
        .attr('fill', '#f0f0f0') // Light grey background
        .attr('stroke', '#000') // Black border
        .attr('rx', 5) // Rounded corners
        .attr('ry', 5); // Rounded corners

    //create legend items
    data.forEach((d, i) => {

        let column = Math.floor(i / legendPerRow);
        let row = i % legendPerRow;

        let legendItem = legend.append('g')
            .attr('transform', `translate(${column * legendItemWidth},  ${row * legendItemHeight})`);

        //Creates a colourful circle for each genre
        legendItem.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 4)
            .style('fill', colour(d.genre));

        //Add text label for each genre
        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 5)
            .text(d.genre)
            .style('font-size', '12px')
            .attr('alignment-baseline', 'middle');
    });
}

//Fetch data, process it, and create scatterplot
fetchMangaData().then(mangaList => {
    const genreCounts = countGenres(mangaList);
    const scatterplotData = prepareDataForD3(genreCounts);
    createScatterplot(scatterplotData);
});
