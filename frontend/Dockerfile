FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Make the dev server accessible from outside the container (host machine)
ENV HOST=0.0.0.0
# Improve file watching when files are mounted from Windows/WSL
ENV CHOKIDAR_USEPOLLING=true
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
