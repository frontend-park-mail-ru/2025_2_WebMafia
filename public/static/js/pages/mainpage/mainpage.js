import { apiServise } from '../../data.js';
import { Router } from '../../routing.js';

export class MainPage {
    async render() {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        if (!isAuthenticated) {
            new Router().navigate('/login');
            return;
        }

        
        let pageData = {
            isAuthenticated: true,
            artists: [],
            albums: [],
            tracks: []
        };

        try {
            const data = await apiServise.getMainPageData();
            pageData.artists = (data.artists || []).map(artist => ({
                id: artist.artist_id,
                name: artist.name,
                image: `static/img/${artist.avatar_url || 'default-artist.png'}`
            }));
            pageData.albums = (data.albums || []).map(album => ({
                id: album.album_id,
                name: album.title,
                image: `static/img/${album.avatar_url || 'default-album.png'}`,
                artist: album.artist ? album.artist.name : 'Unknown Artist'
            }));
            pageData.tracks = (data.tracks || []).map(track => ({
                id: track.track_id,
                name: track.title,
                image: `static/img/${track.album.avatar_url || 'default-album.png'}`,
                artists: track.artists
            }));
        } catch (error) {
            console.error('Failed to load main page data:', error.message);
            localStorage.removeItem('isAuthenticated');
            new Router().navigate('/login');
            return;
        }
        
        const contentTemplate = Handlebars.templates['MainPage.hbs'];
        document.getElementById('app').innerHTML = contentTemplate(pageData);

        this.addEventListeners();
        this.sliderFunction();
    }
    
    addEventListeners() {
        const logoutButton = document.getElementById('logoutBtn');
        if (logoutButton) {
            logoutButton.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await apiServise.logoutUser();
                } catch (error) {
                    console.error('Logout request failed:', error.message);
                } finally {
                    localStorage.removeItem('isAuthenticated');
                    new Router().navigate('/login');
                }
            });
        }
    }

    sliderFunction() {
        document.querySelectorAll(".slider").forEach(slider => {
            const slidebar = slider.querySelector(".cards");
            const leftBtn = slider.querySelector(".slide-btn.left");
            const rightBtn = slider.querySelector(".slide-btn.right");
            if (!slidebar || !leftBtn || !rightBtn) return;
            const scrollAmount = 352;
            rightBtn.addEventListener("click", () => { slidebar.scrollLeft += scrollAmount; });
            leftBtn.addEventListener("click", () => { slidebar.scrollLeft -= scrollAmount; });
        });
    }
}