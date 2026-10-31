#!/usr/bin/env bash

# Script d'exécution automatique avec l'environnement virtuel du projet
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PYTHON="$DIR/venv/bin/python"
STREAMLIT="$DIR/venv/bin/streamlit"
UVICORN="$DIR/venv/bin/uvicorn"
PYTEST="$DIR/venv/bin/pytest"

case "$1" in
    api)
        echo "⚡ Démarrage du backend FastAPI sur http://localhost:8000 (Docs: http://localhost:8000/docs) ..."
        "$UVICORN" api.main:app --host 0.0.0.0 --port 8000 --reload
        ;;
    react)
        echo "⚛️ Démarrage du serveur React (Vite) sur http://localhost:5173 ..."
        cd "$DIR/frontend" && npm run dev
        ;;
    serve)
        echo "🌐 Démarrage de l'application complète (React + FastAPI) sur http://localhost:8000 ..."
        cd "$DIR/frontend" && npm run build
        cd "$DIR" && "$UVICORN" api.main:app --host 0.0.0.0 --port 8000
        ;;
    streamlit)
        echo "🚀 Lancement de l'application Streamlit sur http://localhost:8501 ..."
        "$STREAMLIT" run app.py
        ;;
    test)
        echo "🧪 Exécution des tests avec pytest -v ..."
        "$PYTEST" -v
        ;;
    train)
        echo "⚙️ Entraînement du modèle..."
        "$PYTHON" -m src.train
        ;;
    predict)
        echo "🔮 Test de prédiction..."
        "$PYTHON" -m src.predict
        ;;
    visualize)
        echo "📈 Génération des visualisations..."
        "$PYTHON" -m src.visualize
        ;;
    audit)
        echo "🔍 Audit de contrôle..."
        "$PYTHON" audit_control.py
        ;;
    app|"")
        echo "⚡ Démarrage automatique : FastAPI + React Frontend sur http://localhost:8000 ..."
        cd "$DIR/frontend" && npm run build
        cd "$DIR" && "$UVICORN" api.main:app --host 0.0.0.0 --port 8000
        ;;
    *)
        echo "Usage: ./run.sh [api|react|serve|streamlit|test|train|predict|audit]"
        exit 1
        ;;
esac
