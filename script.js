// =========================
// CloudVault Script
// =========================

// Show selected file name
const fileInput = document.getElementById("fileUpload");

if (fileInput) {
    fileInput.addEventListener("change", function () {

        const file = this.files[0];

        if (file) {
            alert(`Selected File: ${file.name}`);
        }

    });
}

// Upload button

const uploadBtn = document.querySelector(".upload-btn");
if (uploadBtn) {

    uploadBtn.addEventListener("click", async function () {

        if (!fileInput || fileInput.files.length === 0) {
            alert("Please select a file first.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try {

            const response = await fetch(
    "http://13.203.208.72:3000/api/files/upload",
    {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("File Uploaded Successfully!");
                loadFiles();

            } else {

                alert(data.message);

            }


        } catch (error) {

            console.error(error);
            alert("Upload Failed!");

        }

    });

}

// Logout button


// Delete buttons
const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach(button => {

    button.addEventListener("click", function () {

        const confirmDelete = confirm(
            "Are you sure you want to delete this file?"
        );

        if (confirmDelete) {

            const row = this.closest("tr");

            if (row) {
                row.remove();
            }

            alert("File removed from dashboard.");
        }

    });

});

// Download buttons
const downloadButtons = document.querySelectorAll(".download-btn");

downloadButtons.forEach(button => {

    button.addEventListener("click", function () {

        alert(
            "Download functionality will be connected with AWS S3 later."
        );

    });

});

// Register Form Validation
// Register Form
const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const fullname = document.getElementById("fullname").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {

            const response = await fetch(
    "http://13.203.208.72:3000/api/auth/register",
    {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullname,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("JAY TEST 123");

                window.location.href = "login.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            alert("Backend connection failed!");

            console.error(error);

        }

    });

}
// Login Form
const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(e) {

        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {

            const response = await fetch(
    "http://13.203.208.72:3000/api/auth/login",
    {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem("token", data.token);

                alert("Login Successful!");

                window.location.href = "dashboard.html";

            } else {

                alert(data.message);

            }

        } catch (error) {

            alert("Backend connection failed!");

            console.error(error);

        }

    });

}
const filesTableBody = document.getElementById("filesTableBody");

async function loadFiles() {

    if (!filesTableBody) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
    "http://13.203.208.72:3000/api/files",
    {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const files = await response.json();

        filesTableBody.innerHTML = "";
        let totalSize = 0;
        files.forEach(file => {
            totalSize += file.size;

            const ext =
                file.originalName.split(".").pop().toUpperCase();

            const row = `
                <tr>
                    <td>${file.originalName}</td>
                    <td>${ext}</td>
                    <td>${(file.size / 1024).toFixed(2)} KB</td>
                    <td>${new Date(file.uploadedAt).toLocaleDateString()}</td>
                    <td>
                        <div class="action-buttons">

                            <button
                                class="download-btn"
                                onclick="downloadFile('${file.id}')">
                                Download
                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteFile('${file.id}')">
                                Delete
                            </button>

                        </div>
                    </td>
                </tr>
            `;

            filesTableBody.innerHTML += row;

        });
        const usedMB = (totalSize / (1024 * 1024)).toFixed(2);

const storageUsage =
    document.getElementById("storageUsage");

const storageProgress =
    document.getElementById("storageProgress");

if (storageUsage) {

    storageUsage.textContent =
        `${usedMB} MB of 1 GB Used`;

}

if (storageProgress) {

    const percentage =
        (usedMB / 1024) * 100;

    storageProgress.style.width =
        `${percentage}%`;

}

    } catch (error) {

        console.error(error);

    }

}
async function downloadFile(fileId) {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    try {

        const response = await fetch(
            `http://13.203.208.72:3000/api/files/${fileId}/download`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const data = await response.json();
            alert(data.message || "Download Failed!");
            return;
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "downloaded-file";

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(url);

    } catch (error) {

        console.error("Download Error:", error);
        alert("Download Failed!");

    }
}
async function deleteFile(fileId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this file?"
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
    `http://13.203.208.72:3000/api/files/${fileId}`,
    {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
);

        const data = await response.json();

        if (response.ok) {

            alert("File Deleted Successfully!");
            loadFiles();

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);
        alert("Delete Failed!");

    }

}
loadFiles();

// logout button
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function() {

        localStorage.removeItem("token");

        alert("Logged Out Successfully!");

        window.location.href = "login.html";

    });

} 