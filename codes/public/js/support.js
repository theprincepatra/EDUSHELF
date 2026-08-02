const input = document.getElementById("attachments");
const fileList = document.getElementById("file-list");

input.addEventListener("change", () => {

    fileList.innerHTML = "";

    const dt = new DataTransfer();

    [...input.files].forEach((file, index) => {

        dt.items.add(file);

        const div = document.createElement("div");

        div.className = "file-item";

        div.innerHTML = `
            <span>
                <i class="fa-solid fa-image"></i>
                ${file.name}
            </span>

            <i class="fa-solid fa-xmark remove-file" data-index="${index}"></i>
        `;

        fileList.appendChild(div);

    });

    input.files = dt.files;

});

fileList.addEventListener("click", e => {

    if (!e.target.classList.contains("remove-file")) return;

    const removeIndex = Number(e.target.dataset.index);

    const dt = new DataTransfer();

    [...input.files].forEach((file, index) => {

        if (index !== removeIndex) {

            dt.items.add(file);

        }

    });

    input.files = dt.files;

    input.dispatchEvent(new Event("change"));

});