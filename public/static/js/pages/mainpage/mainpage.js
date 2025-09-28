import {apiServise} from '../../data.js'

export class MainPage{
    async render() {
            const data = await apiServise.getMainPageData();
            console.log(data.data.tracks);
            const contentTemplate = Handlebars.templates['MainPage.hbs'];
           
            const mainPageData = {
                artists: (data.data.artists || []).map(artist => ({
                    id: artist.artist_id,
                    name: artist.name,
                    image: `../../../static/img/${artist.avatar_url  || '/static/img/default-artist.png'}`
                })),
                albums: (data.data.albums || []).map(album => ({
                    id: album.album_id,
                    name: album.title,
                    image: `../../../static/img/${album.avatar_url || '/static/img/default-album.png'}`,
                    artist: album.artist.name
                })),
                tracks: (data.data.tracks || []).map(track => ({
                    id: track.track_id,
                    name: track.title,
                    image: `../../../static/img/${track.album.avatar_url }`,
                    artists: track.artists
                }))
            };
            
            document.getElementById('app').innerHTML = contentTemplate(mainPageData);
            this.sliderFunction();
    }

    sliderFunction(){
         document.querySelectorAll(".slider").forEach(slider=>{
            console.log("work");
            const slidebar = slider.querySelector(".cards");
            console.log("work");
            const leftBtn = slider.querySelector(".slide-btn.left");
            const rightBtn = slider.querySelector(".slide-btn.right");

            const scrollAmount = 352;

            rightBtn.addEventListener("click", () => {
                slidebar.scrollLeft += scrollAmount;
                console.log("hi");
            });

            leftBtn.addEventListener("click", () => {
                slidebar.scrollLeft -= scrollAmount;
            });
        });
    }

}




