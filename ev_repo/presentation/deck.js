const pres = require("pptxgenjs");
const stats = require("./presentation_data.json");
const chart = require("./chart_data.json");

const p = new pres();
p.layout = "LAYOUT_WIDE"; // 13.3 x 7.5in
const W = 13.33, H = 7.5;

// ---------------------------------------------------------------
// Palette: "EV Circuit" — deep circuit-board charcoal + electric mint/lime,
// distinct from any generic-blue deck. Chart series reuse the Okabe-Ito
// colour-blind-safe set already used in the notebook/dashboard, retuned so
// green anchors "electric" and grey anchors "the rest of the market."
// ---------------------------------------------------------------
const INK = "0B1D26";        // near-black charcoal-navy, dashboard-dark
const DEEPGREEN = "10332A";  // deep circuit green, secondary dark tone
const MINT = "3DDC97";       // electric mint accent
const SLATE = "45535A";
const OFFWHITE = "FFFFFF";
const LIGHTGREY = "F3F5F4";

const OKABE = {
  blue: "0072B2", orange: "E69F00", green: "009E73",
  vermillion: "D55E00", sky: "56B4E9", purple: "CC79A7", grey: "B0B0B0",
};
const CONTINENT_COLORS = {
  Europe: OKABE.blue, "Asia-Pacific": OKABE.vermillion, Americas: OKABE.orange,
  "Middle East": OKABE.purple, Africa: OKABE.grey,
};

const HEAD_FONT = "Cambria";
const BODY_FONT = "Calibri";

let pageNum = 1;
function footer(slide, dark) {
  slide.addText("Global Electric Vehicle Market Analysis, 2010-2025 · Data Visualization, Summer 2026", {
    x: 0.5, y: H - 0.45, w: 9, h: 0.3, fontFace: BODY_FONT, fontSize: 9,
    color: dark ? "8FB7A8" : SLATE, align: "left",
  });
  slide.addText(String(pageNum), {
    x: W - 1, y: H - 0.45, w: 0.5, h: 0.3, fontFace: BODY_FONT, fontSize: 9,
    color: dark ? "8FB7A8" : SLATE, align: "right",
  });
  pageNum += 1;
}

function iconCircle(slide, x, y, diameter, bg, letter, letterColor) {
  slide.addShape("ellipse", { x, y, w: diameter, h: diameter, fill: { color: bg }, line: { type: "none" } });
  slide.addText(letter, {
    x, y, w: diameter, h: diameter, align: "center", valign: "middle",
    fontFace: HEAD_FONT, fontSize: diameter * 26, bold: true, color: letterColor, margin: 0,
  });
}

function questionHeader(slide, qnum, title) {
  slide.addText(`Q${qnum}`, {
    x: 0.5, y: 0.35, w: 1.0, h: 0.5, fontFace: HEAD_FONT, fontSize: 20, bold: true, color: MINT, margin: 0,
  });
  slide.addText(title, {
    x: 1.4, y: 0.3, w: 11.4, h: 0.85, fontFace: HEAD_FONT, fontSize: 21, bold: true, color: INK,
    valign: "top", margin: 0,
  });
}

function insightBox(slide, text) {
  slide.addShape("roundRect", {
    x: 0.5, y: 6.15, w: 12.33, h: 1.0, rectRadius: 0.08,
    fill: { color: LIGHTGREY }, line: { type: "none" },
    shadow: { type: "outer", color: "1A1A1A", opacity: 0.12, blur: 6, offset: 2, angle: 90 },
  });
  slide.addText([{ text: "Takeaway: ", options: { bold: true, color: INK } }, { text, options: { color: SLATE } }], {
    x: 0.75, y: 6.15, w: 11.83, h: 1.0, fontFace: BODY_FONT, fontSize: 13, valign: "middle", margin: 0,
  });
}

