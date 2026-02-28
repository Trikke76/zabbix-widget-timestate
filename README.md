# Zabbix Time State Widget (7.x)

State timeline widget inspired by Grafana State Timeline.

## Features

- Multiple hosts.
- Item key/name substring filters.
- Explicit item selection via item IDs (`comma`/`newline` separated).
- Time range based on configurable lookback hours.
- Segment merging for equal consecutive states.
- Null-gap mode:
  - `Disconnected` = show no-data gaps for missing intervals.
  - `Connected` = extend neighboring states through missing intervals.
- Per-state color support (`0`, `1`, unknown) with edit-form color picker.
- Fallback deterministic colors for other state values.

## Install

1. Place module directory in your Zabbix `ui/modules/` location.
2. Enable module in `Administration -> General -> Modules`.
3. Add widget `Time State` on a dashboard.

## Packaging

- Local build (for `dev` branch testing):
  - `./scripts/build-package.sh`
- Output file:
  - `dist/timestate-zabbix-v<version>.zip`
- CI build:
  - On every push to `main`, GitHub Actions workflow
    [`.github/workflows/build-package.yml`](/Users/patrik/git/zabbix-widget-timestate/.github/workflows/build-package.yml)
    builds and uploads the package as an artifact.

## Notes

- State mapping accepts lines like:
  - `0=OK`
  - `1=Problem`
  - `2=Warning`
- Color picker is attached to `*_color` fields in widget edit form.
