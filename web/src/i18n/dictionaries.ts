export type Locale = 'fr' | 'en'

export type Dictionary = {
  loading: string
  loadError: string
  geoError: string
  dataUnavailable: string
  brandEyebrow: string
  brandTagline: string
  globe3d: string
  map2d: string
  legendPc1: string
  legendAutocracy: string
  legendHybrid: string
  legendDemocracy: string
  legendTerciles: string
  legendThresholds: string
  legendInsufficient: string
  searchPlaceholder: string
  language: string
  langFr: string
  langEn: string
  tooltip: {
    pc1: string
    rank: string
    rankOf: string
    rankFirst: string
    insufficient: string
  }
  dock: {
    world: string
    compare: string
    about: string
  }
  timeline: {
    title: string
    play: string
    pause: string
    medianPc1: string
    yearAria: string
    politicalMedian: string
  }
  countrySheet: {
    close: string
    fiche: string
    statusLabel: string
    pc1Current: string
    pc1Ref: string
    delta: string
    blurb: string
    addCompare: string
    removeCompare: string
    neighbors: string
    trajectories1d: string
    trajectory3d: string
    axisReading: string
    trajectoryHint: string
    trajectoryEmpty: string
    trajectoryAxesTitle: string
    trajectoryAxisX: string
    trajectoryAxisY: string
    trajectoryAxisZ: string
    trajectoryColorLegend: string
    trajectoryScrub: string
    trajectoryReset: string
  }
  compare: {
    emptyTitle: string
    emptyBody: string
    emptyHint: string
    eyebrow: string
    title: string
    lead: string
    selected: string
    removeAria: string
    colCountry: string
    colStatus: string
    colPc1Ref: string
    colPc1Recent: string
    colDelta: string
    chartPc1: string
    chartPc2: string
    chartPc3: string
  }
  about: {
    eyebrow: string
    heroTitle: string
    lead: string
    metricCountries: string
    metricVariables: string
    metricVariance: string
    projectTitle: string
    projectP1: string
    projectP2: string
    projectP3: string
    authorTitle: string
    authorBio: string
    limitsTitle: string
    limitProjection: string
    limitWindow: string
    limitLinear: string
    sourcesTitle: string
    dataNote: string
  }
  status: {
    democracy: string
    hybrid: string
    autocracy: string
  }
  axisLabels: {
    PC1: string
    PC2: string
    PC3: string
  }
  interpretations: {
    PC1: string
    PC2: string
    PC3: string
    status: string
  }
  documentTitle: string
  documentDescription: string
  intro: {
    eyebrow: string
    body: string
    cta: string
    auto: string
  }
}

