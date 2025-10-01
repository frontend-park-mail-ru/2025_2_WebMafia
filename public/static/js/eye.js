export function InitPasswordShowing() {
    document.querySelectorAll(".eye").forEach(btn => {
        const input = btn.previousElementSibling;

        btn.addEventListener("click", () => {
            if (input.type === "password") {
                input.type = "text";
                btn.querySelector(".eye-open").style.display = "none";
                btn.querySelector(".eye-closed").style.display = "block";
            } else {
                input.type = "password";
                btn.querySelector(".eye-closed").style.display = "none";
                btn.querySelector(".eye-open").style.display = "block";
            }
        });
    });
}