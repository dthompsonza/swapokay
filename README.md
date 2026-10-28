# SwapOkay

Client-side Angular SPA for tracking collectible collections (e.g. Checkers Stickables 2026) and comparing them via QR code to find swaps. Data is stored in the browser's `localStorage`.

## Run (Windows PowerShell)

```powershell
npm install        # first time only
npm run start      # dev server: http://localhost:4200
npm run build      # production build -> dist\swapokay\browser
npm test -- --watch=false
```

Requires Node 22.12+ (developed on 22.20). The camera scanner needs `localhost` or HTTPS; pasting a code works anywhere.

Project rules and the full specification live in `.github\copilot-instructions.md`, which must be updated before any app change.
