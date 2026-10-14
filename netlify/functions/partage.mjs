// Lien partagé sur X / Facebook : /partage/58622
// Les robots de X et Facebook lisent les balises og:* (et donc l'image du compteur),
// les visiteurs qui cliquent sont envoyés vers le lien d'adhésion.
import { fmt } from "../lib/donnees.mjs";

const LIEN_ADHESION = "https://soutenir.unenouvelleenergie.fr/p/V52CQY5T";

export default async (req, context) => {
  const origine = new URL(req.url).origin;
  const n = Number(context.params.n);
  const titre = Number.isFinite(n) && n > 0
    ? `${fmt(n)} adhérents à Nouvelle Énergie`
    : "Compteur d'adhésions à Nouvelle Énergie";
  const { pathname, search } = new URL(req.url);
  const lien = `${origine}${pathname}${search}`;   // adresse exacte partagée (le ?v= rend chaque partage unique pour X)
  const image = `${origine}/og.png?n=${Number.isFinite(n) ? n : Date.now()}`;

  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<title>${titre}</title>
<meta property="og:type" content="website">
<meta property="og:url" content="${lien}">
<meta property="og:title" content="${titre}">
<meta property="og:description" content="Suivez le compteur en direct et rejoignez le mouvement.">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${titre}">
<meta name="twitter:image" content="${image}">
<script>location.replace(${JSON.stringify(LIEN_ADHESION)})</script>
</head><body><a href="${LIEN_ADHESION}">Rejoindre Nouvelle Énergie</a></body></html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
};

export const config = { path: "/partage/:n" };