// =====================================================================
// Slide 1 — Title
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: INK };
  s.addShape("ellipse", { x: 10.6, y: -1.3, w: 4.2, h: 4.2, fill: { color: DEEPGREEN }, line: { type: "none" } });
  s.addShape("ellipse", { x: -1.6, y: 5.2, w: 3.6, h: 3.6, fill: { color: DEEPGREEN }, line: { type: "none" } });
  s.addText("GLOBAL ELECTRIC VEHICLE MARKET ANALYSIS", {
    x: 0.9, y: 2.0, w: 11.5, h: 1.1, fontFace: HEAD_FONT, fontSize: 36, bold: true, color: OFFWHITE, margin: 0,
  });
  s.addText("How EVs Are Transforming the Automobile Industry Across Countries, 2010-2025", {
    x: 0.9, y: 3.05, w: 11.5, h: 0.6, fontFace: BODY_FONT, fontSize: 18, color: MINT, margin: 0,
  });
  s.addText("Final Individual Project — Data Visualization, Summer 2026", {
    x: 0.9, y: 4.9, w: 11.5, h: 0.4, fontFace: BODY_FONT, fontSize: 14, color: "C7D3CE", margin: 0,
  });
  s.addText(`${stats.n_countries_total} countries  ·  16 years (2010-2025)  ·  IEA Global EV Outlook 2025 data, via Our World in Data`, {
    x: 0.9, y: 5.4, w: 11.5, h: 0.4, fontFace: BODY_FONT, fontSize: 13, color: "8FB7A8", margin: 0,
  });
}

// =====================================================================
// Slide 2 — Dataset & scope
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  s.addText("The Dataset: A Decade and a Half of EV Adoption", {
    x: 0.5, y: 0.4, w: 12.3, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: INK, margin: 0,
  });
  s.addText(
    "One row per country per year, 2010-2025, built from four IEA Global EV Outlook 2025 series republished by " +
    "Our World in Data: annual EV sales, EV sales as a share of all new car sales, EV stock (the installed fleet), " +
    "and the battery-electric (BEV) share of EV sales. Enriched with continent groupings, an auto-manufacturing-" +
    "powerhouse flag, market-phase tiers, and each country's 'tipping point' year.",
    { x: 0.5, y: 1.2, w: 7.5, h: 1.9, fontFace: BODY_FONT, fontSize: 14, color: SLATE, valign: "top", margin: 0 }
  );

  const boxStats = [
    { n: `${stats.n_countries_total}`, label: "Countries tracked", color: OKABE.blue },
    { n: `${stats.n_countries_tipped}`, label: "Crossed the 5% tipping point", color: OKABE.vermillion },
    { n: `${stats.n_countries_reached_mainstream}`, label: "Reached 50% EV sales share", color: MINT },
    { n: `${stats.world_sales_multiple_2015_2025}x`, label: "World EV sales growth, 2015-25", color: OKABE.orange },
  ];
  boxStats.forEach((st, i) => {
    const x = 0.5 + i * 3.13;
    s.addShape("roundRect", { x, y: 3.35, w: 2.9, h: 1.5, rectRadius: 0.08, fill: { color: LIGHTGREY }, line: { type: "none" } });
    s.addText(st.n, { x, y: 3.55, w: 2.9, h: 0.75, align: "center", fontFace: HEAD_FONT, fontSize: 30, bold: true, color: st.color, margin: 0 });
    s.addText(st.label, { x: x + 0.15, y: 4.35, w: 2.6, h: 0.45, align: "center", fontFace: BODY_FONT, fontSize: 11, color: SLATE, margin: 0 });
  });

  s.addText(
    "Source: International Energy Agency, Global EV Outlook 2025 — https://www.iea.org/reports/global-ev-outlook-2025, " +
    "via Our World in Data (https://ourworldindata.org/electric-car-sales).",
    { x: 0.5, y: 5.25, w: 12.3, h: 0.6, fontFace: BODY_FONT, fontSize: 11, italic: true, color: SLATE, valign: "top", margin: 0 }
  );

  s.addText(
    "'Auto-manufacturing powerhouse' is a fixed list of the world's largest light-vehicle producing nations (China, USA, " +
    "Japan, Germany, India, South Korea, and others) used to compare adoption speed against markets with no legacy " +
    "internal-combustion industry to protect — an analytical grouping, not a value judgement.",
    { x: 0.5, y: 5.9, w: 12.3, h: 1.0, fontFace: BODY_FONT, fontSize: 11, color: SLATE, valign: "top", margin: 0 }
  );
}

