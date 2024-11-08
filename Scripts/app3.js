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

// Bubble chart code
function createBubbleChart(data) {
    let margin = { top: 50, right: 150, bottom: 100, left: 60 };
    let width = 1200 - margin.left - margin.right;
    let height = 800 - margin.top - margin.bottom;
    let circleRadius = Math.min(width, height) / 2 - 50; // Radius of the enclosing circle

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left + width / 2}, ${margin.top + height / 2})`); // Center the circle

    // Create scale for bubble size
    const size = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.popularity)])
        .range([5, 40]); // Minimum and maximum bubble size

    // Colour scale for genres
    const colour = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d.genre));

    //Tooltip div creation

    const tooltip = d3.select('#chart')
        .append('div')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', '#333')
        .style('color', '#fff')
        .style('padding', '8px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('font-size', '12px');

    // Initialize the bubbles with size and color
    const bubbles = svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('r', d => size(d.popularity))
        .style('fill', d => colour(d.genre))
        .style('opacity', 0.7)
        .attr('stroke', 'black')
        .on('mouseover', (event, d) => {
            tooltip.style('opacity', 1); //show tooltip
        })
        .on('mousemove', (event, d) => {
            tooltip
                .html(`<strong>Genre:</strong> ${d.genre}<br><strong>Popularity:</strong> ${d.popularity}`)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
        })
        .on('mouseleave', () => {
            tooltip.style('opacity', 0); // Hide tooltip
        });

    // D3 force simulation for the circular packing layout
    const simulation = d3.forceSimulation(data)
        .force('x', d3.forceX(0).strength(0.1)) // Center along x-axis
        .force('y', d3.forceY(0).strength(0.1)) // Center along y-axis
        .force('collide', d3.forceCollide(d => size(d.popularity) + 2)) // Prevent overlap
        .force('enclose', forceEnclose(circleRadius)) // Custom force to keep bubbles within circle
        .on('tick', ticked);

    function ticked() {
        bubbles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
    }

    // Function to apply an enclosing circular boundary force
    function forceEnclose(radius) {
        return function () {
            data.forEach(d => {
                const distance = Math.sqrt(d.x * d.x + d.y * d.y);
                if (distance > radius) {
                    const angle = Math.atan2(d.y, d.x);
                    d.x = Math.cos(angle) * radius;
                    d.y = Math.sin(angle) * radius;
                }
            });
        };
    }

    // Search functionality
    const searchInput = document.getElementById('genre-search');
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();

        // Reset all bubbles to default opacity and stroke
        bubbles.style('opacity', 0.7).attr('stroke-width', 1).attr('stroke', 'black');

        if (searchTerm) {
            const foundBubble = bubbles.filter(d => d.genre.toLowerCase() === searchTerm);

            // Highlight found bubbles by increasing opacity and stroke width
            foundBubble
                .style('opacity', 1)
                .attr('stroke-width', 3)
                .attr('stroke', 'red');
        }
    });

    // Adding title label
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -circleRadius - 20)
        .style('font-size', '20px')
        .text('Manga Genre Popularity Bubble Chart');
}




// Fetch data, process it, and create bubble chart
fetchMangaData().then(mangaList => {
    const genreCounts = countGenres(mangaList);
    const bubbleChartData = prepareDataForD3(genreCounts);
    createBubbleChart(bubbleChartData);
});

