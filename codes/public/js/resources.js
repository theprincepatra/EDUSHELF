const sidebar=document.getElementById("sidebar");
const overlay=document.getElementById("overlay");
const main=document.getElementById("main");

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

/*=========================
      CARD ANIMATION
=========================*/

const resourceCards=document.querySelectorAll(".resource-card");

const observer=new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:.15
});

resourceCards.forEach((card,index)=>{

    card.style.opacity="0";
    card.style.transform="translateY(40px)";
    card.style.transition=`all .6s ease ${index*0.08}s`;

    observer.observe(card);

});

/*=========================
      CARD CLICK EFFECT
=========================*/

resourceCards.forEach(card=>{

    card.addEventListener("mousedown",()=>{

        card.style.transform="translateY(-4px) scale(.98)";

    });

    card.addEventListener("mouseup",()=>{

        card.style.transform="";

    });

    card.addEventListener("mouseleave",()=>{

        card.style.transform="";

    });

});

/*=========================
      SHOW CLASS
=========================*/

document.querySelectorAll(".resource-card").forEach(card=>{

    card.addEventListener("transitionend",()=>{

        card.style.willChange="auto";

    });

});

document.addEventListener("DOMContentLoaded",()=>{

    resourceCards.forEach(card=>{

        card.classList.add("ready");

    });

});