export const dictionaries: Record<Locale, Dictionary> = {
  fr: {
    loading: 'Chargement des scores ACP…',
    loadError: 'Erreur de chargement',
    geoError: 'Impossible de charger la géométrie mondiale',
    dataUnavailable: 'Données indisponibles',
    brandEyebrow: 'ACP · démocratie · {from}–{to}',
    brandTagline: 'Le monde coloré par PC1 — cliquez un pays pour ouvrir sa fiche.',
    globe3d: 'Globe 3D',
    map2d: 'Carte 2D',
    legendPc1: 'PC1 (échelle continue)',
    legendAutocracy: 'Autocratie',
    legendHybrid: 'Hybride',
    legendDemocracy: 'Démocratie',
    legendTerciles: 'Terciles PC1 {refYear}',
    legendThresholds: '< {q33} · {q33}–{q66} · ≥ {q66}',
    legendInsufficient: 'Données insuffisantes',
    searchPlaceholder: 'Rechercher un pays…',
    language: 'Langue',
    langFr: 'Français',
    langEn: 'English',
    tooltip: {
      pc1: 'PC1',
      rank: 'Rang',
      rankOf: '{rank}e / {total}',
      rankFirst: '1er / {total}',
      insufficient: 'Données insuffisantes',
    },
    dock: {
      world: 'Monde',
      compare: 'Comparer',
      about: 'À propos',
    },
    timeline: {
      title: 'Évolution mondiale PC1',
      play: 'Animer',
      pause: 'Pause',
      medianPc1: 'Médiane PC1',
      yearAria: 'Année',
      politicalMedian: 'Médiane politique mondiale (1980–2021)',
    },
    countrySheet: {
      close: 'Fermer',
      fiche: 'Fiche pays · {year}',
      statusLabel: 'Statut (tercile PC1 2014)',
      pc1Current: 'PC1 courant',
      pc1Ref: 'PC1 2014',
      delta: 'Δ {from}→{to}',
      blurb:
        '{statusIntro} Pour {name}, le score PC1 de référence (2014) place le pays en {status}. PC1 explique {pct} % de la variance (axe démocratie).',
      addCompare: 'Ajouter à la comparaison',
      removeCompare: 'Retirer de la comparaison',
      neighbors: 'Proche de qui (espace ACP 2014)',
      trajectories1d: 'Trajectoires 1D',
      trajectory3d: 'Trajectoire 3D (PC1–PC2–PC3)',
      axisReading: 'Lecture des axes',
      trajectoryHint: 'Glisser pour orbit · molette / pincer pour zoomer',
      trajectoryEmpty: 'Pas assez de points pour tracer une trajectoire.',
      trajectoryAxesTitle: 'Axes (espace ACP)',
      trajectoryAxisX: 'PC1 — démocratie (+ = plus démocratique)',
      trajectoryAxisY: 'PC3 — autoritarisme modernisé (+) vs État défaillant (−)',
      trajectoryAxisZ: 'PC2 — modernisation / pluralisme fragile',
      trajectoryColorLegend: 'Couleur = temps (clair → ancien, sombre → récent)',
      trajectoryScrub: 'Révéler jusqu’à l’année',
      trajectoryReset: 'Recadrer',
    },
    compare: {
      emptyTitle: 'Comparer des pays',
      emptyBody:
        'Depuis la vue Monde, ouvrez une fiche pays et cliquez sur « Ajouter à la comparaison ». Vous pouvez en sélectionner plusieurs pour croiser leurs trajectoires PC1–PC3.',
      emptyHint: 'Commencez depuis la vue Monde',
      eyebrow: 'Comparaison',
      title: 'Trajectoires côte à côte',
      lead: 'Comparez les dynamiques politiques sur une même échelle, de 1980 à 2021.',
      selected: 'Pays suivis',
      removeAria: 'Retirer {name}',
      colCountry: 'Pays',
      colStatus: 'Statut',
      colPc1Ref: 'PC1 2014',
      colPc1Recent: 'PC1 récent',
      colDelta: 'Δ période',
      chartPc1: 'PC1 — démocratie',
      chartPc2: 'PC2 — modernisation',
      chartPc3: 'PC3 — autoritarisme modernisé / État défaillant',
    },
    about: {
      eyebrow: 'À propos',
      heroTitle: 'Les trajectoires politiques, rendues visibles.',
      lead:
        "Une visualisation interactive de l'analyse en composantes principales (ACP) appliquée au recul démocratique mondial, {from}–{to}.",
      metricCountries: 'Pays en 2014',
      metricVariables: 'Variables',
      metricVariance: 'Variance · PC1–3',
      projectTitle: 'Le projet',
      projectP1:
        "Ce site s'appuie sur le notebook académique du projet PCA : construction d'un indice de démocratie data-driven à partir d'un panel multi-sources (variables politiques, économiques et éducatives). L'ACP est ajustée sur la coupe transversale {refYear} ({nCountries} pays, {nVariables} variables), puis chaque année du panel est projetée sur la même base pour suivre les trajectoires nationales.",
      projectP2:
        'PC1 ({pc1} % de variance) capture l\'axe démocratie / libertés politiques. PC2 ({pc2} %) distingue modernisation économique et pluralisme fragile. PC3 ({pc3} %) sépare autoritarisme modernisé et État défaillant. Ensemble, les trois premiers axes expliquent {cum} % de la variance.',
      projectP3:
        'La classification « démocratie / hybride / autocratie » utilise les terciles du PC1 {refYear} (seuils {q33} et {q66}), comme dans le notebook. L\'évolution mondiale affichée sur la timeline reprend la PCA « politique uniquement » du notebook (médiane mondiale et IQR, 1980–2021) — sans mélanger l\'échelle du modèle principal.',
      authorTitle: 'Auteur',
      authorBio:
        'Étudiant en double diplôme Bocconi University – HEC Paris, parcours Data, Society and Organisation. Cette visualisation ACP du recul démocratique s’inscrit dans son travail académique — une lecture claire, à l’échelle du monde, des trajectoires politiques que les données révèlent.',
      limitsTitle: 'Interprétation & limites',
      limitProjection:
        "La projection historique standardise chaque année sur la distribution {refYear} ; les années sans couverture des variables d'événements (journalistes) contribuent la moyenne de référence (score de couverture affiché dans les données).",
      limitWindow:
        "Fenêtre d'analyse : {from}–{to} (couverture V-Dem / DPI dans le jeu de données). Le brief mentionnait 2022 ; le notebook s'arrête en {to}.",
      limitLinear:
        "L'ACP est linéaire et sensible aux choix d'imputation ; des contrôles de robustesse (scaling robuste, PCA politique seule, etc.) sont documentés dans le notebook.",
      sourcesTitle: 'Sources & références',
      dataNote:
        'Données précalculées depuis Global_Dataset.csv via scripts/export_pca_data.py, fidèle au pipeline du notebook Project_Python_corrected_v7_global_charts.ipynb.',
    },
    status: {
      democracy: 'Démocratie',
      hybrid: 'Hybride',
      autocracy: 'Autocratie',
    },
    axisLabels: {
      PC1: 'Qualité démocratique (+ = plus démocratique)',
      PC2: 'Modernisation / pluralisme fragile',
      PC3: 'Autoritarisme modernisé vs État défaillant',
    },
    interpretations: {
      PC1: 'Axe principal de démocratie / libertés politiques (droits civils, intégrité électorale, absence de répression).',
      PC2: 'Axe secondaire : économie de services modernisée vs pluralisme agraire / fragile.',
      PC3: 'Distinction autoritarisme modernisé (+) vs État défaillant (−).',
      status:
        'Classification en terciles du PC1 2014 : haut = démocratie, milieu = hybride, bas = autocratie.',
    },
    documentTitle: 'Demoscope — ACP & démocratie',
    documentDescription:
      'Visualisation ACP de la démocratie et du recul démocratique mondial, 1980–2021.',
    intro: {
      eyebrow: 'ACP · démocratie · 1980–2021',
      body: 'Une lecture mondiale du recul démocratique : scores ACP (PC1–PC3), trajectoires et comparaisons pays — de 1980 à 2021.',
      cta: 'Accéder au globe',
      auto: 'Ouverture automatique dans {seconds}s',
    },
  },
  en: {
    loading: 'Loading PCA scores…',
    loadError: 'Failed to load data',
    geoError: 'Could not load world geometry',
    dataUnavailable: 'Data unavailable',
    brandEyebrow: 'PCA · democracy · {from}–{to}',
    brandTagline: 'The world colored by PC1 — click a country to open its profile.',
    globe3d: '3D Globe',
    map2d: '2D Map',
    legendPc1: 'PC1 (continuous scale)',
    legendAutocracy: 'Autocracy',
    legendHybrid: 'Hybrid',
    legendDemocracy: 'Democracy',
    legendTerciles: 'PC1 {refYear} terciles',
    legendThresholds: '< {q33} · {q33}–{q66} · ≥ {q66}',
    legendInsufficient: 'Insufficient data',
    searchPlaceholder: 'Search for a country…',
    language: 'Language',
    langFr: 'Français',
    langEn: 'English',
    tooltip: {
      pc1: 'PC1',
      rank: 'Rank',
      rankOf: '#{rank} / {total}',
      rankFirst: '#1 / {total}',
      insufficient: 'Insufficient data',
    },
    dock: {
      world: 'World',
      compare: 'Compare',
      about: 'About',
    },
    timeline: {
      title: 'Global PC1 evolution',
      play: 'Play',
      pause: 'Pause',
      medianPc1: 'PC1 median',
      yearAria: 'Year',
      politicalMedian: 'Global political median (1980–2021)',
    },
    countrySheet: {
      close: 'Close',
      fiche: 'Country profile · {year}',
      statusLabel: 'Status (PC1 2014 tercile)',
      pc1Current: 'Current PC1',
      pc1Ref: 'PC1 2014',
      delta: 'Δ {from}→{to}',
      blurb:
        '{statusIntro} For {name}, the reference PC1 score (2014) places the country as {status}. PC1 explains {pct}% of variance (democracy axis).',
      addCompare: 'Add to comparison',
      removeCompare: 'Remove from comparison',
      neighbors: 'Nearest neighbors (2014 PCA space)',
      trajectories1d: '1D trajectories',
      trajectory3d: '3D trajectory (PC1–PC2–PC3)',
      axisReading: 'Reading the axes',
      trajectoryHint: 'Drag to orbit · scroll / pinch to zoom',
      trajectoryEmpty: 'Not enough points to draw a trajectory.',
      trajectoryAxesTitle: 'Axes (PCA space)',
      trajectoryAxisX: 'PC1 — democracy (+ = more democratic)',
      trajectoryAxisY: 'PC3 — modernized authoritarianism (+) vs failed state (−)',
      trajectoryAxisZ: 'PC2 — modernization / fragile pluralism',
      trajectoryColorLegend: 'Color = time (light → earlier, dark → recent)',
      trajectoryScrub: 'Reveal up to year',
      trajectoryReset: 'Reset view',
    },
    compare: {
      emptyTitle: 'Compare countries',
      emptyBody:
        'From the World view, open a country profile and click “Add to comparison”. You can select several to cross their PC1–PC3 trajectories.',
      emptyHint: 'Start from the World view',
      eyebrow: 'Comparison',
      title: 'Side-by-side trajectories',
      lead: 'Compare political dynamics on a shared scale, from 1980 to 2021.',
      selected: 'Countries tracked',
      removeAria: 'Remove {name}',
      colCountry: 'Country',
      colStatus: 'Status',
      colPc1Ref: 'PC1 2014',
      colPc1Recent: 'Recent PC1',
      colDelta: 'Δ period',
      chartPc1: 'PC1 — democracy',
      chartPc2: 'PC2 — modernization',
      chartPc3: 'PC3 — modernized authoritarianism / failed state',
    },
    about: {
      eyebrow: 'About',
      heroTitle: 'Political trajectories, made visible.',
      lead:
        'An interactive visualization of principal component analysis (PCA) applied to global democratic backsliding, {from}–{to}.',
      metricCountries: 'Countries in 2014',
      metricVariables: 'Variables',
      metricVariance: 'Variance · PC1–3',
      projectTitle: 'The project',
      projectP1:
        'This site builds on the academic PCA project notebook: a data-driven democracy index from a multi-source panel (political, economic, and education variables). PCA is fit on the {refYear} cross-section ({nCountries} countries, {nVariables} variables), then each panel year is projected onto the same basis to track national trajectories.',
      projectP2:
        'PC1 ({pc1}% of variance) captures the democracy / political freedoms axis. PC2 ({pc2}%) separates economic modernization from fragile pluralism. PC3 ({pc3}%) splits modernized authoritarianism from failed-state patterns. Together, the first three axes explain {cum}% of variance.',
      projectP3:
        'The democracy / hybrid / autocracy classification uses PC1 {refYear} terciles (thresholds {q33} and {q66}), as in the notebook. The global evolution on the timeline follows the notebook’s politics-only PCA (world median and IQR, 1980–2021) — without mixing in the main-model scale.',
      authorTitle: 'Author',
      authorBio:
        'A Bocconi University – HEC Paris double degree student on the Data, Society and Organisation track. This PCA visualization of democratic backsliding is part of his academic work — a clear, global reading of the political trajectories the data bring into view.',
      limitsTitle: 'Interpretation & limits',
      limitProjection:
        'Historical projection standardizes each year on the {refYear} distribution; years missing event (journalist) variables receive the reference mean (coverage score shown in the data).',
      limitWindow:
        'Analysis window: {from}–{to} (V-Dem / DPI coverage in the dataset). The brief mentioned 2022; the notebook ends in {to}.',
      limitLinear:
        'PCA is linear and sensitive to imputation choices; robustness checks (robust scaling, politics-only PCA, etc.) are documented in the notebook.',
      sourcesTitle: 'Sources & references',
      dataNote:
        'Precomputed from Global_Dataset.csv via scripts/export_pca_data.py, faithful to the Project_Python_corrected_v7_global_charts.ipynb notebook pipeline.',
    },
    status: {
      democracy: 'Democracy',
      hybrid: 'Hybrid',
      autocracy: 'Autocracy',
    },
    axisLabels: {
      PC1: 'Democratic quality (+ = more democratic)',
      PC2: 'Modernization / fragile pluralism',
      PC3: 'Modernized authoritarianism vs failed state',
    },
    interpretations: {
      PC1: 'Main democracy / political freedoms axis (civil rights, electoral integrity, absence of repression).',
      PC2: 'Secondary axis: modernized service economy vs agrarian / fragile pluralism.',
      PC3: 'Modernized authoritarianism (+) vs failed state (−).',
      status:
        'Classification by 2014 PC1 terciles: high = democracy, middle = hybrid, low = autocracy.',
    },
    documentTitle: 'Demoscope — PCA & democracy',
    documentDescription:
      'PCA visualization of democracy and global democratic backsliding, 1980–2021.',
    intro: {
      eyebrow: 'PCA · democracy · 1980–2021',
      body: 'A global reading of democratic backsliding: PCA scores (PC1–PC3), country trajectories and comparisons — from 1980 to 2021.',
      cta: 'Enter the globe',
      auto: 'Opening automatically in {seconds}s',
    },
  },
}

export const STORAGE_KEY = 'demoscope.locale'
