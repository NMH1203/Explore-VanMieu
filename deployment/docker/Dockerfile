FROM node:24-bookworm-slim
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node backend ./backend
COPY --chown=node:node frontend ./frontend
COPY --chown=node:node database ./database
COPY --chown=node:node storage ./storage
RUN mkdir -p /app/data /app/database/backups && chown -R node:node /app/data /app/database/backups /app/storage
USER node
ENV HOST=0.0.0.0 PORT=3000 DATABASE_PATH=/app/data/vanmieu.sqlite
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "backend/src/app/server.js"]
