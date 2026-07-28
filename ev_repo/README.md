# Global Electric Vehicle Market Analysis, 2010-2025 — Final Individual Project (Data Visualization, Summer 2026)

How electric vehicles are transforming the automobile industry across different countries: adoption
speed, market concentration, the fate of legacy manufacturing powerhouses, and which markets are
still mid-transition. Delivered as an analysis notebook, a slide presentation, and an interactive
Streamlit dashboard.

**Live dashboard**: *add your Streamlit Community Cloud URL here after deploying (see below)*

## Dataset

Source: International Energy Agency, [*Global EV Outlook 2025*](https://www.iea.org/reports/global-ev-outlook-2025),
republished by [Our World in Data](https://ourworldindata.org/electric-car-sales) as four
country-year series: annual EV sales, EV sales share of the new-car market, EV stock (the installed
fleet), and the battery-electric (BEV) share of EV sales.

`data/build_dataset.py` merges the four raw series into one harmonized country-year panel and adds:

- **835 rows** · **60 countries** + World/Europe/EU27/Rest-of-World aggregates · **2010-2025**
- Continent groupings (Europe, Asia-Pacific, Americas, Middle East, Africa)
- An `auto_powerhouse` flag (the world's largest light-vehicle-producing nations, by OICA rankings)
- Market-phase tiers (Nascent / Early / Growth / Mainstream / Mature, by EV sales share)
- Each country's **tipping-point year** (first year crossing 5% EV sales share) and years-to-mainstream
- Year-over-year growth, each country's share of world sales that year, and within-year rankings

Raw source files: `data/raw/`. Cleaned panel: `data/clean_global_ev_2010_2025.csv`. Regenerate with:

```bash
cd data && python3 build_dataset.py
```

**Coverage note**: countries with no measurable EV sales before roughly 2015-2019 simply have fewer
rows — this reflects the market's real history, not missing data. "Auto-manufacturing powerhouse" is
an analytical grouping (China, USA, Japan, Germany, India, South Korea, Mexico, Spain, Brazil,
France, Thailand, Canada, UK, Italy, Czechia, Slovakia, Indonesia, Russia), not a value judgement.

## Repository layout

```
analysis.ipynb                 # 10 analytical questions, each with a Plotly visual
build_notebook.py               # regenerates analysis.ipynb
data/
  raw/                         # the four raw OWID/IEA source series
  build_dataset.py             # harmonizes raw files into one clean panel
  clean_global_ev_2010_2025.csv
dashboard/
  app.py                       # Streamlit dashboard (3 tabs, live filters)
presentation/
  deck.js                      # deck 1: "EV Circuit" theme (mint/charcoal, icon circles)
  deck_alt.js                  # deck 2: "Charging Amber" theme (amber/graphite, square cards)
  chart_data.py / chart_data.json      # per-slide native-chart data series (shared by both decks)
  compute_stats.py / presentation_data.json  # headline stats used in both decks
  EV_Market_Analysis_Presentation_FINAL.pptx / .pdf       # deck 1, rendered
  EV_Market_Analysis_Presentation_ALT_FINAL.pptx / .pdf   # deck 2, rendered
requirements.txt
```

Two ready-to-submit decks are included, built from the same data and stats but with distinct
themes and slide layouts -- use whichever fits, or submit both:

- **`EV_Market_Analysis_Presentation_FINAL`** — "EV Circuit" theme (deep charcoal + electric
  mint), icon-circle motif, chart-on-top / takeaway-band-below layout. Regenerate with `node deck.js`.
- **`EV_Market_Analysis_Presentation_ALT_FINAL`** — "Charging Amber" theme (graphite + amber +
  steel), square-card motif, split-screen title, left-chart / right-stat-card layout. Regenerate
  with `node deck_alt.js`.

## Running it yourself

```bash
pip install -r requirements.txt

# 1. Analysis notebook
jupyter notebook analysis.ipynb
# then: File -> Export Notebook As -> PDF or HTML

# 2. Dashboard, locally
cd dashboard
streamlit run app.py
```

## Deploying the dashboard (required before submission)

1. Create a **new public GitHub repository** for this project (not your classwork repo) and push
   this entire folder to it.
2. Go to [share.streamlit.io](https://share.streamlit.io), sign in with GitHub, and click "New app."
3. Point it at your repo, branch `main`, and main file path `dashboard/app.py`.
4. Deploy. Streamlit Community Cloud installs `requirements.txt` automatically (the one at the repo
   root already covers the dashboard's dependencies).
5. Copy the live URL back into this README, and into the "Live URL:" line in `presentation/deck.js`
   and/or `presentation/deck_alt.js` (whichever deck you're submitting), then rerun `node deck.js` /
   `node deck_alt.js` and re-export to PDF if you update it.

## Submission checklist (per the course brief)

- [x] Real-world, rich, varied dataset — done (see above)
- [x] 10 multi-dimensional analytical questions = 10 explanatory Plotly visuals — done, `analysis.ipynb`
- [x] Plotly only, CVD-safe, decluttered, annotated — done
- [x] Interactive Streamlit dashboard, built and ready to deploy — `dashboard/app.py`
- [ ] Deploy the dashboard to Streamlit Community Cloud and add the live URL above
- [ ] Push to a **public GitHub repo** (not the classwork one)
- [ ] Submit the repo link via **1-to-1 message on Microsoft Teams**
- [ ] **Deadline: Friday, 31 July 2026 — no late submissions**

## The 10 analytical questions

1. How fast has the world actually gone electric, and who is driving that volume?
2. Which continent leads the world's EV transformation today, and has leadership changed hands?
3. Once a market crosses the 5% "tipping point," how fast does it reach the mainstream (50%)?
4. Are legacy auto-manufacturing powerhouses transforming slower than markets with no ICE industry to protect?
5. As the EV market has scaled, has it settled on pure battery-electric, or stayed hybrid?
6. Does year-over-year sales growth slow down as a market matures, or does it stay explosive?
7. Has the global EV market become more or less concentrated among a handful of countries?
8. Which countries' new-car sales have transformed faster than their overall vehicle fleet?
9. Which countries climbed or fell the most in the global sales-volume leaderboard, 2015-2025?
10. What does a near-complete EV transformation actually look like, and how far is the rest of the world from it?
