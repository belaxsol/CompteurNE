// Données du compteur, calculées comme sur le site (site/index.html)
const URL_LIVE = "https://adherent.unenouvelleenergie.fr/donnees/adherents.json";
const URL_HISTO = "https://adherent.unenouvelleenergie.fr/donnees/adherents/historique.json";
const PAS_CAP = 5000;
const MOIS = ["JANV.", "FÉVR.", "MARS", "AVR.", "MAI", "JUIN", "JUIL.", "AOÛT", "SEPT.", "OCT.", "NOV.", "DÉC."];

export const fmt = n => Math.round(n).toLocaleString("fr-FR").replace(/ | /g, " ");
const signe = n => (n >= 0 ? "+" : "") + fmt(n);

function valeurA(t, serie) {
  if (!serie.length) return null;
  if (t <= serie[0].t) return serie[0].v;
  for (let i = 1; i < serie.length; i++) {
    if (t <= serie[i].t) {
      const a = serie[i - 1], b = serie[i];
      return a.v + (b.v - a.v) * (t - a.t) / (b.t - a.t);
    }
  }
  return serie[serie.length - 1].v;
}

export async function lireDonnees() {
  const [live, histo] = await Promise.all([
    fetch(URL_LIVE).then(r => r.json()),
    fetch(URL_HISTO).then(r => r.json()),
  ]);
  const total = live.adherents, maj = new Date(live.mis_a_jour);
  // La valeur d'un jour correspond au total en fin de journée (≈ minuit UTC suivant)
  const serie = (histo.jours || [])
    .map(d => ({ t: Date.parse(`${d.jour || d.date}T00:00:00Z`) + 86400e3, v: d.adherents }))
    .filter(p => Number.isFinite(p.t) && Number.isFinite(p.v));

  const v24 = valeurA(+maj - 24 * 3600e3, serie);
  const v7 = valeurA(+maj - 7 * 24 * 3600e3, serie);
  const capBas = Math.floor(total / PAS_CAP) * PAS_CAP, capHaut = capBas + PAS_CAP;
  const pct = total / capHaut * 100;          // part de l'objectif déjà atteinte

  const parties = Object.fromEntries(new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris", day: "numeric", month: "numeric", year: "numeric",
  }).formatToParts(maj).map(p => [p.type, p.value]));

  return {
    total,
    date: `${+parties.day} ${MOIS[+parties.month - 1]} ${parties.year}`,
    d24: v24 == null ? "—" : signe(total - v24),
    d7: v7 == null ? "—" : signe(total - v7),
    cap: `Objectif ${fmt(capHaut)} · reste ${fmt(capHaut - total)}`,
    pct: (Math.floor(pct * 10) / 10).toLocaleString("fr-FR", { minimumFractionDigits: 1 }) + " %",
    pctN: pct,
  };
}
