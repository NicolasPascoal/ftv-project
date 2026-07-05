FROM python:3.12-slim

WORKDIR /app

# Instala dependências de build necessárias para compilar pacotes se preciso (como bcrypt, cryptography)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir cryptography

COPY . .

EXPOSE 5000

ENV FLASK_ENV=production

CMD ["python", "run.py"]
