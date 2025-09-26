document.querySelectorAll(".slider").forEach(slider=>{
    const slidebar = slider.querySelector(".cards");
    const leftBtn = slider.querySelector(".slide-btn.left");
    const rightBtn = slider.querySelector(".slide-btn.right");

    const scrollAmount = 350;

    rightBtn.addEventListener("click", () => {
        slidebar.scrollLeft += scrollAmount;
    });

    leftBtn.addEventListener("click", () => {
        slidebar.scrollLeft -= scrollAmount;
    });
});