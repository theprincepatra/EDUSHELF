// Navbar
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
    if (window.scrollY > 80) {
        header.style.background = "rgba(5,5,5,.85)";
        header.style.borderBottom = "1px solid rgba(255,255,255,.08)";
    } else {
        header.style.background = "rgba(5,5,5,.45)";
        header.style.borderBottom = "1px solid rgba(255,255,255,.06)";
    }
});

// Platform Slider
const platformImages=document.querySelectorAll(".slides img");
let platformIndex=0;

platformImages[0].classList.add("active");

setInterval(()=>{
    platformImages[platformIndex].classList.remove("active");
    platformIndex=(platformIndex+1)%platformImages.length;
    platformImages[platformIndex].classList.add("active");
},3500);

// Feature Slider
const featureTexts = document.querySelectorAll(".feature-text");
const featureImages = document.querySelectorAll(".feature-image");
const dots = document.querySelectorAll(".dot");

let featureIndex = 0;
function featureSlider() {
    featureTexts[featureIndex].classList.remove("active");
    featureImages[featureIndex].classList.remove("active");
    dots[featureIndex].classList.remove("active");

    featureIndex++;

    if (featureIndex >= featureTexts.length) {
        featureIndex = 0;
    }

    featureTexts[featureIndex].classList.add("active");
    featureImages[featureIndex].classList.add("active");
    dots[featureIndex].classList.add("active");

}

setInterval(featureSlider, 4000);

// FAQ

const faq = document.querySelectorAll(".faq-item");

faq.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        faq.forEach(f => {

            if (f !== item) {
                f.classList.remove("active");
            }

        });

        item.classList.toggle("active");

    });

});

// Counter

const counters = document.querySelectorAll(".stat h2");

let counted = false;

window.addEventListener("scroll", () => {

    const stats = document.querySelector(".stats");

    if (!stats) return;

    const top = stats.offsetTop - window.innerHeight + 100;

    if (window.scrollY > top && !counted) {

        counted = true;

        counters.forEach(counter => {

            const text = counter.innerText;
            const target = parseInt(text);

            if (isNaN(target)) return;

            let count = 0;

            const speed = Math.ceil(target / 50);

            const update = () => {

                count += speed;

                if (count >= target) {
                    counter.innerText = text;
                } else {
                    counter.innerText = count + "+";
                    requestAnimationFrame(update);
                }

            };

            update();

        });

    }

});

// Scroll Reveal

const reveal = document.querySelectorAll("section");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: .2
});

reveal.forEach(section => {

    section.classList.add("hidden");

    observer.observe(section);

});

// Back To Top

const topBtn = document.querySelector(".top-btn");

topBtn.addEventListener("click", e => {

    e.preventDefault();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

// Active Nav

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const top = section.offsetTop - 120;

        if (scrollY >= top) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }

    });

});