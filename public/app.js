(() => {
  const $ = (id) => document.getElementById(id);
  const escapeText = (value) => String(value ?? '').trim();
  const isSpanish = document.documentElement.lang.toLowerCase().startsWith('es');

  const L = isSpanish ? {
    readUnsupported: 'La lectura en voz alta no es compatible con este navegador.',
    suggestionTemplate: [
      'Sugerencia de recurso para Senior Care Compass',
      '',
      'Nombre del recurso:',
      'Teléfono:',
      'Sitio web:',
      'Código postal / ciudad / estado:',
      'Qué servicios ofrece:',
      'Por qué puede ser útil para adultos mayores o cuidadores:',
      'Fuente utilizada para verificar esta información:'
    ].join('\n'),
    copied: 'Plantilla copiada.',
    copyBlocked: 'El navegador bloqueó la copia. Puede copiar la plantilla manualmente.',
    near: 'cerca de',
    nearZip: 'cerca del código postal',
    provider: 'Proveedor',
    rating: 'Calificación general',
    call: 'Llamar',
    verifyMedicare: 'Verificar en Medicare',
    viewNpi: 'Ver registro NPI',
    official: 'Recurso oficial',
    medicareSupplier: 'Directorio de Medicare',
    assignment: 'Asignación de Medicare',
    assignmentYes: 'Acepta la asignación de Medicare',
    assignmentAsk: 'Pregunte sobre la asignación de Medicare',
    supplies: 'Artículos disponibles',
    validZip: 'Ingrese un código postal válido de 5 dígitos de EE. UU.',
    searching: 'Buscando fuentes públicas confiables para el código postal ',
    unavailable: 'El servicio de búsqueda no está disponible temporalmente.',
    resultsFor: 'Resultados para',
    exactZip: 'Se muestran coincidencias del código postal exacto; puede haber proveedores cercanos fuera de este código postal.',
    lookupComplete: 'Búsqueda completada. Llame al proveedor para confirmar servicios, horarios, cobertura y disponibilidad.',
    fallback: 'No pudimos completar la búsqueda. Utilice los enlaces oficiales que aparecen abajo.',
    noHospital: 'No se encontró un hospital de Medicare en este código postal exacto. Use Medicare Care Compare para buscar áreas cercanas.',
    noNursing: 'No se encontró un centro de enfermería certificado por CMS en este código postal exacto. Use Medicare Care Compare para buscar áreas cercanas.',
    noClinic: 'No se encontró una clínica en NPPES para este código postal exacto. Pruebe el buscador de centros de salud de HRSA.',
    noPharmacy: 'No se encontró una farmacia en NPPES para este código postal exacto. Llame a farmacias locales o use los enlaces de ayuda con medicamentos.',
    noVision: 'No se encontró un proveedor de visión u optometría en NPPES para este código postal exacto. Use la búsqueda local de visión para ampliar el área.',
    noDme: 'No se encontró un proveedor de equipo médico de Medicare en este código postal exacto. Use el directorio oficial de Medicare para buscar áreas cercanas.',
    liveHospitalFail: 'No se pudieron cargar los datos de hospitales. Use Medicare Care Compare.',
    liveNursingFail: 'No se pudieron cargar los datos de centros de enfermería. Use Medicare Care Compare.',
    liveClinicFail: 'No se pudieron cargar los datos de clínicas. Use el buscador de centros de salud de HRSA.',
    livePharmacyFail: 'No se pudieron cargar los datos de farmacias. Use directorios locales o NeedyMeds.',
    liveVisionFail: 'No se pudieron cargar los datos de visión. Use la búsqueda local de visión o Medicare Care Compare.',
    liveDmeFail: 'No se pudieron cargar los proveedores de equipo médico. Use el directorio oficial de Medicare.',
    question: 'Pregunta',
    of: 'de',
    next: 'Siguiente',
    seeCare: 'Ver categoría de cuidado'
  } : {
    readUnsupported: 'Read-aloud is not supported by this browser.',
    suggestionTemplate: [
      'Senior Care Compass resource suggestion',
      '',
      'Resource name:',
      'Phone:',
      'Website:',
      'ZIP / city / state:',
      'What they provide:',
      'Why this may be useful for seniors or caregivers:',
      'Source used to verify this information:'
    ].join('\n'),
    copied: 'Template copied.',
    copyBlocked: 'Copy was blocked by the browser. You can copy the template manually from this page.',
    near: 'near',
    nearZip: 'near ZIP',
    provider: 'Provider',
    rating: 'Overall rating',
    call: 'Call',
    verifyMedicare: 'Verify on Medicare',
    viewNpi: 'View NPI record',
    official: 'Official resource',
    medicareSupplier: 'Medicare directory',
    assignment: 'Medicare assignment',
    assignmentYes: 'Accepts Medicare assignment',
    assignmentAsk: 'Ask about Medicare assignment',
    supplies: 'Supplies carried',
    validZip: 'Enter a valid 5-digit U.S. ZIP code.',
    searching: 'Searching trusted public provider sources for ZIP ',
    unavailable: 'Lookup service is temporarily unavailable.',
    resultsFor: 'Results for',
    exactZip: 'Exact-ZIP results are shown; nearby providers may be outside this ZIP.',
    lookupComplete: 'Lookup complete. Call each provider to confirm current services, hours, coverage, and availability.',
    fallback: 'We could not complete the lookup. Please use the official links below.',
    noHospital: 'No Medicare hospital record was returned for this exact ZIP. Use Medicare Care Compare below to search nearby areas.',
    noNursing: 'No CMS-certified nursing home was returned for this exact ZIP. Use Medicare Care Compare below to search nearby areas.',
    noClinic: 'No clinic organization was returned from NPPES for this exact ZIP. Try the HRSA Health Center locator below.',
    noPharmacy: 'No pharmacy organization was returned from NPPES for this exact ZIP. Call local pharmacies or use the medication-assistance links below.',
    noVision: 'No vision or optometry organization was returned from NPPES for this exact ZIP. Use the local vision search to expand the area.',
    noDme: 'No Medicare medical-equipment supplier was returned for this exact ZIP. Use Medicare’s official supplier directory to search nearby areas.',
    liveHospitalFail: 'Live hospital data could not be loaded. Use Medicare Care Compare.',
    liveNursingFail: 'Live nursing-home data could not be loaded. Use Medicare Care Compare.',
    liveClinicFail: 'Live clinic data could not be loaded. Use the HRSA Health Center locator.',
    livePharmacyFail: 'Live pharmacy data could not be loaded. Use local pharmacy directories or NeedyMeds.',
    liveVisionFail: 'Live vision data could not be loaded. Use the local vision search or Medicare Care Compare.',
    liveDmeFail: 'Live medical-equipment supplier data could not be loaded. Use Medicare’s official supplier directory.',
    question: 'Question',
    of: 'of',
    next: 'Next',
    seeCare: 'See care category'
  };

  // Clean mobile menu
  const menuToggle = $('menuToggle');
  const menuPanel = $('menuPanel');
  menuToggle?.addEventListener('click', () => {
    const open = menuPanel?.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
    menuToggle.textContent = open ? '✕' : '☰';
  });
  menuPanel?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    menuPanel.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuToggle) menuToggle.textContent = '☰';
  }));

  // Accessibility controls
  const largeTextBtn = $('largeTextBtn');
  const contrastBtn = $('contrastBtn');
  const readBtn = $('readBtn');

  function toggleText() {
    const on = document.body.classList.toggle('large-text');
    largeTextBtn?.setAttribute('aria-pressed', String(on));
  }
  function toggleContrast() {
    const on = document.body.classList.toggle('high-contrast');
    contrastBtn?.setAttribute('aria-pressed', String(on));
  }
  function readPage() {
    if (!('speechSynthesis' in window)) {
      alert(L.readUnsupported);
      return;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      readBtn?.setAttribute('aria-pressed', 'false');
      return;
    }
    const text = document.querySelector('main')?.innerText?.slice(0, 18000) || '';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.lang = isSpanish ? 'es-US' : 'en-US';
    utterance.onend = () => readBtn?.setAttribute('aria-pressed', 'false');
    utterance.onerror = () => readBtn?.setAttribute('aria-pressed', 'false');
    readBtn?.setAttribute('aria-pressed', 'true');
    speechSynthesis.speak(utterance);
  }

  largeTextBtn?.addEventListener('click', toggleText);
  contrastBtn?.addEventListener('click', toggleContrast);
  readBtn?.addEventListener('click', readPage);
  document.querySelectorAll('[data-a11y]').forEach((btn) => btn.addEventListener('click', () => {
    const action = btn.dataset.a11y;
    if (action === 'text') toggleText();
    if (action === 'contrast') toggleContrast();
    if (action === 'read') readPage();
  }));

  // tribute-image-fallback
  const tributeImg = document.querySelector('.tribute-photo-img');
  if (tributeImg && isSpanish) {
    tributeImg.addEventListener('error', async () => {
      try {
        const response = await fetch('index.html?tribute-source=1', { cache: 'no-store' });
        const sourceHtml = await response.text();
        const doc = new DOMParser().parseFromString(sourceHtml, 'text/html');
        const working = doc.querySelector('.tribute-photo-img');
        if (working?.src) tributeImg.src = working.src;
      } catch {}
    }, { once: true });
  }

  // Resource accordions
  document.querySelectorAll('.accordion-trigger').forEach((button) => {
    const panelId = button.getAttribute('aria-controls');
    const panel = panelId ? document.getElementById(panelId) : null;
    if (!panel) return;
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  $('printToolkitBtn')?.addEventListener('click', () => window.print());

  $('copySuggestionBtn')?.addEventListener('click', async () => {
    const status = $('copySuggestionStatus');
    try {
      await navigator.clipboard.writeText(L.suggestionTemplate);
      if (status) status.textContent = L.copied;
    } catch {
      if (status) status.textContent = L.copyBlocked;
    }
  });

  // Nationwide ZIP finder
  const zipForm = $('zipForm');
  const zipInput = $('zipInput');
  const lookupStatus = $('lookupStatus');
  const locationSummary = $('locationSummary');
  const providerResults = $('providerResults');

  function setStatus(message, kind = '') {
    if (!lookupStatus) return;
    lookupStatus.textContent = message;
    lookupStatus.className = kind ? 'status ' + kind : 'status';
  }

  function updateDynamicLocation(location) {
    const zip = escapeText(location?.zip);
    const city = escapeText(location?.city);
    const state = escapeText(location?.state);
    const label = [city, state].filter(Boolean).join(', ');
    const short = label
      ? L.near + ' ' + label + ' ' + zip
      : zip
        ? L.nearZip + ' ' + zip
        : '';
    document.querySelectorAll('.dynamic-near').forEach((node) => {
      node.textContent = short ? ' ' + short : '';
    });
  }

  function updateLocalDiscovery(location) {
    const zip = escapeText(location?.zip);
    const city = escapeText(location?.city);
    const state = escapeText(location?.state);
    const place = [city, state, zip].filter(Boolean).join(' ');

    document.querySelectorAll('[data-map-query]').forEach((link) => {
      const query = link.dataset.mapQuery || '';
      link.href = place
        ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query + ' near ' + place)
        : '#finder';
      link.target = place ? '_blank' : '';
      link.rel = place ? 'noopener' : '';
    });

    document.querySelectorAll('[data-web-query]').forEach((link) => {
      const query = link.dataset.webQuery || '';
      link.href = place
        ? 'https://www.google.com/search?q=' + encodeURIComponent(query + ' ' + place)
        : '#finder';
      link.target = place ? '_blank' : '';
      link.rel = place ? 'noopener' : '';
    });

    const label = [city, state].filter(Boolean).join(', ') || zip;
    document.querySelectorAll('.local-place-label').forEach((node) => {
      node.textContent = label || (isSpanish ? 'su área' : 'your area');
    });
  }

  function cleanPhone(phone) {
    return escapeText(phone).replace(/[^0-9+]/g, '');
  }

  function card(item, type) {
    const el = document.createElement('article');
    el.className = 'provider-card';

    const h = document.createElement('h4');
    h.textContent = item.name || L.provider;
    el.appendChild(h);

    if (item.address) {
      const p = document.createElement('p');
      p.textContent = item.address;
      el.appendChild(p);
    }

    if (item.phone) {
      const p = document.createElement('p');
      p.textContent = item.phone;
      el.appendChild(p);
    }

    const meta = document.createElement('div');
    meta.className = 'provider-meta';

    if (item.subtype) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = item.subtype;
      meta.appendChild(tag);
    }

    if (item.rating && item.rating !== 'Not Available') {
      const rating = document.createElement('span');
      rating.className = 'tag rating';
      rating.textContent = L.rating + ': ' + item.rating + '/5';
      meta.appendChild(rating);
    }

    if (item.assignment) {
      const assignment = document.createElement('span');
      assignment.className = 'tag assignment-tag';
      assignment.textContent =
        item.assignment === 'yes'
          ? L.assignmentYes
          : item.assignment === 'ask'
            ? L.assignmentAsk
            : item.assignment;
      meta.appendChild(assignment);
    }

    if (meta.children.length) el.appendChild(meta);

    if (item.supplies) {
      const supplies = document.createElement('p');
      supplies.className = 'supplier-items';
      supplies.innerHTML = '<strong>' + L.supplies + ':</strong> ' + escapeText(item.supplies);
      el.appendChild(supplies);
    }

    const actions = document.createElement('div');
    actions.className = 'provider-actions';

    if (item.phone) {
      const call = document.createElement('a');
      call.className = 'small-btn';
      call.href = 'tel:' + cleanPhone(item.phone);
      call.textContent = L.call;
      actions.appendChild(call);
    }

    const verify = document.createElement('a');
    verify.className = 'small-btn alt';
    verify.target = '_blank';
    verify.rel = 'noopener';

    if (type === 'dme') {
      verify.href = 'https://www.medicare.gov/medical-equipment-suppliers';
      verify.textContent = L.medicareSupplier;
    } else if (type === 'hospital') {
      verify.href = item.id
        ? 'https://www.medicare.gov/care-compare/details/hospital/' + encodeURIComponent(item.id)
        : 'https://www.medicare.gov/care-compare/';
      verify.textContent = L.verifyMedicare;
    } else if (type === 'nursing') {
      verify.href = item.id
        ? 'https://www.medicare.gov/care-compare/details/nursing-home/' + encodeURIComponent(item.id)
        : 'https://www.medicare.gov/care-compare/';
      verify.textContent = L.verifyMedicare;
    } else if (item.id) {
      verify.href = 'https://npiregistry.cms.hhs.gov/provider-view/' + encodeURIComponent(item.id);
      verify.textContent = L.viewNpi;
    } else {
      verify.href = type === 'pharmacy'
        ? 'https://www.needymeds.org/'
        : 'https://findahealthcenter.hrsa.gov/';
      verify.textContent = L.official;
    }

    actions.appendChild(verify);
    el.appendChild(actions);
    return el;
  }

  function renderGroup(id, items, type, emptyText) {
    const host = $(id);
    if (!host) return;
    host.textContent = '';

    if (!Array.isArray(items) || items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = emptyText;
      host.appendChild(empty);
      return;
    }
    items.slice(0, 8).forEach((item) => host.appendChild(card(item, type)));
  }

  zipForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const zip = zipInput.value.trim();

    if (!/^\d{5}$/.test(zip)) {
      setStatus(L.validZip, 'error');
      zipInput.focus();
      return;
    }

    providerResults.hidden = true;
    locationSummary.hidden = true;
    setStatus(L.searching + zip + '…', 'loading');

    try {
      const response = await fetch('/api/providers?zip=' + encodeURIComponent(zip), {
        headers: { Accept: 'application/json' }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || L.unavailable);

      const location = data.location || { zip };
      updateDynamicLocation(location);
      updateLocalDiscovery(location);

      const place = [location.city, location.state].filter(Boolean).join(', ');
      locationSummary.textContent =
        L.resultsFor + ' ' + (place || zip) + ' ' + zip + '. ' + L.exactZip;
      locationSummary.hidden = false;

      renderGroup('hospitalResults', data.hospitals, 'hospital', L.noHospital);
      renderGroup('nursingResults', data.nursingHomes, 'nursing', L.noNursing);
      renderGroup('clinicResults', data.clinics, 'clinic', L.noClinic);
      renderGroup('visionResults', data.vision, 'vision', L.noVision);
      renderGroup('pharmacyResults', data.pharmacies, 'pharmacy', L.noPharmacy);
      renderGroup('dmeResults', data.medicalEquipment, 'dme', L.noDme);

      providerResults.hidden = false;
      setStatus(L.lookupComplete, 'success');
      providerResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      updateDynamicLocation({ zip });
      updateLocalDiscovery({ zip });
      setStatus(error.message || L.fallback, 'error');
      providerResults.hidden = false;
      renderGroup('hospitalResults', [], 'hospital', L.liveHospitalFail);
      renderGroup('nursingResults', [], 'nursing', L.liveNursingFail);
      renderGroup('clinicResults', [], 'clinic', L.liveClinicFail);
      renderGroup('visionResults', [], 'vision', L.liveVisionFail);
      renderGroup('pharmacyResults', [], 'pharmacy', L.livePharmacyFail);
      renderGroup('dmeResults', [], 'dme', L.liveDmeFail);
    }
  });

  // Care-planning questionnaire
  const questions = [...document.querySelectorAll('.question')];
  const answers = [null, null, null, null];
  let step = 0;
  const bar = $('progressBar');
  const label = $('stepLabel');
  const back = $('backBtn');
  const next = $('nextBtn');
  const quiz = $('quiz');
  const results = $('results');

  function renderQuiz() {
    questions.forEach((q, i) => q.classList.toggle('active', i === step));
    if (bar) bar.style.width = ((step + 1) / questions.length * 100) + '%';
    if (label) label.textContent = L.question + ' ' + (step + 1) + ' ' + L.of + ' ' + questions.length;
    if (back) back.disabled = step === 0;
    if (next) {
      next.disabled = !answers[step];
      next.textContent = step === questions.length - 1 ? L.seeCare : L.next;
    }
  }

  questions.forEach((q, i) => q.querySelectorAll('.option').forEach((btn) => {
    btn.addEventListener('click', () => {
      q.querySelectorAll('.option').forEach((b) => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      answers[i] = btn.dataset.value;
      if (next) next.disabled = false;
    });
  }));

  back?.addEventListener('click', () => {
    if (step > 0) {
      step -= 1;
      renderQuiz();
    }
  });

  next?.addEventListener('click', () => {
    if (!answers[step]) return;
    if (step < questions.length - 1) {
      step += 1;
      renderQuiz();
      questions[step].querySelector('.option')?.focus({ preventScroll: true });
    } else {
      showResults();
    }
  });

  const careData = isSpanish ? {
    home: {
      title: 'Apoyo en el hogar',
      text: 'El apoyo en el hogar puede ser una opción cuando la persona mayor puede permanecer segura en casa con ayuda para rutinas diarias, compañía, transporte, recordatorios de medicamentos o determinadas necesidades de cuidado personal.',
      steps: [
        'Anote las tareas específicas con las que necesita ayuda y con qué frecuencia.',
        'Pregunte al profesional de atención primaria si sería útil una evaluación funcional o de seguridad en el hogar.',
        'Compare agencias de cuidado en el hogar, credenciales de cuidadores, horarios y costos.',
        'Prepare un plan de respaldo para noches, fines de semana, caídas, enfermedades o ausencia del cuidador.'
      ],
      consider: ['Seguridad en el hogar y riesgo de caídas','Manejo de medicamentos','Disponibilidad del cuidador familiar','Transporte y comidas','Cómo pueden aumentar las necesidades con el tiempo']
    },
    assisted: {
      title: 'Vida asistida',
      text: 'La vida asistida puede ser útil cuando se necesita ayuda regular con actividades diarias, comidas, medicamentos, supervisión o conexión social, pero la enfermería especializada las 24 horas no es la necesidad principal.',
      steps: [
        'Documente la ayuda necesaria con baño, vestido, movilidad, comidas y medicamentos.',
        'Visite más de una comunidad y pregunte qué servicios están incluidos y cuáles tienen costo adicional.',
        'Revise personal, cobertura nocturna, respuesta a emergencias, transporte y criterios de salida.',
        'Compare el costo mensual total con alternativas realistas de cuidado en el hogar.'
      ],
      consider: ['Personal y apoyo nocturno','Ayuda con medicamentos','Accesibilidad y movilidad','Actividades y conexión social','Precios y futuras transiciones de cuidado']
    },
    memory: {
      title: 'Evaluación de cuidado de memoria',
      text: 'Puede ser apropiado hablar de cuidado especializado de memoria cuando existen deambulación, confusión, cambios de conducta, juicio inseguro o necesidad de supervisión estructurada las 24 horas.',
      steps: [
        'Solicite una evaluación clínica de factores cognitivos, conductuales y médicos.',
        'Pregunte sobre capacitación en demencia, seguridad, personal y comunicación con la familia.',
        'Revise cómo se manejan deambulación, agitación, caídas, cambios de medicamentos y hospitalizaciones.',
        'Hable con profesionales calificados sobre planificación legal, financiera, anticipada y apoyo al cuidador.'
      ],
      consider: ['Supervisión y seguridad 24 horas','Personal capacitado en demencia','Necesidades de conducta y comunicación','Entorno y rutina','Participación familiar y planificación del cuidado']
    },
    skilled: {
      title: 'Evaluación clínica / cuidado especializado de mayor nivel',
      text: 'Cuando existen necesidades médicas importantes o apoyo las 24 horas, un profesional clínico o de cuidado debe evaluar si corresponde enfermería especializada, rehabilitación, salud en el hogar, cuidados paliativos u otro nivel de apoyo.',
      steps: [
        'Pida al profesional tratante una evaluación funcional y de necesidades médicas.',
        'Aclare si la necesidad es rehabilitación a corto plazo, enfermería continua, salud en el hogar u otro servicio.',
        'Use Medicare Care Compare para revisar proveedores certificados y confirme la cobertura directamente.',
        'Hable sobre metas de cuidado, directivas anticipadas, capacidad del cuidador y planes de emergencia.'
      ],
      consider: ['Necesidades clínicas y estabilidad','Supervisión 24 horas','Potencial de rehabilitación','Reglas de seguro y beneficios','Metas de cuidado y preferencias personales']
    }
  } : {
    home: {
      title: 'In-Home Support',
      text: 'In-home support may be worth exploring when the senior can remain safely at home with help for daily routines, companionship, transportation, medication reminders, or selected personal-care needs.',
      steps: [
        'List the specific tasks that need help and how often help is needed.',
        'Ask the primary-care clinician whether a functional or home-safety assessment would be useful.',
        'Compare licensed home-care agencies, caregiver qualifications, schedules, and costs.',
        'Create a backup plan for nights, weekends, falls, illness, or caregiver absence.'
      ],
      consider: ['Home safety and fall risks','Medication management','Family caregiver availability','Transportation and meals','How needs may increase over time']
    },
    assisted: {
      title: 'Assisted Living',
      text: 'Assisted living may be worth comparing when regular help with daily activities, meals, medications, supervision, or social connection is needed but round-the-clock skilled nursing is not the primary need.',
      steps: [
        'Document assistance needed with bathing, dressing, mobility, meals, and medications.',
        'Tour more than one community and ask what services are included versus added-cost.',
        'Review staffing, overnight coverage, emergency response, transportation, and move-out criteria.',
        'Compare the full monthly cost with realistic in-home care alternatives.'
      ],
      consider: ['Staffing and overnight support','Medication assistance','Accessibility and mobility','Activities and social connection','Pricing and future care transitions']
    },
    memory: {
      title: 'Memory-Care Evaluation',
      text: 'Specialized memory care may be appropriate to discuss when dementia-related wandering, confusion, behavioral changes, unsafe judgment, or a need for structured 24-hour supervision is prominent.',
      steps: [
        'Request a clinical assessment for cognitive, behavioral, and medical contributors.',
        'Ask memory-care communities about dementia training, secure environments, staffing, and family communication.',
        'Review how the community handles wandering, agitation, falls, medication changes, and hospitalization.',
        'Discuss legal, financial, advance-care, and caregiver-support planning with qualified professionals.'
      ],
      consider: ['24-hour supervision and security','Dementia-trained staff','Behavioral and communication needs','Environment and routine','Family involvement and care planning']
    },
    skilled: {
      title: 'Higher-Level Clinical / Skilled-Care Assessment',
      text: 'When substantial medical needs or 24-hour support are central, a clinician or care professional should assess whether skilled nursing, rehabilitation, home health, palliative care, or another higher level of clinical support fits the person’s needs and goals.',
      steps: [
        'Ask the treating clinician for a functional and medical-needs assessment.',
        'Clarify whether the need is short-term rehabilitation, ongoing skilled nursing, home health, or another service.',
        'Use Medicare Care Compare to review certified providers and confirm insurance coverage directly.',
        'Discuss goals of care, advance directives, caregiver capacity, and emergency plans.'
      ],
      consider: ['Clinical needs and stability','24-hour supervision','Rehabilitation potential','Insurance and benefit rules','Goals of care and personal preferences']
    }
  };

  function recommendation() {
    const [living, concern, health, support] = answers;
    if (living === 'memory') return 'memory';
    if (health === 'specialized' || (concern === 'medical' && (support === 'significant' || support === '24hour'))) return 'skilled';
    if (support === '24hour' || support === 'significant' || living === 'assisted') return 'assisted';
    return 'home';
  }

  function showResults() {
    const r = careData[recommendation()];
    $('resultTitle').textContent = r.title;
    $('resultText').textContent = r.text;
    $('nextSteps').innerHTML = r.steps
      .map((s, i) => '<li><span class="num">' + (i + 1) + '</span><span>' + s + '</span></li>')
      .join('');
    $('considerations').innerHTML = r.consider.map((x) => '<li>' + x + '</li>').join('');
    quiz.style.display = 'none';
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('restartBtn')?.addEventListener('click', () => {
    answers.fill(null);
    step = 0;
    document.querySelectorAll('.option').forEach((b) => {
      b.classList.remove('selected');
      b.setAttribute('aria-checked', 'false');
    });
    results.style.display = 'none';
    quiz.style.display = 'block';
    renderQuiz();
    quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  renderQuiz();
})();