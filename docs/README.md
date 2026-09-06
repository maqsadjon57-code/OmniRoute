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

This demo agent runs **locally in the browser**. It is not affiliated with Anthropic and does not call Claude unless you wire `js/websocket.js` to your own backend.

## Project layout

See the repository root: `css/`, `js/`, `components/`, `config/`.

## Keyboard

See [SHORTCUTS.md](./SHORTCUTS.md).

## API hook

See [API.md](./API.md).
