from typing import Tuple, List
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder


def split_features_target(
    df: pd.DataFrame,
    target_column: str = "SalePrice",
    drop_columns: List[str] = None
) -> Tuple[pd.DataFrame, pd.Series]:
    """Sépare les variables explicatives (X) et la variable cible (y), en retirant les identifiants."""
    if drop_columns is None:
        drop_columns = ["Id"]

    cols_to_drop = [c for c in drop_columns if c in df.columns]
    if target_column in df.columns:
        cols_to_drop.append(target_column)

    X = df.drop(columns=cols_to_drop)
    y = df[target_column] if target_column in df.columns else None
    return X, y


def split_train_test(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Divise les données en ensembles d'entraînement et de test."""
    return train_test_split(X, y, test_size=test_size, random_state=random_state)


def create_preprocessor(X: pd.DataFrame) -> ColumnTransformer:
    """
    Construit un ColumnTransformer adapté aux données tabulaires :
    - Numériques : imputation médiane + normalisation StandardScaler
    - Catégorielles : imputation mode + encodage OneHotEncoder (gestion des nouvelles modalités)
    """
    numeric_features = X.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_features = X.select_dtypes(include=["object", "category"]).columns.tolist()

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ],
        remainder="drop"
    )

    return preprocessor
