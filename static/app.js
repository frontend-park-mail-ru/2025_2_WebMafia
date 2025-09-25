document.querySelectorAll(".slider").forEach(slider=>{
    let slidebar = slider.querySelector(".cards");
    let leftBtn = slider.querySelector(".slide-btn.left");
    let rightBtn = slider.querySelector(".slide-btn.right");

    let scrollAmount = 350;

    rightBtn.addEventListener("click", () => {
        slidebar.scrollLeft += scrollAmount;
    });

    leftBtn.addEventListener("click", () => {
        slidebar.scrollLeft -= scrollAmount;
    });
});