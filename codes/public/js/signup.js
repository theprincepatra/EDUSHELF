const nameInput = document.querySelector('input[name="name"]');
const usernameInput = document.querySelector('input[name="username"]');
const emailInput = document.querySelector('input[name="email"]');
const otpInput = document.querySelector('input[name="otp"]');
const passwordInput = document.querySelector('input[name="password"]');
const confirmPasswordInput = document.querySelector('input[name="confirmPassword"]');
const otpButton = document.querySelector('.otp-btn');
const createbutton = document.querySelector(".create-btn");
const signinbutton = document.querySelector(".signin-btn");

const errors = document.querySelectorAll(".error");

// Clear all errors
function clearErrors() {
    errors.forEach(error => error.innerText = "");
    document.querySelectorAll("input").forEach(input => {
        input.style.border = "1px solid rgba(255,255,255,0.2)";
    });
}

// Show error message
function showError(input, message) {
    const parent = input.parentElement;
    const error = parent.querySelector(".error");

    if (error) {
        error.innerText = message;
        error.style.color = "#ff362c";
    }

    input.style.border = "1px solid #ff362c";
}

// Email validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// OTP Button click
otpButton.addEventListener("click", async () => {
    clearErrors();

    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
        showError(emailInput, "Enter valid email");
        return;
    }

    try {
        const res = await fetch("/send-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await res.text();
        if (!res.ok) {
            showError(emailInput, data || "Failed to send OTP");
            return;
        }

        alert(data);
        otpButton.disabled = true;
    } catch (err) {
        showError(emailInput, "Failed to send OTP");
    }
});

const form = document.querySelector('form');
form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearErrors();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const username = usernameInput.value.trim();
        const otp = otpInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;

    if (name === "") {
        showError(nameInput, "Name should not be empty");
        isValid = false;
    } else if (/\d/.test(name)) {
        showError(nameInput, "Name should not contain numbers");
        isValid = false;
    }
    if (username === "") {
        showError(usernameInput, "Username should not be empty");
        isValid = false;
    } else if (username.length < 4) {
        showError(usernameInput, "Username too short");
        isValid = false;
    }
    if (!isValidEmail(email)) {
        showError(emailInput, "Enter valid email");
        isValid = false;
    }
    if (otp.length !== 6) {
        showError(otpInput, "Enter valid 6-digit OTP");
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

    try {
        const res = await fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, username, email, password, otp })
    });

        const data = await res.text();
        if (!res.ok) {
            alert(data || 'Signup failed');
            return;
        }

        alert('Account created successfully ✅');
        setTimeout(() => {
            window.location.href = '/login';
        }, 1000);
    } catch (err) {
        alert('Failed to create account');
    }
});

// signinbutton untouched
signinbutton.addEventListener("click", function () {
    setTimeout(() => {
        window.location.href = "/login";
    }, 100);
});