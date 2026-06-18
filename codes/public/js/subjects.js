const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const main = document.getElementById("main");
const menuBtn = document.querySelector(".menu-btn");

function toggleSidebar(){

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");

    if(window.innerWidth > 768){
        main.classList.toggle("shift");
    }

}

function closeSidebar(){

    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    main.classList.remove("shift");

}

overlay.addEventListener("click", closeSidebar);

document.addEventListener("keydown", function(e){

    if(e.key === "Escape"){
        closeSidebar();
    }

});

window.addEventListener("resize", function(){

    if(window.innerWidth <= 768){

        main.classList.remove("shift");

    }else{

        if(sidebar.classList.contains("active")){
            main.classList.add("shift");
        }

    }

});

document.addEventListener("click", function(e){

    if(window.innerWidth > 768) return;

    if(
        sidebar.classList.contains("active") &&
        !sidebar.contains(e.target) &&
        !menuBtn.contains(e.target)
    ){
        closeSidebar();
    }

});