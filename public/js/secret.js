document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", async (event) => {
    let selectedSecret = null;

    const modal = document.getElementById("deleteModal");

    const confirmBtn = document.getElementById("confirmDelete");

    const cancelBtn = document.getElementById("cancelDelete");

    const closeBtn = document.getElementById("closeModal");

    const deleteBtn = event.target.closest(".delete-btn");

    if (!deleteBtn) return;

    selectedSecret = deleteBtn.dataset.secretId;

    modal.classList.remove("hidden");

    function closeModal() {

      modal.classList.add("hidden");

      selectedSecret = null;

    }

    cancelBtn.onclick = closeModal;

    closeBtn.onclick = closeModal;

    confirmBtn.onclick = () => {

      if (!selectedSecret) return;

      const form = document.createElement("form");

      form.method = "POST";

      form.action = "/delete/" + selectedSecret;

      document.body.appendChild(form);

      form.submit();

    };

    const btn = event.target.closest(".react-btn");
    if (!btn) return;

    event.preventDefault();

    const secretId = btn.dataset.secretId;
    const icon = btn.querySelector("i");
    const countEl = btn.querySelector(".like-count");

    if (!secretId) return;

    btn.disabled = true;

    try {
      const response = await fetch(`/like/${secretId}`, {
        method: "POST",
        headers: {
          Accept: "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update like");
      }

      const liked = Boolean(data.liked);

      btn.classList.toggle("liked", liked);
      icon.classList.toggle("far", !liked);
      icon.classList.toggle("fas", liked);
      countEl.textContent = data.likeCount;
    } catch (err) {
      console.error(err);
    } finally {
      btn.disabled = false;
    }
  });
});