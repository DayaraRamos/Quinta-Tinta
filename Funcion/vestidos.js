function toggleMobileMenu() {

    document
        .getElementById("navLinks")
        .classList
        .toggle("open");

}


function closeMobileMenu() {

    document
        .getElementById("navLinks")
        .classList
        .remove("open");

}


function contactService(service) {

    const phone = "573103492858";

    const message =
        `Hola Quinta Tinta 👋, estoy interesado/a en el servicio de: ${service}. Quisiera recibir más información y una cotización.`;

    const url =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

}