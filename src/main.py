from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "Global_Dataset.csv"
OUTPUT_DIR = ROOT / "outputs"

REFERENCE_YEAR = 2014
MAX_VISUALIZATION_YEAR = 2022
HIGHLIGHT_COUNTRIES = ["USA", "CHN", "FRA", "LUX", "SOM", "NER"]
COUNTRY_COLORS = {
    "USA": "#1f77b4",
    "CHN": "#d62728",
    "FRA": "#2ca02c",
    "LUX": "#9467bd",
    "SOM": "#ff7f0e",
    "NER": "#17becf",
}

RENAME_COLUMNS = {
    "polity2": "polity_score",
    "v2x_elecoff": "election_quality",
    "v2x_polyarchy": "Electoral democracy (polyarchy)",
    "v2x_libdem": "Liberal democracy index",
    "v2x_liberal": "Liberal component of democracy",
    "v2xel_frefair": "Free and fair elections",
    "v2x_freexp_altinf": "Freedom of expression and alternative information",
    "v2x_frassoc_thick": "Freedom of association",
    "v2x_suffr": "Inclusive suffrage",
    "partylose": "Incumbent party loses election",
    "partylose2": "Incumbent party loses election (alternative measure)",
    "oppallowed": "Opposition parties allowed to compete",
    "oppprevent": "Opposition parties prevented from running",
    "multilegal": "Multiple political parties legally allowed",
    "choice": "Voters have a choice on the ballot",
    "boycott": "Opposition parties boycott the election",
    "suspended": "Elections suspended",
    "multiparty": "Multiparty competition index",
    "process": "Electoral process integrity index",
    "allhouse": "Executive controls all legislative houses",
    "termlimit.x": "Existence of executive term limits",
    "succession": "Formal rules for executive succession",
    "dismiss": "Formal rules for dismissing the executive",
    "tl_attempt": "Attempt to evade term limits",
    "tl_failed": "Failed attempt to evade term limits",
    "tl_success": "Successful evasion of term limits",
    "pasttl": "Past violation of term limits",
    "journalists_killed": "journalists_killed_n",
    "journalists_imprison": "journalists_imprisoned_n",
    "SE.ADT.LITR.ZS": "adult_literacy_rate",
    "UIS.EA.6T8.AG25T99": "tertiary_edu_25plus",
    "SE.PRM.LERN.1": "Primary education proficiency (literacy and numeracy)",
    "SE.PRM.LERN.2": "Primary education literacy proficiency",
    "GC.TAX.GSRV.RV.ZS": "Taxes on goods and services (% of revenue)",
    "GC.TAX.YPKG.RV.ZS": "Taxes on income, profits and capital gains (% of revenue)",
    "NE.TRD.GNFS.ZS": "Trade openness (% of GDP)",
    "NV.AGR.TOTL.ZS": "Agriculture, forestry, and fishing value added (% of GDP)",
    "NV.IND.MANF.ZS": "Manufacturing value added (% of GDP)",
    "NV.MNF.TXTL.ZS.UN": "Textiles and clothing (% of manufacturing value added)",
    "NV.SRV.TOTL.ZS": "Services value added (% of GDP)",
    "SL.SRV.EMPL.ZS": "Employment in services (% of total employment)",
}

PCA_VARIABLES = [
    "polity_score",
    "election_quality",
    "Electoral democracy (polyarchy)",
    "Liberal democracy index",
    "Liberal component of democracy",
    "Free and fair elections",
    "Freedom of expression and alternative information",
    "Freedom of association",
    "Inclusive suffrage",
    "Incumbent party loses election",
    "Incumbent party loses election (alternative measure)",
    "Opposition parties allowed to compete",
    "Opposition parties prevented from running",
    "Multiple political parties legally allowed",
    "Voters have a choice on the ballot",
    "Opposition parties boycott the election",
    "Elections suspended",
    "Multiparty competition index",
    "Electoral process integrity index",
    "Executive controls all legislative houses",
    "Existence of executive term limits",
    "Formal rules for executive succession",
    "Formal rules for dismissing the executive",
    "Attempt to evade term limits",
    "Failed attempt to evade term limits",
    "Successful evasion of term limits",
    "Past violation of term limits",
    "journalists_killed_n",
    "journalists_imprisoned_n",
    "adult_literacy_rate",
    "tertiary_edu_25plus",
    "Primary education proficiency (literacy and numeracy)",
    "Primary education literacy proficiency",
    "Taxes on goods and services (% of revenue)",
    "Taxes on income, profits and capital gains (% of revenue)",
    "Trade openness (% of GDP)",
    "Agriculture, forestry, and fishing value added (% of GDP)",
    "Manufacturing value added (% of GDP)",
    "Textiles and clothing (% of manufacturing value added)",
    "Services value added (% of GDP)",
    "Employment in services (% of total employment)",
]

