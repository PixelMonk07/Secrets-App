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

    /* =========================
           COMMENTS BUTTON
        ========================= */

    /*
     * Toggle comments
     */
    document.querySelectorAll(".comment-toggle").forEach(button => {

        button.addEventListener("click", async () => {

            const secretId = button.dataset.secretId;

            const container = document.getElementById(
                `comments-${secretId}`
            );

            if (!container) return;

            // Toggle visibility
            if (container.style.display === "none") {

                container.style.display = "block";

                await loadComments(secretId, container);

            } else {

                container.style.display = "none";

            }
        });

    });


    /*
     * Submit comment
     */
    document.querySelectorAll(".comment-form").forEach(form => {

        form.addEventListener("submit", async (event) => {

            event.preventDefault();

            const secretId = form.dataset.secretId;

            const input = form.querySelector(
                'input[name="comment"]'
            );

            const comment = input.value.trim();

            if (!comment) return;

            if (comment.length > 500) {
                alert("Comment cannot exceed 500 characters.");
                return;
            }

            const submitButton = form.querySelector("button");

            submitButton.disabled = true;

            try {

                const response = await fetch(
                    `/comments/${secretId}`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            comment: comment
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {

                    alert(
                        data.message || "Failed to add comment"
                    );

                    return;
                }

                /*
                 * Add the new comment immediately
                 */
                const container = document.getElementById(
                    `comments-${secretId}`
                );

                const commentsList =
                    container.querySelector(".comments-list");

                commentsList.appendChild(
                    createCommentElement(data.comment)
                );

                /*
                 * Clear input
                 */
                input.value = "";

                /*
                 * Update comment count
                 */
                updateCommentCount(secretId, 1);

            } catch (error) {

                console.error(
                    "Comment error:",
                    error
                );

                alert(
                    "Something went wrong. Please try again."
                );

            } finally {

                submitButton.disabled = false;

            }

        });

    });

});


/*
 * Load comments for a secret
 */
async function loadComments(secretId, container) {

    const commentsList =
        container.querySelector(".comments-list");

    commentsList.innerHTML = `
        <div class="comments-loading">
            Loading comments...
        </div>
    `;

    try {

        const response = await fetch(
            `/comments/${secretId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            commentsList.innerHTML = `
                <p class="comments-error">
                    Failed to load comments.
                </p>
            `;

            return;
        }

        commentsList.innerHTML = "";

        if (data.comments.length === 0) {

            commentsList.innerHTML = `
                <p class="no-comments">
                    No comments yet. Be the first to comment.
                </p>
            `;

        } else {

            data.comments.forEach(comment => {

                commentsList.appendChild(
                    createCommentElement(comment)
                );

            });

        }

        /*
         * Set exact comment count
         */
        updateCommentCount(
            secretId,
            data.comments.length,
            true
        );

    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );

        commentsList.innerHTML = `
            <p class="comments-error">
                Failed to load comments.
            </p>
        `;
    }
}


/*
 * Create comment HTML safely
 */
function createCommentElement(comment) {

    const wrapper = document.createElement("div");

    wrapper.className = "comment-item";

    const avatar = document.createElement("div");

    avatar.className = "comment-avatar";

    avatar.textContent =
        comment.anonymous_name
            ? comment.anonymous_name.charAt(0).toUpperCase()
            : "?";


    const content = document.createElement("div");

    content.className = "comment-content";


    const header = document.createElement("div");

    header.className = "comment-header";


    const username = document.createElement("span");

    username.className = "comment-username";

    username.textContent =
        comment.anonymous_name || "Anonymous";


    const time = document.createElement("span");

    time.className = "comment-time";

    time.textContent =
        formatCommentTime(comment.created_at);


    header.appendChild(username);

    header.appendChild(time);


    const text = document.createElement("p");

    text.className = "comment-text";

    /*
     * textContent is intentional.
     * It prevents HTML injection / XSS.
     */
    text.textContent = comment.comment;


    content.appendChild(header);

    content.appendChild(text);


    wrapper.appendChild(avatar);

    wrapper.appendChild(content);


    return wrapper;
}


/*
 * Update comment count
 */
function updateCommentCount(
    secretId,
    value,
    replace = false
) {

    const button = document.querySelector(
        `.comment-toggle[data-secret-id="${secretId}"]`
    );

    if (!button) return;

    const counter =
        button.querySelector(".comment-count");

    if (!counter) return;

    const current =
        parseInt(counter.textContent, 10) || 0;

    counter.textContent =
        replace
            ? value
            : current + value;
}


/*
 * Format comment timestamp
 */
function formatCommentTime(date) {

    const now = new Date();

    const then = new Date(date);

    const diffSeconds =
        Math.floor(
            (now - then) / 1000
        );


    if (diffSeconds < 60) {
        return "just now";
    }


    const minutes =
        Math.floor(diffSeconds / 60);

    if (minutes < 60) {
        return `${minutes}m`;
    }


    const hours =
        Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h`;
    }


    const days =
        Math.floor(hours / 24);

    if (days < 7) {
        return `${days}d`;
    }


    return then.toLocaleDateString();
};