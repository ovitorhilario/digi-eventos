#!/bin/sh

# Aguarda o MinIO estar pronto
sleep 5

# Configura o alias do MinIO
mc alias set minio http://minio:9000 minioadmin minioadmin

# Cria o bucket se não existir
mc mb minio/digi-eventos --ignore-existing

# Define política pública para leitura (opcional - apenas se você quiser acesso público)
mc anonymous set download minio/digi-eventos

echo "MinIO bucket 'digi-eventos' created successfully!"