SPARSE_TIME_VARIABLES = [
    "Primary education proficiency (literacy and numeracy)",
    "Primary education literacy proficiency",
    "tertiary_edu_25plus",
    "adult_literacy_rate",
    "Textiles and clothing (% of manufacturing value added)",
    "Employment in services (% of total employment)",
]

COUNT_VARIABLES = ["journalists_killed_n", "journalists_imprisoned_n"]


def load_dataset(path: Path = DATA_PATH) -> pd.DataFrame:
    df = pd.read_csv(path, low_memory=False)
    df = df.rename(columns=RENAME_COLUMNS)
    columns = ["Country Code", "Year", *PCA_VARIABLES]
    df = df.loc[:, columns].copy()
    df[PCA_VARIABLES] = df[PCA_VARIABLES].apply(pd.to_numeric, errors="coerce")
    return df


def impute_slow_moving_variables(df: pd.DataFrame) -> pd.DataFrame:
    df = df.sort_values(["Country Code", "Year"]).copy()
    df[SPARSE_TIME_VARIABLES] = df.groupby("Country Code")[SPARSE_TIME_VARIABLES].transform(
        lambda s: s.interpolate(method="nearest", limit_direction="both").ffill().bfill()
    )
    return df


def build_reference_matrix(df: pd.DataFrame, year: int = REFERENCE_YEAR) -> pd.DataFrame:
    reference = df[df["Year"] == year].copy()
    x = reference.groupby("Country Code")[PCA_VARIABLES].mean()

    for column in COUNT_VARIABLES:
        if column in x.columns:
            x[column] = x[column].fillna(0)

    x = x.dropna(axis=1, how="all")
    x = x.loc[:, x.isna().mean() <= 0.40]
    x = x.loc[x.isna().mean(axis=1) <= 0.40, :]
    x = x.fillna(x.mean())
    return x


def standardize(x: pd.DataFrame) -> pd.DataFrame:
    std = x.std(axis=0)
    std[std == 0] = 1
    return (x - x.mean(axis=0)) / std


def fit_manual_pca(x: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray, np.ndarray]:
    z = standardize(x)
    covariance_matrix = (z.T @ z) / (z.shape[0] - 1)
    eigenvalues, eigenvectors = np.linalg.eigh(covariance_matrix)
    order = np.argsort(eigenvalues)[::-1]
    return z, eigenvalues[order], eigenvectors[:, order]


def compute_scores(z: pd.DataFrame, eigenvectors: np.ndarray) -> pd.DataFrame:
    scores = pd.DataFrame(
        z.values @ eigenvectors[:, :3],
        index=z.index,
        columns=["PC1", "PC2", "PC3"],
    )
    scores["PC1"] *= -1
    return scores


def compute_historical_scores(
    df: pd.DataFrame,
    x: pd.DataFrame,
    eigenvectors: np.ndarray,
) -> pd.DataFrame:
    aligned = df[["Country Code", "Year", *x.columns]].copy()
    for column in COUNT_VARIABLES:
        if column in aligned.columns:
            aligned[column] = aligned[column].fillna(0)

    sigma = x.std(axis=0)
    sigma[sigma == 0] = 1
    z_history = (aligned[x.columns] - x.mean(axis=0)) / sigma
    z_history = z_history.fillna(0)

    scores = pd.DataFrame(z_history.values @ eigenvectors[:, :3], columns=["PC1", "PC2", "PC3"])
    scores["PC1"] *= -1
    scores["country"] = aligned["Country Code"].values
    scores["year"] = aligned["Year"].astype(int).values
    return scores.set_index(["country", "year"]).sort_index()


