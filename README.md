# HexLab

**https://hexlab.somacosf.com** — Marine Architecture Configurator

Full-screen hexagonal seastead / inframodule platform. UI lives in floating panels.

> Direct response to Palmer Luckey's SLAB seastead concept. Hexagons that link and tile.

## Harvested from Gemini configurator

Port of the Google Sites embed (`hexlab_marine_architecture_configurator.html`) into React Three Fiber:

| Module | Code | Role |
|--------|------|------|
| Core Infra-Module | H1 | Structural hull, stackable Tier-2 deck / helipad |
| Flight-Harbor | FH | Articulating swing/raise/lower face gate + UAV |
| Drainable Dry-Dock | DD | Ballast cradle + USV |
| Sub-Launching Harbor | SH | Moonpool + UUV + gantry |

**Presets:** 7-hex recon · 19-hex carrier hub · sandbox  
**Kinematics:** gate angle, ballast pump, thrusters, interlocks, stack, sea-state waves  
**Telemetry:** area, nodes, thrusters, displacement, bay counts, stability bar  
**Export:** live X-thread reply to @PalmerLuckey + engineering spec sheet

## Run

```bash
npm install
npm run dev
```

Deployed on Vercel → `hexlab.somacosf.com` from `SoMaCoSF/hexlab-platform`.

## Integrations (scoped)

- **spoken-world** — voice build (capability only; not estate-tied)
- **anymachine** — device generation for modules
- **monohud** — floating panel chrome

## License

TBD
