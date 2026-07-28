"""Computes the per-slide chart data series used by deck.js (native pptxgenjs
charts, not images). Writes chart_data.json."""
import json

import pandas as pd

df = pd.read_csv("../data/clean_global_ev_2010_2025.csv")
countries = df[~df["is_aggregate"]].copy()
world = df[df["entity"] == "World"].set_index("year")

data = {}

years = list(range(2015, 2026))
data["years"] = years

# --- Q1: world sales (millions) + share (%) ---
data["world_sales_millions"] = [round(world.loc[y, "ev_sales"] / 1e6, 2) for y in years]
data["world_sales_share"] = [round(world.loc[y, "ev_sales_share"], 1) for y in years]

# --- Q2: continent share of world sales, by year ---
cont_year = (countries.dropna(subset=["ev_sales"])
             .groupby(["year", "continent"])["ev_sales"].sum().reset_index())
cont_year["pct"] = cont_year["ev_sales"] / cont_year.groupby("year")["ev_sales"].transform("sum") * 100
continents = ["Europe", "Asia-Pacific", "Americas", "Middle East", "Africa"]
data["continents"] = continents
data["continent_share_by_year"] = {}
for c in continents:
    sub = cont_year[cont_year["continent"] == c].set_index("year")["pct"]
    data["continent_share_by_year"][c] = [round(sub.get(y, 0.0), 1) for y in years]

# --- Q3: tipping speed (years from 5% to 50%) ---
tipped = countries[countries["tipping_year"].notna()][["entity", "tipping_year"]].drop_duplicates()
over50 = (countries[countries["ev_sales_share"] >= 50].groupby("entity")["year"].min()
          .rename("year_50pct").reset_index())
speed = tipped.merge(over50, on="entity", how="left").dropna(subset=["year_50pct"])
speed["years_5_to_50"] = speed["year_50pct"] - speed["tipping_year"]
speed = speed.sort_values("years_5_to_50")
data["tipping_speed_countries"] = list(speed["entity"])
data["tipping_speed_years"] = [int(v) for v in speed["years_5_to_50"]]

# --- Q4: powerhouse vs other, median EV sales share 2022-2025 ---
recent = countries[countries["year"] >= 2022]
data["powerhouse_median"] = round(recent[recent["auto_powerhouse"]]["ev_sales_share"].median(), 1)
data["nonpowerhouse_median"] = round(recent[~recent["auto_powerhouse"]]["ev_sales_share"].median(), 1)

# --- Q5: world BEV vs PHEV+FCEV share of EV sales, by year ---
data["bev_share_by_year"] = [round(world.loc[y, "bev_share_ev_cars"], 1) for y in years]
data["phev_share_by_year"] = [round(world.loc[y, "phev_fcev_share_ev_cars"], 1) for y in years]

# --- Q7: top-5 country concentration of world sales, by year ---
def top5_share(year):
    yr = countries[countries["year"] == year].dropna(subset=["ev_sales"])
    total = yr["ev_sales"].sum()
    return round(yr.nlargest(5, "ev_sales")["ev_sales"].sum() / total * 100, 1)

data["top5_concentration_by_year"] = [top5_share(y) for y in years]

# --- Q9: biggest climbers / fallers, rank 2015 -> 2025 ---
r2015 = countries[countries["year"] == 2015].set_index("entity")["rank_sales_in_year"]
r2025 = countries[countries["year"] == 2025].set_index("entity")["rank_sales_in_year"]
both = pd.DataFrame({"rank_2015": r2015, "rank_2025": r2025}).dropna()
both["climb"] = both["rank_2015"] - both["rank_2025"]
movers = pd.concat([both.nlargest(5, "climb"), both.nsmallest(5, "climb").iloc[::-1]])
data["mover_countries"] = list(movers.index)
data["mover_climb"] = [int(v) for v in movers["climb"]]

# --- Q10: spotlight trajectories ---
spotlight = ["Norway", "Iceland", "China", "United States"]
data["spotlight_countries"] = spotlight + ["World"]
data["spotlight_series"] = {}
for ent in spotlight:
    sub = countries[countries["entity"] == ent].set_index("year")["ev_sales_share"]
    data["spotlight_series"][ent] = [round(sub.get(y, None), 1) if y in sub.index else None for y in years]
data["spotlight_series"]["World"] = [round(world.loc[y, "ev_sales_share"], 1) for y in years]

with open("chart_data.json", "w") as f:
    json.dump(data, f, indent=1)

print("Wrote chart_data.json")
