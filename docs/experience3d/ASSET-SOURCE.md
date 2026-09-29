# Asset source — WEBEDRIVE ribbon candidate

This folder documents the editable source used during the implementation session.

## Source

`tools/generate-ribbon-assets.py` is an original procedural generator created for WEBEDRIVE. It does not import a third-party vehicle model, texture or environment.

The script reconstructs only values explicitly present in the uploaded execution PDF:
- 4.05 × 1.78 × 1.45 m illustrative compact proportions
- 0.31 m nominal wheel radius
- 3.4 m road width / 0.14 m thickness
- the seven route control points
- WEBEDRIVE material colours and starting PBR values
- required node names

## Status

The generator is an editable source, but its generated GLBs remain **CANDIDATE_REQUIRES_VISUAL_REVIEW** until:
1. the actual exported binaries are committed,
2. the three contractual camera views are reviewed,
3. wheel contact, silhouette and margins are checked,
4. the asset manifest is updated with measured file sizes and licensing provenance.

No generated asset should be described as the real training fleet.

## Reproduction

Use a separate 3D tooling environment, not the frontend runtime:

```sh
python -m venv .venv-3d
. .venv-3d/bin/activate
pip install -r tools/requirements-3d.txt
python tools/generate-ribbon-assets.py --out public/experience3d/models
```

The frontend must not depend on Python or trimesh.
