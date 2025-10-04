export function InitPasswordShowing() {
    document.querySelectorAll(".eye").forEach(btn => {
        const input = btn.previousElementSibling;

        const eyeOpen = btn.querySelector(".eye-open")
        const eyeClosed = eyeOpen.nextElementSibling

        btn.addEventListener("click", () => {
            if (input.type === "password") {
                input.type = "text";
                eyeOpen.style.display = "none";
                eyeClosed.style.display = "block";
            } else {
                input.type = "password";
                eyeClosed.style.display = "none";
                eyeOpen.style.display = "block";
            }
        });
    });
}