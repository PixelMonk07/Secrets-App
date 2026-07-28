document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");
    const modal = document.getElementById("logoutModal");

    const closeBtn = document.getElementById("closeLogout");
    const cancelBtn = document.getElementById("cancelLogout");
    const confirmBtn = document.getElementById("confirmLogout");

    if (!logoutBtn || !modal) return;

    function closeModal() {
        modal.classList.remove("active");
    }

    logoutBtn.addEventListener("click", () => {
        modal.classList.add("active");
    });

    closeBtn.addEventListener("click", closeModal);

    cancelBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {

            closeModal();

        }

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeModal();

        }

    });

    confirmBtn.addEventListener("click", () => {

        window.location.href = "/logout";

    });

});