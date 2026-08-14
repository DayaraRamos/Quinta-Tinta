document.addEventListener("DOMContentLoaded", () => {

    const mapElement = document.getElementById("map");

    if (!mapElement) return;

    // Coordenadas del punto de Quinta Tinta
    const quintaTinta = [4.7076, -74.2301];

    // Crear mapa
    const map = L.map("map", {
        scrollWheelZoom: false
    }).setView(quintaTinta, 17);

    // Mapa base OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

        attribution: "&copy; OpenStreetMap contributors",

        maxZoom: 19

    }).addTo(map);


    // Marcador
    const marker = L.marker(quintaTinta).addTo(map);


    // Información del punto
    marker.bindPopup(`
        <strong>Quinta Tinta</strong><br>
        Cra. 3 #2-57<br>
        Mosquera, Cundinamarca
    `).openPopup();


    // Corregir el tamaño del mapa después de cargar
    setTimeout(() => {
        map.invalidateSize();
    }, 300);

});