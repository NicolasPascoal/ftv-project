FROM node:20-slim

# Instala o Chromium e dependências do Puppeteer para rodar em modo Headless no Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    && rm -rf /var/lib/apt/lists/*

# Configura variáveis para o Puppeteer usar o Chromium do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --only=production

COPY . .

# Expõe a porta do microserviço
EXPOSE 3001

CMD ["node", "index.js"]
