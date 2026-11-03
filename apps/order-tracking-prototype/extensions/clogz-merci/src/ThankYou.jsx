// CLOGZ — Shopify Checkout UI extension for purchase.thank-you.block.render
// Works without a configured backend in information-only mode; never invents
// a CZ code or tells a visitor that a preview page confirms a real order.
import '@shopify/ui-extensions/preact';
import {render} from 'preact';
import {useEffect, useState} from 'preact/hooks';

export default function extension() {
  render(<CLOGZThankYou />, document.body);
}

const CODE_PATTERN = /^CZ-[A-HJ-NP-Z2-9]{5}$/;
const TRACKING_URL = 'https://clogz.sn/pages/suivi';
const CHANGE_URL = 'https://clogz.sn/pages/modifier-commande';
const WHATSAPP_URL = 'https://www.clogz.sn';

function normalizeApiUrl(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash) return null;
    return `${u.origin}${u.pathname.replace(/\/$/, '')}`;
  } catch {
    return null;
  }
}

function CLOGZThankYou() {
  // The Shopify thank-you page can be rendered before Admin API's Order exists.
  const confirmation = shopify.orderConfirmation.value;
  const gid = confirmation?.order?.id;
  const checkoutToken = shopify.checkoutToken.value;
  const apiBase = normalizeApiUrl(shopify.settings.value?.api_url);
  const [view, setView] = useState({status: 'pending', code: '', orderName: ''});
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!apiBase || !gid || !checkoutToken) {
      setView({status: 'inactive', code: '', orderName: ''});
      return () => {cancelled = true;};
    }
    setView({status: 'pending', code: '', orderName: ''});
    (async () => {
      const endpoint = `${apiBase}/api/checkout-code`;
      for (let attempt = 0; attempt < 14 && !cancelled; attempt++) {
        try {
          // Obtain a fresh signed JWT for every call; never use an Admin token
          // or personal details in the extension/browser.
          const jwt = await shopify.sessionToken.get();
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt}`,
            },
            body: JSON.stringify({orderId: gid, checkoutToken}),
          });
          if (response.ok) {
            const data = await response.json();
            if (!cancelled && CODE_PATTERN.test(String(data?.code || '')) &&
                /^#[0-9]+$/.test(String(data?.orderNumber || ''))) {
              setView({status: 'ready', code: data.code, orderName: data.orderNumber});
              return;
            }
            if (response.status !== 202) break;
          } else if (response.status !== 202) {
            // A misconfigured backend or invalid token must never expose an
            // order or display a fabricated code.
            break;
          }
        } catch {
          // A transient network failure cannot block checkout completion.
        }
        if (attempt < 13) await new Promise(resolve => setTimeout(resolve, 1500));
      }
      if (!cancelled) setView({status: 'retry', code: '', orderName: ''});
    })();
    return () => {cancelled = true;};
  }, [apiBase, gid, checkoutToken, retry]);

  const codeReady = view.status === 'ready';
  const linkToTrack = codeReady ? `${TRACKING_URL}#${view.code}` : TRACKING_URL;
  const linkToChange = codeReady ? `${CHANGE_URL}#${view.code}` : CHANGE_URL;

  return <s-stack direction="block" gap="base">
    <s-banner tone="success" heading="Merci pour ta commande CLOGZ ! 🧡">
      Ta commande a bien été reçue. Nous te remercions pour ta confiance.
      {codeReady ? <s-text> Numéro de commande : {view.orderName}.</s-text> : null}
    </s-banner>

    {codeReady ?
      <s-box border="base" borderRadius="large" padding="base">
        <s-stack direction="block" gap="base">
          <s-heading>Ton code personnel de suivi</s-heading>
          <s-heading>{view.code}</s-heading>
          <s-text>Conserve ce code pour retrouver le suivi de ta paire sans créer de compte client.</s-text>
          <s-link href={linkToTrack}>📦 Suivre ma commande</s-link>
        </s-stack>
      </s-box> :
      <s-banner tone="info" heading="Suivi de commande CLOGZ">
        {view.status === 'pending'
          ? 'Ton code CZ-XXXXX est en cours de préparation. Tu peux déjà conserver la confirmation Shopify.'
          : 'Le suivi automatique par code n’est pas encore disponible ici. Notre équipe peut te renseigner sur ta commande.'}
        <s-link href={TRACKING_URL}>Consulter les informations de suivi</s-link>
        {view.status === 'retry' && apiBase && gid && checkoutToken ?
          <s-button onClick={() => setRetry(v => v + 1)}>Réessayer d’obtenir mon code</s-button> : null}
      </s-banner>
    }

    <s-box border="base" borderRadius="large" padding="base">
      <s-stack direction="block" gap="small">
        <s-heading>Un changement de pointure ou de couleur ?</s-heading>
        <s-text>Avant l’expédition, tu peux demander à modifier ton choix. Notre équipe vérifiera la disponibilité et te confirmera si le changement est possible. La demande ne modifie pas automatiquement la commande.</s-text>
        <s-link href={linkToChange}>✏️ Demander une modification de ma commande</s-link>
      </s-stack>
    </s-box>
    <s-link href={WHATSAPP_URL}>Une question ? Écris-nous sur WhatsApp</s-link>
  </s-stack>;
}
