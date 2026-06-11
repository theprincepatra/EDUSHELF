const fileInput = document.getElementById("profilepicture");
const preview = document.getElementById("profilePreview");

if (fileInput && preview) {
    fileInput.addEventListener("change", function () {
        const file = this.files[0];

        if (file) {
            preview.src = URL.createObjectURL(file);
        }
    });
}