"""
Interactive Streamlit dashboard for the Global Electric Vehicle Market Analysis
project (2010-2025). Reads the cleaned country-year panel and offers three
views: a global overview map/leaderboard, an adoption S-curve explorer, and a
legacy-manufacturers-vs-challengers comparison.
"""
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

st.set_page_config(page_title="Global EV Market Analysis 2010-2025", layout="wide", page_icon="⚡")

# Resolve the data path relative to this script's own location, not the current
# working directory -- Streamlit Community Cloud runs the app with its cwd set
# to the repo root (not the dashboard/ folder), so a plain "../data/..."
# relative path breaks in deployment even though it works locally with
# `streamlit run app.py` from inside dashboard/.
DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "clean_global_ev_2010_2025.csv"

GREY, BLUE, ORANGE, GREEN, VERMILLION, SKY, PURPLE = (
    "#B0B0B0", "#0072B2", "#E69F00", "#009E73", "#D55E00", "#56B4E9", "#CC79A7",
)
CONTINENT_COLORS = {
    "Europe": BLUE, "Americas": ORANGE, "Asia-Pacific": VERMILLION,
    "Middle East": PURPLE, "Africa": GREY,
}
TIER_ORDER = ["Nascent (<1%)", "Early (1-5%)", "Growth (5-20%)", "Mainstream (20-50%)", "Mature (>50%)"]
TEMPLATE = "plotly_white"


@st.cache_data
def load_data():
    df = pd.read_csv(DATA_PATH)
    return df


df = load_data()
countries = df[~df["is_aggregate"]].copy()
world = df[df["entity"] == "World"].copy()

st.title("⚡ Global Electric Vehicle Market Analysis (2010-2025)")
st.caption(
    "How EVs are transforming the automobile industry across 60 countries. "
    "Source: IEA Global EV Outlook 2025, via Our World in Data."
)

# ---------------------------------------------------------------
# Sidebar filters
# ---------------------------------------------------------------
st.sidebar.header("Filters")

year_min, year_max = int(countries["year"].min()), int(countries["year"].max())
year_range = st.sidebar.slider("Year range", year_min, year_max, (2015, year_max), step=1)

continents = sorted(countries["continent"].dropna().unique())
selected_continents = st.sidebar.multiselect("Continents", continents, default=continents)

powerhouse_filter = st.sidebar.radio(
    "Market type", ["All markets", "Auto-manufacturing powerhouses only", "Other markets only"], index=0,
)

country_list = sorted(countries["entity"].unique())
highlight_country = st.sidebar.selectbox(
    "Spotlight a country in the S-Curve tab", country_list,
    index=country_list.index("Norway") if "Norway" in country_list else 0,
)

st.sidebar.markdown("---")
st.sidebar.markdown(
    "**Data note:** coverage begins later for markets with no measurable EV "
    "sales before roughly 2015-2019 -- those countries simply have fewer years "
    "of data. 'Auto-manufacturing powerhouse' is a fixed list of the world's "
    "largest light-vehicle producing nations, used only to compare adoption "
    "speed, not as a value judgement."
)

mask = (
    (countries["year"] >= year_range[0]) & (countries["year"] <= year_range[1])
    & (countries["continent"].isin(selected_continents))
)
if powerhouse_filter == "Auto-manufacturing powerhouses only":
    mask &= countries["auto_powerhouse"]
elif powerhouse_filter == "Other markets only":
    mask &= ~countries["auto_powerhouse"]
fdf = countries[mask].copy()
world_f = world[(world["year"] >= year_range[0]) & (world["year"] <= year_range[1])]

tab1, tab2, tab3 = st.tabs(["🌍 Global Overview", "📈 Adoption S-Curve Explorer", "🏭 Powerhouses vs. Challengers"])

