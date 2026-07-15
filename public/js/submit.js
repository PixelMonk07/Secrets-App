  const textarea = document.getElementById("secret-input");
  const charCount = document.getElementById("char-count");
  const whisperBtn = document.getElementById("whisper-btn");
  const LIMIT = 280;

  textarea.addEventListener("input", () => {
    const len = textarea.value.length;
    charCount.textContent = len;
    charCount.classList.toggle(
      "near-limit",
      len >= LIMIT * 0.85 && len < LIMIT,
    );
    charCount.classList.toggle("at-limit", len >= LIMIT);
    whisperBtn.disabled = textarea.value.trim().length === 0;
  });