// =====================================================================
// Slide 3 — Q1: World transformation
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 1, "How fast has the world actually gone electric, and who is driving that volume?");

  s.addChart(
    [
      { type: "bar", data: [{ name: "World EV sales (millions)", labels: chart.years.map(String), values: chart.world_sales_millions }],
        options: { chartColors: [OKABE.grey], barGapWidthPct: 40 } },
      { type: "line", data: [{ name: "World EV sales share (%)", labels: chart.years.map(String), values: chart.world_sales_share }],
        options: { chartColors: [MINT], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 6, secondaryValAxis: true, secondaryCatAxis: true } },
    ],
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55,
      showTitle: true, title: "World EV sales grew 41x from 2015-2025 as their market share passed 25%",
      titleFontSize: 14, titleColor: INK,
      showLegend: true, legendPos: "b", legendFontSize: 11,
      showValue: false,
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
      valAxisTitle: "EV sales (millions/year)", showValAxisTitle: true, valAxisTitleColor: SLATE, valAxisTitleFontSize: 11,
      valAxes: [
        { showValAxisTitle: true, valAxisTitle: "EV sales (millions/year)", valAxisTitleColor: SLATE, valGridLine: { color: "E4E7E6", size: 1 } },
        { showValAxisTitle: true, valAxisTitle: "Sales share (%)", valAxisTitleColor: SLATE, valGridLine: { style: "none" } },
      ],
      catAxes: [{ catAxisLabelColor: SLATE }, { catAxisHidden: true }],
    }
  );
  insightBox(s, `China alone rose from ${stats.china_global_share_2015}% to ${stats.china_global_share_2025}% of that global sales volume -- the "global" EV transformation is, in raw units, disproportionately a Chinese one.`);
  footer(s, false);
}

// =====================================================================
// Slide 4 — Q2: Continental leadership
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 2, "Which continent leads the world's EV transformation today?");

  s.addChart(
    "area",
    chart.continents.map((c) => ({ name: c, labels: chart.years.map(String), values: chart.continent_share_by_year[c] })),
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55,
      showTitle: true, title: "Asia-Pacific's share of global EV sales volume overtook Europe's around 2022",
      titleFontSize: 14, titleColor: INK,
      chartColors: chart.continents.map((c) => CONTINENT_COLORS[c]),
      barGrouping: "stacked",
      showLegend: true, legendPos: "b", legendFontSize: 11,
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
      valAxisTitle: "Share of that year's world EV sales (%)", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valAxisMaxVal: 100,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, "Europe held the clearest early lead, but Asia-Pacific's volume (driven overwhelmingly by China) has commanded roughly two-thirds of world EV sales since 2022.");
  footer(s, false);
}

// =====================================================================
// Slide 5 — Q3: Tipping-point speed
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 3, "Once a market crosses the 5% tipping point, how fast does it reach the mainstream (50%)?");

  s.addChart(
    "bar",
    [{ name: "Years from 5% to 50% EV sales share", labels: chart.tipping_speed_countries, values: chart.tipping_speed_years }],
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55, barDir: "bar",
      showTitle: true, title: "Nordic markets crossed from tipping point to mainstream fastest",
      titleFontSize: 14, titleColor: INK,
      chartColors: [MINT], showLegend: false,
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 11,
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
      valAxisTitle: "Years from 5% to 50% share", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, `Only ${stats.n_countries_reached_mainstream} of ${stats.n_countries_total} tracked countries have reached 50% EV sales share so far. China took 6 years to make the same jump Iceland made in 4 -- across roughly 1,000x the sales volume.`);
  footer(s, false);
}

