export function showInfoMessage(text: string) {
  const msg = document.createElement("div");
  msg.className = "inform-message";
  msg.textContent = text;

  document.body.appendChild(msg);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      msg.classList.add("visible");
    });
  });

  setTimeout(() => {
    msg.classList.remove("visible");
    msg.addEventListener("transitionend", () => msg.remove());
  }, 4000);
}