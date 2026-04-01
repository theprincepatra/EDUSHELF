const nameInput = document.querySelector('input[placeholder="Full Name"]');
const emailInput = document.querySelector('input[placeholder="Email"]');
const passwordInput = document.querySelector('input[placeholder="Password"]');
const confirmPasswordInput = document.querySelector('input[placeholder="Confirm Password"]');
const signupbutton = document.querySelector(".signup-btn");
const signinbutton = document.querySelector(".signin-btn");

const errors = document.querySelectorAll(".error");

// Clear all errors
function clearErrors() {
    errors.forEach(error => error.innerText = "");
    document.querySelectorAll("input").forEach(input => {
        input.style.border = "1px solid #ccc";
    });
}

// Show error under specific input
function showError(input, message) {
    const parent = input.parentElement;
    const error = parent.querySelector(".error");

    error.innerText = message;
    error.style.color = "#ff362c";

    input.style.border = "1px solid #ff362c";
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Button click
signupbutton.addEventListener("click", function () {

    clearErrors();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;

    if (name === "") {
        showError(nameInput, "Name required");
        isValid = false;
    }

    if (!isValidEmail(email)) {
        showError(emailInput, "Enter valid email");
        isValid = false;
    }

    if (password.length < 6) {
        showError(passwordInput, "Minimum 6 characters");
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError(confirmPasswordInput, "Passwords do not match");
        isValid = false;
    }

    if (!isValid) return;

    // Save (practice only)
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);

    alert("Account created successfully ✅");

    setTimeout(() => {
        window.location.href = "signin.html";
    }, 1000);
});

signinbutton.addEventListener("click", function () {
    setTimeout(() => {
        window.location.href = "signin.html";
    }, 100);
});