// =====================================================================
// Slide 6 — Q4: Powerhouses vs challengers
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 4, "Are legacy auto-manufacturing powerhouses transforming slower than other markets?");

  s.addChart(
    "bar",
    [{ name: "Median EV sales share, 2022-2025 (%)", labels: ["Auto-manufacturing powerhouses", "Other markets"],
       values: [chart.powerhouse_median, chart.nonpowerhouse_median] }],
    {
      x: 1.5, y: 1.5, w: 10.3, h: 4.4,
      showTitle: true, title: "Powerhouse nations lag other markets on home-market EV adoption",
      titleFontSize: 14, titleColor: INK,
      chartColors: [OKABE.vermillion], showLegend: false,
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 14, dataLabelFormatCode: "0.0",
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE, valAxisLabelFormatCode: "0",
      valAxisTitle: "Median EV share of new car sales (%)", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, `In 2022-2025, the median EV sales share among auto-manufacturing powerhouses was ${chart.powerhouse_median}%, versus ${chart.nonpowerhouse_median}% among other markets -- roughly a three-fold gap.`);
  footer(s, false);
}

// =====================================================================
// Slide 7 — Q5: BEV vs PHEV mix
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 5, "As the market has scaled, has it settled on pure battery-electric, or stayed hybrid?");

  s.addChart(
    "area",
    [
      { name: "BEV (battery-electric)", labels: chart.years.map(String), values: chart.bev_share_by_year },
      { name: "PHEV + FCEV", labels: chart.years.map(String), values: chart.phev_share_by_year },
    ],
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55,
      showTitle: true, title: "PHEVs hold a persistent ~30-35% share -- the world has not converged on pure battery-electric",
      titleFontSize: 14, titleColor: INK,
      chartColors: [MINT, OKABE.orange], showLegend: true, legendPos: "b", legendFontSize: 11,
      barGrouping: "stacked",
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
      valAxisTitle: "Share of world EV sales (%)", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, "Global BEV share has hovered in the 60-65% range through the mid-2020s, after dipping from the pioneer-era 70-90% highs -- plug-in hybrids found a durable foothold rather than disappearing.");
  footer(s, false);
}

// =====================================================================
// Slide 8 — Q7: Market concentration
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 6, "Has the global EV market become more or less concentrated among a few countries?");

  s.addChart(
    "line",
    [{ name: "Top-5 countries' share of world EV sales (%)", labels: chart.years.map(String), values: chart.top5_concentration_by_year }],
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55,
      showTitle: true, title: "The top 5 EV markets still command roughly 80% of world sales volume",
      titleFontSize: 14, titleColor: INK,
      chartColors: [OKABE.vermillion], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 7,
      showLegend: false, showValue: true, dataLabelPosition: "t", dataLabelColor: SLATE, dataLabelFontSize: 10, dataLabelFormatCode: "0.0",
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE, valAxisMinVal: 0, valAxisMaxVal: 100,
      valAxisTitle: "Top-5 share of world EV sales (%)", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, `Concentration held essentially flat -- ${stats.top5_share_2015}% in 2015 (led by ${stats.top5_countries_2015.slice(0,3).join(", ")}) to ${stats.top5_share_2025}% in 2025 (led by ${stats.top5_countries_2025.slice(0,3).join(", ")}) -- even as dozens of new countries entered the market.`);
  footer(s, false);
}

// =====================================================================
// Slide 9 — Q9: Ranking churn
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 7, "Which countries climbed or fell the most in the global sales-volume ranking, 2015-2025?");

  const moverColors = chart.mover_climb.map((v) => (v > 0 ? MINT : OKABE.vermillion));
  s.addChart(
    "bar",
    [{ name: "Rank change, 2015 to 2025 (positive = climbed)", labels: chart.mover_countries, values: chart.mover_climb }],
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55, barDir: "bar",
      showTitle: true, title: "Turkey, Thailand and Brazil surged up the ranking; Japan and Iceland slid down it",
      titleFontSize: 14, titleColor: INK,
      chartColors: moverColors, invertedColors: moverColors, showLegend: false,
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontSize: 10,
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
      valAxisTitle: "Rank-position change (positive = climbed)", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, "Japan went from the world's 5th-largest EV market in 2015 to 22nd in 2025 -- not because its own sales fell, but because dozens of other countries' volumes scaled past its comparatively flat growth.");
  footer(s, false);
}

