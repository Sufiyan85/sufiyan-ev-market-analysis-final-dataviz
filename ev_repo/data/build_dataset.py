"""
Builds one harmonized country-year panel for the Global Electric Vehicle Market
Analysis project (2010-2025) from four raw series published by Our World in Data,
sourced from the IEA's Global EV Outlook 2025 (https://www.iea.org/reports/global-ev-outlook-2025):

  raw/ev_sales.csv        - annual new EV (car) sales, by country/region
  raw/ev_sales_share.csv  - EVs as a % of all new car sales that year
  raw/ev_stock.csv        - cumulative EVs on the road (the installed fleet)
  raw/bev_share_new_ev.csv- battery-electric (BEV) share of that year's EV sales
                            (the remainder is plug-in hybrid, PHEV, plus a sliver of FCEV)

Output: clean_global_ev_2010_2025.csv, one row per entity-year, enriched with
continent groupings, an "automotive powerhouse" flag, market-phase tiers, the
tipping-point year each market first crossed 5% EV sales share, and year-over-year
growth and world-share metrics.
"""
import numpy as np
import pandas as pd

RAW = "raw"

# ---------------------------------------------------------------------------
# Load & merge the four series on (entity, code, year)
# ---------------------------------------------------------------------------
sales = pd.read_csv(f"{RAW}/ev_sales.csv")
share = pd.read_csv(f"{RAW}/ev_sales_share.csv")
stock = pd.read_csv(f"{RAW}/ev_stock.csv")
bev = pd.read_csv(f"{RAW}/bev_share_new_ev.csv")

df = (
    sales.merge(share, on=["entity", "code", "year"], how="outer")
         .merge(stock, on=["entity", "code", "year"], how="outer")
         .merge(bev, on=["entity", "code", "year"], how="outer")
)
df = df.sort_values(["entity", "year"]).reset_index(drop=True)

# ---------------------------------------------------------------------------
# Entity classification
# ---------------------------------------------------------------------------
AGGREGATES = {"World", "Europe", "European Union (27)", "Rest of World"}
df["is_aggregate"] = df["entity"].isin(AGGREGATES)

CONTINENT = {
    "Australia": "Asia-Pacific", "New Zealand": "Asia-Pacific", "China": "Asia-Pacific",
    "Japan": "Asia-Pacific", "South Korea": "Asia-Pacific", "India": "Asia-Pacific",
    "Indonesia": "Asia-Pacific", "Malaysia": "Asia-Pacific", "Singapore": "Asia-Pacific",
    "Thailand": "Asia-Pacific", "Vietnam": "Asia-Pacific", "Philippines": "Asia-Pacific",
    "Cambodia": "Asia-Pacific", "Laos": "Asia-Pacific", "Nepal": "Asia-Pacific",
    "Uzbekistan": "Asia-Pacific",
    "Austria": "Europe", "Belgium": "Europe", "Bulgaria": "Europe", "Croatia": "Europe",
    "Cyprus": "Europe", "Czechia": "Europe", "Denmark": "Europe", "Estonia": "Europe",
    "Finland": "Europe", "France": "Europe", "Germany": "Europe", "Greece": "Europe",
    "Hungary": "Europe", "Iceland": "Europe", "Ireland": "Europe", "Italy": "Europe",
    "Latvia": "Europe", "Lithuania": "Europe", "Luxembourg": "Europe", "Netherlands": "Europe",
    "Norway": "Europe", "Poland": "Europe", "Portugal": "Europe", "Romania": "Europe",
    "Russia": "Europe", "Slovakia": "Europe", "Slovenia": "Europe", "Spain": "Europe",
    "Sweden": "Europe", "Switzerland": "Europe", "United Kingdom": "Europe",
    "Brazil": "Americas", "Canada": "Americas", "Chile": "Americas", "Colombia": "Americas",
    "Costa Rica": "Americas", "Mexico": "Americas", "United States": "Americas",
    "Israel": "Middle East", "Jordan": "Middle East", "Turkey": "Middle East",
    "United Arab Emirates": "Middle East",
    "South Africa": "Africa", "Seychelles": "Africa",
}
df["continent"] = df["entity"].map(CONTINENT)
df.loc[df["is_aggregate"], "continent"] = None

