const sidebar=document.getElementById("sidebar");
const overlay=document.getElementById("overlay");
const main=document.getElementById("main");
const menuBtn=document.querySelector(".menu-btn");

const resourceCards=document.querySelectorAll(".resource-card");

function toggleSidebar(){
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    if(window.innerWidth>768){
        main.classList.toggle("shift");
    }
}
function closeSidebar(){
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    main.classList.remove("shift");
}

overlay.addEventListener("click",closeSidebar);
document.addEventListener("keydown",function(e){
    if(e.key==="Escape"){
        closeSidebar();
    }
});

window.addEventListener("resize",function(){
    if(window.innerWidth<=768){
        main.classList.remove("shift");
    }else{
        if(sidebar.classList.contains("active")){
            main.classList.add("shift");
        }
    }
});

/* Card Animation */

resourceCards.forEach((card,index)=>{

    card.style.opacity="0";
    card.style.transform="translateY(35px)";

    setTimeout(()=>{
        card.style.transition="all .45s ease";
        card.style.opacity="1";
        card.style.transform="translateY(0)";
    },index*120);
});

/*  Hover Effect */

resourceCards.forEach(card=>{
    card.addEventListener("mouseenter",()=>{
        card.style.boxShadow="0 22px 45px rgba(0,0,0,.40)";
    });
    card.addEventListener("mouseleave",()=>{
        card.style.boxShadow="0 12px 30px rgba(0,0,0,.30)";
    });
});

/* Ripple Effect */

resourceCards.forEach(card=>{

    card.addEventListener("click",function(e){

        const ripple=document.createElement("span");

        const diameter=Math.max(card.clientWidth,card.clientHeight);

        ripple.style.width=diameter+"px";
        ripple.style.height=diameter+"px";

        ripple.style.left=(e.clientX-card.getBoundingClientRect().left-diameter/2)+"px";
        ripple.style.top=(e.clientY-card.getBoundingClientRect().top-diameter/2)+"px";

        ripple.classList.add("ripple");

        const oldRipple=card.querySelector(".ripple");

        if(oldRipple){
            oldRipple.remove();
        }

        card.appendChild(ripple);

    });

});