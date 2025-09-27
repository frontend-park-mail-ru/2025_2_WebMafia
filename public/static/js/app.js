const headerTemplates = Handlebars.compile(document.getElementById('header-template').innerHTML);
const sidebarTemplate = Handlebars.compile(document.getElementById('sidebar-template').innerHTML);
const contentTemplate = Handlebars.compile(document.getElementById('content-template').innerHTML);

function loadpage(){
    const data = getPageData();
    
    document.getElementById('header-container').innerHTML = headerTemplates();
    document.getElementById('sidebar-container').innerHTML = sidebarTemplate();
    document.getElementById('content-container').innerHTML = contentTemplate(data);

    cardsSlider();
}

function cardsSlider(){
    document.querySelectorAll(".slider").forEach(slider=>{
    console.log("hi");
    const slidebar = slider.querySelector(".cards");
    console.log("hi");
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

document.addEventListener('DOMContentLoaded', loadpage);

