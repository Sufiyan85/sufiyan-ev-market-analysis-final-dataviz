"""Regenerates analysis.ipynb from scratch. Run with: python3 build_notebook.py
Builds the .ipynb JSON directly (no nbformat dependency needed to *write* it --
only to *run* it, which requires the packages in requirements.txt)."""
import json

NB_VERSION = 4
NB_MINOR = 5


def md(src):
    return {"cell_type": "markdown", "metadata": {}, "source": src.strip("\n").splitlines(keepends=True)}


def code(src):
    return {
        "cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [],
        "source": src.strip("\n").splitlines(keepends=True),
    }


SETUP = '''
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio

pio.templates.default = "plotly_white"
df = pd.read_csv("data/clean_global_ev_2010_2025.csv")
countries = df[~df["is_aggregate"]].copy()
world = df[df["entity"] == "World"].copy()

# Okabe-Ito, a colorblind-safe palette (Okabe & Ito, 2008), retuned for this
# project: green anchors "electric", grey anchors "the rest of the market".
GREY, BLUE, ORANGE, GREEN, VERMILLION, SKY, PURPLE = (
    "#B0B0B0", "#0072B2", "#E69F00", "#009E73", "#D55E00", "#56B4E9", "#CC79A7",
)
CONTINENT_COLORS = {
    "Europe": BLUE, "Americas": ORANGE, "Asia-Pacific": VERMILLION,
    "Middle East": PURPLE, "Africa": GREY,
}
TEMPLATE = "plotly_white"
'''

cells = []
cells.append(md('''
# Global Electric Vehicle Market Analysis, 2010-2025

How electric vehicles are transforming the automobile industry across different
countries: adoption speed, market concentration, the fate of legacy
manufacturing powerhouses, and which markets are still on the runway.

**Dataset**: 60 countries + World/Europe/EU27/Rest-of-World aggregates, 2010-2025,
built from four IEA Global EV Outlook 2025 series (via Our World in Data): annual
EV sales, EV sales share of the new-car market, EV stock (the installed fleet),
and the BEV share of EV sales. See `data/build_dataset.py` for the full
harmonization logic (continent groups, auto-powerhouse flag, tipping-point year,
tiering, rankings).
'''))
cells.append(code(SETUP))
cells.append(code('''
print(f"{countries['entity'].nunique()} countries, {df['year'].min():.0f}-{df['year'].max():.0f}")
df.head()
'''))

