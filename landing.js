const loginBtn = document.querySelector(".login");
const signupBtn = document.querySelector(".signup");

loginBtn.addEventListener("click", function () {
        window.location.href = "signin.html";
});

signupBtn.addEventListener("click", function () {
        window.location.href = "signup.html";
});
// This code adds event listeners to the login and signup buttons on the landing page. When the login button is clicked, it redirects the user to the "signin.html" page, and when the signup button is clicked, it redirects the user to the "signup.html" page.