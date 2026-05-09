function toggleMenu() {
    const sidebar = document.getElementById("sidebar");
    const main = document.querySelector(".main");
    
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-260px";
        main.style.marginLeft = "132px";
    }
    else {
        sidebar.style.left = "0px";
        main.style.marginLeft = "200px";
    }
}