questions = [
    dict(
        title="Q1. How fast has the world actually gone electric, and who is driving that volume?",
        takeaway=(
            "World EV sales rose from 520,000 in 2015 to 21.2 million in 2025 -- a "
            "41x increase in a decade -- while the EV share of every new car sold "
            "worldwide climbed from 0.7% to 25%. China alone went from 41% to 63% "
            "of that global volume, meaning the 'global' EV transformation is, in "
            "raw unit terms, disproportionately a Chinese one."
        ),
        code='''
fig = go.Figure()
fig.add_trace(go.Bar(x=world["year"], y=world["ev_sales"] / 1e6, name="World EV sales (millions)",
                      marker_color=GREY, opacity=0.55, yaxis="y"))
fig.add_trace(go.Scatter(x=world["year"], y=world["ev_sales_share"], name="World EV sales share (%)",
                          mode="lines+markers", line=dict(color=GREEN, width=3), yaxis="y2"))
fig.update_layout(
    title="World EV sales grew 41x from 2015-2025 while their market share passed 25%<br>"
          "<sup>Bars: annual unit sales (left axis). Line: share of all new car sales (right axis).</sup>",
    yaxis=dict(title="EV sales (millions/year)"),
    yaxis2=dict(title="Share of new car sales (%)", overlaying="y", side="right", showgrid=False),
    xaxis_title="", legend=dict(orientation="h", y=1.15), height=480,
)
fig.show()
''',
    ),
    dict(
        title="Q2. Which continent leads the world's EV transformation today, and has leadership changed hands?",
        takeaway=(
            "Europe held the clearest early lead (it was already at 10% EV share "
            "in 2020, when China was at 5.7%), but Asia-Pacific overtook it by "
            "value from roughly 2022 onward as China's sheer sales volume came to "
            "dominate the global total -- even though China's own *sales share* "
            "(53% in 2025) still trails Norway or the Netherlands."
        ),
        code='''
cont_year = (countries.dropna(subset=["ev_sales"])
             .groupby(["year", "continent"])["ev_sales"].sum().reset_index())
cont_year["pct_of_year_total"] = cont_year["ev_sales"] / cont_year.groupby("year")["ev_sales"].transform("sum") * 100

fig = px.area(cont_year, x="year", y="pct_of_year_total", color="continent", template=TEMPLATE,
              color_discrete_map=CONTINENT_COLORS,
              labels={"pct_of_year_total": "Share of that year's global EV sales volume (%)", "year": ""},
              title="Asia-Pacific's share of global EV sales volume overtook Europe's around 2022<br>"
                    "<sup>Continental share of worldwide EV unit sales, by year (World/EU27 aggregates excluded)</sup>")
fig.update_layout(height=480, legend_title="")
fig.show()
''',
    ),
    dict(
        title="Q3. Once a market crosses the 5% 'tipping point,' how fast does it reach the mainstream (50%)?",
        takeaway=(
            "27 of the 60 tracked countries have crossed the widely-cited 5% EV "
            "sales-share tipping point, but only 7 have gone on to cross 50%. The "
            "fastest transitions -- Iceland and Denmark, 4 years; Sweden, 5 years "
            "-- are all small Nordic/European markets. China took 6 years (2019 to "
            "2025) to make the same jump, but did so across a market roughly "
            "1,000x the size."
        ),
        code='''
tipped = countries[countries["tipping_year"].notna()][["entity", "tipping_year", "continent"]].drop_duplicates()
over50 = (countries[countries["ev_sales_share"] >= 50]
          .groupby("entity")["year"].min().rename("year_50pct").reset_index())
speed = tipped.merge(over50, on="entity", how="left")
speed["years_5_to_50"] = speed["year_50pct"] - speed["tipping_year"]
plot_df = speed.dropna(subset=["years_5_to_50"]).sort_values("years_5_to_50")

fig = px.bar(plot_df, x="years_5_to_50", y="entity", orientation="h", color="continent",
             color_discrete_map=CONTINENT_COLORS, template=TEMPLATE,
             labels={"years_5_to_50": "Years from 5% to 50% EV sales share", "entity": ""},
             title="Nordic markets crossed from 'tipping point' to 'mainstream' fastest -- China took 6 years at 1,000x the scale<br>"
                   "<sup>Only 7 of 60 tracked countries have reached 50% EV sales share so far</sup>")
fig.update_layout(height=420, showlegend=True, legend_title="")
fig.show()
''',
    ),
    dict(
        title="Q4. Are legacy auto-manufacturing powerhouses transforming slower than markets with no ICE industry to protect?",
        takeaway=(
            "In 2025, the median EV sales share among the world's traditional "
            "vehicle-manufacturing powerhouses (Germany, Japan, USA, South Korea, "
            "India, and others building the majority of the world's cars) is 11%, "
            "versus 34% among all other tracked countries -- a three-fold gap. "
            "The nations with the deepest ICE manufacturing base to defend are "
            "electrifying their own home sales the slowest."
        ),
        code='''
plot_df = countries.dropna(subset=["ev_sales_share"]).copy()
plot_df["group"] = plot_df["auto_powerhouse"].map({True: "Auto-manufacturing powerhouse", False: "Other market"})

fig = px.box(plot_df[plot_df["year"] >= 2022], x="group", y="ev_sales_share", color="group",
             color_discrete_map={"Auto-manufacturing powerhouse": VERMILLION, "Other market": GREEN},
             template=TEMPLATE, points="all",
             labels={"ev_sales_share": "EV share of new car sales (%)", "group": ""},
             title="Legacy vehicle-manufacturing powerhouses lag other markets on home-market EV adoption<br>"
                   "<sup>Distribution of EV sales share, 2022-2025, powerhouse nations vs. everyone else</sup>")
fig.update_layout(height=480, showlegend=False)
fig.show()
''',
    ),
    dict(
        title="Q5. As the EV market has scaled, has it settled on pure battery-electric, or stayed hybrid?",
        takeaway=(
            "Globally, the BEV share of EV sales dipped from the high-60s/70s in "
            "2010-2015 (when the market was small and dominated by pioneers) down "
            "to the 60-65% range through the mid-2020s as PHEVs found a foothold "
            "in markets like Germany and Sweden -- the technology mix has not "
            "converged; it has stayed a genuine BEV/PHEV contest even at scale."
        ),
        code='''
world_bev = world[["year", "bev_share_ev_cars", "phev_fcev_share_ev_cars"]].melt(
    id_vars="year", var_name="powertrain", value_name="share")
world_bev["powertrain"] = world_bev["powertrain"].map(
    {"bev_share_ev_cars": "BEV (battery-electric)", "phev_fcev_share_ev_cars": "PHEV + FCEV"})

fig = px.area(world_bev, x="year", y="share", color="powertrain", template=TEMPLATE,
              color_discrete_map={"BEV (battery-electric)": GREEN, "PHEV + FCEV": ORANGE},
              labels={"share": "Share of world EV sales (%)", "year": ""},
              title="The world has not converged on pure battery-electric -- PHEVs hold a persistent ~30-35% share<br>"
                    "<sup>Global EV sales by powertrain type, 2010-2025</sup>")
fig.update_layout(height=460, legend_title="")
fig.show()
''',
    ),
    dict(
        title="Q6. Does year-over-year sales growth slow down as a market matures, or does it stay explosive?",
        takeaway=(
            "Median year-over-year sales growth is fastest in the earliest "
            "tiers -- 70%+ in the Nascent (<1% share) and Early (1-5%) stages -- "
            "and roughly halves to 20-23% once a market reaches Mainstream (20-"
            "50%) or Mature (>50%) status. Growth doesn't stop as markets mature; "
            "it downshifts from exponential to merely fast."
        ),
        code='''
TIER_ORDER = ["Nascent (<1%)", "Early (1-5%)", "Growth (5-20%)", "Mainstream (20-50%)", "Mature (>50%)"]
plot_df = countries.dropna(subset=["sales_share_tier", "yoy_sales_growth_pct"]).copy()
plot_df = plot_df[plot_df["yoy_sales_growth_pct"].between(-100, 400)]  # trim extreme early-market outliers for readability

fig = px.box(plot_df, x="sales_share_tier", y="yoy_sales_growth_pct", category_orders={"sales_share_tier": TIER_ORDER},
             template=TEMPLATE, color_discrete_sequence=[BLUE],
             labels={"yoy_sales_growth_pct": "Year-over-year sales growth (%)", "sales_share_tier": "Market phase (by EV sales share)"},
             title="EV sales growth downshifts from exponential to merely fast as markets mature<br>"
                   "<sup>Year-over-year growth in EV sales, grouped by each country-year's market phase</sup>")
fig.update_layout(height=480)
fig.show()
''',
    ),
    dict(
        title="Q7. Has the global EV market become more or less concentrated among a handful of countries?",
        takeaway=(
            "The top 5 EV-selling countries accounted for 78.9% of world EV sales "
            "in 2015 (China, USA, Norway, UK, Japan) and 80.9% in 2025 (China, "
            "USA, Germany, UK, France) -- concentration has held essentially flat "
            "even as dozens of new countries entered the market, because the "
            "leaders' own volumes grew even faster than the market's long tail."
        ),
        code='''
def top5_share(year):
    yr = countries[countries["year"] == year].dropna(subset=["ev_sales"])
    total = yr["ev_sales"].sum()
    return yr.nlargest(5, "ev_sales")["ev_sales"].sum() / total * 100

years = sorted(countries["year"].dropna().unique())
conc = pd.DataFrame({"year": years, "top5_share": [top5_share(y) for y in years]})

fig = px.line(conc, x="year", y="top5_share", template=TEMPLATE, markers=True,
              color_discrete_sequence=[VERMILLION],
              labels={"top5_share": "Top-5 countries' share of world EV sales (%)", "year": ""},
              title="The top 5 EV markets still command ~80% of global sales volume, unchanged since 2015<br>"
                    "<sup>Combined share of world annual EV sales held by that year's 5 largest markets</sup>")
fig.update_yaxes(range=[0, 100])
fig.update_layout(height=460)
fig.show()
''',
    ),
    dict(
        title="Q8. Which countries' new-car sales have transformed faster than their overall vehicle fleet?",
        takeaway=(
            "Comparing each country's 2025 sales share against its share of the "
            "world's installed EV fleet highlights the countries whose *current* "
            "purchasing behavior is running well ahead of their *historical* "
            "fleet composition -- these are the markets where the transformation "
            "of the actual roads, not just the showroom, is still mostly ahead of them."
        ),
        code='''
latest = countries[countries["year"] == 2025].dropna(subset=["ev_sales_share", "ev_stock"]).copy()
latest["stock_share_of_world_fleet"] = latest["ev_stock"] / latest["ev_stock"].sum() * 100
top20 = latest.nlargest(20, "ev_sales")

fig = px.scatter(top20, x="stock_share_of_world_fleet", y="ev_sales_share", text="entity",
                  color="continent", color_discrete_map=CONTINENT_COLORS, template=TEMPLATE,
                  size="ev_sales", size_max=40,
                  labels={"stock_share_of_world_fleet": "Share of world's installed EV fleet (%, log scale)",
                          "ev_sales_share": "2025 EV share of new car sales (%)"},
                  title="Countries above the trend are electrifying new sales faster than their existing fleet reflects<br>"
                        "<sup>Top 20 markets by 2025 EV sales volume; bubble size = 2025 EV sales</sup>")
fig.update_xaxes(type="log")
fig.update_traces(textposition="top center")
fig.update_layout(height=520)
fig.show()
''',
    ),
    dict(
        title="Q9. Which countries climbed or fell the most in the global sales-volume leaderboard, 2015-2025?",
        takeaway=(
            "Turkey (+21 places), Thailand (+20) and Brazil (+19) are the "
            "decade's biggest climbers in the global EV sales-volume ranking -- "
            "all markets with no early EV policy push that later industrialized "
            "quickly. South Africa (-28), Iceland (-23) and Japan (-17) fell "
            "furthest: Japan in particular went from the world's 5th-largest EV "
            "market in 2015 to 22nd in 2025, as other countries' volumes scaled "
            "past its comparatively flat growth."
        ),
        code='''
r2015 = countries[countries["year"] == 2015].set_index("entity")["rank_sales_in_year"]
r2025 = countries[countries["year"] == 2025].set_index("entity")["rank_sales_in_year"]
both = pd.DataFrame({"rank_2015": r2015, "rank_2025": r2025}).dropna()
both["climb"] = both["rank_2015"] - both["rank_2025"]
top_movers = pd.concat([both.nlargest(6, "climb"), both.nsmallest(6, "climb")]).reset_index()
top_movers = top_movers.rename(columns={"index": "entity"}).sort_values("climb")

fig = go.Figure()
for _, row in top_movers.iterrows():
    color = GREEN if row["climb"] > 0 else VERMILLION
    fig.add_trace(go.Scatter(x=[row["rank_2015"], row["rank_2025"]], y=[row["entity"], row["entity"]],
                              mode="lines+markers", line=dict(color=color, width=3),
                              marker=dict(size=10), showlegend=False))
fig.update_layout(
    title="Turkey, Thailand and Brazil surged up the EV sales-volume ranking; Japan and Iceland slid down it<br>"
          "<sup>Global sales-volume rank in 2015 (left dot) vs. 2025 (right dot) -- lower rank number = larger market</sup>",
    xaxis=dict(title="Global sales-volume rank (1 = largest market)", autorange="reversed"),
    yaxis_title="", template=TEMPLATE, height=520,
)
fig.show()
''',
    ),
    dict(
        title="Q10. What does a near-complete EV transformation actually look like, and how far is the rest of the world from it?",
        takeaway=(
            "Norway (97% EV sales share in 2025) and Iceland (62%) show that "
            "near-total displacement of the internal combustion engine in new car "
            "sales is achievable within about 15 years of sustained policy support "
            "-- but the World average (25%) and China (53%) illustrate that most "
            "of the globe, including its largest single EV market, is still "
            "mid-transition rather than past it."
        ),
        code='''
spotlight = ["Norway", "Iceland", "China", "United States"]
plot_df = countries[countries["entity"].isin(spotlight)]
world_line = world[["year", "ev_sales_share"]].assign(entity="World average")
combined = pd.concat([plot_df[["entity", "year", "ev_sales_share"]], world_line])

fig = px.line(combined, x="year", y="ev_sales_share", color="entity", template=TEMPLATE, markers=True,
              color_discrete_map={"Norway": GREEN, "Iceland": SKY, "China": VERMILLION,
                                   "United States": GREY, "World average": "black"},
              labels={"ev_sales_share": "EV share of new car sales (%)", "year": "", "entity": ""},
              title="Norway shows what a near-complete EV transformation looks like -- most of the world is not there yet<br>"
                    "<sup>EV sales share over time: two near-complete transformations vs. two still mid-transition</sup>")
fig.update_layout(height=500)
fig.show()
''',
    ),
]

