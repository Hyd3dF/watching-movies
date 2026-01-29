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
                    <span class="rating-badge">★ ${vote_average.toFixed(1)}</span>
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

        // Simulation for external players
        const player1Url = `https://vidsrc.me/embed/movie?tmdb=${id}`;
        const player2Url = `https://embed.su/embed/movie/${id}`;

        detailContent.innerHTML = `
            <div class="hero-backdrop" style="background-image: url('${ORIG_URL + details.backdrop_path}')"></div>
            <div class="detail-body container">
                <div class="main-info">
                    <img src="${IMG_URL + details.poster_path}" class="poster-small">
                    <div class="title-info">
                        <h2>${details.title}</h2>
                        <div class="tags">
                            <span class="tag">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color:var(--accent-color)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <b>${details.vote_average.toFixed(1)}</b> / 10
                            </span>
                            <span class="tag">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                ${details.runtime} dk
                            </span>
                            <span class="tag">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                ${details.release_date.split('-')[0]}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="player-section">
                    <div class="player-tabs">
                        <button class="tab-btn active" onclick="switchPlayer(this, '${player1Url}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Sunucu 1
                        </button>
                        <button class="tab-btn" onclick="switchPlayer(this, '${player2Url}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            Sunucu 2
                        </button>
                    </div>
                    <div class="player-container">
                        <iframe id="moviePlayer" src="${player1Url}" allowfullscreen></iframe>
                    </div>
                </div>

                <div class="overview-section">
                    <h3 class="section-title">Film Özeti</h3>
                    <p class="overview-text">${details.overview || 'Bu film için henüz bir özet bulunmuyor.'}</p>
                </div>

                ${trailers.length > 0 ? `
                    <div class="video-section">
                        <h3 class="section-title">Resmi Fragmanlar</h3>
                        <div class="video-scroll">
                            ${trailers.map(v => `
                                <div class="video-card">
                                    <iframe src="https://www.youtube.com/embed/${v.key}" allowfullscreen></iframe>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="cast-section">
                    <h3 class="section-title">Oyuncu Kadrosu</h3>
                    <div class="cast-scroll">
                        ${cast.map(c => `
                            <div class="cast-card">
                                <img src="${c.profile_path ? IMG_URL + c.profile_path : 'https://via.placeholder.com/150x150?text=👤'}" alt="${c.name}">
                                <p>${c.name}</p>
                                <span>${c.character}</span>
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

window.switchPlayer = (btn, url) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('moviePlayer').src = url;
};

function setupPagination(totalPages) {
    paginationContainer.innerHTML = '';
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous Button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
        prevBtn.onclick = () => { currentPage--; loadMovies(); window.scrollTo(0,0); };
        paginationContainer.appendChild(prevBtn);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = i === currentPage ? 'active' : '';
        btn.onclick = () => { currentPage = i; loadMovies(); window.scrollTo(0,0); };
        paginationContainer.appendChild(btn);
    }

    // Next Button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        nextBtn.onclick = () => { currentPage++; loadMovies(); window.scrollTo(0,0); };
        paginationContainer.appendChild(nextBtn);
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

const searchWrapper = document.getElementById('searchWrapper');
const searchToggle = document.getElementById('searchToggle');

searchToggle.onclick = () => {
    searchWrapper.classList.toggle('active');
    if (searchWrapper.classList.contains('active')) {
        searchInput.focus();
    }
};

searchBtn.onclick = () => {
    currentSearchTerm = searchInput.value;
    if (currentSearchTerm) { 
        currentPage = 1; 
        loadMovies();
        // Close search on mobile after searching
        if (window.innerWidth < 768) {
            searchWrapper.classList.remove('active');
        }
    }
};

searchInput.onkeyup = (e) => { if (e.key === 'Enter') searchBtn.onclick(); };

backBtn.onclick = () => {
    detailView.style.display = 'none';
    mainView.style.display = 'block';
    detailContent.innerHTML = '';
};

loadMovies();