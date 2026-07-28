const pres = require("pptxgenjs");
const stats = require("./presentation_data.json");
const chart = require("./chart_data.json");

const p = new pres();
p.layout = "LAYOUT_WIDE"; // 13.3 x 7.5in
const W = 13.33, H = 7.5;

// ---------------------------------------------------------------
// Palette: "Charging Amber" -- graphite + charging-indicator amber + steel,
// a deliberately different identity from the mint/charcoal "EV Circuit" deck:
// square card motif instead of icon circles, right-rail insight cards instead
// of a bottom takeaway band, a split-screen title instead of overlapping blobs.
// ---------------------------------------------------------------
const GRAPHITE = "23272B";
const AMBER = "F2A93B";
const STEEL = "4E6E81";
const INK = "23272B";
const SLATE = "3A3F44";
const OFFWHITE = "FFFFFF";
const CARDTINT = "F0F2F3";

const OKABE = {
  blue: "0072B2", orange: "E69F00", green: "009E73",
  vermillion: "D55E00", sky: "56B4E9", purple: "CC79A7", grey: "B0B0B0",
};
const CONTINENT_COLORS = {
  Europe: OKABE.blue, "Asia-Pacific": OKABE.vermillion, Americas: OKABE.orange,
  "Middle East": OKABE.purple, Africa: OKABE.grey,
};

const HEAD_FONT = "Bookman Old Style";
const BODY_FONT = "Arial";

let pageNum = 1;
function footer(slide, dark) {
  slide.addText("Global Electric Vehicle Market Analysis, 2010-2025 · Data Visualization, Summer 2026", {
    x: 0.5, y: H - 0.42, w: 9, h: 0.3, fontFace: BODY_FONT, fontSize: 9,
    color: dark ? "B9C2C8" : SLATE, align: "left",
  });
  slide.addText(String(pageNum), {
    x: W - 1, y: H - 0.42, w: 0.5, h: 0.3, fontFace: BODY_FONT, fontSize: 9,
    color: dark ? "B9C2C8" : SLATE, align: "right",
  });
  pageNum += 1;
}

// Square-tag motif (replaces the circular icon motif in the other deck)
function tagSquare(slide, x, y, size, bg, letter, letterColor) {
  slide.addShape("roundRect", { x, y, w: size, h: size, rectRadius: size * 0.16, fill: { color: bg }, line: { type: "none" } });
  slide.addText(letter, {
    x, y, w: size, h: size, align: "center", valign: "middle",
    fontFace: HEAD_FONT, fontSize: size * 24, bold: true, color: letterColor, margin: 0,
  });
}

function dotGrid(slide, x0, y0, cols, rows, gap, r, color) {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      slide.addShape("ellipse", { x: x0 + i * gap, y: y0 + j * gap, w: r, h: r, fill: { color }, line: { type: "none" } });
    }
  }
}

// Slide header used on every content slide: a square tag + full-width title
function header(slide, tag, title) {
  tagSquare(slide, 0.5, 0.45, 0.62, AMBER, tag, GRAPHITE);
  slide.addText(title, {
    x: 1.35, y: 0.38, w: 11.5, h: 0.85, fontFace: HEAD_FONT, fontSize: 21, bold: true, color: INK,
    valign: "top", margin: 0,
  });
}

// Right-rail insight card: a stat + a short "why it matters" note, replacing
// the bottom-band takeaway used in the other deck's format.
function insightCard(slide, x, y, w, h, statText, statLabel, note) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.09, fill: { color: CARDTINT }, line: { type: "none" },
    shadow: { type: "outer", color: "1A1A1A", opacity: 0.12, blur: 6, offset: 2, angle: 90 },
  });
  slide.addText(statText, {
    x: x + 0.3, y: y + 0.25, w: w - 0.6, h: 0.85, fontFace: HEAD_FONT, fontSize: 34, bold: true, color: AMBER, margin: 0,
  });
  slide.addText(statLabel, {
    x: x + 0.3, y: y + 1.05, w: w - 0.6, h: 0.55, fontFace: BODY_FONT, fontSize: 11, bold: true, color: STEEL, margin: 0,
  });
  slide.addText(note, {
    x: x + 0.3, y: y + 1.7, w: w - 0.6, h: h - 2.0, fontFace: BODY_FONT, fontSize: 12.5, color: SLATE, valign: "top", margin: 0,
  });
}