for i, q in enumerate(questions, start=1):
    cells.append(md(f"## {q['title']}\n\n{q['takeaway']}"))
    cells.append(code(q["code"]))

cells.append(md('''
## Data notes & limitations

- **Source**: International Energy Agency, *Global EV Outlook 2025*, via Our World
  in Data (https://ourworldindata.org/electric-car-sales). OWID republishes the
  IEA's Global EV Data Explorer series under a compatible open license.
- **Coverage**: 60 countries plus World, Europe, EU27 and a residual "Rest of
  World" aggregate. Coverage starts later for markets that had no measurable EV
  sales before roughly 2015-2019; those countries simply have fewer rows.
- **"Auto-manufacturing powerhouse"** is a fixed list of the world's largest
  light-vehicle producing nations by OICA production rankings (China, USA, Japan,
  Germany, India, South Korea, Mexico, Spain, Brazil, France, Thailand, Canada,
  UK, Italy, Czechia, Slovakia, Indonesia, Russia) -- an analytical grouping, not
  a value judgement.
- **"Tipping point"** (5% EV sales share) and **"mainstream"** (50%) thresholds
  follow commonly-cited EV-adoption S-curve benchmarks (BloombergNEF, IEA) rather
  than a claim inherent to this dataset.
- A handful of small markets ("Rest of World") show negative year-over-year
  changes in some years -- this reflects OWID's residual-aggregate construction
  (World minus all named countries), not a literal decline in vehicles.
'''))

nb = {
    "cells": cells,
    "metadata": {
        "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
        "language_info": {"name": "python", "version": "3.10"},
    },
    "nbformat": NB_VERSION,
    "nbformat_minor": NB_MINOR,
}

with open("analysis.ipynb", "w") as f:
    json.dump(nb, f, indent=1)

print(f"Wrote analysis.ipynb with {len(cells)} cells ({len(questions)} questions).")
