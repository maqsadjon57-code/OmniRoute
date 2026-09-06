# Claude Code Web

A browser-native recreation of the **Claude Code** terminal agent: dark, dense, monospaced, with tools, permissions, streaming, and a virtual workspace.

Open `index.html` via a local server (ES modules require HTTP).

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Then visit the served URL.

## What works

- Terminal chrome (traffic lights, 80×24 title, status bar)
- Slash commands (`/help`, `/files`, `/read`, `/write`, `/execute`, …)
- Natural-language intents (create a file, search, run, git)
- Virtual filesystem persisted in `localStorage`
- Permission dialogs for destructive actions
- Command palette (`Ctrl+Shift+P`)
- Autocomplete, history, reverse-i-search (`Ctrl+R`)
- Syntax highlighting + markdown
- Dark / light / midnight themes
- File tree sidebar (`Ctrl+B`)
- Simulated shell: `ls`, `cat`, `pwd`, `git`, `node`, `python`, …

Click **API Key** in the titlebar (or `/apikey`) and paste a key from [console.anthropic.com](https://console.anthropic.com/settings/keys). Pick a model with the chip next to it (Sonnet 5, Opus 5, Haiku 4.5, …).

Without a key, a local demo agent still runs slash commands and simple file tasks. With a key, prompts go to the Anthropic Messages API (`anthropic-dangerous-direct-browser-access`) and Claude can use workspace tools.

## Project layout

See the repository root: `css/`, `js/`, `components/`, `config/`.

## Keyboard

See [SHORTCUTS.md](./SHORTCUTS.md).

## API hook

See [API.md](./API.md).
