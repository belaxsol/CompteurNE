// Anciens liens partagés (/partage/58622) : renvoi vers la page du compteur avec le même nombre,
// qui porte les balises d'aperçu (voir netlify/edge-functions/apercu.js).
export default async (req, context) => {
  const n = /^\d{1,7}$/.test(context.params.n || "") ? context.params.n : "";
  return Response.redirect(new URL(n ? `/?n=${n}` : "/", req.url), 301);
};

export const config = { path: "/partage/:n" };
