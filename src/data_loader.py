import os
from pathlib import Path
import pandas as pd
from datasets import load_dataset


DATA_DIR = Path("data/raw")
DATA_DIR.mkdir(parents=True, exist_ok=True)
DEFAULT_CSV_PATH = DATA_DIR / "house_prices.csv"


def load_house_data(csv_path: Path = DEFAULT_CSV_PATH, force_download: bool = False) -> pd.DataFrame:
    """
    Charge le jeu de données depuis le CSV local s'il existe, sinon le télécharge
    depuis Hugging Face ("t22000t/house-prices-tabular").
    """
    csv_path = Path(csv_path)
    if csv_path.exists() and not force_download:
        print(f"Chargement depuis le cache local: {csv_path}")
        return pd.read_csv(csv_path)

    print("Téléchargement du jeu de données depuis Hugging Face ('t22000t/house-prices-tabular')...")
    dataset = load_dataset(
        "t22000t/house-prices-tabular",
        split="train"
    )

    df = dataset.to_pandas()
    df.to_csv(csv_path, index=False)

    print("Dimensions :", df.shape)
    print("\nColonnes :")
    print(df.columns.tolist()[:15], "... (total:", len(df.columns), ")")

    print("\nAperçu :")
    print(df.head(3))

    print("\nValeurs manquantes (Top 10) :")
    print(df.isnull().sum().sort_values(ascending=False).head(10))

    if "SalePrice" in df.columns:
        print("\nStatistiques des prix (SalePrice) :")
        print(df["SalePrice"].describe())

    print(f"\nDonnées sauvegardées avec succès dans: {csv_path}")
    return df


def load_raw_data(filepath: str = None) -> pd.DataFrame:
    """
    Charge les données brutes depuis le CSV local.
    Si le fichier n'existe pas, télécharge le dataset depuis Hugging Face.
    """
    if filepath is None:
        filepath = DEFAULT_CSV_PATH

    path_obj = Path(filepath)
    if not path_obj.exists():
        print(f"Fichier {filepath} non trouvé. Téléchargement initial...")
        return load_house_data(path_obj)

    df = pd.read_csv(filepath)
    print(f"Données chargées ({len(df)} lignes, {len(df.columns)} colonnes) depuis {filepath}")
    return df


if __name__ == "__main__":
    load_house_data()
