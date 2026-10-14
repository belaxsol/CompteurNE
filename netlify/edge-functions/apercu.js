// Page d'accueil partagée avec ?n=<total> : on adapte les balises d'aperçu (X, Facebook)
// pour que la carte affiche ce nombre et que X ne ressorte pas une ancienne image.
export default async (req, context) => {
  const url = new URL(req.url);
  const n = url.searchParams.get("n");
  const reponse = await context.next();
  if (!/^\d{1,7}$/.test(n || "")) return reponse;

  const total = Number(n).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ");
  const titre = `${total} adhérents à Nouvelle Énergie`;
  const image = `${url.origin}/og.png?n=${n}`;
  const html = (await reponse.text())
    .replace(/(property="og:title" content=")[^"]*/, `$1${titre}`)
    .replace(/(name="twitter:title" content=")[^"]*/, `$1${titre}`)
    .replace(/(property="og:url" content=")[^"]*/, `$1${url.origin}/?n=${n}`)
    .replace(/(property="og:image" content=")[^"]*/, `$1${image}`)
    .replace(/(name="twitter:image" content=")[^"]*/, `$1${image}`);

  const entetes = new Headers(reponse.headers);
  entetes.delete("content-length");
  return new Response(html, { status: reponse.status, headers: entetes });
};

export const config = { path: "/" };
