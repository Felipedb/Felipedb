# Áudios com ElevenLabs

1. Crie uma chave em elevenlabs.io → Profile → API Keys (permissão Text to Speech).
2. No GitHub: Settings → Secrets and variables → Actions → New repository secret
   `ELEVENLABS_API_KEY`.
3. Rode o workflow **Gerar áudios (ElevenLabs)** (Actions → escolher a branch → Run workflow).
   Ele gera os MP3 em `biblelingo/audio/`, atualiza `manifest.json` e faz commit na branch.
4. O app toca os clipes automaticamente (com fallback para a síntese do navegador).

Vozes por personagem: `tools/gen-audio.mjs` (`VOICE_BY_CHAR`). Modelo padrão `eleven_flash_v2_5`
(0,5 crédito por caractere; ~14 mil caracteres no total). Re-executar só gera o que faltar.
