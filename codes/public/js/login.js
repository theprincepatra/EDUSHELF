// Eye Icon Toggle-----------------------------------------
function togglePassword() {
    const password = document.getElementById("password");
    const eye = document.querySelector(".eye-icon");

    if (password.type === "password") {
        password.type = "text";
        eye.src = "/images/eye-open.png";
    } else {
        password.type = "password";
        eye.src = "/images/eye-closed.png";
    }
}

// Form Validation------------------------------------------
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

// Clear error messages and reset it
function clearErrors() {
    emailError.innerText = "";
    passwordError.innerText = "";

    emailInput.style.border = "";
    passwordInput.style.border = "";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    let valid = true;
    if (email === "") {
        emailError.innerText = "Email is required";
        valid = false;
    }
    if (password === "") {
        passwordError.innerText = "Password is required";
        valid = false;
    }
    if (!valid) return;

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.text();
        if (!res.ok) {
            if (data === "User not found") {
                emailError.innerText = data;
            } else if (data === "Invalid password") {
                passwordError.innerText = data;
            }
            return;
        }
        window.location.href = data;
    } catch (err) {
        alert("Server Error");
    }
});