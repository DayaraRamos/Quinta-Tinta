document.addEventListener("DOMContentLoaded", () => {

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const navLinks = document.getElementById("navLinks");

    if (!hamburgerBtn || !navLinks) return;

    hamburgerBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

        const isOpen = navLinks.classList.contains("active");

        hamburgerBtn.setAttribute("aria-expanded", isOpen);

    });

});

function toggleMobileMenu() {
    const nav = document.getElementById("navLinks");

    if (!nav) return;

    nav.classList.toggle("active");
}