const fileInput = document.getElementById("profilepicture");
const preview = document.getElementById("profilePreview");

if (fileInput && preview) {
    fileInput.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];
        if (!allowedTypes.includes(file.type)) {
            alert("Please select JPG, JPEG, PNG or WEBP image.");
            this.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must be less than 5 MB.");
            this.value = "";
            return;
        }
        preview.src = URL.createObjectURL(file);
    });
}