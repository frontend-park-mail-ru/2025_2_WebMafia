document.querySelectorAll(".slider").forEach(slider=>{
    const slidebar = slider.querySelector(".cards");
    const left_btn = slider.querySelector(".slide-btn.left");
    const right_btn = slider.querySelector(".slide-btn.right");

    scrollAmount = 250;

    right_btn.addEventListener("click", () => {
        slidebar.scrollLeft += scrollAmount;
    });

    left_btn.addEventListener("click", () => {
        slidebar.scrollLeft -= scrollAmount;
    });
});