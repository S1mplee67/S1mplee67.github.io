/* Wency's verified participation certificates and historical membership.
 * Attaches to the existing Experience section; no compiled React edits.
 */
(() => {
  "use strict";
  if (window.__wencyCertificatesInstalled) return;
  window.__wencyCertificatesInstalled = true;

  const certificates = [
    {
      type: "Participation certificate",
      title: "Safer Internet Day: Cybersecurity for Everyone",
      issuer: "Department of Information and Communications Technology (DICT) · CALABARZON",
      date: "February 10, 2026",
      description: "Participated in the DICT CALABARZON Safer Internet Day session on cybersecurity for everyone.",
      filename: "dict-safer-internet-day-2026"
    },
    {
      type: "Participation certificate",
      title: "Bioinformatics and Digital Science Information in the Philippine Context",
      issuer: "ICCT Colleges · Engineering and Digital Technology",
      date: "March 3, 2026",
      description: "Participated in a seminar exploring bioinformatics and digital science information in the Philippine context.",
      filename: "icct-bioinformatics-2026"
    },
    {
      type: "Participation certificate",
      title: "Advancing Research and Development in IoT for Smart Environments",
      issuer: "ICCT Colleges · 12th Engineering Day",
      date: "March 6, 2025",
      description: "Participated in the seminar on IoT innovations and future directions for smart environments.",
      filename: "icct-iot-rnd-2025"
    },
    {
      type: "Historical membership",
      title: "ICCT Engineering Society",
      issuer: "ICCT Colleges · Engineering Society (IES)",
      date: "A.Y. 2024–2025",
      description: "Certificate of membership for the third trimester. The certificate states validity through June 30, 2025.",
      filename: "icct-ies-membership-2025"
    }
  ];

  const prefix = "/assets/certificates/";
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function makeCard(item) {
    const article = el("article", "wency-certificate-card");
    const imgLink = el("a", "wency-certificate-image-link");
    imgLink.href = prefix + item.filename + ".pdf";
    imgLink.target = "_blank";
    imgLink.rel = "noopener noreferrer";
    imgLink.setAttribute("aria-label", "Open certificate: " + item.title + " (PDF, new tab)");

    const img = el("img", "wency-certificate-image");
    img.src = prefix + item.filename + ".webp";
    img.alt = "Certificate awarded to Wency Miguel D. Valmonte: " + item.title;
    img.loading = "lazy";
    img.decoding = "async";
    imgLink.appendChild(img);

    const contents = el("div", "wency-certificate-details");
    const label = el("div", "wency-certificate-type", item.type);
    const title = el("h3", "wency-certificate-name", item.title);
    const institution = el("p", "wency-certificate-issuer", item.issuer);
    const date = el("p", "wency-certificate-date", item.date);
    const description = el("p", "wency-certificate-description", item.description);
    const pdfLink = el("a", "wency-certificate-document", "View certificate PDF ↗");
    pdfLink.href = imgLink.href;
    pdfLink.target = "_blank";
    pdfLink.rel = "noopener noreferrer";
    pdfLink.setAttribute("aria-label", "View " + item.title + " certificate PDF in a new tab");

    contents.append(label, title, institution, date, description, pdfLink);
    article.append(imgLink, contents);
    return article;
  }

  function render() {
    const anchor = document.getElementById("experience");
    const existing = document.getElementById("certificates");
    if (!anchor) {
      if (existing) existing.remove();
      return;
    }
    if (existing && existing.parentElement === anchor) return;
    if (existing) existing.remove();

    const section = el("section", "wency-certificates");
    section.id = "certificates";
    section.setAttribute("aria-labelledby", "wency-certificates-heading");

    const header = el("div", "wency-certificates-header");
    const heading = el("h2", "wency-certificates-heading", "Certificates & Participation");
    heading.id = "wency-certificates-heading";
    const intro = el(
      "p",
      "wency-certificates-intro",
      "Verified seminars and organization participation. TESDA NC II remains listed above as a separate national qualification."
    );
    header.append(heading, intro);

    const grid = el("div", "wency-certificates-grid");
    certificates.forEach(item => grid.appendChild(makeCard(item)));
    section.append(header, grid);
    anchor.appendChild(section);
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  };

  const start = () => {
    schedule();
    const root = document.getElementById("root") || document.body;
    new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
    window.addEventListener("popstate", schedule);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