# =====================================================================
# TAB 1: Global overview
# =====================================================================
with tab1:
    latest_year_in_view = int(fdf["year"].max()) if len(fdf) else year_range[1]
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Countries in view", fdf["entity"].nunique())
    col2.metric(f"World EV sales, {latest_year_in_view}",
                f"{world_f[world_f['year'] == latest_year_in_view]['ev_sales'].sum() / 1e6:.1f}M"
                if len(world_f[world_f["year"] == latest_year_in_view]) else "-")
    col3.metric(f"World EV sales share, {latest_year_in_view}",
                f"{world_f[world_f['year'] == latest_year_in_view]['ev_sales_share'].sum():.1f}%"
                if len(world_f[world_f["year"] == latest_year_in_view]) else "-")
    top_country = (fdf[fdf["year"] == latest_year_in_view].nlargest(1, "ev_sales")["entity"].iloc[0]
                   if len(fdf[fdf["year"] == latest_year_in_view]) else "-")
    col4.metric(f"Top market, {latest_year_in_view}", top_country)

    st.subheader(f"EV sales share by country, {latest_year_in_view} (map)")
    map_df = fdf[(fdf["year"] == latest_year_in_view) & fdf["code"].notna()]
    fig_map = px.choropleth(
        map_df, locations="code", locationmode="ISO-3", color="ev_sales_share",
        color_continuous_scale=["#F2F2F2", SKY, GREEN], template=TEMPLATE,
        labels={"ev_sales_share": "EV sales share (%)"}, hover_name="entity",
        title=f"Share of new car sales that were electric, {latest_year_in_view}",
    )
    fig_map.update_layout(margin=dict(l=0, r=0, t=40, b=0))
    st.plotly_chart(fig_map, use_container_width=True)

    left, right = st.columns(2)
    with left:
        st.subheader(f"Top 15 markets by EV sales volume, {latest_year_in_view}")
        top15 = fdf[fdf["year"] == latest_year_in_view].nlargest(15, "ev_sales").sort_values("ev_sales")
        fig_top = px.bar(top15, x="ev_sales", y="entity", orientation="h", color="continent",
                          color_discrete_map=CONTINENT_COLORS, template=TEMPLATE,
                          labels={"ev_sales": "EV sales (units)", "entity": ""})
        st.plotly_chart(fig_top, use_container_width=True)
    with right:
        st.subheader("World EV sales share trend")
        fig_trend = go.Figure()
        fig_trend.add_trace(go.Scatter(x=world_f["year"], y=world_f["ev_sales_share"], mode="lines+markers",
                                        line=dict(color=GREEN, width=3), name="World"))
        fig_trend.update_layout(template=TEMPLATE, yaxis_title="EV share of new car sales (%)", xaxis_title="")
        st.plotly_chart(fig_trend, use_container_width=True)

# =====================================================================
# TAB 2: Adoption S-curve explorer
# =====================================================================
with tab2:
    st.subheader(f"{highlight_country}'s EV adoption S-curve vs. its continent and the world")
    country_row = countries[countries["entity"] == highlight_country]
    if len(country_row):
        c_continent = country_row["continent"].iloc[0]
        country_series = countries[countries["entity"] == highlight_country].set_index("year")["ev_sales_share"]
        continent_avg = (countries[countries["continent"] == c_continent]
                          .groupby("year")["ev_sales_share"].mean())
        fig_hl = go.Figure()
        fig_hl.add_trace(go.Scatter(x=world["year"], y=world["ev_sales_share"], name="World average",
                                     line=dict(color="black", dash="dot")))
        fig_hl.add_trace(go.Scatter(x=continent_avg.index, y=continent_avg.values,
                                     name=f"{c_continent} average", line=dict(color=GREY, dash="dash")))
        fig_hl.add_trace(go.Scatter(x=country_series.index, y=country_series.values, name=highlight_country,
                                     line=dict(color=GREEN, width=3)))
        tip_year = country_row["tipping_year"].dropna()
        if len(tip_year):
            fig_hl.add_vline(x=tip_year.iloc[0], line_dash="dot", line_color=VERMILLION,
                              annotation_text="5% tipping point")
        fig_hl.update_layout(template=TEMPLATE, yaxis_title="EV share of new car sales (%)", xaxis_title="")
        st.plotly_chart(fig_hl, use_container_width=True)
    else:
        st.info("No data for that country in the current filter selection.")

    st.subheader("Tipping-point speed: years from 5% to 50% EV sales share")
    tipped = countries[countries["tipping_year"].notna()][["entity", "tipping_year", "continent"]].drop_duplicates()
    over50 = (countries[countries["ev_sales_share"] >= 50].groupby("entity")["year"].min()
              .rename("year_50pct").reset_index())
    speed = tipped.merge(over50, on="entity", how="left")
    speed["years_5_to_50"] = speed["year_50pct"] - speed["tipping_year"]
    speed_plot = speed.dropna(subset=["years_5_to_50"]).sort_values("years_5_to_50")
    if len(speed_plot):
        fig_speed = px.bar(speed_plot, x="years_5_to_50", y="entity", orientation="h", color="continent",
                            color_discrete_map=CONTINENT_COLORS, template=TEMPLATE,
                            labels={"years_5_to_50": "Years from 5% to 50% EV sales share", "entity": ""})
        st.plotly_chart(fig_speed, use_container_width=True)
    else:
        st.info("No country in the current filter has crossed both the 5% and 50% thresholds.")

