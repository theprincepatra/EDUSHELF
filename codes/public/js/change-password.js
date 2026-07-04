const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const changePasswordBtn = document.getElementById("changePassword");

const messageBox = document.getElementById("messageBox");
const passwordError = document.getElementById("passwordError");

const toggleIcons = document.querySelectorAll(".toggle");

changePasswordBtn.addEventListener("click", changePassword);

toggleIcons.forEach(icon => {
    icon.addEventListener("click", function () {
        const input = this.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            this.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            this.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
});

async function changePassword(e) {
    e.preventDefault();

    passwordError.style.display = "none";
    passwordError.innerText = "";

    const current = currentPassword.value.trim();
    const password = newPassword.value.trim();
    const confirm = confirmPassword.value.trim();

    if (current === "") {
        showMessage("Enter your current password.", "error");
        return;
    }

    if (password.length < 8) {
        passwordError.style.display = "block";
        passwordError.innerText = "Password must be at least 8 characters.";
        return;
    }

    if (password === current) {
        passwordError.style.display = "block";
        passwordError.innerText = "New password cannot be the same as current password.";
        return;
    }

    if (password !== confirm) {
        passwordError.style.display = "block";
        passwordError.innerText = "Passwords do not match.";
        return;
    }

    try {

        const response = await fetch("/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                currentPassword: current,
                newPassword: password
            })
        });

        const result = await response.json();

        showMessage(result.message, result.success ? "success" : "error");

        if (result.success) {

            currentPassword.value = "";
            newPassword.value = "";
            confirmPassword.value = "";

            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);

        }

    } catch (err) {
        console.log(err);
        showMessage("Server Error", "error");
    }

}

function showMessage(message, type) {
    messageBox.innerText = message;
    messageBox.className = "message-box";
    messageBox.style.display = "block";

    if (type === "success") {
        messageBox.classList.add("message-success");
    } else {
        messageBox.classList.add("message-error");
    }

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}