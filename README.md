# HexLab

**hexlab.somacosf.com** — Marine Architecture Configurator

Full-screen hexagonal seastead / inframodule platform. All other UI lives in floating panels.

> Direct response to Palmer Luckey's SLAB seastead concept. Hexagons that link and tile.

## Vision

Each hex is a self-contained **inframodule**:

- Perimeter faces swing / raise / lower as **flight-harbor gates**
- Isolated ballast cells act as **drainable dry-docks**
- Central cells form wave-attenuated **UUV / sub launch harbors**
- Solid corner floating + infra interlocks
- Stackable second-story flight / sensor decks
- Vertex ties + tug swivel propellers at intersections

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  FULL-SCREEN PLATFORM (Three.js / R3F hex world)            │
│  • Hex tiling (link + tile)                                 │
│  • Module instances with live transforms (gates, docks)     │
│  • Voice commands (spoken-world style — separate from estate)│
└─────────────────────────────────────────────────────────────┘
         ▲ floating panels (monohud-style)
┌────────┴────────┬───────────────┬──────────────────────────┐
│ Module Inspector│ Voice Console │ Fleet / Harbor Status    │
│ Topology Editor │ Device Gen    │ Stack / Deck Planner     │
│ Propulsion      │ Build Log     │                          │
└─────────────────┴───────────────┴──────────────────────────┘
```

## Integrations (deliberately scoped)

- **spoken-world** — voice-driven building. Capability borrow only for SLAB-style construction. **Not** wired into the SoMaCoSF estate identity layer.
- **anymachine** — generate working mechanical devices (hinges, propellers, hydraulics) for the modules.
- **monohud** — sci-fi floating panel system for the HUD.

## Status

Scaffolding the full-screen + floating-panel shell.

## Related

- [spoken-world](https://github.com/SoMaCoSF/spoken-world)
- [anymachine](https://github.com/SoMaCoSF/anymachine)
- [monohud](https://github.com/SoMaCoSF/monohud)

## License

TBD
