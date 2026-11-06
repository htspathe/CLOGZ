/* CLOGZ — GPS facultatif pour la livraison, persistant en attributs Shopify */
(() => {
  'use strict';
  const root = (window.Shopify?.routes?.root || window.CLOGZ?.routes?.root || '/').replace(/\/?$/, '/');
  const key = {
    link: 'Position livraison - Google Maps',
    lat: 'Latitude livraison',
    lng: 'Longitude livraison',
    accuracy: 'Precision position livraison (m)',
    saved: 'Position livraison relevee le'
  };
  const panels = [];
  let busy = false;
  let savedPosition = null;

  function validMapLink(url) {
    return /^https:\/\/www\.google\.com\/maps\?q=-?\d{1,3}\.\d{4,8},-?\d{1,3}\.\d{4,8}$/.test(url || '');
  }

  function panelBefore(selector, anchor) {
    const parent = document.querySelector(selector);
    const before = parent?.querySelector(anchor);
    if (!parent || !before) return;
    const section = document.createElement('section');
    section.className = 'clogz-geo';
    section.setAttribute('aria-label', 'Position pour la livraison');
    section.innerHTML =
      '<div class="clogz-geo__heading"><span aria-hidden="true">📍</span><strong>Ta position de livraison</strong><span class="clogz-geo__optional">Facultatif</span></div>' +
      '<p class="clogz-geo__copy">Tu es à ton adresse de livraison ? Partage ta position pour que le livreur te trouve plus vite.</p>' +
      '<div class="clogz-geo__actions"><button class="clogz-geo__share" type="button">Partager ma position</button><button class="clogz-geo__clear" type="button" hidden>Effacer ma position</button></div>' +
      '<p class="clogz-geo__status" role="status" aria-live="polite"></p>' +
      '<a class="clogz-geo__map" href="#" target="_blank" rel="noopener noreferrer" hidden>Vérifier sur Google Maps ↗</a>' +
      '<p class="clogz-geo__privacy">Position utilisée uniquement pour faciliter la livraison. Si tu commandes pour une autre adresse, ne partage pas celle où tu te trouves. Indique aussi ton quartier, ton adresse et un repère au paiement. <a href="/policies/privacy-policy">Confidentialité</a></p>' +
      '<details class="clogz-geo__fallback"><summary>Pas de GPS ? Utiliser WhatsApp</summary><p>Après avoir commandé, envoie ta position dans la conversation WhatsApp avec CLOGZ : sur iPhone, touche <strong>+</strong> puis <strong>Localisation</strong> ; sur Android, touche <strong>📎</strong> puis <strong>Localisation</strong>. Choisis « Envoyer ma position actuelle ».</p></details>';
    before.parentNode.insertBefore(section, before);
    const share = section.querySelector('.clogz-geo__share');
    const clear = section.querySelector('.clogz-geo__clear');
    share.addEventListener('click', shareLocation);
    clear.addEventListener('click', clearLocation);
    panels.push({section, share, clear, status:section.querySelector('.clogz-geo__status'), map:section.querySelector('.clogz-geo__map')});
  }

  function render(message, kind) {
    for (const panel of panels) {
      panel.share.disabled = busy;
      panel.clear.disabled = busy;
      panel.clear.hidden = !savedPosition;
      panel.status.className = 'clogz-geo__status' + (kind ? ' is-' + kind : '');
      panel.status.textContent = message || (savedPosition ? '✓ Position enregistrée pour la livraison.' : '');
      panel.map.hidden = !savedPosition;
      if (savedPosition) panel.map.href = savedPosition;
    }
  }

  async function updateAttributes(attributes) {
    const response = await fetch(root + 'cart/update.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: JSON.stringify({attributes})
    });
    if (!response.ok) throw new Error('Impossible d’enregistrer la position dans le panier.');
    const cart = await response.json();
    return cart.attributes || {};
  }

  function attributesToClear() {
    return {
      [key.link]: '', [key.lat]: '', [key.lng]: '', [key.accuracy]: '', [key.saved]: ''
    };
  }

  async function clearLocation() {
    if (busy) return;
    busy = true;
    render('Suppression de ta position…');
    try {
      const attributes = await updateAttributes(attributesToClear());
      if (validMapLink(attributes[key.link])) throw new Error('La suppression n’a pas été confirmée.');
      savedPosition = null;
      render('✓ Position supprimée du panier.', 'success');
    } catch (error) {
      render(error.message || 'Suppression impossible, réessaie.', 'error');
    } finally {
      busy = false;
      for (const p of panels) { p.share.disabled = false; p.clear.disabled = false; }
    }
  }

  function shareLocation() {
    if (busy) return;
    if (!window.isSecureContext || !navigator.geolocation) {
      render('Géolocalisation indisponible ici. Tu peux continuer sans GPS et utiliser WhatsApp.', 'error');
      return;
    }
    busy = true;
    render('Recherche de ta position… Autorise la localisation si ton téléphone le demande.');
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const accuracy = Math.round(position.coords.accuracy || 0);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
          Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        busy = false;
        render('Position invalide. Réessaie ou utilise WhatsApp.', 'error');
        return;
      }
      const lat = latitude.toFixed(6);
      const lng = longitude.toFixed(6);
      const mapLink = 'https://www.google.com/maps?q=' + lat + ',' + lng;
      try {
        render('Position trouvée. Enregistrement dans ton panier…');
        const attributes = await updateAttributes({
          [key.link]: mapLink,
          [key.lat]: lat,
          [key.lng]: lng,
          [key.accuracy]: String(accuracy),
          [key.saved]: new Date().toISOString()
        });
        if (attributes[key.link] !== mapLink) throw new Error('Enregistrement non confirmé.');
        savedPosition = mapLink;
        render('✓ Position enregistrée · précision estimée ±' + accuracy + ' m.' +
          (accuracy > 100 ? ' La précision est faible : indique un repère ou envoie ta position sur WhatsApp.' : ''), 'success');
      } catch (error) {
        render(error.message || 'Impossible d’enregistrer la position. Réessaie.', 'error');
      } finally {
        busy = false;
        for (const p of panels) { p.share.disabled = false; p.clear.disabled = false; }
      }
    }, (error) => {
      busy = false;
      const message = error.code === 1 ? 'Partage refusé. Tu peux continuer sans GPS et utiliser WhatsApp.' :
        error.code === 2 ? 'Position introuvable. Vérifie la localisation de ton téléphone ou utilise WhatsApp.' :
        'La localisation a pris trop de temps. Réessaie ou utilise WhatsApp.';
      render(message, 'error');
      for (const p of panels) { p.share.disabled = false; p.clear.disabled = false; }
    }, {enableHighAccuracy: true, timeout: 15000, maximumAge: 0});
  }

  panelBefore('[data-clogz-cart-form]', '.clogz-cart-actions');
  panelBefore('#ClogzDrawer .clogz-drawer__bottom', '.clogz-drawer__buttons');
  if (!panels.length) return;

  document.addEventListener('click', (event) => {
    if (busy && event.target.closest('#ClogzCheckoutLink, #ClogzNativeCheckoutButton')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      render('L’enregistrement GPS est en cours. Attends sa fin ou réessaie.');
    }
  }, true);

  fetch(root + 'cart.js', {credentials:'same-origin', headers:{Accept:'application/json'}})
    .then(r => { if (!r.ok) throw new Error('Panier non disponible'); return r.json(); })
    .then(cart => {
      if (busy) return;
      const attrs = cart.attributes || {};
      savedPosition = validMapLink(attrs[key.link]) ? attrs[key.link] : null;
      if (savedPosition) {
        const accuracy = Number(attrs[key.accuracy]);
        render('✓ Position déjà enregistrée.' +
          (Number.isFinite(accuracy) && accuracy > 0 ? ' Précision estimée ±' + Math.round(accuracy) + ' m.' : ''), 'success');
      } else render('');
    })
    .catch(() => render('Tu peux partager ta position avant de passer commande.'));
})();