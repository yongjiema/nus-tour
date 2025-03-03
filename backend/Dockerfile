ARG USERNAME=default
ARG USER_UID=1000
ARG USER_GID=${USER_UID}


FROM docker.io/node:lts AS builder
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

COPY . /project/nus-tour/backend
WORKDIR /project/nus-tour/backend

RUN true \
    # Install dependencies
    && npm ci \
    # Build
    && npm run build


FROM docker.io/node:lts
ARG USERNAME
ARG USER_UID
ARG USER_GID
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

ENV NODE_ENV=production

HEALTHCHECK --interval=1m --timeout=3s \
    CMD curl -f http://localhost:3000 || exit 1

COPY . /app/nus-tour/backend
COPY --from=builder /project/nus-tour/backend/dist /app/nus-tour/backend/dist
WORKDIR /app/nus-tour/backend

RUN true \
    # Delete built-in node user.
    && userdel node \
    # Add a non-root user.
    && groupadd -g "${USER_GID}" "${USERNAME}" \
    && useradd -s /bin/bash -u "${USER_UID}" -g "${USER_GID}" -m "${USERNAME}" \
    # Install production dependencies
    && NODE_ENV=production npm ci

USER "${USERNAME}"
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
