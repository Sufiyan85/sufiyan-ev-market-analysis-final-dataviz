"""Computes the headline statistics used in the presentation deck and README,
from the cleaned country-year EV panel. Writes presentation_data.json."""
import json

import pandas as pd

df = pd.read_csv("../data/clean_global_ev_2010_2025.csv")
countries = df[~df["is_aggregate"]].copy()
world = df[df["entity"] == "World"].set_index("year")

stats = {}

# --- World-level headline ---
stats["world_sales_share_2015"] = round(world.loc[2015, "ev_sales_share"], 2)
stats["world_sales_share_2025"] = round(world.loc[2025, "ev_sales_share"], 2)
stats["world_sales_2015"] = int(world.loc[2015, "ev_sales"])
stats["world_sales_2025"] = int(world.loc[2025, "ev_sales"])
stats["world_sales_multiple_2015_2025"] = round(world.loc[2025, "ev_sales"] / world.loc[2015, "ev_sales"], 1)
stats["world_stock_2025"] = int(world.loc[2025, "ev_stock"])

# --- China's share of global volume ---
china = countries[countries["entity"] == "China"].set_index("year")
stats["china_global_share_2015"] = round(china.loc[2015, "global_sales_share_pct"], 1)
stats["china_global_share_2025"] = round(china.loc[2025, "global_sales_share_pct"], 1)
stats["china_sales_2025"] = int(china.loc[2025, "ev_sales"])

# --- Top-5 concentration ---
def top5_share(year):
    yr = countries[countries["year"] == year].dropna(subset=["ev_sales"])
    total = yr["ev_sales"].sum()
    top5 = yr.nlargest(5, "ev_sales")["ev_sales"].sum()
    return round(top5 / total * 100, 1), list(yr.nlargest(5, "ev_sales")["entity"])

stats["top5_share_2015"], stats["top5_countries_2015"] = top5_share(2015)
stats["top5_share_2025"], stats["top5_countries_2025"] = top5_share(2025)

# --- Tipping point (5% threshold) speed to mainstream (50%) ---
tipped = countries[countries["tipping_year"].notna()][["entity", "tipping_year"]].drop_duplicates()
rows = []
for _, r in tipped.iterrows():
    ent = r["entity"]
    sub = countries[countries["entity"] == ent]
    over50 = sub[sub["ev_sales_share"] >= 50]
    if len(over50):
        year50 = over50["year"].min()
        rows.append({"entity": ent, "tipping_year": int(r["tipping_year"]), "year_50pct": int(year50),
                      "years_5_to_50": int(year50 - r["tipping_year"])})
speed_df = pd.DataFrame(rows).sort_values("years_5_to_50")
stats["fastest_5_to_50_countries"] = speed_df.head(5).to_dict("records")
stats["n_countries_reached_mainstream"] = len(speed_df)
stats["n_countries_tipped"] = int(tipped["entity"].nunique())
stats["n_countries_total"] = int(countries["entity"].nunique())

# --- Powerhouse vs non-powerhouse comparison, most recent year ---
latest = countries[countries["year"] == 2025]
stats["powerhouse_median_share_2025"] = round(latest[latest["auto_powerhouse"]]["ev_sales_share"].median(), 1)
stats["non_powerhouse_median_share_2025"] = round(latest[~latest["auto_powerhouse"]]["ev_sales_share"].median(), 1)

# --- Growth deceleration by tier ---
tier_growth = countries.dropna(subset=["sales_share_tier", "yoy_sales_growth_pct"]).groupby(
    "sales_share_tier", observed=True
)["yoy_sales_growth_pct"].median().round(1)
stats["median_growth_by_tier"] = tier_growth.to_dict()

# --- Ranking churn 2015 -> 2025 ---
r2015 = countries[countries["year"] == 2015].set_index("entity")["rank_sales_in_year"]
r2025 = countries[countries["year"] == 2025].set_index("entity")["rank_sales_in_year"]
both = pd.DataFrame({"rank_2015": r2015, "rank_2025": r2025}).dropna()
both["climb"] = both["rank_2015"] - both["rank_2025"]
stats["biggest_climbers"] = both.sort_values("climb", ascending=False).head(5).reset_index().to_dict("records")
stats["biggest_fallers"] = both.sort_values("climb").head(5).reset_index().to_dict("records")

# --- Stock vs sales-share gap, most recent year (markets with fleets still catching up) ---
latest_gap = latest.dropna(subset=["ev_sales_share"]).copy()
latest_gap["stock_share_proxy"] = latest_gap["ev_stock"] / latest_gap.groupby("year")["ev_stock"].transform("sum") * 100
stats["norway_2025_share"] = round(countries[(countries.entity == "Norway") & (countries.year == 2025)]["ev_sales_share"].iloc[0], 1)
stats["iceland_2025_share"] = round(countries[(countries.entity == "Iceland") & (countries.year == 2025)]["ev_sales_share"].iloc[0], 1)

with open("presentation_data.json", "w") as f:
    json.dump(stats, f, indent=2, default=str)

print(json.dumps(stats, indent=2, default=str))
