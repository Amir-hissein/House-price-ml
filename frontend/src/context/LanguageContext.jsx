import React, { createContext, useContext, useState } from 'react';

const translations = {
  fr: {
    // Header
    appTitle: "House Price Predictor",
    appSubtitle: "Estime le prix d'une maison avec un modèle de Machine Learning et explore les données.",
    languageModalTitle: "Choisir la langue",
    languageModalSubtitle: "Sélectionnez votre langue d'affichage",

    // Tabs
    tabPredict: "Prédire le prix",
    tabCharts: "Graphiques des données",
    tabModel: "Performances du modèle",
    tabData: "Tableau des données",

    // Predictor
    livingArea: "Surface habitable (sq ft)",
    overallQuality: "Qualité générale (1 à 10)",
    garageCapacity: "Capacité du garage (véhicules)",
    basementArea: "Surface du sous-sol (sq ft)",
    fullBathrooms: "Salles de bain complètes",
    bedrooms: "Chambres",
    predictBtn: "Prédire le prix",
    calculating: "Calcul en cours...",
    estimatedPrice: "Prix estimé",
    marketPosition: "Positionnement marché réel",
    higherThan: "Supérieur à",
    ofHouses: "des maisons du marché",
    vsMedianLabel: "par rapport à la médiane (163 000 $)",
    disclaimer: "Estimation expérimentale basée sur 1 460 données réelles, pas une expertise immobilière légale.",

    // Charts Tab
    loadingCharts: "Chargement des graphiques Plotly...",
    chartDistTitle: "Distribution des Prix de Vente (SalePrice)",
    chartAreaTitle: "Surface Habitable (GrLivArea) vs Prix Réel de Vente",
    chartNeighTitle: "Dispersion Réelle des Prix par Quartier (Neighborhood)",
    chartCorrTitle: "Matrice de Corrélation des Variables Clés avec SalePrice",

    // Plotly Axis / Traces / Labels inside charts
    plotSalePrice: "Prix de Vente ($)",
    plotHouseCount: "Nombre de maisons",
    plotLivingArea: "Surface Habitable (sq ft)",
    plotQuality: "Qualité (1-10)",
    plotBasement: "Sous-sol (sq ft)",
    plotNeighborhood: "Quartier",
    plotActualPrice: "Prix Réel ($)",
    plotPredictedPrice: "Prix Estimé ($)",
    plotError: "Erreur ($)",
    plotAbsoluteError: "Erreur Absolue ($)",
    plotMedianPrefix: "Médiane :",
    plotMeanPrefix: "Moyenne :",
    plotIdealLine: "Ligne parfaite y = x",

    // Model Performance
    modelPerfTitle: "Performances du modèle de régression linéaire",
    modelPerfSubtitle: "Évaluation sur 1 460 maisons réelles — Jeu de données Ames Housing",
    r2Score: "Score R²",
    r2Delta: "~80% de variance expliquée",
    medianAccuracy: "Précision médiane",
    medAccDelta: "Des prédictions à ±15% du réel",
    maeLabel: "MAE ($)",
    maeSub: "Erreur absolue moyenne",
    rmseLabel: "RMSE ($)",
    rmseSub: "Écart-type des erreurs",
    mapeLabel: "MAPE (%)",
    mapeSub: "Erreur relative moyenne",
    scatterTitle: "Prix Réels vs Prix Estimés par le Modèle — Ligne parfaite y = x",
    featureImpactTitle: "Impact de chaque variable",
    featureImpactSubtitle: "Coefficient appris par la régression linéaire",
    colRank: "#",
    colVariable: "VARIABLE",
    colImpact: "IMPACT",
    colWeight: "POIDS",
    interceptConst: "Constante d'interception :",
    equationTitle: "Équation du modèle",
    equationPrice: "Prix",
    interpretationTitle: "Interprétation métier",
    rule1Text: "+1 sq ft de surface habitable",
    rule1Impact: "+49 $ en moyenne",
    rule2Text: "+1 point de qualité générale",
    rule2Impact: "+22 434 $ en moyenne",
    rule3Text: "+1 place de garage",
    rule3Impact: "+18 529 $ en moyenne",
    rule4Text: "+1 chambre supplémentaire",
    rule4Impact: "–7 277 $ (corrélation négative)",
    featGrLivArea: "Surface habitable (GrLivArea)",
    featOverallQual: "Qualité générale (OverallQual)",
    featTotalBsmtSF: "Surface sous-sol (TotalBsmtSF)",
    featGarageCars: "Capacité garage (GarageCars)",
    featFullBath: "Salles de bain (FullBath)",
    featBedroomAbvGr: "Chambres (BedroomAbvGr)",

    // Data Explorer
    dataTitle: "Données brutes — Ames Housing",
    dataSubtitle: "Jeu de données complet · 1 460 maisons · Cliquez sur une colonne pour trier",
    filterNeighborhood: "Filtrer par quartier",
    allNeighborhoods: "Tous les quartiers ({count})",
    quickSearch: "Recherche rapide",
    searchPlaceholder: "Ex: CollgCr, Veenker, Edwards…",
    rowsDisplayed: "maison(s) affichée(s)",
    outOfTotal: "sur {total} au total",
    resetFilters: "Réinitialiser les filtres",
    loadingData: "Chargement des 1 460 maisons…",
    noDataFound: "Aucune maison ne correspond aux filtres sélectionnés.",
    colId: "#",
    colQuartier: "Quartier",
    colPrice: "Prix Réel ($)",
    colArea: "Surface (sq ft)",
    colQuality: "Qualité",
    colGarage: "Garage",
    colBasement: "Sous-sol (sq ft)",
    colBath: "Salles de bain",
    colYear: "Année de construction",
    sortedBy: "Triées par",
    ascending: "croissant",
    descending: "décroissant",
  },

  en: {
    // Header
    appTitle: "House Price Predictor",
    appSubtitle: "Estimate house prices using Machine Learning and explore real dataset insights.",
    languageModalTitle: "Choose Language",
    languageModalSubtitle: "Select your preferred display language",

    // Tabs
    tabPredict: "Predict Price",
    tabCharts: "Data Charts",
    tabModel: "Model Performance",
    tabData: "Data Table",

    // Predictor
    livingArea: "Living Area (sq ft)",
    overallQuality: "Overall Quality (1 to 10)",
    garageCapacity: "Garage Capacity (cars)",
    basementArea: "Basement Area (sq ft)",
    fullBathrooms: "Full Bathrooms",
    bedrooms: "Bedrooms",
    predictBtn: "Predict Price",
    calculating: "Calculating...",
    estimatedPrice: "Estimated Price",
    marketPosition: "Market Positioning",
    higherThan: "Higher than",
    ofHouses: "of market homes",
    vsMedianLabel: "compared to median ($163,000)",
    disclaimer: "Experimental estimate based on 1,460 real properties, not a certified real estate appraisal.",

    // Charts Tab
    loadingCharts: "Loading Plotly charts...",
    chartDistTitle: "Sale Price Distribution (SalePrice)",
    chartAreaTitle: "Living Area (GrLivArea) vs Actual Sale Price",
    chartNeighTitle: "Actual Price Distribution by Neighborhood",
    chartCorrTitle: "Correlation Matrix of Key Features with SalePrice",

    // Plotly Axis / Traces / Labels inside charts
    plotSalePrice: "Sale Price ($)",
    plotHouseCount: "Number of Houses",
    plotLivingArea: "Living Area (sq ft)",
    plotQuality: "Quality (1-10)",
    plotBasement: "Basement (sq ft)",
    plotNeighborhood: "Neighborhood",
    plotActualPrice: "Actual Price ($)",
    plotPredictedPrice: "Predicted Price ($)",
    plotError: "Error ($)",
    plotAbsoluteError: "Absolute Error ($)",
    plotMedianPrefix: "Median:",
    plotMeanPrefix: "Mean:",
    plotIdealLine: "Ideal line y = x",

    // Model Performance
    modelPerfTitle: "Linear Regression Model Performance",
    modelPerfSubtitle: "Evaluation on 1,460 real houses — Ames Housing dataset",
    r2Score: "R² Score",
    r2Delta: "~80% of variance explained",
    medianAccuracy: "Median Accuracy",
    medAccDelta: "Predictions within ±15% of actual price",
    maeLabel: "MAE ($)",
    maeSub: "Mean Absolute Error",
    rmseLabel: "RMSE ($)",
    rmseSub: "Root Mean Squared Error",
    mapeLabel: "MAPE (%)",
    mapeSub: "Mean Absolute Percentage Error",
    scatterTitle: "Actual vs Predicted Prices — Ideal Line y = x",
    featureImpactTitle: "Feature Impact",
    featureImpactSubtitle: "Coefficients learned by linear regression",
    colRank: "#",
    colVariable: "FEATURE",
    colImpact: "IMPACT",
    colWeight: "WEIGHT",
    interceptConst: "Intercept constant:",
    equationTitle: "Model Equation",
    equationPrice: "Price",
    interpretationTitle: "Business Interpretation",
    rule1Text: "+1 sq ft living area",
    rule1Impact: "+$49 on average",
    rule2Text: "+1 point overall quality",
    rule2Impact: "+$22,434 on average",
    rule3Text: "+1 garage car space",
    rule3Impact: "+$18,529 on average",
    rule4Text: "+1 additional bedroom",
    rule4Impact: "–$7,277 (negative correlation)",
    featGrLivArea: "Living Area (GrLivArea)",
    featOverallQual: "Overall Quality (OverallQual)",
    featTotalBsmtSF: "Basement Area (TotalBsmtSF)",
    featGarageCars: "Garage Capacity (GarageCars)",
    featFullBath: "Full Bathrooms (FullBath)",
    featBedroomAbvGr: "Bedrooms (BedroomAbvGr)",

    // Data Explorer
    dataTitle: "Raw Data — Ames Housing",
    dataSubtitle: "Full dataset · 1,460 houses · Click any column to sort",
    filterNeighborhood: "Filter by neighborhood",
    allNeighborhoods: "All neighborhoods ({count})",
    quickSearch: "Quick Search",
    searchPlaceholder: "Ex: CollgCr, Veenker, Edwards…",
    rowsDisplayed: "house(s) displayed",
    outOfTotal: "out of {total} total",
    resetFilters: "Reset filters",
    loadingData: "Loading 1,460 houses…",
    noDataFound: "No properties match the selected filters.",
    colId: "#",
    colQuartier: "Neighborhood",
    colPrice: "Actual Price ($)",
    colArea: "Area (sq ft)",
    colQuality: "Quality",
    colGarage: "Garage",
    colBasement: "Basement (sq ft)",
    colBath: "Bathrooms",
    colYear: "Year Built",
    sortedBy: "Sorted by",
    ascending: "ascending",
    descending: "descending",
  },

  tr: {
    // Header
    appTitle: "Ev Fiyat Tahmini",
    appSubtitle: "Makine Öğrenimi modeli ile ev fiyatını tahmin edin ve gerçek verileri keşfedin.",
    languageModalTitle: "Dil Seçimi",
    languageModalSubtitle: "Kullanmak istediğiniz dili seçin",

    // Tabs
    tabPredict: "Fiyat Tahmini",
    tabCharts: "Veri Grafikleri",
    tabModel: "Model Performansı",
    tabData: "Veri Tablosu",

    // Predictor
    livingArea: "Yaşam Alanı (sq ft)",
    overallQuality: "Genel Kalite (1 - 10)",
    garageCapacity: "Garaj Kapasitesi (araç)",
    basementArea: "Bodrum Alanı (sq ft)",
    fullBathrooms: "Tam Banyo Sayısı",
    bedrooms: "Yatak Odası Sayısı",
    predictBtn: "Fiyatı Tahmin Et",
    calculating: "Hesaplanıyor...",
    estimatedPrice: "Tahmini Fiyat",
    marketPosition: "Piyasa Konumu",
    higherThan: "Piyasadaki evlerin",
    ofHouses: "'inden daha yüksek",
    vsMedianLabel: "medyan fiyata göre ($163.000)",
    disclaimer: "1.460 gerçek mülk verisine dayalı deneysel tahmin, resmi bir gayrimenkul ekspertizi değildir.",

    // Charts Tab
    loadingCharts: "Plotly grafikleri yükleniyor...",
    chartDistTitle: "Satış Fiyatı Dağılımı (SalePrice)",
    chartAreaTitle: "Yaşam Alanı (GrLivArea) ve Gerçek Satış Fiyatı",
    chartNeighTitle: "Mahallelere Göre Gerçek Fiyat Dağılımı",
    chartCorrTitle: "SalePrice ile Önemli Değişkenlerin Korelasyon Matrisi",

    // Plotly Axis / Traces / Labels inside charts
    plotSalePrice: "Satış Fiyatı ($)",
    plotHouseCount: "Ev Sayısı",
    plotLivingArea: "Yaşam Alanı (sq ft)",
    plotQuality: "Kalite (1-10)",
    plotBasement: "Bodrum (sq ft)",
    plotNeighborhood: "Mahalle",
    plotActualPrice: "Gerçek Fiyat ($)",
    plotPredictedPrice: "Tahmin Edilen Fiyat ($)",
    plotError: "Hata ($)",
    plotAbsoluteError: "Mutlak Hata ($)",
    plotMedianPrefix: "Medyan:",
    plotMeanPrefix: "Ortalama:",
    plotIdealLine: "İdeal doğru y = x",

    // Model Performance
    modelPerfTitle: "Lineer Regresyon Model Performansı",
    modelPerfSubtitle: "1.460 gerçek ev üzerinde değerlendirme — Ames Housing veri seti",
    r2Score: "R² Skoru",
    r2Delta: "~%80 açıklanan varyans",
    medianAccuracy: "Medyan Doğruluk",
    medAccDelta: "Gerçek fiyata ±%15 yakınlıkta tahminler",
    maeLabel: "MAE ($)",
    maeSub: "Ortalama Mutlak Hata",
    rmseLabel: "RMSE ($)",
    rmseSub: "Hataların Standart Sapması",
    mapeLabel: "MAPE (%)",
    mapeSub: "Ortalama Yüzde Hatası",
    scatterTitle: "Gerçek ve Tahmin Edilen Fiyatlar — İdeal Doğru y = x",
    featureImpactTitle: "Değişkenlerin Etkisi",
    featureImpactSubtitle: "Lineer regresyon ile öğrenilen katsayılar",
    colRank: "#",
    colVariable: "DEĞİŞKEN",
    colImpact: "ETKİ",
    colWeight: "AĞIRLIK",
    interceptConst: "Kesişim sabiti:",
    equationTitle: "Model Denklemi",
    equationPrice: "Fiyat",
    interpretationTitle: "İş Mantığı Yorumu",
    rule1Text: "+1 sq ft yaşam alanı",
    rule1Impact: "ortalama +$49",
    rule2Text: "+1 puan genel kalite",
    rule2Impact: "ortalama +$22.434",
    rule3Text: "+1 araçlık garaj yeri",
    rule3Impact: "ortalama +$18.529",
    rule4Text: "+1 ek yatak odası",
    rule4Impact: "–$7.277 (negatif korelasyon)",
    featGrLivArea: "Yaşam Alanı (GrLivArea)",
    featOverallQual: "Genel Kalite (OverallQual)",
    featTotalBsmtSF: "Bodrum Alanı (TotalBsmtSF)",
    featGarageCars: "Garaj Kapasitesi (GarageCars)",
    featFullBath: "Banyo Sayısı (FullBath)",
    featBedroomAbvGr: "Yatak Odası (BedroomAbvGr)",

    // Data Explorer
    dataTitle: "Ham Veriler — Ames Housing",
    dataSubtitle: "Tam veri seti · 1.460 ev · Sıralamak için sütun başlığına tıklayın",
    filterNeighborhood: "Mahalleye göre filtrele",
    allNeighborhoods: "Tüm mahalleler ({count})",
    quickSearch: "Hızlı Arama",
    searchPlaceholder: "Örn: CollgCr, Veenker, Edwards…",
    rowsDisplayed: "ev gösteriliyor",
    outOfTotal: "toplam {total} içinden",
    resetFilters: "Filtreleri sıfırla",
    loadingData: "1.460 ev yükleniyor…",
    noDataFound: "Seçilen filtrelere uygun ev bulunamadı.",
    colId: "#",
    colQuartier: "Mahalle",
    colPrice: "Gerçek Fiyat ($)",
    colArea: "Alan (sq ft)",
    colQuality: "Kalite",
    colGarage: "Garaj",
    colBasement: "Bodrum (sq ft)",
    colBath: "Banyo",
    colYear: "Yapım Yılı",
    sortedBy: "Sıralama:",
    ascending: "artan",
    descending: "azalan",
  }
};

const LanguageContext = createContext();

export const AVAILABLE_LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷', sub: 'Français (France)' },
  { code: 'en', label: 'English', flag: '🇬🇧', sub: 'English (International)' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', sub: 'Türkçe (Türkiye)' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('house_ml_lang') || 'fr';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('house_ml_lang', lang);
  };

  const t = (key, params = {}) => {
    let str = translations[language]?.[key] || translations.fr[key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, languages: AVAILABLE_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