# =====================================================================
# TAB 3: Powerhouses vs. challengers
# =====================================================================
with tab3:
    st.subheader("EV sales share: auto-manufacturing powerhouses vs. other markets")
    box_df = fdf.dropna(subset=["ev_sales_share"]).copy()
    box_df["group"] = box_df["auto_powerhouse"].map({True: "Auto-manufacturing powerhouse", False: "Other market"})
    if len(box_df):
        fig_box = px.box(box_df, x="group", y="ev_sales_share", color="group", points="all", template=TEMPLATE,
                          color_discrete_map={"Auto-manufacturing powerhouse": VERMILLION, "Other market": GREEN},
                          labels={"ev_sales_share": "EV share of new car sales (%)", "group": ""})
        fig_box.update_layout(showlegend=False)
        st.plotly_chart(fig_box, use_container_width=True)
    else:
        st.info("Widen the filters to see data here.")

    st.subheader("Live explorer: sales growth vs. market maturity")
    x_axis = st.selectbox("X axis", ["yoy_sales_growth_pct", "global_sales_share_pct", "rank_sales_in_year"], index=0)
    y_axis = st.selectbox("Y axis", ["ev_sales_share", "ev_stock", "bev_share_ev_cars"], index=0)
    scatter_df = fdf.dropna(subset=[x_axis, y_axis])
    if len(scatter_df):
        fig_explore = px.scatter(scatter_df, x=x_axis, y=y_axis, color="continent", hover_name="entity",
                                  color_discrete_map=CONTINENT_COLORS, template=TEMPLATE, size="ev_sales")
        st.plotly_chart(fig_explore, use_container_width=True)
    else:
        st.info("No data for that combination in the current filter selection.")

    st.subheader("Biggest ranking climbers and fallers (first year in range vs. last year in range)")
    yrs = sorted(fdf["year"].unique())
    if len(yrs) >= 2:
        r_first = fdf[fdf["year"] == yrs[0]].set_index("entity")["rank_sales_in_year"]
        r_last = fdf[fdf["year"] == yrs[-1]].set_index("entity")["rank_sales_in_year"]
        both = pd.DataFrame({"rank_first": r_first, "rank_last": r_last}).dropna()
        both["climb"] = both["rank_first"] - both["rank_last"]
        movers = pd.concat([both.nlargest(6, "climb"), both.nsmallest(6, "climb")]).reset_index()
        movers = movers.rename(columns={"index": "entity"}).sort_values("climb")
        fig_movers = px.bar(movers, x="climb", y="entity", orientation="h", template=TEMPLATE,
                             color=movers["climb"] > 0, color_discrete_map={True: GREEN, False: VERMILLION},
                             labels={"climb": f"Rank change, {yrs[0]}→{yrs[-1]} (positive = climbed)", "entity": ""})
        fig_movers.update_layout(showlegend=False)
        st.plotly_chart(fig_movers, use_container_width=True)
    else:
        st.info("Widen the year range to compare rankings across at least two years.")