# Nations among the world's largest light-vehicle manufacturers (OICA production
# rankings) -- used to compare how the traditional internal-combustion-engine
# manufacturing base is adapting versus markets with no legacy auto industry.
AUTO_POWERHOUSES = {
    "China", "United States", "Japan", "Germany", "India", "South Korea", "Mexico",
    "Spain", "Brazil", "France", "Thailand", "Canada", "United Kingdom", "Italy",
    "Czechia", "Slovakia", "Indonesia", "Russia",
}
df["auto_powerhouse"] = df["entity"].isin(AUTO_POWERHOUSES)

# ---------------------------------------------------------------------------
# Derived metrics
# ---------------------------------------------------------------------------
df["phev_fcev_share_ev_cars"] = (100 - df["bev_share_ev_cars"]).clip(lower=0)

df["yoy_sales_growth_pct"] = (
    df.sort_values("year").groupby("entity")["ev_sales"].pct_change(fill_method=None) * 100
)

TIER_BINS = [-0.001, 1, 5, 20, 50, 100.001]
TIER_LABELS = ["Nascent (<1%)", "Early (1-5%)", "Growth (5-20%)", "Mainstream (20-50%)", "Mature (>50%)"]
df["sales_share_tier"] = pd.cut(df["ev_sales_share"], bins=TIER_BINS, labels=TIER_LABELS)

# Tipping-point year: first year each market's EV sales share crossed 5% -- a
# threshold widely cited (BloombergNEF, IEA) as the point after which EV adoption
# tends to accelerate sharply rather than plateau.
tip = (
    df[df["ev_sales_share"] >= 5]
    .groupby("entity")["year"].min()
    .rename("tipping_year")
)
df = df.merge(tip, on="entity", how="left")
df["years_since_tipping"] = np.where(df["tipping_year"].notna(), df["year"] - df["tipping_year"], np.nan)

# World totals per year, for computing each country's share of the global market
world_sales_by_year = df.loc[df["entity"] == "World", ["year", "ev_sales"]].rename(
    columns={"ev_sales": "world_ev_sales"}
)
df = df.merge(world_sales_by_year, on="year", how="left")
df["global_sales_share_pct"] = np.where(
    (~df["is_aggregate"]) & df["world_ev_sales"].notna() & df["ev_sales"].notna(),
    df["ev_sales"] / df["world_ev_sales"] * 100,
    np.nan,
)

# Within-year ranks among real countries only (aggregates excluded)
country_rows = df["is_aggregate"] == False  # noqa: E712
df["rank_sales_in_year"] = np.nan
df["rank_stock_in_year"] = np.nan
df.loc[country_rows, "rank_sales_in_year"] = (
    df.loc[country_rows].groupby("year")["ev_sales"].rank(ascending=False, method="min")
)
df.loc[country_rows, "rank_stock_in_year"] = (
    df.loc[country_rows].groupby("year")["ev_stock"].rank(ascending=False, method="min")
)

# ---------------------------------------------------------------------------
# Column order & save
# ---------------------------------------------------------------------------
cols = [
    "entity", "code", "year", "is_aggregate", "continent", "auto_powerhouse",
    "ev_sales", "ev_sales_share", "ev_stock",
    "bev_share_ev_cars", "phev_fcev_share_ev_cars",
    "yoy_sales_growth_pct", "global_sales_share_pct",
    "sales_share_tier", "tipping_year", "years_since_tipping",
    "rank_sales_in_year", "rank_stock_in_year",
]
df = df[cols].sort_values(["entity", "year"]).reset_index(drop=True)
df.to_csv("clean_global_ev_2010_2025.csv", index=False)

n_countries = df.loc[~df["is_aggregate"], "entity"].nunique()
print(f"Wrote clean_global_ev_2010_2025.csv: {len(df)} rows, "
      f"{n_countries} countries + {df['is_aggregate'].sum() and df.loc[df['is_aggregate'],'entity'].nunique()} aggregates, "
      f"years {int(df['year'].min())}-{int(df['year'].max())}")
