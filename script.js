/**
 * CineSearch Pro Logic
 * Ditulis oleh Muhammad Anhaar Solihin
 */

let wishlist = JSON.parse(localStorage.getItem('movieWishlist')) || [];

$(document).ready(function() {
    updateWishlistUI();
    
    // Pencarian default
    getMovies('Avengers');

    // Toggle Dark Mode
    $('#darkModeToggle').on('click', function() {
        const currentTheme = $('body').attr('data-bs-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        $('body').attr('data-bs-theme', newTheme);
        $(this).html(newTheme === 'light' ? '<i class="bi bi-moon-stars-fill"></i>' : '<i class="bi bi-sun-fill"></i>');
    });

    // Event Pencarian
    $('.search-button').on('click', () => triggerSearch());
    $('.input-keyword').on('keyup', (e) => { if (e.which === 13) triggerSearch(); });

    // Fitur Voice Search
    $('.voice-button').on('click', function() {
        startVoiceSearch();
    });

    // Lihat Wishlist
    $('#viewWishlist').on('click', function() {
        showWishlist();
    });
});

function triggerSearch() {
    const keyword = $('.input-keyword').val();
    const type = $('.filter-type').val();
    if (keyword) getMovies(keyword, type);
}

function getMovies(keyword, type = '') {
    $('#result-title').text(`Hasil untuk: ${keyword}`);
    $('.movie-container').html('');
    $('.spinner-container').show();

    $.ajax({
        url: `https://www.omdbapi.com/?apikey=3809ece7&s=${keyword}&type=${type}`,
        success: result => {
            $('.spinner-container').hide();
            if (result.Response === "True") {
                renderCards(result.Search);
            } else {
                renderError(result.Error);
            }
        }
    });
}

function renderCards(movies) {
    let cards = '';
    movies.forEach(m => {
        const poster = m.Poster !== 'N/A' ? m.Poster : 'https://via.placeholder.com/400x600?text=No+Poster';
        const isFav = wishlist.some(fav => fav.imdbID === m.imdbID);
        
        cards += `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0 position-relative">
                    <div class="wishlist-badge shadow-sm add-wishlist" data-movie='${JSON.stringify(m).replace(/'/g, "&apos;")}'>
                        <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </div>
                    <img src="${poster}" class="card-img-top" alt="${m.Title}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-primary-subtle text-primary mb-2 align-self-start text-uppercase" style="font-size:0.7rem">${m.Type}</span>
                        <h6 class="card-title fw-bold text-truncate mb-1">${m.Title}</h6>
                        <p class="small text-muted mb-3">${m.Year}</p>
                        <button class="btn btn-primary btn-sm mt-auto btn-round modal-detail-button" 
                                data-bs-toggle="modal" 
                                data-bs-target="#moviedetailModal" 
                                data-imdbid="${m.imdbID}">
                            Detail Film
                        </button>
                    </div>
                </div>
            </div>`;
    });
    $('.movie-container').html(cards);
}

// Fitur Voice Search
function startVoiceSearch() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'id-ID';
    
    recognition.onstart = () => {
        $('.voice-button').addClass('btn-danger text-white').html('<i class="bi bi-record-fill animate-pulse"></i>');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        $('.input-keyword').val(transcript);
        $('.voice-button').removeClass('btn-danger text-white').html('<i class="bi bi-mic-fill"></i>');
        triggerSearch();
    };

    recognition.onerror = () => {
        $('.voice-button').removeClass('btn-danger text-white').html('<i class="bi bi-mic-fill"></i>');
    };

    recognition.start();
}

// Logic Wishlist
$(document).on('click', '.add-wishlist', function() {
    const movieData = $(this).data('movie');
    const index = wishlist.findIndex(m => m.imdbID === movieData.imdbID);

    if (index === -1) {
        wishlist.push(movieData);
        $(this).find('i').removeClass('bi-heart').addClass('bi-heart-fill');
    } else {
        wishlist.splice(index, 1);
        $(this).find('i').removeClass('bi-heart-fill').addClass('bi-heart');
    }

    localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
    updateWishlistUI();
});

function updateWishlistUI() {
    $('#wishlist-count').text(wishlist.length);
}

function showWishlist() {
    if (wishlist.length === 0) {
        alert('Wishlist Anda masih kosong!');
        return;
    }
    $('#result-title').text('Koleksi Favorit Anda');
    renderCards(wishlist);
}

// Detail Film & Rekomendasi
$(document).on('click', '.modal-detail-button', function() {
    const imdbid = $(this).data('imdbid');
    $('.modal-body').html('<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>');

    $.ajax({
        url: `https://www.omdbapi.com/?apikey=3809ece7&i=${imdbid}`,
        success: m => {
            const movieDetail = `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-md-4 mb-4 text-center">
                            <img src="${m.Poster}" class="img-fluid rounded-4 shadow">
                        </div>
                        <div class="col-md-8">
                            <h3 class="fw-bold mb-1">${m.Title}</h3>
                            <p class="text-muted mb-3">${m.Year} • ${m.Genre} • <span class="text-warning">⭐ ${m.imdbRating}</span></p>
                            
                            <div class="card bg-light border-0 p-3 mb-3 text-dark">
                                <strong>Sinopsis:</strong>
                                <small>${m.Plot}</small>
                            </div>

                            <div class="row g-2 mb-4">
                                <div class="col-6"><small class="text-muted d-block">Sutradara</small> <strong>${m.Director}</strong></div>
                                <div class="col-6"><small class="text-muted d-block">Penulis</small> <strong>${m.Writer}</strong></div>
                            </div>

                            <!-- Smart AI Suggestion Section -->
                            <div class="p-3 rounded-4" style="background-color: #eef2ff; border: 1px dashed #6366f1;">
                                <h6 class="text-indigo-900 fw-bold mb-1"><i class="bi bi-magic"></i> Analisis AI</h6>
                                <p class="small text-muted mb-0">
                                    Film ini memiliki vibe <strong>${m.Genre.split(',')[0]}</strong> yang kuat. Jika Anda menyukai akting <strong>${m.Actors.split(',')[0]}</strong>, 
                                    kami merekomendasikan untuk mengeksplorasi kategori <em>${m.Type}</em> serupa di tahun ${m.Year}.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>`;
            $('.modal-body').html(movieDetail);
        }
    });
});

function renderError(msg) {
    $('.movie-container').html(`
        <div class="col-12 text-center py-5">
            <i class="bi bi-exclamation-circle display-1 text-muted"></i>
            <h4 class="mt-3 text-muted">${msg}</h4>
            <p>Coba kata kunci lain atau periksa filter Anda.</p>
        </div>
    `);
}