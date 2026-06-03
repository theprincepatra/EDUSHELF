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