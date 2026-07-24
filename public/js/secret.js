document.addEventListener("DOMContentLoaded", () => {

    /* ============================================
       DELETE MODAL
    ============================================ */

    const deleteModal = document.getElementById("deleteModal");
    const deleteCloseBtn = document.getElementById("closeDelete");
    const deleteCancelBtn = document.getElementById("cancelDelete");
    const deleteConfirmBtn = document.getElementById("confirmDelete");

    let deleteSecretId = null;


    /* ============================================
       EDIT MODAL
    ============================================ */

    const editOverlay = document.getElementById("editOverlay");
    const editCloseBtn = document.getElementById("closeEdit");
    const editCancelBtn = document.getElementById("cancelEdit");
    const editForm = document.getElementById("editForm");
    const editTextarea = document.getElementById("editSecret");
    const editSecretId = document.getElementById("secretId");
    const saveEditBtn = document.getElementById("saveEdit");

    /* ============================================
       SINGLE CLICK LISTENER
    ============================================ */

    document.addEventListener("click", async (event) => {

        /* =========================
           LIKE BUTTON
        ========================= */

        const likeBtn = event.target.closest(".react-btn");

        if (likeBtn) {

            event.preventDefault();

            likeBtn.disabled = true;

            const secretId = likeBtn.dataset.secretId;

            const icon = likeBtn.querySelector("i");

            const count = likeBtn.querySelector(".like-count");

            try {

                const response = await fetch(`/like/${secretId}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    }
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message);
                }

                likeBtn.classList.toggle("liked", data.liked);

                icon.classList.toggle("fas", data.liked);
                icon.classList.toggle("far", !data.liked);

                count.textContent = data.likeCount;

            } catch (err) {

                console.error(err);

            } finally {

                likeBtn.disabled = false;

            }

            return;

        }


        /* =========================
           DELETE BUTTON
        ========================= */

        const deleteBtn = event.target.closest(".delete-btn");

        if (deleteBtn) {

            event.preventDefault();

            deleteSecretId = deleteBtn.dataset.secretId;

            deleteModal.classList.add("active");

            return;

        }


        /* =========================
           EDIT BUTTON
        ========================= */

        const editBtn = event.target.closest(".edit-btn");

        if (editBtn) {

            event.preventDefault();

            editOverlay.classList.add("active");

            editTextarea.value = editBtn.dataset.secret;

            editSecretId.value = editBtn.dataset.id;

            editTextarea.focus();

            return;

        }

    });


    /* ============================================
       DELETE MODAL EVENTS
    ============================================ */

    document.addEventListener("click", (e) => {

        const menuButton = e.target.closest(".menu-btn");

        if (menuButton) {

            const owner = menuButton.closest(".owner-actions");

            document.querySelectorAll(".owner-actions")
                .forEach(item => {

                    if (item !== owner) {

                        item.classList.remove("open");

                    }

                });

            owner.classList.toggle("open");

            return;

        }

        document.querySelectorAll(".owner-actions")
            .forEach(item => item.classList.remove("open"));

    });

    if (deleteModal) {

        if (deleteCloseBtn) {
            deleteCloseBtn.addEventListener("click", closeDeleteModal);
        }

        if (deleteCancelBtn) {
            deleteCancelBtn.addEventListener("click", closeDeleteModal);
        }

        deleteModal.addEventListener("click", (e) => {

            if (e.target === deleteModal) {

                closeDeleteModal();

            }

        });

    }


    function closeDeleteModal() {

        deleteModal.classList.remove("active");

        deleteSecretId = null;

    }


    if (deleteConfirmBtn) {

        deleteConfirmBtn.addEventListener("click", async () => {

            if (!deleteSecretId) return;

            deleteConfirmBtn.disabled = true;

            try {

                const response = await fetch(`/delete/${deleteSecretId}`, {

                    method: "POST"

                });

                if (!response.ok) {

                    throw new Error("Delete failed");

                }

                closeDeleteModal();
                location.reload();

            } catch (err) {

                console.error(err);

            } finally {

                deleteConfirmBtn.disabled = false;

            }

        });

    }



    /* ============================================
       EDIT MODAL EVENTS
    ============================================ */

    if (editOverlay) {

        editCloseBtn.addEventListener("click", closeEditModal);

        editCancelBtn.addEventListener("click", closeEditModal);

        editOverlay.addEventListener("click", (e) => {

            if (e.target === editOverlay) {

                closeEditModal();

            }

        });

    }


    function closeEditModal() {

        editOverlay.classList.remove("active");

        editTextarea.value = "";

        editSecretId.value = "";

    }



    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") {

            closeDeleteModal();

            closeEditModal();

        }

    });



    /* ============================================
       EDIT SUBMIT
    ============================================ */

    if (editForm) {

        editForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            saveEditBtn.disabled = true;

            try {

                const response = await fetch(

                    `/edit/${editSecretId.value}`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type": "application/json"

                        },

                        body: JSON.stringify({

                            secret: editTextarea.value.trim()

                        })

                    }

                );

                const data = await response.json();

                if (!response.ok || !data.success) {

                    throw new Error(data.message);

                }

                const editButton = document.querySelector(

                    `.edit-btn[data-id="${editSecretId.value}"]`

                );

                if (editButton) {

                    const card = editButton.closest(".secret-card");

                    card.querySelector(".secret-text").innerHTML =
                        `&ldquo;${editTextarea.value.trim()}&rdquo;`;

                    editButton.dataset.secret = editTextarea.value.trim();

                }

                closeEditModal();

            } catch (err) {

                console.error(err);

            } finally {

                saveEditBtn.disabled = false;

            }

        });

    }

});