def plot_3d_scores(scores: pd.DataFrame, output_path: Path) -> None:
    fig = plt.figure(figsize=(11, 8))
    ax = fig.add_subplot(111, projection="3d")

    ax.scatter(scores["PC1"], scores["PC2"], scores["PC3"], color="#4c78a8", alpha=0.70, s=28)

    for country in HIGHLIGHT_COUNTRIES:
        if country not in scores.index:
            continue
        row = scores.loc[country]
        ax.scatter(row["PC1"], row["PC2"], row["PC3"], color="#d62728", s=90, edgecolors="black")
        ax.text(row["PC1"], row["PC2"], row["PC3"], country, fontsize=10, weight="bold")

    ax.set_title(f"3D PCA of Democratization Indicators ({REFERENCE_YEAR})")
    ax.set_xlabel("PC1")
    ax.set_ylabel("PC2")
    ax.set_zlabel("PC3")
    ax.view_init(elev=12, azim=42)
    fig.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=180)
    plt.close(fig)


def plot_3d_trajectories(history: pd.DataFrame, output_path: Path, year: int | None = None) -> None:
    years = history.index.get_level_values("year")
    selected_year = int(year or min(years.max(), MAX_VISUALIZATION_YEAR))

    fig = plt.figure(figsize=(12, 8.5))
    ax = fig.add_subplot(111, projection="3d")

    year_slice = history.xs(selected_year, level="year")
    ax.scatter(
        year_slice["PC1"],
        year_slice["PC2"],
        year_slice["PC3"],
        color="#9aa0a6",
        alpha=0.22,
        s=18,
        depthshade=False,
    )

    for country in HIGHLIGHT_COUNTRIES:
        if country not in history.index.get_level_values("country"):
            continue

        trajectory = history.xs(country, level="country").sort_index()
        trajectory = trajectory.loc[trajectory.index <= selected_year]
        if trajectory.empty:
            continue

        color = COUNTRY_COLORS.get(country, "#333333")
        ax.plot(
            trajectory["PC1"],
            trajectory["PC2"],
            trajectory["PC3"],
            color=color,
            linewidth=2.4,
            alpha=0.95,
            label=country,
        )
        current = trajectory.iloc[-1]
        ax.scatter(
            current["PC1"],
            current["PC2"],
            current["PC3"],
            color=color,
            s=95,
            edgecolors="black",
            linewidths=0.7,
            depthshade=False,
        )
        ax.text(
            current["PC1"],
            current["PC2"],
            current["PC3"],
            f" {country}",
            color=color,
            fontsize=10,
            weight="bold",
        )

    ax.set_title(f"3D PCA Democratization Trajectories (1960-{selected_year})", pad=18)
    ax.set_xlabel("PC1")
    ax.set_ylabel("PC2")
    ax.set_zlabel("PC3")
    ax.view_init(elev=17, azim=38)
    ax.legend(loc="upper left", bbox_to_anchor=(0.02, 0.98), frameon=True)
    fig.tight_layout()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_path, dpi=200)
    plt.close(fig)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the democratization PCA visualization.")
    parser.add_argument("--data", type=Path, default=DATA_PATH, help="Path to the input CSV.")
    parser.add_argument("--output-dir", type=Path, default=OUTPUT_DIR, help="Directory for outputs.")
    args = parser.parse_args()

    df = impute_slow_moving_variables(load_dataset(args.data))
    x = build_reference_matrix(df)
    z, eigenvalues, eigenvectors = fit_manual_pca(x)
    scores = compute_scores(z, eigenvectors)

    explained_variance = eigenvalues / eigenvalues.sum()
    static_output_path = args.output_dir / "pca_3d_2014.png"
    trajectory_output_path = args.output_dir / "pca_3d_trajectories.png"
    history = compute_historical_scores(df, x, eigenvectors)
    history = history[history.index.get_level_values("year") <= MAX_VISUALIZATION_YEAR]

    plot_3d_scores(scores, static_output_path)
    plot_3d_trajectories(history, trajectory_output_path)

    print(f"Cleaned reference matrix: {x.shape[0]} countries x {x.shape[1]} variables")
    print(
        "Explained variance, first three PCs: "
        + ", ".join(f"{value:.2%}" for value in explained_variance[:3])
    )
    print(f"Wrote {static_output_path}")
    print(f"Wrote {trajectory_output_path}")


if __name__ == "__main__":
    main()