// =====================================================================
// Slide 1 — Title (split-screen, not the overlapping-blob composition)
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  s.addShape("rect", { x: 0, y: 0, w: 5.2, h: H, fill: { color: GRAPHITE }, line: { type: "none" } });
  dotGrid(s, 8.9, 0.6, 6, 4, 0.62, 0.22, "E3E7E8");
  s.addShape("roundRect", { x: 5.55, y: 3.0, w: 0.55, h: 0.55, rectRadius: 0.09, fill: { color: AMBER }, line: { type: "none" } });

  s.addText("GLOBAL\nELECTRIC\nVEHICLE\nMARKET\nANALYSIS", {
    x: 0.55, y: 1.5, w: 4.3, h: 4.4, fontFace: HEAD_FONT, fontSize: 33, bold: true, color: OFFWHITE,
    lineSpacing: 38, margin: 0,
  });
  s.addText("2010–2025", { x: 0.55, y: 5.95, w: 4.3, h: 0.5, fontFace: BODY_FONT, fontSize: 16, color: AMBER, margin: 0 });

  s.addText("How EVs Are Transforming the Automobile Industry Across Countries", {
    x: 5.55, y: 3.75, w: 7.2, h: 1.0, fontFace: HEAD_FONT, fontSize: 20, bold: true, color: INK, valign: "top", margin: 0,
  });
  s.addText("Final Individual Project — Data Visualization, Summer 2026", {
    x: 5.55, y: 4.85, w: 7.2, h: 0.4, fontFace: BODY_FONT, fontSize: 13, color: SLATE, margin: 0,
  });
  s.addText(`${stats.n_countries_total} countries  ·  16 years (2010-2025)  ·  IEA Global EV Outlook 2025, via Our World in Data`, {
    x: 5.55, y: 5.35, w: 7.2, h: 0.4, fontFace: BODY_FONT, fontSize: 12, color: STEEL, margin: 0,
  });
}

// =====================================================================
// Slide 2 — Dataset & scope (2x2 stat grid, two-column body)
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  header(s, "01", "The Dataset: A Decade and a Half of EV Adoption");

  s.addText(
    "One row per country per year, 2010-2025, built from four IEA Global EV Outlook 2025 series " +
    "republished by Our World in Data: annual EV sales, EV sales share of new car sales, EV stock " +
    "(the installed fleet), and the battery-electric (BEV) share of EV sales.\n\n" +
    "Enriched with continent groupings, an auto-manufacturing-powerhouse flag, market-phase tiers, " +
    "and each country's 'tipping point' year -- the year its EV sales share first crossed 5%.",
    { x: 0.5, y: 1.55, w: 6.6, h: 4.7, fontFace: BODY_FONT, fontSize: 13.5, color: SLATE, valign: "top", margin: 0, lineSpacingMultiple: 1.25 }
  );

  const boxStats = [
    { n: `${stats.n_countries_total}`, label: "Countries tracked" },
    { n: `${stats.n_countries_tipped}`, label: "Crossed the 5% tipping point" },
    { n: `${stats.n_countries_reached_mainstream}`, label: "Reached 50% EV sales share" },
    { n: `${stats.world_sales_multiple_2015_2025}x`, label: "World EV sales growth, 2015-25" },
  ];
  const gx = 7.4, gy = 1.55, gw = 2.7, gh = 1.75, gap = 0.2;
  boxStats.forEach((st, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = gx + col * (gw + gap), y = gy + row * (gh + gap);
    s.addShape("roundRect", { x, y, w: gw, h: gh, rectRadius: 0.08, fill: { color: CARDTINT }, line: { type: "none" } });
    s.addShape("roundRect", { x: x + 0.2, y: y + 0.2, w: 0.35, h: 0.35, rectRadius: 0.06, fill: { color: AMBER }, line: { type: "none" } });
    s.addText(st.n, { x, y: y + 0.5, w: gw, h: 0.7, align: "center", fontFace: HEAD_FONT, fontSize: 26, bold: true, color: INK, margin: 0 });
    s.addText(st.label, { x: x + 0.15, y: y + 1.2, w: gw - 0.3, h: 0.5, align: "center", fontFace: BODY_FONT, fontSize: 10.5, color: STEEL, margin: 0 });
  });

  s.addText(
    "Source: IEA Global EV Outlook 2025 (iea.org/reports/global-ev-outlook-2025), via Our World in Data " +
    "(ourworldindata.org/electric-car-sales). 'Auto-manufacturing powerhouse' is an analytical grouping " +
    "(largest light-vehicle producers by OICA rankings), not a value judgement.",
    { x: 0.5, y: 6.35, w: 12.3, h: 0.85, fontFace: BODY_FONT, fontSize: 10.5, italic: true, color: STEEL, valign: "top", margin: 0 }
  );
}

