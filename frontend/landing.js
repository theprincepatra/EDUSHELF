const loginBtn = document.querySelector(".login");
const signupBtn = document.querySelector(".signup");

loginBtn.addEventListener("click", function () {
        window.location.href = "signin.html";
});

signupBtn.addEventListener("click", function () {
        window.location.href = "signup.html";
});