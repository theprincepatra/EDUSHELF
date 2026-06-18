const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const main = document.getElementById("main");

function toggleSidebar(){

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    if(window.innerWidth > 768){
        main.classList.toggle("shift");
    }

}

overlay.addEventListener("click", () => {

    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    main.classList.remove("shift");

});

window.addEventListener("resize", () => {

    if(window.innerWidth <= 768){
        main.classList.remove("shift");
    }

});

document.addEventListener("keydown", (e) => {

    if(e.key === "Escape"){

        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        main.classList.remove("shift");

    }

});