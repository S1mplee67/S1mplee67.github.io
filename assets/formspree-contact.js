/* Wency portfolio contact form.
 * Captures the compiled React demo form before React's fake-success handler.
 * Set data-formspree-endpoint on this script tag after the owner's verified
 * Formspree form has been created.
 */
(() => {
  "use strict";

  if (window.__wencyContactDeliveryInstalled) return;
  window.__wencyContactDeliveryInstalled = true;

  const script = document.currentScript;
  const endpoint = (script?.dataset.formspreeEndpoint || "").trim();
  const configured = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint);
  const contactEmail = "elsievalmonte1@gmail.com";
  const formSelector = "main#contact form";
  let isSending = false;

  function statusFor(form) {
    let note = form.querySelector(".wency-contact-status");
    if (!note) {
      note = document.createElement("p");
      note.className = "wency-contact-status";
      note.setAttribute("role", "status");
      note.setAttribute("aria-live", "polite");
      note.setAttribute("aria-atomic", "true");
      form.appendChild(note);
    }
    return note;
  }

  function setStatus(form, message, type = "info") {
    const note = statusFor(form);
    note.textContent = message;
    note.dataset.status = type;
    return note;
  }

  function getFields(form) {
    return {
      name: (form.querySelector('input[type="text"]')?.value || "").trim(),
      email: (form.querySelector('input[type="email"]')?.value || "").trim(),
      message: (form.querySelector("textarea")?.value || "").trim()
    };
  }

  function showDraftLink(form, fields) {
    const note = setStatus(
      form,
      "Online delivery is not connected yet. Nothing has been sent. Open an email draft and press Send in your email app.",
      "warning"
    );
    const link = document.createElement("a");
    link.href = "mailto:" + contactEmail +
      "?subject=" + encodeURIComponent("Portfolio message from " + fields.name) +
      "&body=" + encodeURIComponent(
        "Name: " + fields.name + "\nEmail: " + fields.email + "\n\n" + fields.message
      );
    link.textContent = "Open email draft →";
    link.className = "wency-contact-email-link";
    note.appendChild(document.createTextNode(" "));
    note.appendChild(link);
  }

  function serviceError(data) {
    if (data && Array.isArray(data.errors) && data.errors.length) {
      const messages = data.errors
        .map(item => typeof item?.message === "string" ? item.message : "")
        .filter(Boolean);
      return messages.join(" ").slice(0, 260);
    }
    return "The message could not be delivered. Please try again, or use the email link above.";
  }

  async function onSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches(formSelector)) return;

    // The bundled React component otherwise fakes success and clears input.
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (isSending || !form.reportValidity()) return;

    const fields = getFields(form);
    if (!fields.name || !fields.email || !fields.message) {
      setStatus(form, "Please complete all three fields.", "error");
      return;
    }

    if (!configured) {
      showDraftLink(form, fields);
      return;
    }

    isSending = true;
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.dataset.originalLabel = button.getAttribute("aria-label") || "";
      button.setAttribute("aria-label", "Sending message");
    }
    setStatus(form, "Sending your message…", "info");

    const body = new FormData();
    body.append("name", fields.name);
    body.append("email", fields.email);
    body.append("message", fields.message);
    body.append("_subject", "New portfolio message from " + fields.name);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
        signal: controller.signal
      });
      if (!response.ok) {
        let data = null;
        try { data = await response.json(); } catch {}
        throw new Error(serviceError(data));
      }

      setStatus(form, "Message sent successfully. Thanks for reaching out!", "success");
      // Preserve the typed message; do not clear unless the server confirms it.
      if (button) button.setAttribute("aria-label", "Message sent");
    } catch (error) {
      const message = error?.name === "AbortError"
        ? "Sending took too long. Your text is safe; please retry or email directly."
        : (error instanceof TypeError
          ? "Network error. Your message was not confirmed. Please retry or email directly."
          : error?.message || "Could not confirm delivery. Please retry or email directly.");
      setStatus(form, message, "error");
    } finally {
      clearTimeout(timeout);
      isSending = false;
      if (button) button.disabled = false;
    }
  }

  function ensureFormNote() {
    if (configured) return;
    const form = document.querySelector(formSelector);
    if (!form || form.querySelector(".wency-contact-status")) return;
    const note = document.createElement("p");
    note.className = "wency-contact-status";
    note.dataset.status = "warning";
    note.setAttribute("role", "status");
    const link = document.createElement("a");
    link.href = "mailto:" + contactEmail;
    link.textContent = "Email me directly";
    link.className = "wency-contact-email-link";
    note.append("Online message delivery is being set up. For now, ", link, ".");
    form.appendChild(note);
  }

  document.addEventListener("submit", onSubmit, true);

  // The form is mounted by React when the /contact route opens.
  const attachWatcher = () => {
    ensureFormNote();
    const root = document.getElementById("root") || document.body;
    const watcher = new MutationObserver(ensureFormNote);
    watcher.observe(root, { childList: true, subtree: true });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachWatcher, { once: true });
  } else {
    attachWatcher();
  }
})();
