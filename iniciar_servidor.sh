#!/bin/bash
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
PORT=8080
echo ""
echo "✅ Servidor iniciado"
echo ""
echo "📱 Abre esta dirección en Safari desde tu iPhone:"
echo "   http://$IP:$PORT"
echo ""
echo "Presiona Ctrl+C para detener."
echo ""
cd "$(dirname "$0")"
python3 -m http.server $PORT