// =====================================================================
// Slide 10 — Q10: Spotlight trajectories
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  questionHeader(s, 8, "What does a near-complete EV transformation actually look like?");

  const spotlightColors = [MINT, OKABE.sky, OKABE.vermillion, OKABE.grey, "1A1A1A"];
  s.addChart(
    "line",
    chart.spotlight_countries.map((c, i) => ({ name: c, labels: chart.years.map(String), values: chart.spotlight_series[c] })),
    {
      x: 0.6, y: 1.35, w: 12.1, h: 4.55,
      showTitle: true, title: "Norway and Iceland show what near-complete displacement of the ICE looks like",
      titleFontSize: 14, titleColor: INK,
      chartColors: spotlightColors, lineSize: 2.5, showLegend: true, legendPos: "b", legendFontSize: 11,
      catAxisLabelColor: SLATE, valAxisLabelColor: SLATE,
      valAxisTitle: "EV share of new car sales (%)", showValAxisTitle: true, valAxisTitleColor: SLATE,
      valGridLine: { color: "E4E7E6", size: 1 }, catGridLine: { style: "none" },
    }
  );
  insightBox(s, `Norway reached ${stats.norway_2025_share}% EV sales share in 2025 and Iceland ${stats.iceland_2025_share}% -- but the World average (25%) and even China (53%) show most of the globe is still mid-transition, not past it.`);
  footer(s, false);
}

// =====================================================================
// Slide 11 — Dashboard walkthrough
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: INK };
  s.addText("Explore It Yourself: The Interactive Dashboard", {
    x: 0.6, y: 0.5, w: 12.1, h: 0.7, fontFace: HEAD_FONT, fontSize: 28, bold: true, color: OFFWHITE, margin: 0,
  });

  const tabsInfo = [
    { t: "Global Overview", d: "World sales/share trend, a country choropleth, and the top-15 markets by volume, for any year and continent filter." },
    { t: "Adoption S-Curve Explorer", d: "Spotlight any country against its continent and the world; a bar chart of every market's 5%-to-50% tipping speed." },
    { t: "Powerhouses vs. Challengers", d: "Legacy manufacturer vs. other-market comparison, a live growth-vs-maturity scatter explorer, and ranking-churn charts." },
  ];
  tabsInfo.forEach((info, i) => {
    const y = 1.6 + i * 1.55;
    iconCircle(s, 0.6, y, 0.7, DEEPGREEN, String(i + 1), MINT);
    s.addText(info.t, { x: 1.55, y: y - 0.05, w: 10.8, h: 0.5, fontFace: HEAD_FONT, fontSize: 18, bold: true, color: MINT, margin: 0 });
    s.addText(info.d, { x: 1.55, y: y + 0.45, w: 10.8, h: 0.9, fontFace: BODY_FONT, fontSize: 13, color: "C7D3CE", valign: "top", margin: 0 });
  });

  s.addText([
    { text: "Live URL: ", options: { bold: true, color: MINT } },
    { text: "<your-streamlit-app-url>", options: { color: "C7D3CE" } },
  ], { x: 0.6, y: 6.5, w: 12.1, h: 0.5, fontFace: BODY_FONT, fontSize: 14, valign: "middle", margin: 0 });
  footer(s, true);
}

