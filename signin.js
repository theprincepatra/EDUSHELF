function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    let emailError = document.getElementById("emailError");
    let passwordError = document.getElementById("passwordError");

    // Reset errors
    emailError.innerText = "";
    passwordError.innerText = "";

    let storedEmail = "prtshsnpt@gmail.com";
    let storedPassword = "720506";

    // Validation
    if (email === "") {
        emailError.innerText = "Email is required";
        return;
    }

    if (password === "") {
        passwordError.innerText = "Password is required";
        return;
    }

    if (email !== storedEmail) {
        emailError.innerText = "Email not found";
        return;
    }

    if (password !== storedPassword) {
        passwordError.innerText = "Incorrect password";
        return;
    }

    alert("Login Successful ✅");
    window.location.href = "d.html";

}

const signupbutton = document.querySelector(".signup");
signupbutton.addEventListener("click", function () {
        window.location.href = "signup.html";
});