// =====================================================================
// Content slide builder: left chart, right insight card
// =====================================================================
function chartSlide(tag, title, chartTitle, buildChart, statText, statLabel, note) {
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  header(s, tag, title);
  buildChart(s, { x: 0.5, y: 1.5, w: 7.7, h: 5.15, subtitle: chartTitle });
  insightCard(s, 8.45, 1.5, 4.35, 5.15, statText, statLabel, note);
  footer(s, false);
  return s;
}

// --- Q1 ---
chartSlide(
  "02", "How fast has the world actually gone electric?",
  "World EV sales grew 41x from 2015-2025",
  (s, r) => {
    s.addChart(
      [
        { type: "bar", data: [{ name: "World EV sales (millions)", labels: chart.years.map(String), values: chart.world_sales_millions }],
          options: { chartColors: [OKABE.grey], barGapWidthPct: 40 } },
        { type: "line", data: [{ name: "World EV sales share (%)", labels: chart.years.map(String), values: chart.world_sales_share }],
          options: { chartColors: [AMBER], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6, secondaryValAxis: true, secondaryCatAxis: true } },
      ],
      {
        x: r.x, y: r.y, w: r.w, h: r.h,
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        showLegend: true, legendPos: "b", legendFontSize: 10,
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
        valAxes: [
          { showValAxisTitle: true, valAxisTitle: "Sales (millions)", valAxisTitleColor: SLATE, valGridLine: { color: "E4E7E6", size: 1 } },
          { showValAxisTitle: true, valAxisTitle: "Share (%)", valAxisTitleColor: SLATE, valGridLine: { style: "none" } },
        ],
        catAxes: [{ catAxisLabelColor: SLATE }, { catAxisHidden: true }],
      }
    );
  },
  `${stats.china_global_share_2025}%`, "of world EV sales volume in 2025 came from China alone",
  `China rose from ${stats.china_global_share_2015}% to ${stats.china_global_share_2025}% of global EV sales volume between 2015 and 2025 -- the "global" transformation is, in raw units, disproportionately a Chinese one.`
);

