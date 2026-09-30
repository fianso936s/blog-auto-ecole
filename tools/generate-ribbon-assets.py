#!/usr/bin/env python3
"""Generate the WEBEDRIVE ribbon road + illustrative compact GLB variants.

This is a deterministic editable source, reconstructed from the uploaded
WEBEDRIVE execution PDF. It does not use any third-party 3D model or texture.

Usage:
    python tools/generate-ribbon-assets.py --out public/experience3d/models

The generated assets remain candidates until visual review is completed.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import numpy as np
import trimesh

ROAD_POINTS = np.array([
    [-18.0, 0.0, 8.0],
    [-12.0, 0.0, 8.0],
    [-5.0, 0.0, 4.0],
    [2.0, 0.0, 0.0],
    [8.0, 0.0, 2.0],
    [13.0, 0.0, 4.0],
    [20.0, 0.0, 2.0],
])

LEVELS = {
    "desktop": {"samples": 160, "body_subdiv": 3, "cabin_subdiv": 3, "wheel_sections": 32},
    "lite": {"samples": 96, "body_subdiv": 2, "cabin_subdiv": 2, "wheel_sections": 24},
    "mobile": {"samples": 64, "body_subdiv": 2, "cabin_subdiv": 2, "wheel_sections": 20},
}

def pbr(name: str, hex_color: str, metallic: float = 0.0, roughness: float = 0.5):
    value = hex_color.lstrip("#")
    rgba = [int(value[i:i+2], 16) for i in (0, 2, 4)] + [255]
    return trimesh.visual.material.PBRMaterial(
        name=name,
        baseColorFactor=rgba,
        metallicFactor=metallic,
        roughnessFactor=roughness,
    )

MATERIALS = {
    "body": pbr("Body", "#153D58", 0.35, 0.32),
    "glass": pbr("Glass", "#243844", 0.10, 0.18),
    "road": pbr("Road", "#516675", 0.0, 0.88),
    "tires": pbr("Tires", "#1B2024", 0.0, 0.92),
    "markers": pbr("Markers", "#D7B98E", 0.0, 0.70),
}

def tj(ti: float, pi: np.ndarray, pj: np.ndarray, alpha: float = 0.5) -> float:
    return ti + float(np.linalg.norm(pj - pi) ** alpha)

def catmull_segment(p0, p1, p2, p3, count: int) -> np.ndarray:
    t0 = 0.0
    t1 = tj(t0, p0, p1)
    t2 = tj(t1, p1, p2)
    t3 = tj(t2, p2, p3)
    ts = np.linspace(t1, t2, count, endpoint=False)
    result = []
    for t in ts:
        a1 = (t1 - t) / (t1 - t0) * p0 + (t - t0) / (t1 - t0) * p1
        a2 = (t2 - t) / (t2 - t1) * p1 + (t - t1) / (t2 - t1) * p2
        a3 = (t3 - t) / (t3 - t2) * p2 + (t - t2) / (t3 - t2) * p3
        b1 = (t2 - t) / (t2 - t0) * a1 + (t - t0) / (t2 - t0) * a2
        b2 = (t3 - t) / (t3 - t1) * a2 + (t - t1) / (t3 - t1) * a3
        c = (t2 - t) / (t2 - t1) * b1 + (t - t1) / (t2 - t1) * b2
        result.append(c)
    return np.array(result)

def sample_curve(count: int):
    points = ROAD_POINTS
    extended = np.vstack([2 * points[0] - points[1], points, 2 * points[-1] - points[-2]])
    per_segment = max(4, math.ceil(count / (len(points) - 1)))
    chunks = []
    for i in range(1, len(extended) - 2):
        chunks.append(catmull_segment(extended[i-1], extended[i], extended[i+1], extended[i+2], per_segment))
    path = np.vstack(chunks)
    path = np.vstack([path, points[-1]])
    indices = np.linspace(0, len(path) - 1, count).round().astype(int)
    path = path[indices]
    tangent = np.gradient(path, axis=0)
    tangent[:, 1] = 0.0
    tangent /= np.linalg.norm(tangent, axis=1)[:, None]
    u = np.linspace(0.0, 1.0, len(path))
    return u, path, tangent

def make_ribbon(samples: int, width: float = 3.4, thickness: float = 0.14):
    u, path, tangent = sample_curve(samples)
    normal = np.column_stack([-tangent[:, 2], np.zeros(samples), tangent[:, 0]])
    half = width / 2
    top_l = path + normal * half
    top_r = path - normal * half
    bot_l = top_l.copy(); bot_l[:, 1] -= thickness
    bot_r = top_r.copy(); bot_r[:, 1] -= thickness
    vertices = np.vstack([top_l, top_r, bot_l, bot_r])
    tl = np.arange(0, samples); tr = np.arange(samples, 2 * samples)
    bl = np.arange(2 * samples, 3 * samples); br = np.arange(3 * samples, 4 * samples)
    faces = []
    for i in range(samples - 1):
        faces += [
            [tl[i], tr[i], tr[i+1]], [tl[i], tr[i+1], tl[i+1]],
            [bl[i], br[i+1], br[i]], [bl[i], bl[i+1], br[i+1]],
            [tl[i], tl[i+1], bl[i+1]], [tl[i], bl[i+1], bl[i]],
            [tr[i], br[i+1], tr[i+1]], [tr[i], br[i], br[i+1]],
        ]
    faces += [[tl[0], bl[0], br[0]], [tl[0], br[0], tr[0]]]
    faces += [[tl[-1], tr[-1], br[-1]], [tl[-1], br[-1], bl[-1]]]
    mesh = trimesh.Trimesh(vertices=vertices, faces=np.array(faces), process=True)
    mesh.visual.material = MATERIALS["road"]
    return mesh, (u, path, tangent)

def ellipsoid(subdivisions, scale, center, material):
    mesh = trimesh.creation.icosphere(subdivisions=subdivisions, radius=1.0)
    mesh.apply_scale(scale)
    mesh.apply_translation(center)
    mesh.visual.material = material
    return mesh

def make_car(level: str):
    cfg = LEVELS[level]
    sb = cfg["body_subdiv"]
    lower = ellipsoid(sb, [.89, .34, 1.95], [0, .55, 0], MATERIALS["body"])
    hood = ellipsoid(max(1, sb - 1), [.82, .24, .78], [0, .62, 1.18], MATERIALS["body"])
    rear = ellipsoid(max(1, sb - 1), [.82, .22, .58], [0, .60, -1.38], MATERIALS["body"])
    shoulders = ellipsoid(max(1, sb - 1), [.86, .26, 1.25], [0, .78, -.12], MATERIALS["body"])
    body = trimesh.util.concatenate([lower, hood, rear, shoulders])
    body.visual.material = MATERIALS["body"]
    glass = ellipsoid(cfg["cabin_subdiv"], [.68, .30, .88], [0, 1.08, -.16], MATERIALS["glass"])

    wheels = []
    for x in (-.87, .87):
        for z in (-1.22, 1.22):
            wheel = trimesh.creation.cylinder(radius=.31, height=.22, sections=cfg["wheel_sections"])
            wheel.visual.material = MATERIALS["tires"]
            wheel.apply_transform(trimesh.transformations.rotation_matrix(math.pi / 2, [0, 1, 0]))
            wheel.apply_translation([x, .31, z])
            wheels.append(wheel)
    return body, glass, wheels

def tangent_frame(tangent):
    angle = math.atan2(float(tangent[0]), float(tangent[2]))
    return trimesh.transformations.rotation_matrix(angle, [0, 1, 0])

def build_scene(level: str):
    cfg = LEVELS[level]
    road, (u, path, tangent) = make_ribbon(cfg["samples"])
    scene = trimesh.Scene()
    scene.graph.update(frame_from="world", frame_to="SceneRoot", matrix=np.eye(4))
    scene.graph.update(frame_from="SceneRoot", frame_to="RoadRoot", matrix=np.eye(4))
    scene.graph.update(frame_from="SceneRoot", frame_to="CarRoot", matrix=np.eye(4))
    scene.add_geometry(road, node_name="RoadSurface", geom_name="RoadSurface", parent_node_name="RoadRoot")

    index = int(np.argmin(abs(u - .12)))
    car_transform = tangent_frame(tangent[index])
    car_transform[:3, 3] = path[index] + np.array([0, .005, 0])
    scene.graph.update(frame_from="SceneRoot", frame_to="CarRoot", matrix=car_transform)

    body, glass, wheels = make_car(level)
    scene.add_geometry(body, node_name="Body", geom_name="Body", parent_node_name="CarRoot")
    scene.add_geometry(glass, node_name="Glass", geom_name="Glass", parent_node_name="CarRoot")
    for name, wheel in zip(["Wheel_RL", "Wheel_FL", "Wheel_RR", "Wheel_FR"], wheels):
        scene.add_geometry(wheel, node_name=name, geom_name=name, parent_node_name="CarRoot")

    for marker_index, marker_u in enumerate([.32, .72], start=1):
        index = int(np.argmin(abs(u - marker_u)))
        marker = trimesh.creation.cylinder(radius=.12, height=.06, sections=24)
        marker.visual.material = MATERIALS["markers"]
        marker.apply_translation(path[index] + np.array([0, .03, 0]))
        name = f"Marker_{marker_index:02d}"
        scene.add_geometry(marker, node_name=name, geom_name=name, parent_node_name="RoadRoot")
    return scene

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="public/experience3d/models")
    args = parser.parse_args()
    output = Path(args.out)
    output.mkdir(parents=True, exist_ok=True)

    report = {
        "source": "procedural WEBEDRIVE geometry; no third-party model or texture",
        "status": "CANDIDATE_REQUIRES_VISUAL_REVIEW",
        "variants": {}
    }
    for level in LEVELS:
        scene = build_scene(level)
        payload = trimesh.exchange.gltf.export_glb(scene)
        target = output / f"webedrive-ribbon-{level}.glb"
        target.write_bytes(payload)
        triangles = sum(len(geometry.faces) for geometry in scene.geometry.values() if hasattr(geometry, "faces"))
        report["variants"][level] = {
            "path": str(target),
            "bytes": len(payload),
            "triangles": triangles,
            "geometryCount": len(scene.geometry),
            "nodeNames": sorted(scene.graph.nodes),
        }

    report_path = output / "generation-report.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()