// =====================================================================
// Slide 12 — Key takeaways
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  s.addText("Key Takeaways", {
    x: 0.6, y: 0.5, w: 12.1, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: INK, margin: 0,
  });

  const takeaways = [
    "The transformation is real and fast (41x sales growth since 2015) but heavily concentrated: China alone drove 63% of 2025's global volume, and the top 5 markets have held ~80% of sales throughout the decade.",
    "Nordic and European markets pioneered the fastest complete transformations (Norway, Iceland: 4-year tipping-to-mainstream sprints), but they are small markets -- China's slower per-capita pace still moves far more metal.",
    "Legacy auto-manufacturing powerhouses are electrifying their home markets roughly 3x slower than other countries, a genuine tension between industrial-policy caution and the pace of global change.",
    "Most of the world, including the current volume leader China, remains mid-transition (25-53% EV share) rather than past it -- the story of the next decade is still substantially unwritten.",
  ];
  takeaways.forEach((t, i) => {
    const y = 1.5 + i * 1.15;
    iconCircle(s, 0.6, y, 0.55, DEEPGREEN, String(i + 1), MINT);
    s.addText(t, { x: 1.4, y: y - 0.05, w: 11.3, h: 1.0, fontFace: BODY_FONT, fontSize: 14, color: SLATE, valign: "top", margin: 0 });
  });
}

// =====================================================================
// Slide 13 — Methodology & limitations
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: OFFWHITE };
  s.addText("Methodology & Limitations", {
    x: 0.6, y: 0.5, w: 12.1, h: 0.7, fontFace: HEAD_FONT, fontSize: 30, bold: true, color: INK, margin: 0,
  });
  const items = [
    "Source: IEA Global EV Outlook 2025, republished by Our World in Data under a compatible open license.",
    "Coverage starts later for markets with no measurable EV sales before roughly 2015-2019 -- those countries simply have fewer rows, not missing data.",
    "'Tipping point' (5%) and 'mainstream' (50%) thresholds follow commonly-cited EV-adoption S-curve benchmarks (BloombergNEF, IEA), not a claim inherent to the raw data.",
    "'Auto-manufacturing powerhouse' is a fixed list built from OICA global vehicle-production rankings -- an analytical grouping for comparison, not a value judgement.",
    "The 'Rest of World' aggregate is a residual (World minus all named countries) and can show small negative year-over-year swings from data revisions -- not a literal fleet decline.",
  ];
  items.forEach((t, i) => {
    const y = 1.5 + i * 0.95;
    s.addShape("ellipse", { x: 0.6, y: y + 0.08, w: 0.12, h: 0.12, fill: { color: MINT }, line: { type: "none" } });
    s.addText(t, { x: 1.0, y: y - 0.1, w: 11.7, h: 0.85, fontFace: BODY_FONT, fontSize: 13, color: SLATE, valign: "top", margin: 0 });
  });
}

// =====================================================================
// Slide 14 — Thank you
// =====================================================================
{
  const s = p.addSlide();
  s.background = { color: INK };
  s.addShape("ellipse", { x: -1.4, y: -1.6, w: 4.4, h: 4.4, fill: { color: DEEPGREEN }, line: { type: "none" } });
  s.addShape("ellipse", { x: 10.8, y: 4.6, w: 4.0, h: 4.0, fill: { color: DEEPGREEN }, line: { type: "none" } });
  s.addText("Thank You", {
    x: 0.9, y: 2.7, w: 11.5, h: 1.0, fontFace: HEAD_FONT, fontSize: 40, bold: true, color: OFFWHITE, margin: 0,
  });
  s.addText("Global Electric Vehicle Market Analysis, 2010-2025", {
    x: 0.9, y: 3.7, w: 11.5, h: 0.5, fontFace: BODY_FONT, fontSize: 16, color: MINT, margin: 0,
  });
  s.addText("Repository, dashboard, and notebook links in the README.", {
    x: 0.9, y: 4.3, w: 11.5, h: 0.4, fontFace: BODY_FONT, fontSize: 12, color: "8FB7A8", margin: 0,
  });
}

p.writeFile({ fileName: "EV_Market_Analysis_Presentation.pptx" }).then(() => {
  console.log("Wrote EV_Market_Analysis_Presentation.pptx");
});