// --- Q2 ---
chartSlide(
  "03", "Which continent leads the world's EV transformation today?",
  "Asia-Pacific overtook Europe's share around 2022",
  (s, r) => {
    s.addChart(
      "area",
      chart.continents.map((c) => ({ name: c, labels: chart.years.map(String), values: chart.continent_share_by_year[c] })),
      {
        x: r.x, y: r.y, w: r.w, h: r.h,
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: chart.continents.map((c) => CONTINENT_COLORS[c]), barGrouping: "stacked",
        showLegend: true, legendPos: "b", legendFontSize: 10,
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE, valAxisMaxVal: 100,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  "~70%", "of world EV sales volume now comes from Asia-Pacific",
  "Europe held the clearest early lead, but Asia-Pacific's volume (driven overwhelmingly by China) has commanded roughly two-thirds of world EV sales since 2022."
);

// --- Q3 ---
chartSlide(
  "04", "Once a market crosses 5%, how fast does it reach 50%?",
  "Nordic markets crossed fastest",
  (s, r) => {
    s.addChart(
      "bar",
      [{ name: "Years from 5% to 50% EV sales share", labels: chart.tipping_speed_countries, values: chart.tipping_speed_years }],
      {
        x: r.x, y: r.y, w: r.w, h: r.h, barDir: "bar",
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: [AMBER], showLegend: false,
        showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 10,
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  `${stats.n_countries_reached_mainstream}/${stats.n_countries_total}`, "countries have reached 50% EV sales share so far",
  "China took 6 years to go from 5% to 50% -- the same jump Iceland made in 4 -- but did it across roughly 1,000x the sales volume."
);

// --- Q4 ---
chartSlide(
  "05", "Are legacy auto powerhouses transforming slower?",
  "Powerhouse nations lag other markets",
  (s, r) => {
    s.addChart(
      "bar",
      [{ name: "Median EV sales share, 2022-2025 (%)", labels: ["Auto powerhouses", "Other markets"],
         values: [chart.powerhouse_median, chart.nonpowerhouse_median] }],
      {
        x: r.x, y: r.y, w: r.w, h: r.h,
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: [OKABE.vermillion], showLegend: false,
        showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 13, dataLabelFormatCode: "0.0",
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  "3x", "gap between powerhouse and other-market median EV share",
  `In 2022-2025, the median EV sales share among auto-manufacturing powerhouses was ${chart.powerhouse_median}%, versus ${chart.nonpowerhouse_median}% among other markets.`
);

// --- Q5 ---
chartSlide(
  "06", "Has the market settled on battery-electric, or stayed hybrid?",
  "PHEVs hold a persistent ~30-35% share",
  (s, r) => {
    s.addChart(
      "area",
      [
        { name: "BEV (battery-electric)", labels: chart.years.map(String), values: chart.bev_share_by_year },
        { name: "PHEV + FCEV", labels: chart.years.map(String), values: chart.phev_share_by_year },
      ],
      {
        x: r.x, y: r.y, w: r.w, h: r.h,
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: [AMBER, STEEL], barGrouping: "stacked",
        showLegend: true, legendPos: "b", legendFontSize: 10,
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  "60-65%", "BEV share of world EV sales through the mid-2020s",
  "Global BEV share dipped from pioneer-era 70-90% highs, then settled in the 60-65% range -- plug-in hybrids found a durable foothold rather than disappearing."
);

// --- Q6 ---
chartSlide(
  "07", "Has the market become more or less concentrated?",
  "Top 5 markets still command ~80% of sales",
  (s, r) => {
    s.addChart(
      "line",
      [{ name: "Top-5 countries' share of world EV sales (%)", labels: chart.years.map(String), values: chart.top5_concentration_by_year }],
      {
        x: r.x, y: r.y, w: r.w, h: r.h,
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: [AMBER], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 7,
        showLegend: false, showValue: true, dataLabelPosition: "t", dataLabelColor: SLATE, dataLabelFontSize: 9, dataLabelFormatCode: "0.0",
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE, valAxisMinVal: 0, valAxisMaxVal: 100,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  `${stats.top5_share_2025}%`, "share of world sales held by the top 5 markets in 2025",
  `Concentration held essentially flat -- ${stats.top5_share_2015}% in 2015 to ${stats.top5_share_2025}% in 2025 -- even as dozens of new countries entered the market.`
);

// --- Q7 ---
chartSlide(
  "08", "Which countries climbed or fell furthest in the ranking?",
  "Turkey, Thailand and Brazil surged",
  (s, r) => {
    const moverColors = chart.mover_climb.map((v) => (v > 0 ? AMBER : STEEL));
    s.addChart(
      "bar",
      [{ name: "Rank change, 2015 to 2025", labels: chart.mover_countries, values: chart.mover_climb }],
      {
        x: r.x, y: r.y, w: r.w, h: r.h, barDir: "bar",
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: moverColors, invertedColors: moverColors, showLegend: false,
        showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 9,
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  "-17", "places Japan fell in the global sales-volume ranking",
  "Japan went from the world's 5th-largest EV market in 2015 to 22nd in 2025 -- not because its sales fell, but because dozens of others scaled past it."
);

// --- Q8 ---
chartSlide(
  "09", "What does a near-complete transformation look like?",
  "Norway and Iceland vs. the world average",
  (s, r) => {
    const spotlightColors = [AMBER, OKABE.sky, OKABE.vermillion, OKABE.grey, GRAPHITE];
    s.addChart(
      "line",
      chart.spotlight_countries.map((c) => ({ name: c, labels: chart.years.map(String), values: chart.spotlight_series[c] })),
      {
        x: r.x, y: r.y, w: r.w, h: r.h,
        showTitle: true, title: r.subtitle, titleFontSize: 13, titleColor: INK,
        chartColors: spotlightColors, lineSize: 2.5, showLegend: true, legendPos: "b", legendFontSize: 10,
        catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
        valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
      }
    );
  },
  `${stats.norway_2025_share}%`, "of Norway's 2025 new-car sales were electric",
  `Norway (${stats.norway_2025_share}%) and Iceland (${stats.iceland_2025_share}%) show near-total ICE displacement is achievable -- but the World average (25%) shows most of the globe is still mid-transition.`
);

// =====================================================================
// Slide 11 — Dashboard walkthrough (3-card row on dark background)
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: GRAPHITE };
  dotGrid(s, 0.5, 6.55, 10, 1, 0.3, 0.1, "3A3F44");
  s.addText("Explore It Yourself: The Interactive Dashboard", {
    x: 0.6, y: 0.55, w: 12.1, h: 0.7, fontFace: HEAD_FONT, fontSize: 26, bold: true, color: OFFWHITE, margin: 0,
  });

  const cards = [
    { t: "Global\nOverview", d: "World sales/share trend, a country choropleth, and the top-15 markets by volume, for any year and continent filter." },
    { t: "Adoption\nS-Curve Explorer", d: "Spotlight any country against its continent and the world, plus every market's 5%-to-50% tipping speed." },
    { t: "Powerhouses vs.\nChallengers", d: "Legacy manufacturer vs. other-market comparison, a live growth-vs-maturity scatter explorer, and ranking-churn charts." },
  ];
  const cw = 3.9, ch = 4.5, gap = 0.28, startX = 0.6, y = 1.7;
  cards.forEach((c, i) => {
    const x = startX + i * (cw + gap);
    s.addShape("roundRect", { x, y, w: cw, h: ch, rectRadius: 0.1, fill: { color: "2C3237" }, line: { type: "none" } });
    s.addShape("roundRect", { x: x + 0.3, y: y + 0.3, w: 0.55, h: 0.55, rectRadius: 0.09, fill: { color: AMBER }, line: { type: "none" } });
    s.addText(String(i + 1), { x: x + 0.3, y: y + 0.3, w: 0.55, h: 0.55, align: "center", valign: "middle", fontFace: HEAD_FONT, fontSize: 16, bold: true, color: GRAPHITE, margin: 0 });
    s.addText(c.t, { x: x + 0.3, y: y + 1.05, w: cw - 0.6, h: 1.1, fontFace: HEAD_FONT, fontSize: 17, bold: true, color: AMBER, valign: "top", margin: 0 });
    s.addText(c.d, { x: x + 0.3, y: y + 2.15, w: cw - 0.6, h: ch - 2.4, fontFace: BODY_FONT, fontSize: 11.5, color: "D6DADC", valign: "top", margin: 0 });
  });

  s.addText([
    { text: "Live URL:  ", options: { bold: true, color: AMBER } },
    { text: "<your-streamlit-app-url>", options: { color: "D6DADC" } },
  ], { x: 0.6, y: 6.55, w: 12.1, h: 0.5, fontFace: BODY_FONT, fontSize: 13, valign: "middle", margin: 0 });
  footer(s, true);
}

// =====================================================================
// Slide 12 — Key takeaways (2x2 card grid)
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  header(s, "10", "Key Takeaways");

  const takeaways = [
    "The transformation is real and fast (41x sales growth since 2015) but heavily concentrated: China alone drove 63% of 2025's global volume, and the top 5 markets have held ~80% of sales throughout the decade.",
    "Nordic and European markets pioneered the fastest complete transformations (4-year tipping-to-mainstream sprints), but China's slower per-capita pace still moves far more metal.",
    "Legacy auto-manufacturing powerhouses electrify their home markets roughly 3x slower than other countries -- a real tension between industrial-policy caution and the pace of global change.",
    "Most of the world, including volume leader China, remains mid-transition (25-53% EV share) rather than past it -- the story of the next decade is still substantially unwritten.",
  ];
  const gw = 5.95, gh = 2.15, gap = 0.25, gx = 0.5, gy = 1.55;
  takeaways.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = gx + col * (gw + gap), y = gy + row * (gh + gap);
    s.addShape("roundRect", { x, y, w: gw, h: gh, rectRadius: 0.09, fill: { color: CARDTINT }, line: { type: "none" } });
    tagSquare(s, x + 0.25, y + 0.25, 0.5, AMBER, String(i + 1), GRAPHITE);
    s.addText(t, { x: x + 0.95, y: y + 0.2, w: gw - 1.2, h: gh - 0.4, fontFace: BODY_FONT, fontSize: 12, color: SLATE, valign: "top", margin: 0 });
  });
}

// =====================================================================
// Slide 13 — Methodology & limitations (two-column list)
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  header(s, "11", "Methodology & Limitations");
  const items = [
    "Source: IEA Global EV Outlook 2025, republished by Our World in Data under a compatible open license.",
    "Coverage starts later for markets with no measurable EV sales before roughly 2015-2019 -- fewer rows, not missing data.",
    "'Tipping point' (5%) and 'mainstream' (50%) follow commonly-cited EV-adoption S-curve benchmarks (BloombergNEF, IEA).",
    "'Auto-manufacturing powerhouse' is a fixed list built from OICA global vehicle-production rankings -- an analytical grouping, not a value judgement.",
    "The 'Rest of World' aggregate is a residual (World minus all named countries) and can show small negative year-over-year swings from data revisions.",
  ];
  const colW = 5.95;
  items.forEach((t, i) => {
    const col = i < 3 ? 0 : 1;
    const idxInCol = i < 3 ? i : i - 3;
    const x = 0.5 + col * (colW + 0.4);
    const y = 1.6 + idxInCol * 1.55;
    s.addShape("roundRect", { x, y: y + 0.05, w: 0.18, h: 0.18, rectRadius: 0.04, fill: { color: AMBER }, line: { type: "none" } });
    s.addText(t, { x: x + 0.4, y: y - 0.15, w: colW - 0.4, h: 1.4, fontFace: BODY_FONT, fontSize: 12, color: SLATE, valign: "top", margin: 0 });
  });
}

// =====================================================================
// Slide 14 — Thank you (centered, dot-grid corners instead of blobs)
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: GRAPHITE };
  dotGrid(s, 0.6, 0.55, 5, 3, 0.5, 0.16, "3A3F44");
  dotGrid(s, 10.0, 6.0, 5, 3, 0.5, 0.16, "3A3F44");
  s.addShape("roundRect", { x: W / 2 - 0.35, y: 2.55, w: 0.7, h: 0.7, rectRadius: 0.12, fill: { color: AMBER }, line: { type: "none" } });
  s.addText("Thank You", {
    x: 0, y: 3.5, w: W, h: 1.0, align: "center", fontFace: HEAD_FONT, fontSize: 38, bold: true, color: OFFWHITE, margin: 0,
  });
  s.addText("Global Electric Vehicle Market Analysis, 2010-2025", {
    x: 0, y: 4.45, w: W, h: 0.5, align: "center", fontFace: BODY_FONT, fontSize: 15, color: AMBER, margin: 0,
  });
  s.addText("Repository, dashboard, and notebook links in the README.", {
    x: 0, y: 4.95, w: W, h: 0.4, align: "center", fontFace: BODY_FONT, fontSize: 11, color: "B9C2C8", margin: 0,
  });
}

p.writeFile({ fileName: "EV_Market_Analysis_Presentation_Alt.pptx" }).then(() => {
  console.log("Wrote EV_Market_Analysis_Presentation_Alt.pptx");
});
