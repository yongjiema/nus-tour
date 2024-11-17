FROM docker.io/node:lts

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

RUN true \
    # Delete built-in node user.
    && userdel node \
    # Update npm.
    && npm install -g npm@latest \
    # Install Nest CLI.
    && npm i -g @nestjs/cli

# For Visual Studio Code Dev Containers.
#   - https://code.visualstudio.com/docs/devcontainers/containers
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        # Add Git support.
        git \
        # Add `ps` command support (for debugging using Attach by Process ID).
        procps \
    # Add a non-root user.
    && groupadd -g "${USER_GID}" "${USERNAME}" \
    && useradd -s /bin/bash -u "${USER_UID}" -g "${USER_GID}" -m "${USERNAME}" \
    # Clean up.
    && rm -rf /var/lib/apt/lists/*

USER vscode
