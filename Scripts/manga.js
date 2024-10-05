const mangaSection = document.getElementById('manga-list');
const coverArtBaseURL = 'https://uploads.mangadex.org/covers/:manga-id/:cover-filename.{256, 512}.jpg';

//create function to fetch data from API
async function fetchManga() {
    try {
        const response = await fetch('https://api.mangadex.org/manga?limit=10');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);  // Inspect the data structure
        displayManga(data.data);
    
    } catch (error) {
        console.error('Error fetching MangaDex data:', error);
    }
}

//Was meant to display images as well as descriptions
function displayManga(mangaList) {
    if (!Array.isArray(mangaList)) {
        console.error('Error: mangaList is not an array', mangaList);
        return;
    }
    mangaSection.innerHTML = ''; // Clears previous content

    mangaList.forEach(manga => {
        const mangaItem = document.createElement('div');
        mangaItem.className = 'manga-item';

        // Fetch Manga title and description
        const title = manga.attributes.title.en || 'No title available';
        const description = manga.attributes.description.en || 'No description available';

        // Get manga Id
        const mangaId = manga.id;

        // Find cover art ID from the relationships array
        const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
        const coverId = coverArt ? coverArt.id : null;

        // Construct cover image URL
        const coverImage = coverId ? `${coverArtBaseURL}${mangaId}/${coverId}.jpg` : 'default-cover.jpg';

        // Log for debugging
        console.log(`Cover ID: ${coverId}`);
        console.log(`Cover Image URL: ${coverImage}`);

        // HTML structure for each manga title, includes cover image
        mangaItem.innerHTML = `<h3>${title}</h3>
        <img src="${coverImage}" alt="${title}" class="manga-cover"/>
        <p>${description.substring(0, 100)}...</p>`;

        mangaSection.appendChild(mangaItem);
    });
}

fetchManga();
