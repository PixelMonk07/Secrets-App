document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", async (event) => {
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