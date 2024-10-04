const mangaSection = document.getElementById('manga-list');


async function fetchManga() {
    try {
        const response = await fetch('https://api.mangadex.org/manga?limit=10');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        displayManga(data.data);
    
    } catch (error) {
        console.error('Error fetching MangaDex data:', error);

    }
}

function displayManga(mangaList) {

    if (!Array.isArray(mangaList)) {
        console.error('Error: mangaList is not an array', mangaList);
        return;
    }
    mangaSection.innerHTML = ''; //clears previous content
    mangaList.forEach(manga => {
        const mangaItem = document.createElement('div');
        mangaItem.className = 'manga-item';

        const title = manga.attributes.title.en || 'No title available';
        const description = manga.attributes.description.en || 'No description available';

        mangaItem.innerHTML = `<h3>${title}</h3>
        <p>${description.substring(0, 100)}...</p>`;

        mangaSection.appendChild(mangaItem);
    });
}

fetchManga();