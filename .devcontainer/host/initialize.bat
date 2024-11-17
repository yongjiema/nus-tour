@echo off

@REM Dotenv
if not exist .devcontainer\.env (
  copy .devcontainer\.env.sample .devcontainer\.env
)

