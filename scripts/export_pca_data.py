#!/usr/bin/env python3
"""
Export PCA democracy-index data from Global_Dataset.csv for the web app.

Replicates the pipeline in Project_Python_corrected_v7_global_charts.ipynb:
  - panel-aware imputation (1980–2021)
  - 2014 cross-section PCA (PC1–PC3)
  - historical projection onto the 2014 basis
  - political-only world median PC1 series
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT / "Global_Dataset.csv"
OUT_DIR = ROOT / "web" / "public" / "data"

ANALYSIS_START_YEAR = 1980
ANALYSIS_END_YEAR = 2021
CHOSEN_YEAR = 2014

IMPUTATION_CONFIG = {
    "max_internal_gap": 3,
    "low_rank": 4,
    "max_global_missing_for_model": 0.70,
    "min_global_observations": 1_000,
    "min_country_observations": 5,
    "min_countries_per_supported_year": 5,
    "max_svd_iterations": 60,
    "svd_tolerance": 1e-7,
}

RENAME = {
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

CV = list(RENAME.values())

CV_continuous = [
    "election_quality",
    "Electoral democracy (polyarchy)",
    "Liberal democracy index",
    "Liberal component of democracy",
    "Free and fair elections",
    "Freedom of expression and alternative information",
    "Freedom of association",
    "Inclusive suffrage",
    "polity_score",
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
CV_binary = [
    "Incumbent party loses election",
    "Incumbent party loses election (alternative measure)",
    "Opposition parties allowed to compete",
    "Opposition parties prevented from running",
    "Multiple political parties legally allowed",
    "Voters have a choice on the ballot",
    "Opposition parties boycott the election",
    "Elections suspended",
    "Executive controls all legislative houses",
    "Existence of executive term limits",
    "Formal rules for executive succession",
    "Formal rules for dismissing the executive",
    "Attempt to evade term limits",
    "Failed attempt to evade term limits",
    "Successful evasion of term limits",
    "Past violation of term limits",
]
CV_ordinal = ["Multiparty competition index", "Electoral process integrity index"]
CV_count = ["journalists_killed_n", "journalists_imprisoned_n"]

assert set(CV_continuous + CV_binary + CV_ordinal + CV_count) == set(CV)

DEMOCRATIC_DIRECTION = {
    "polity_score": 1,
    "election_quality": 1,
    "Freedom of expression and alternative information": 1,
    "adult_literacy_rate": 1,
    "Taxes on goods and services (% of revenue)": 1,
    "journalists_killed_n": -1,
    "journalists_imprisoned_n": -1,
}

ISO3_TO_ISO2 = {
    "AFG": "AF", "ALB": "AL", "DZA": "DZ", "AGO": "AO", "ARG": "AR", "ARM": "AM",
    "AUS": "AU", "AUT": "AT", "AZE": "AZ", "BHS": "BS", "BHR": "BH", "BGD": "BD",
    "BRB": "BB", "BLR": "BY", "BEL": "BE", "BLZ": "BZ", "BEN": "BJ", "BTN": "BT",
    "BOL": "BO", "BIH": "BA", "BWA": "BW", "BRA": "BR", "BRN": "BN", "BGR": "BG",
    "BFA": "BF", "BDI": "BI", "KHM": "KH", "CMR": "CM", "CAN": "CA", "CPV": "CV",
    "CAF": "CF", "TCD": "TD", "CHL": "CL", "CHN": "CN", "COL": "CO", "COM": "KM",
    "COG": "CG", "COD": "CD", "CRI": "CR", "CIV": "CI", "HRV": "HR", "CUB": "CU",
    "CYP": "CY", "CZE": "CZ", "DNK": "DK", "DJI": "DJ", "DOM": "DO", "ECU": "EC",
    "EGY": "EG", "SLV": "SV", "GNQ": "GQ", "ERI": "ER", "EST": "EE", "SWZ": "SZ",
    "ETH": "ET", "FJI": "FJ", "FIN": "FI", "FRA": "FR", "GAB": "GA", "GMB": "GM",
    "GEO": "GE", "DEU": "DE", "GHA": "GH", "GRC": "GR", "GTM": "GT", "GIN": "GN",
    "GNB": "GW", "GUY": "GY", "HTI": "HT", "HND": "HN", "HUN": "HU", "ISL": "IS",
    "IND": "IN", "IDN": "ID", "IRN": "IR", "IRQ": "IQ", "IRL": "IE", "ISR": "IL",
    "ITA": "IT", "JAM": "JM", "JPN": "JP", "JOR": "JO", "KAZ": "KZ", "KEN": "KE",
    "PRK": "KP", "KOR": "KR", "KWT": "KW", "KGZ": "KG", "LAO": "LA", "LVA": "LV",
    "LBN": "LB", "LSO": "LS", "LBR": "LR", "LBY": "LY", "LTU": "LT", "LUX": "LU",
    "MDG": "MG", "MWI": "MW", "MYS": "MY", "MDV": "MV", "MLI": "ML", "MLT": "MT",
    "MRT": "MR", "MUS": "MU", "MEX": "MX", "MDA": "MD", "MNG": "MN", "MNE": "ME",
    "MAR": "MA", "MOZ": "MZ", "MMR": "MM", "NAM": "NA", "NPL": "NP", "NLD": "NL",
    "NZL": "NZ", "NIC": "NI", "NER": "NE", "NGA": "NG", "MKD": "MK", "NOR": "NO",
    "OMN": "OM", "PAK": "PK", "PAN": "PA", "PNG": "PG", "PRY": "PY", "PER": "PE",
    "PHL": "PH", "POL": "PL", "PRT": "PT", "QAT": "QA", "ROU": "RO", "RUS": "RU",
    "RWA": "RW", "SAU": "SA", "SEN": "SN", "SRB": "RS", "SYC": "SC", "SLE": "SL",
    "SGP": "SG", "SVK": "SK", "SVN": "SI", "SOM": "SO", "ZAF": "ZA", "SSD": "SS",
    "ESP": "ES", "LKA": "LK", "SDN": "SD", "SUR": "SR", "SWE": "SE", "CHE": "CH",
    "SYR": "SY", "TWN": "TW", "TJK": "TJ", "TZA": "TZ", "THA": "TH", "TLS": "TL",
    "TGO": "TG", "TTO": "TT", "TUN": "TN", "TUR": "TR", "TKM": "TM", "UGA": "UG",
    "UKR": "UA", "ARE": "AE", "GBR": "GB", "USA": "US", "URY": "UY", "UZB": "UZ",
    "VEN": "VE", "VNM": "VN", "YEM": "YE", "ZMB": "ZM", "ZWE": "ZW", "XKX": "XK",
    "PSE": "PS", "HKG": "HK", "MAC": "MO", "ABW": "AW", "CUW": "CW", "SXM": "SX",
}


def interpolate_short_internal_gaps(data, column, max_gap=3):
    result = data[column].copy()
    filled = pd.Series(False, index=data.index)
    for _, group in data[["Country Code", "Year", column]].groupby("Country Code", sort=False):
        group = group.sort_values("Year")
        idx = group.index.to_numpy()
        years = group["Year"].to_numpy(dtype=float)
        values = group[column].to_numpy(dtype=float)
        missing = ~np.isfinite(values)
        padded = np.r_[False, missing, False]
        starts = np.flatnonzero(~padded[:-1] & padded[1:])
        ends = np.flatnonzero(padded[:-1] & ~padded[1:])
        for start, end in zip(starts, ends):
            run_length = end - start
            left, right = start - 1, end
            bounded = left >= 0 and right < len(values)
            consecutive_years = bounded and (years[right] - years[left] == run_length + 1)
            if bounded and consecutive_years and run_length <= max_gap:
                values[start:end] = np.interp(
                    years[start:end],
                    [years[left], years[right]],
                    [values[left], values[right]],
                )
                filled.loc[idx[start:end]] = True
        result.loc[idx] = values
    return result, filled


def low_rank_panel_completion(data, column, rank=4):
    matrix = data.pivot(index="Country Code", columns="Year", values=column)
    values = matrix.to_numpy(dtype=float)
    observed = np.isfinite(values)
    country_n = observed.sum(axis=1)
    year_n = observed.sum(axis=0)
    supported_years = matrix.columns[year_n >= IMPUTATION_CONFIG["min_countries_per_supported_year"]]
    if len(supported_years) == 0:
        return pd.Series(np.nan, index=data.index), pd.Series(False, index=data.index)

    support_min, support_max = supported_years.min(), supported_years.max()
    center = float(np.nanmean(values))
    scale = float(np.nanstd(values)) or 1.0
    z = (values - center) / scale
    row_count = np.isfinite(z).sum(axis=1)
    col_count = np.isfinite(z).sum(axis=0)
    row_mean = np.divide(
        np.nansum(z, axis=1), row_count,
        out=np.zeros(z.shape[0], dtype=float), where=row_count > 0,
    )
    col_mean = np.divide(
        np.nansum(z, axis=0), col_count,
        out=np.zeros(z.shape[1], dtype=float), where=col_count > 0,
    )
    filled = np.where(observed, z, row_mean[:, None] + col_mean[None, :])
    effective_rank = max(1, min(rank, min(filled.shape) - 1))
    for _ in range(IMPUTATION_CONFIG["max_svd_iterations"]):
        u, singular_values, vt = np.linalg.svd(filled, full_matrices=False)
        shrinkage = 0.05 * singular_values[0]
        shrunk = np.maximum(singular_values[:effective_rank] - shrinkage, 0.0)
        reconstructed = (u[:, :effective_rank] * shrunk) @ vt[:effective_rank, :]
        reconstructed = np.clip(reconstructed, -8.0, 8.0)
        updated = filled.copy()
        updated[~observed] = 0.5 * filled[~observed] + 0.5 * reconstructed[~observed]
        updated[observed] = z[observed]
        delta = float(np.mean((updated[~observed] - filled[~observed]) ** 2)) if (~observed).any() else 0.0
        filled = updated
        if delta < IMPUTATION_CONFIG["svd_tolerance"]:
            break
    completed = filled * scale + center
    observed_values = values[observed]
    completed = np.clip(completed, np.nanmin(observed_values), np.nanmax(observed_values))
    country_pos = pd.Series(np.arange(len(matrix.index)), index=matrix.index)
    year_pos = pd.Series(np.arange(len(matrix.columns)), index=matrix.columns)
    row_idx = data["Country Code"].map(country_pos).to_numpy(dtype=int)
    col_idx = data["Year"].map(year_pos).to_numpy(dtype=int)
    predictions = completed[row_idx, col_idx]
    eligible_country = country_n[row_idx] >= IMPUTATION_CONFIG["min_country_observations"]
    eligible_year = data["Year"].between(support_min, support_max).to_numpy()
    is_missing = data[column].isna().to_numpy()
    eligible = is_missing & eligible_country & eligible_year & np.isfinite(predictions)
    prediction_series = pd.Series(np.nan, index=data.index, dtype=float)
    prediction_series.loc[eligible] = predictions[eligible]
    return prediction_series, pd.Series(eligible, index=data.index)


def standardize(X: pd.DataFrame) -> pd.DataFrame:
    mu = X.mean(axis=0)
    st = X.std(axis=0)
    st[st == 0] = 1
    return (X - mu) / st


def round_float(x: float, nd: int = 4) -> float:
    if not np.isfinite(x):
        return None  # type: ignore
    return round(float(x), nd)


def main() -> None:
    print("Loading dataset…")
    raw = pd.read_csv(CSV_PATH, low_memory=False)

    # Country display names (best available)
    name_cols = [c for c in ["country_name", "fh_country", "country", "extended_country_name"] if c in raw.columns]
    name_map: dict[str, str] = {}
    for code, group in raw.groupby("Country Code"):
        for col in name_cols:
            vals = group[col].dropna().astype(str)
            vals = vals[vals.str.len() > 1]
            if len(vals):
                name_map[str(code)] = vals.mode().iloc[0] if len(vals.mode()) else vals.iloc[-1]
                break
        else:
            name_map[str(code)] = str(code)

    region_map: dict[str, str] = {}
    if "region" in raw.columns or "e_regiongeo" in raw.columns:
        rcol = "region" if "region" in raw.columns else "e_regiongeo"
        for code, group in raw.groupby("Country Code"):
            vals = group[rcol].dropna()
            if len(vals):
                region_map[str(code)] = str(vals.mode().iloc[0] if len(vals.mode()) else vals.iloc[-1])

    df = raw.rename(columns=RENAME)
    cols_needed = ["Country Code", "Year"] + CV
    df = df.loc[:, cols_needed].copy()
    df[CV] = df[CV].apply(pd.to_numeric, errors="coerce")
    df = df[df["Year"].between(ANALYSIS_START_YEAR, ANALYSIS_END_YEAR)].copy()
    df = df.sort_values(["Country Code", "Year"]).copy()
    df = df[~df.duplicated(["Country Code", "Year"], keep="first")].copy()

    original_missing_mask = df[CV].isna().copy()
    panel_imputed_mask = pd.DataFrame(False, index=df.index, columns=CV)

    print("Panel imputation…")
    for column in CV_count:
        covered_year = df.groupby("Year")[column].transform(lambda s: (s > 0).any())
        to_zero = covered_year & df[column].isna()
        df.loc[to_zero, column] = 0.0
        panel_imputed_mask.loc[to_zero, column] = True

    for column in CV_continuous:
        missing_rate = float(df[column].isna().mean())
        n_observed = int(df[column].notna().sum())
        model_is_supported = (
            missing_rate <= IMPUTATION_CONFIG["max_global_missing_for_model"]
            and n_observed >= IMPUTATION_CONFIG["min_global_observations"]
        )
        if not model_is_supported:
            continue
        interpolated, interpolated_flag = interpolate_short_internal_gaps(
            df, column, IMPUTATION_CONFIG["max_internal_gap"]
        )
        df[column] = interpolated
        panel_imputed_mask.loc[interpolated_flag, column] = True
        low_rank_predictions, low_rank_flag = low_rank_panel_completion(
            df, column, rank=IMPUTATION_CONFIG["low_rank"]
        )
        df.loc[low_rank_flag, column] = low_rank_predictions.loc[low_rank_flag]
        panel_imputed_mask.loc[low_rank_flag, column] = True

    assert not (panel_imputed_mask & ~original_missing_mask).any().any()

    # 2014 cross-section
    print(f"Building {CHOSEN_YEAR} cross-section…")
    sdf = df[df["Year"] == CHOSEN_YEAR].copy()
    X = sdf.groupby("Country Code")[CV].mean()
    X = X.dropna(axis=1, how="all")

    Cols_missing_Maxthreshold = 0.40
    Rows_missing_Maxthreshold = 0.40
    X = X.loc[:, X.isna().mean() <= Cols_missing_Maxthreshold]
    X = X.loc[X.isna().mean(axis=1) <= Rows_missing_Maxthreshold, :].copy()

    cols_present = list(X.columns)
    cont_cols = [c for c in CV_continuous if c in cols_present]
    bin_cols = [c for c in CV_binary if c in cols_present]
    ord_cols = [c for c in CV_ordinal if c in cols_present]
    count_cols = [c for c in CV_count if c in cols_present]

    for column in cont_cols:
        X[column] = X[column].fillna(X[column].median())
    for column in bin_cols + ord_cols:
        mode = X[column].mode(dropna=True)
        X[column] = X[column].fillna(mode.iloc[0])
    for column in count_cols:
        if X[column].isna().any():
            X[column] = X[column].fillna(0.0)

    assert X.isna().sum().sum() == 0
    print(f"Cleaned {CHOSEN_YEAR} shape: {X.shape}")

    # PCA on 2014
    Z = standardize(X)
    n = Z.shape[0]
    cov = (Z.T @ Z) / (n - 1)
    eigvals, eigvecs = np.linalg.eigh(cov)
    order = np.argsort(eigvals)[::-1]
    eigvals = np.clip(eigvals[order], 0, None)
    eigvecs = eigvecs[:, order]
    total_var = float(eigvals.sum())
    explained = (eigvals / total_var).tolist()

    loadings_pc1 = pd.Series(eigvecs[:, 0] * np.sqrt(eigvals[0]), index=X.columns)
    orientation_score = sum(
        direction * loadings_pc1.get(var, 0.0) for var, direction in DEMOCRATIC_DIRECTION.items()
    )
    pc1_sign = -1.0 if orientation_score < 0 else 1.0
    eigvecs[:, 0] *= pc1_sign
    loadings_pc1 *= pc1_sign

    scores_2014 = Z.values @ eigvecs[:, :3]
    pc_2014 = pd.DataFrame(scores_2014, index=X.index, columns=["PC1", "PC2", "PC3"])

    # Orient PC2 so mature service democracies sit on the negative pole
    # (notebook: + = agrarian/fragile pluralism, − = modernized service economy).
    modern_refs = [c for c in ["USA", "SWE", "NLD", "LUX", "DNK"] if c in pc_2014.index]
    if modern_refs and pc_2014.loc[modern_refs, "PC2"].mean() > 0:
        eigvecs[:, 1] *= -1
        pc_2014["PC2"] *= -1

    # Orient PC3 so China anchors the modernized-authoritarian (+) pole
    # (notebook: + = modernized authoritarian, − = failed state).
    if "CHN" in pc_2014.index and pc_2014.loc["CHN", "PC3"] < 0:
        eigvecs[:, 2] *= -1
        pc_2014["PC3"] *= -1

    vals = pc_2014["PC1"].values
    q33, q66 = np.percentile(vals, [33, 66])

    # Historical projection
    print("Projecting historical scores…")
    valid_columns = list(X.columns)
    df_hist = df[["Country Code", "Year"] + valid_columns].copy()
    cont_cols_h = [c for c in CV_continuous if c in valid_columns]
    bin_cols_h = [c for c in CV_binary if c in valid_columns]
    ord_cols_h = [c for c in CV_ordinal if c in valid_columns]
    count_cols_h = [c for c in CV_count if c in valid_columns]

    df_hist = df_hist.loc[df_hist[valid_columns].isna().mean(axis=1) <= Rows_missing_Maxthreshold].copy()
    mu_2014 = X.mean(axis=0)
    median_2014 = X.median(axis=0)
    mode_2014 = {c: X[c].mode().iloc[0] for c in bin_cols_h + ord_cols_h}
    sigma_2014 = X.std(axis=0)
    sigma_2014[sigma_2014 == 0] = 1

    for column in cont_cols_h:
        def supported_year_median(series):
            if series.notna().sum() < 20:
                return series
            return series.fillna(series.median())

        df_hist[column] = df_hist.groupby("Year")[column].transform(supported_year_median)
        df_hist[column] = df_hist[column].fillna(median_2014[column])

    for column in bin_cols_h + ord_cols_h:
        def supported_year_mode(series):
            mode = series.mode(dropna=True)
            if series.notna().sum() < 20 or mode.empty:
                return series
            return series.fillna(mode.iloc[0])

        df_hist[column] = df_hist.groupby("Year")[column].transform(supported_year_mode)
        df_hist[column] = df_hist[column].fillna(mode_2014[column])

    projection_feature_coverage = df_hist[valid_columns].notna().mean(axis=1)
    Z_hist = (df_hist[valid_columns] - mu_2014) / sigma_2014
    Z_hist_for_projection = Z_hist.fillna(0.0)
    scores_hist = Z_hist_for_projection.values @ eigvecs[:, :3]
    hist = pd.DataFrame(scores_hist, columns=["PC1", "PC2", "PC3"])
    hist["feature_coverage"] = projection_feature_coverage.to_numpy()
    hist["year"] = df_hist["Year"].to_numpy(dtype=int)
    hist["iso3"] = df_hist["Country Code"].to_numpy()

    # World political-only PCA (same analysis window as country scores).
    # Fit + project on one politics-only scale — never splice mainModel for
    # a missing year (different scale → fake jump ~0.31 → ~0.62).
    print("Computing world political PCA…")
    WORLD_END = ANALYSIS_END_YEAR
    world_economic_vars = [
        "Taxes on goods and services (% of revenue)",
        "Taxes on income, profits and capital gains (% of revenue)",
        "Trade openness (% of GDP)",
        "Agriculture, forestry, and fishing value added (% of GDP)",
        "Manufacturing value added (% of GDP)",
        "Textiles and clothing (% of manufacturing value added)",
        "Services value added (% of GDP)",
        "Employment in services (% of total employment)",
    ]
    world_education_vars = ["adult_literacy_rate", "tertiary_edu_25plus"]
    world_event_vars = ["journalists_killed_n", "journalists_imprisoned_n"]
    world_nonpolitical = set(world_economic_vars + world_education_vars + world_event_vars)
    world_political_cols = [c for c in valid_columns if c not in world_nonpolitical]

    world_panel = df_hist.loc[
        df_hist["Year"].between(ANALYSIS_START_YEAR, WORLD_END),
        ["Country Code", "Year"] + world_political_cols,
    ].dropna(subset=world_political_cols).copy()

    world_mu = world_panel[world_political_cols].mean(axis=0)
    world_sigma = world_panel[world_political_cols].std(axis=0)
    world_sigma[world_sigma == 0] = 1.0
    world_Z = (world_panel[world_political_cols] - world_mu) / world_sigma
    world_cov = (world_Z.T @ world_Z) / (len(world_Z) - 1)
    w_eigvals, w_eigvecs = np.linalg.eigh(world_cov)
    w_order = np.argsort(w_eigvals)[::-1]
    w_eigvecs = w_eigvecs[:, w_order]
    world_loadings_pc1 = pd.Series(w_eigvecs[:, 0], index=world_political_cols)
    world_direction = {
        "polity_score": 1,
        "Electoral democracy (polyarchy)": 1,
        "Liberal democracy index": 1,
        "Free and fair elections": 1,
        "Freedom of expression and alternative information": 1,
        "Freedom of association": 1,
        "Opposition parties allowed to compete": 1,
        "Opposition parties prevented from running": -1,
    }
    world_orientation = sum(
        direction * world_loadings_pc1.get(variable, 0.0)
        for variable, direction in world_direction.items()
    )
    if world_orientation < 0:
        w_eigvecs[:, 0] *= -1

    world_scores = (world_Z.to_numpy() @ w_eigvecs[:, :2]) / np.sqrt(len(world_political_cols))
    world_scores = pd.DataFrame(world_scores, columns=["PC1", "PC2"], index=world_panel.index)
    if world_scores["PC2"].median() < 0:
        world_scores["PC2"] *= -1
    world_scores["Year"] = world_panel["Year"].to_numpy(dtype=int)
    world_scores["Country Code"] = world_panel["Country Code"].to_numpy()

    world_annual = world_scores.groupby("Year").agg(
        PC1_median=("PC1", "median"),
        PC1_q25=("PC1", lambda s: float(s.quantile(0.25))),
        PC1_q75=("PC1", lambda s: float(s.quantile(0.75))),
        PC2_median=("PC2", "median"),
        countries=("Country Code", "nunique"),
    ).sort_index()

    # Sanity: high PC1 = more democratic (notebook convention).
    if "USA" in pc_2014.index and "CHN" in pc_2014.index:
        assert float(pc_2014.loc["USA", "PC1"]) > float(pc_2014.loc["CHN", "PC1"]), (
            "PC1 orientation failed: USA should score above China"
        )

    # Also aggregate main-model world median PC1 by year (for reference / globe
    # consistency). Consumers MUST NOT splice mainModel onto politicalOnly:
    # scales differ (~0.3 vs ~0.6), which creates a fake end-of-series jump.
    main_world = hist.groupby("year").agg(
        PC1_median=("PC1", "median"),
        PC1_mean=("PC1", "mean"),
        PC1_q25=("PC1", lambda s: float(s.quantile(0.25))),
        PC1_q75=("PC1", lambda s: float(s.quantile(0.75))),
        countries=("iso3", "nunique"),
    ).sort_index()

    # Neighbors in PCA space for latest available year per country (use 2014 for stability)
    ref_year = CHOSEN_YEAR
    ref = hist[hist["year"] == ref_year].set_index("iso3")[["PC1", "PC2", "PC3"]]
    neighbors: dict[str, list[dict]] = {}
    codes = list(ref.index)
    coords = ref[["PC1", "PC2", "PC3"]].to_numpy()
    for i, code in enumerate(codes):
        dists = np.sqrt(((coords - coords[i]) ** 2).sum(axis=1))
        order_idx = np.argsort(dists)
        near = []
        for j in order_idx[1:6]:
            near.append({
                "iso3": codes[j],
                "name": name_map.get(codes[j], codes[j]),
                "distance": round_float(float(dists[j]), 3),
                "PC1": round_float(float(coords[j, 0])),
                "PC2": round_float(float(coords[j, 1])),
                "PC3": round_float(float(coords[j, 2])),
            })
        neighbors[code] = near

    # Build per-country time series
    countries_out = {}
    for iso3, group in hist.groupby("iso3"):
        group = group.sort_values("year")
        series = [
            {
                "year": int(r.year),
                "PC1": round_float(r.PC1),
                "PC2": round_float(r.PC2),
                "PC3": round_float(r.PC3),
                "coverage": round_float(r.feature_coverage, 3),
            }
            for r in group.itertuples()
        ]
        # Stats
        pc1_vals = group["PC1"].to_numpy()
        latest = group.iloc[-1]
        first = group.iloc[0]
        s2014 = group[group["year"] == 2014]
        pc1_2014 = float(s2014["PC1"].iloc[0]) if len(s2014) else float(latest.PC1)

        if pc1_2014 >= q66:
            status = "democracy"
            status_fr = "Démocratie"
        elif pc1_2014 >= q33:
            status = "hybrid"
            status_fr = "Hybride / en transition"
        else:
            status = "autocracy"
            status_fr = "Autocratie"

        countries_out[iso3] = {
            "iso3": iso3,
            "iso2": ISO3_TO_ISO2.get(iso3),
            "name": name_map.get(iso3, iso3),
            "region": region_map.get(iso3),
            "status": status,
            "statusFr": status_fr,
            "pc1_2014": round_float(pc1_2014),
            "pc1_latest": round_float(float(latest.PC1)),
            "pc1_first": round_float(float(first.PC1)),
            "pc1_change": round_float(float(latest.PC1) - float(first.PC1)),
            "year_start": int(first.year),
            "year_end": int(latest.year),
            "neighbors": neighbors.get(iso3, []),
            "series": series,
        }

    # Yearly snapshots for globe coloring: {year: {iso3: pc1}}
    by_year: dict[str, dict[str, float]] = {}
    for year, group in hist.groupby("year"):
        by_year[str(int(year))] = {
            str(r.iso3): round_float(r.PC1) for r in group.itertuples()
        }

    loadings = {
        "PC1": {k: round_float(v) for k, v in loadings_pc1.sort_values(key=abs, ascending=False).items()},
        "PC2": {
            k: round_float(float(v))
            for k, v in pd.Series(
                eigvecs[:, 1] * np.sqrt(eigvals[1]), index=X.columns
            ).sort_values(key=abs, ascending=False).items()
        },
        "PC3": {
            k: round_float(float(v))
            for k, v in pd.Series(
                eigvecs[:, 2] * np.sqrt(eigvals[2]), index=X.columns
            ).sort_values(key=abs, ascending=False).items()
        },
    }

    meta = {
        "title": "Indice de démocratie basé sur l'ACP",
        "analysisWindow": [ANALYSIS_START_YEAR, ANALYSIS_END_YEAR],
        "pcaReferenceYear": CHOSEN_YEAR,
        "nCountries2014": int(X.shape[0]),
        "nVariables": int(X.shape[1]),
        "variables": valid_columns,
        "explainedVariance": {
            "PC1": round_float(explained[0], 4),
            "PC2": round_float(explained[1], 4),
            "PC3": round_float(explained[2], 4),
            "cumulative3": round_float(sum(explained[:3]), 4),
        },
        "terciles2014": {"q33": round_float(float(q33)), "q66": round_float(float(q66))},
        "axisLabels": {
            "PC1": "Qualité démocratique (+ = plus démocratique)",
            "PC2": "Modernisation / pluralisme fragile",
            "PC3": "Autoritarisme modernisé vs État défaillant",
        },
        "interpretations": {
            "PC1": "Axe principal de démocratie / libertés politiques (droits civils, intégrité électorale, absence de répression).",
            "PC2": "Axe secondaire : économie de services modernisée vs pluralisme agraire / fragile.",
            "PC3": "Distinction autoritarisme modernisé (+) vs État défaillant (−).",
            "status": "Classification en terciles du PC1 2014 : haut = démocratie, milieu = hybride, bas = autocratie.",
        },
        "author": {
            "name": "Oscar Brunel",
            "email": "oscar.brunel@studbocconi.it",
            "linkedin": "https://www.linkedin.com/in/oscar-brunel-624657334/",
            "affiliation": "Bocconi University – HEC Paris · Data, Society and Organisation",
        },
        "sources": [
            {
                "title": "Little, A. T., & Meng, A. (2024). Measuring Democratic Backsliding.",
                "url": "https://www.cambridge.org/core/journals/ps-political-science-and-politics/article/measuring-democratic-backsliding/9EE2044CDA598BD815349912E61189D8",
            },
            {
                "title": "Replication Data — Measuring Democratic Backsliding (Harvard Dataverse)",
                "url": "https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/G2SQ6Y",
            },
            {
                "title": "World Bank Education & Economic Statistics",
                "url": "https://databank.worldbank.org/",
            },
        ],
    }

    world_evolution = {
        "politicalOnly": [
            {
                "year": int(y),
                "PC1_median": round_float(float(r.PC1_median)),
                "PC1_q25": round_float(float(r.PC1_q25)),
                "PC1_q75": round_float(float(r.PC1_q75)),
                "PC2_median": round_float(float(r.PC2_median)),
                "countries": int(r.countries),
            }
            for y, r in world_annual.iterrows()
        ],
        "mainModel": [
            {
                "year": int(y),
                "PC1_median": round_float(float(r.PC1_median)),
                "PC1_mean": round_float(float(r.PC1_mean)),
                "PC1_q25": round_float(float(r.PC1_q25)),
                "PC1_q75": round_float(float(r.PC1_q75)),
                "countries": int(r.countries),
            }
            for y, r in main_world.iterrows()
        ],
        "decadeMarkers": [1980, 1990, 2000, 2010, 2020],
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    payloads = {
        "meta.json": meta,
        "countries.json": countries_out,
        "scores_by_year.json": by_year,
        "world_evolution.json": world_evolution,
        "loadings.json": loadings,
    }
    for name, payload in payloads.items():
        path = OUT_DIR / name
        with open(path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        size_mb = path.stat().st_size / 1e6
        print(f"Wrote {path.relative_to(ROOT)} ({size_mb:.2f} MB)")

    print("Done.")
    print(f"Countries: {len(countries_out)}")
    print(f"Years: {min(int(y) for y in by_year)}–{max(int(y) for y in by_year)}")
    print(f"Explained variance PC1–3: {[round(e, 3) for e in explained[:3]]}")


if __name__ == "__main__":
    main()
