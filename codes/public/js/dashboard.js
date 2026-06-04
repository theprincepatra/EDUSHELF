function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector(".main");

    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-260px";
        main.classList.remove("shift");
    }
    else {
        sidebar.style.left = "0px";
        main.classList.add("shift");
    }
}

function showSection(sectionId){
    const sections = document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(sectionId).classList.add("active");
}