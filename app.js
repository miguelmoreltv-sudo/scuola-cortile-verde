(() => {
  const WA_BASE = 'https://wa.me/390390000123?text=';

  const courseSelect = document.getElementById('course-select');
  const ageSelect = document.getElementById('age-select');
  const slotInput = document.getElementById('slot-note');
  const waPreviewText = document.getElementById('wa-preview-text');
  const waMainBtn = document.getElementById('wa-main-btn');
  const waConfirmBtn = document.getElementById('wa-confirm-btn');

  function buildWhatsAppMessage({ parentName = '', course = '', ageGroup = '', slotNote = '' } = {}) {
    const parts = ['Ciao! Vorrei informazioni e prenotare una lezione di prova gratuita a Scuola Cortile Verde (Monza).'];
    if (course) parts.push(`Corso: ${course}.`);
    if (ageGroup) parts.push(`Fascia d'età: ${ageGroup}.`);
    if (slotNote) parts.push(`Orario preferito: ${slotNote}.`);
    if (parentName) parts.push(`Genitore: ${parentName}.`);
    return parts.join(' ');
  }

  function syncWhatsAppLinks() {
    const msg = buildWhatsAppMessage({
      parentName: document.getElementById('parent-name').value.trim(),
      course: courseSelect.value,
      ageGroup: ageSelect.value,
      slotNote: slotInput.value.trim(),
    });
    const url = WA_BASE + encodeURIComponent(msg);
    document.querySelectorAll('.js-wa-link').forEach((link) => {
      link.href = url;
    });
    if (waPreviewText) waPreviewText.textContent = `Messaggio pronto: "${msg}"`;
  }

  // Schedule filter tabs
  const filterButtons = document.querySelectorAll('.filter-btn');
  const scheduleRows = document.querySelectorAll('#schedule-rows tr');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      scheduleRows.forEach((row) => {
        const match =
          filter === 'all' ||
          (filter === 'sabato' && row.dataset.day === 'sabato') ||
          row.dataset.age === filter;
        row.hidden = !match;
      });
    });
  });

  // Course cards -> preselect course & scroll smoothly to contact
  function jumpToForm({ course = '', age = '', slot = '' }) {
    if (course && courseSelect) courseSelect.value = course;
    if (age && ageSelect) ageSelect.value = age;
    if (slot && slotInput) slotInput.value = slot;

    // Reset success state if user picks a new course/slot
    const inputBox = document.getElementById('form-state-input');
    const successBox = document.getElementById('form-state-success');
    if (inputBox && successBox) {
      inputBox.hidden = false;
      successBox.hidden = true;
    }

    syncWhatsAppLinks();
    document.getElementById('contatti').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.getElementById('parent-name').focus({ preventScroll: true });
    }, 450);
  }

  document.querySelectorAll('.js-select-course').forEach((btn) => {
    btn.addEventListener('click', () => {
      jumpToForm({ course: btn.dataset.course });
    });
  });

  document.querySelectorAll('.js-pick-slot').forEach((btn) => {
    btn.addEventListener('click', () => {
      jumpToForm({
        course: btn.dataset.course,
        age: btn.dataset.age,
        slot: btn.dataset.slot,
      });
    });
  });

  // Sync WhatsApp dynamically as parent fills form
  ['parent-name', 'course-select', 'age-select', 'slot-note'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', syncWhatsAppLinks);
    if (el) el.addEventListener('change', syncWhatsAppLinks);
  });

  // Form validation & submission
  const form = document.getElementById('trial-form');
  const formInputBox = document.getElementById('form-state-input');
  const formSuccessBox = document.getElementById('form-state-success');
  const successSummary = document.getElementById('success-summary');
  const resetFormBtn = document.getElementById('reset-form-btn');

  function setError(inputId, errId, msg) {
    const inputEl = document.getElementById(inputId);
    const errEl = document.getElementById(errId);
    if (errEl) errEl.textContent = msg;
    if (inputEl) {
      if (msg) inputEl.setAttribute('aria-invalid', 'true');
      else inputEl.removeAttribute('aria-invalid');
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('parent-name').value.trim();
      const contact = document.getElementById('parent-contact').value.trim();
      const course = courseSelect.value;
      const ageGroup = ageSelect.value;
      const slotNote = slotInput.value.trim();

      let valid = true;
      setError('parent-name', 'err-name', '');
      setError('parent-contact', 'err-contact', '');
      setError('course-select', 'err-course', '');
      setError('age-select', 'err-age', '');

      if (name.length < 2) {
        setError('parent-name', 'err-name', 'Inserisci nome e cognome.');
        valid = false;
      }
      if (contact.length < 5) {
        setError('parent-contact', 'err-contact', 'Inserisci un numero WhatsApp o una email valida.');
        valid = false;
      }
      if (!course) {
        setError('course-select', 'err-course', 'Scegli un percorso (o seleziona consigliatemi voi).');
        valid = false;
      }
      if (!ageGroup) {
        setError('age-select', 'err-age', "Indica la fascia d'età.");
        valid = false;
      }

      if (!valid) return;

      const slotPart = slotNote ? ` (${slotNote})` : '';
      successSummary.textContent = `Grazie ${name}! Richiesta ricevuta per "${course}" — fascia ${ageGroup}${slotPart}. Ti ricontatteremo su ${contact}.`;

      const confirmMsg = buildWhatsAppMessage({
        parentName: name,
        course,
        ageGroup,
        slotNote,
      });
      waConfirmBtn.href = WA_BASE + encodeURIComponent(confirmMsg);

      formInputBox.hidden = true;
      formSuccessBox.hidden = false;
    });
  }

  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      formSuccessBox.hidden = true;
      formInputBox.hidden = false;
    });
  }

  // Privacy modal
  const privacyDialog = document.getElementById('privacy-dialog');
  const openPrivacy = document.getElementById('open-privacy');
  const closePrivacy = document.getElementById('close-privacy');

  if (openPrivacy && privacyDialog && closePrivacy) {
    openPrivacy.addEventListener('click', () => privacyDialog.showModal());
    closePrivacy.addEventListener('click', () => privacyDialog.close());
  }

  syncWhatsAppLinks();
})();
