const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const ORIG_URL = 'https://image.tmdb.org/t/p/original';

const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const mainView = document.getElementById('main-view');
const detailView = document.getElementById('detail-view');
const detailContent = document.getElementById('detailContent');
const backBtn = document.getElementById('backBtn');
const paginationContainer = document.getElementById('pagination');
const catBtns = document.querySelectorAll('.cat-btn');

let currentPage = 1;
let currentSearchTerm = '';
let currentType = 'popular';

async function getMovies(url, page = 1) {
    showSkeleton();
    try {
        const res = await fetch(`${url}&page=${page}`);
        const data = await res.json();
        if (data.results) {
            displayMovies(data.results);
            setupPagination(data.total_pages);
        }
    } catch (error) {
        console.error('Hata:', error);
    }
}

function showSkeleton() {
    moviesGrid.innerHTML = Array(6).fill('<div class="skeleton"></div>').join('');
}

function displayMovies(moviesList) {
    moviesGrid.innerHTML = '';
    moviesList.forEach(movie => {
        const { id, title, poster_path, vote_average, release_date } = movie;
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        const poster = poster_path 
            ? IMG_URL + poster_path 
            : 'https://via.placeholder.com/500x750?text=Afiş+Yok';

        movieCard.innerHTML = `
            <img src="${poster}" loading="lazy" alt="${title}">
            <div class="card-overlay">
                <h3>${title}</h3>
                <div class="card-meta">
                    <span>${release_date ? release_date.split('-')[0] : ''}</span>
                    <span class="rating-tag">★ ${vote_average.toFixed(1)}</span>
                </div>
            </div>
        `;
        movieCard.onclick = () => showMovieDetails(id);
        moviesGrid.appendChild(movieCard);
    });
}

async function showMovieDetails(id) {
    try {
        mainView.style.display = 'none';
        detailView.style.display = 'block';
        detailContent.innerHTML = '<div style="padding:150px 0; text-align:center">Yükleniyor...</div>';
        window.scrollTo(0,0);

        const [detailsRes, videosRes, imagesRes, creditsRes] = await Promise.all([
            fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=tr-TR`),
            fetch(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}&language=tr-TR`),
            fetch(`${BASE_URL}/movie/${id}/images?api_key=${API_KEY}`),
            fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=tr-TR`)
        ]);

        const details = await detailsRes.json();
        const videos = await videosRes.json();
        const images = await imagesRes.json();
        const credits = await creditsRes.json();

        const trailers = videos.results.filter(v => v.type === 'Trailer' || v.type === 'Teaser').slice(0, 3);
        const backdrops = images.backdrops.slice(1, 5);
        const cast = credits.cast.slice(0, 10);

        detailContent.innerHTML = `
            <div class="hero-backdrop" style="background-image: url('${ORIG_URL + details.backdrop_path}')"></div>
            <div class="detail-body container">
                <div class="main-info">
                    <img src="${IMG_URL + details.poster_path}" class="poster-small">
                    <div class="title-info">
                        <h2>${details.title}</h2>
                        <div class="tags">
                            <span class="tag">⭐ ${details.vote_average.toFixed(1)}</span>
                            <span class="tag">⏱️ ${details.runtime} dk</span>
                            <span class="tag">📅 ${details.release_date.split('-')[0]}</span>
                        </div>
                    </div>
                </div>

                <div class="overview-section">
                    <h3 class="section-title">Özet</h3>
                    <p class="overview-text">${details.overview || 'Özet bulunamadı.'}</p>
                </div>

                ${trailers.length > 0 ? `
                    <div class="video-section">
                        <h3 class="section-title">Fragmanlar</h3>
                        <div class="video-scroll">
                            ${trailers.map(v => `
                                <div class="video-card">
                                    <iframe src="https://www.youtube.com/embed/${v.key}" allowfullscreen></iframe>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${backdrops.length > 0 ? `
                    <div class="photos-section">
                        <h3 class="section-title">Görseller</h3>
                        <div class="photo-grid">
                            ${backdrops.map(img => `<img src="${IMG_URL + img.file_path}" loading="lazy">`).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="cast-section">
                    <h3 class="section-title">Oyuncu Kadrosu</h3>
                    <div class="cast-scroll">
                        ${cast.map(c => `
                            <div class="cast-card">
                                <img src="${c.profile_path ? IMG_URL + c.profile_path : 'https://via.placeholder.com/100x100'}" alt="${c.name}">
                                <p>${c.name}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Hata:', error);
    }
}

function setupPagination(totalPages) {
    paginationContainer.innerHTML = '';
    const pages = Math.min(totalPages, 5);
    for (let i = 1; i <= pages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => { currentPage = i; loadMovies(); window.scrollTo(0,0); };
        paginationContainer.appendChild(btn);
    }
}

function loadMovies() {
    let url = currentSearchTerm 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${currentSearchTerm}&language=tr-TR`
        : `${BASE_URL}/movie/${currentType}?api_key=${API_KEY}&language=tr-TR`;
    getMovies(url, currentPage);
}

catBtns.forEach(btn => {
    btn.onclick = () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        currentSearchTerm = '';
        searchInput.value = '';
        currentPage = 1;
        loadMovies();
    };
});

searchBtn.onclick = () => {
    currentSearchTerm = searchInput.value;
    if (currentSearchTerm) { currentPage = 1; loadMovies(); }
};

searchInput.onkeyup = (e) => { if (e.key === 'Enter') searchBtn.onclick(); };

backBtn.onclick = () => {
    detailView.style.display = 'none';
    mainView.style.display = 'block';
    detailContent.innerHTML = '';
};

loadMovies();