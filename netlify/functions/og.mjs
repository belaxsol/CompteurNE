// Image de partage (og:image) du compteur, générée avec les chiffres du moment.
// Même mise en page que site/compteur-carte-modele.html, rendue en PNG 1200x630 (format conseillé par X et Facebook).
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { fmt, lireDonnees } from "../lib/donnees.mjs";

const W = 1200, H = 630;
let ressources = null;           // polices + photo, gardées entre deux appels

async function chargerRessources(origine) {
  if (ressources) return ressources;
  const binaire = chemin => fetch(new URL(chemin, origine)).then(r => {
    if (!r.ok) throw new Error(`${chemin} : ${r.status}`);
    return r.arrayBuffer();
  });
  const [f500, f600, f700, f800, photo] = await Promise.all(
    ["/og/outfit-500.ttf", "/og/outfit-600.ttf", "/og/outfit-700.ttf", "/og/outfit-800.ttf", "/og/lisnard.png"].map(binaire)
  );
  ressources = {
    polices: [[500, f500], [600, f600], [700, f700], [800, f800]].map(([weight, data]) => ({ name: "Outfit", data, weight, style: "normal" })),
    photo: "data:image/png;base64," + Buffer.from(photo).toString("base64"),
  };
  return ressources;
}

const h = (type, style, ...children) => ({ type, props: { style, children: children.length > 1 ? children : children[0] } });
const img = (src, style) => ({ type: "img", props: { src, style } });
const svg = s => "data:image/svg+xml;base64," + Buffer.from(s).toString("base64");
const hexa = (w, ht) => `0,${ht * .25} ${w / 2},0 ${w},${ht * .25} ${w},${ht * .75} ${w / 2},${ht} 0,${ht * .75}`;

// Fond : couleur, halo turquoise, rayures, hexagones
const FOND = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="halo" cx="${W * .85}" cy="${H}" r="${W * .6}" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(${W * .85} ${H}) scale(1 ${(H * .8) / (W * .6)}) translate(${-W * .85} ${-H})">
      <stop offset="0" stop-color="#0d9296" stop-opacity=".35"/><stop offset=".7" stop-color="#0d9296" stop-opacity="0"/>
    </radialGradient>
    <pattern id="rayures" width="${22 * Math.SQRT2}" height="${22 * Math.SQRT2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="2" height="${22 * Math.SQRT2 * 2}" fill="#fff" fill-opacity=".035"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#1d257a"/>
  <rect width="${W}" height="${H}" fill="url(#halo)"/>
  <rect width="${W}" height="${H}" fill="url(#rayures)"/>
  <polygon transform="translate(630 30)" points="${hexa(150, 173)}" fill="#0d9296" fill-opacity=".9"/>
  <polygon transform="translate(690 60)" points="${hexa(520, 600)}" fill="#b0ad85"/>
</svg>`);
const HEX_DL = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="50"><polygon points="${hexa(44, 50)}" fill="#b0ad85"/></svg>`);

function carte(d, photo) {
  const pave = (val, lib, couleur) => h("div", {
    display: "flex", flexDirection: "column", padding: "14px 20px", borderRadius: 14,
    background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.18)",
  },
    h("div", { fontSize: 34, fontWeight: 800, color: couleur, lineHeight: 1.2 }, val),
    h("div", { fontSize: 14, fontWeight: 700, letterSpacing: 1.4, color: "#c9cce6" }, lib),
  );

  return h("div", { width: W, height: H, display: "flex", position: "relative", fontFamily: "Outfit", color: "#fff", background: "#1d257a" },
    img(FOND, { position: "absolute", left: 0, top: 0, width: W, height: H }),
    img(photo, { position: "absolute", right: 0, bottom: 0, height: 560, width: 452 }),
    h("div", { position: "absolute", left: 64, top: 56, width: 600, display: "flex", flexDirection: "column" },
      h("div", { display: "flex", alignItems: "center", gap: 16 },
        h("div", { fontSize: 20, fontWeight: 700, letterSpacing: 2.8, color: "#b0ad85" }, `ADHÉRENTS · ${d.date}`),
        h("div", {
          display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99,
          border: "1.5px solid rgba(255,255,255,.35)", fontSize: 15, fontWeight: 700, letterSpacing: 1.2,
        },
          h("div", { width: 10, height: 10, borderRadius: 5, background: "#ff3b5c", boxShadow: "0 0 0 4px rgba(255,59,92,.25)" }),
          "EN DIRECT",
        ),
      ),
      h("div", { fontSize: 150, fontWeight: 800, lineHeight: .95, letterSpacing: -4.5, marginTop: 22 }, d.total),
      h("div", { display: "flex", fontSize: 30, fontWeight: 500, color: "#dfe2f5", marginTop: 8 },
        "adhérents à",
        h("span", { color: "#fff", fontWeight: 700, marginLeft: 8 }, "Nouvelle Énergie"),
      ),
      h("div", { display: "flex", gap: 14, marginTop: 30 },
        pave(d.d24, "DERNIÈRES 24 H", "#5ee0a8"),
        pave(d.d7, "SUR 7 JOURS", "#7fe3e6"),
      ),
      h("div", { display: "flex", flexDirection: "column", width: 560, marginTop: 28 },
        h("div", { display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: 700 },
          h("span", {}, d.cap),
          h("span", { color: "#7fe3e6" }, d.pct),
        ),
        h("div", { display: "flex", height: 12, borderRadius: 12, background: "rgba(255,255,255,.15)", marginTop: 10 },
          h("div", { width: `${Math.max(2, d.pctN).toFixed(1)}%`, height: 12, borderRadius: 12, backgroundImage: "linear-gradient(90deg, #0d9296, #7fe3e6)" }),
        ),
      ),
    ),
    h("div", { position: "absolute", left: 64, bottom: 36, display: "flex", alignItems: "center", gap: 14, fontSize: 20, fontWeight: 600, color: "#dfe2f5" },
      h("div", { display: "flex", position: "relative", width: 44, height: 50, alignItems: "center", justifyContent: "center" },
        img(HEX_DL, { position: "absolute", left: 0, top: 0, width: 44, height: 50 }),
        h("span", { position: "absolute", left: 0, top: 0, width: 44, height: 50, display: "flex", alignItems: "center", justifyContent: "center", color: "#1d257a", fontWeight: 800, fontSize: 17 }, "DL"),
      ),
      "Rejoignez le mouvement · unenouvelleenergie.fr",
    ),
  );
}

export default async (req) => {
  try {
    const { polices, photo } = await chargerRessources(new URL(req.url).origin);
    const d = await lireDonnees();
    const svgCarte = await satori(carte({ ...d, total: fmt(d.total) }, photo), { width: W, height: H, fonts: polices });
    const png = new Resvg(svgCarte, { fitTo: { mode: "width", value: W } }).render().asPng();
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
        "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    console.error(e);
    return new Response("Image indisponible", { status: 500 });
  }
};

export const config = { path: "/og.png" };
