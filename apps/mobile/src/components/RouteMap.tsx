import {MAP_RECENTER_DELAY} from "../../../../packages/product/src/student-experience";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, View, Pressable } from "react-native";
import {
  Map,
  Camera,
  GeoJSONSource,
  Layer,
  Marker,
  type CameraRef,
  type MapRef,
} from "@maplibre/maplibre-react-native";
import {
  geometry,
  type Fix,
  type Point,
  type MapSpot,
  type NativeLocation,
} from "@repere/core";
import { routeBounds } from "../services/route-viewport";
import { colors, tones, filterTone } from "../theme";
import { Icon } from "./UI";
import { useReducedMotion } from "react-native-reanimated";
const categoryIcons = {
  Intersection: "git-branch-outline",
  Priorité: "warning-outline",
  Giratoire: "sync-outline",
  Placement: "navigate-outline",
  Manœuvre: "car-outline",
  Vitesse: "speedometer-outline",
  Observation: "eye-outline",
  Autre: "location-outline",
} as const;
export function RouteMap({
  fixes = [],
  routeKey,
  points = [],
  position,
  styleUrl,
  onTap,
  onLongPress,
  showPanControls = false,
  onPoint,
  focus,
  follow = true,
  course,
  recenterKey = 0,
  bottom = 16,
  viewportPadding = { top: 65, bottom: 70, left: 40, right: 40 },
  initialThreeD = false,
  threeD: controlledThreeD,
  show3DToggle = false,
  navigationMode = false,
  previewMode = false,
  zoomControls = false,
  highlightId,
  centerHandle,
}: {
  fixes?: Fix[];
  routeKey?: string;
  points?: (Point | MapSpot)[];
  position?: NativeLocation | null;
  styleUrl?: string | null;
  onLongPress?: (p: { lat: number; lng: number }) => void;
  showPanControls?: boolean;
  onTap?: (p: { lat: number; lng: number }) => void;
  onPoint?: (p: Point | MapSpot) => void;
  focus?: Fix | null;
  follow?: boolean;
  course?: number | null;
  recenterKey?: number;
  bottom?: number;
  viewportPadding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  initialThreeD?: boolean;
  threeD?: boolean;
  show3DToggle?: boolean;
  navigationMode?: boolean;
  previewMode?: boolean;
  /** Shows − / + buttons that work in every mode, Aperçu included. */
  zoomControls?: boolean;
  /** The repère to watch now: drawn bigger, with its name. */
  highlightId?: string;
  /** Filled with a reader of the map centre (website: "Utiliser le centre"). */
  centerHandle?: React.MutableRefObject<(() => Promise<{ lat: number; lng: number } | null>) | null>;
}) {
  const reducedMotion = useReducedMotion();
  const camera = useRef<CameraRef>(null),
    [mapReady, setMapReady] = useState(false),
    [error, setError] = useState(false);
  const map = useRef<MapRef>(null);
  if (centerHandle)
    centerHandle.current = async () => {
      try {
        const c = await map.current?.getCenter();
        return c ? { lng: c[0], lat: c[1] } : null;
      } catch {
        return null;
      }
    };
  const panning = useRef(false);
  const longPressAt = useRef(0);
  async function pan(dx: number, dy: number) {
    if (!map.current || panning.current) return;
    panning.current = true;
    pauseFollow();
    try {
      const center = await map.current.getCenter();
      const pixel = await map.current.project(center);
      const next = await map.current.unproject([
        pixel[0] + dx * 80,
        pixel[1] + dy * 80,
      ]);
      camera.current?.easeTo({
        center: next,
        duration: reducedMotion ? 0 : 180,
      });
    } catch {
      setError(true);
    } finally {
      panning.current = false;
    }
  }
  const [localThreeD, setThreeD] = useState(initialThreeD);
  const threeD = controlledThreeD ?? localThreeD;
  const following = useRef(follow);
  const lastId = useRef("");
  const [followTick,setFollowTick]=useState(0);
  const resumeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  function pauseFollow(){following.current=false;if(resumeTimer.current)clearTimeout(resumeTimer.current);if(follow)resumeTimer.current=setTimeout(()=>{following.current=true;setFollowTick(n=>n+1);},MAP_RECENTER_DELAY);}
  useEffect(()=>()=>{if(resumeTimer.current)clearTimeout(resumeTimer.current);},[]);
  const lastPitch = useRef<boolean | null>(null);
  const previousPreview=useRef(false);
  const lastBearing=useRef(0);
  // The driver's own zoom (pinch or − / +) is kept when the camera recentres.
  const userZoom=useRef<number|null>(null);
  useEffect(()=>{userZoom.current=null;},[navigationMode,previewMode,recenterKey]);
  async function zoomBy(delta:number){
    try{
      const current=await map.current?.getZoom();
      if(typeof current!=="number")return;
      const next=Math.max(3,Math.min(20,current+delta));
      if(!previewMode)userZoom.current=next;
      camera.current?.zoomTo(next,{duration:reducedMotion?0:200});
    }catch{}
  }
  useEffect(() => {
    following.current = follow;
    if(resumeTimer.current)clearTimeout(resumeTimer.current);
  }, [follow, recenterKey]);
  const shape = useMemo(
    () => ({
      type: "Feature" as const,
      properties: {},
      geometry: geometry(fixes),
    }),
    [fixes],
  );
  const signature = fixes.length ? `${routeKey || fixes[0]!.time}` : "";
  useEffect(() => {
    if (!mapReady) return;
    const pitchChanged = lastPitch.current !== threeD;
    const pitch = navigationMode ? (threeD ? 80 : 0) : threeD ? 70 : 0;
    const last = fixes.at(-1), before = fixes.at(-2);
    const computedBearing = last && before && (last.lat !== before.lat || last.lng !== before.lng)
      ? Math.atan2(Math.sin((last.lng-before.lng)*Math.PI/180)*Math.cos(last.lat*Math.PI/180),
        Math.cos(before.lat*Math.PI/180)*Math.sin(last.lat*Math.PI/180)-Math.sin(before.lat*Math.PI/180)*Math.cos(last.lat*Math.PI/180)*Math.cos((last.lng-before.lng)*Math.PI/180))*180/Math.PI
      : lastBearing.current;
    if(Number.isFinite(computedBearing))lastBearing.current=computedBearing;
    if(previewMode && fixes.length>1){
      if(!previousPreview.current || lastId.current!==signature){
        camera.current?.fitBounds(routeBounds(fixes)!,{padding:viewportPadding,pitch:threeD?70:0,bearing:0,duration:reducedMotion?0:750});
        lastId.current=signature;
      }
      previousPreview.current=true;lastPitch.current=false;return;
    }
    previousPreview.current=false;
    const point =
      focus ||
      (position ? { lat: position.latitude, lng: position.longitude } : null);
    if (point && following.current)
      camera.current?.easeTo({
        center: [point.lng, point.lat],
        zoom: userZoom.current ?? (navigationMode ? 18 : course != null ? 17 : 16),
        bearing: navigationMode ? (course ?? lastBearing.current) : course ?? 0,
        pitch,
        duration: reducedMotion ? 0 : navigationMode ? 800 : 250,
      });
    else if (fixes.length && lastId.current !== signature) {
      camera.current?.fitBounds(routeBounds(fixes)!, {
        padding: viewportPadding,
        pitch,
        duration: reducedMotion ? 0 : 250,
      });
      lastId.current = signature;
    } else if (pitchChanged) {
      void camera.current?.setStop({
        pitch,
        duration: reducedMotion ? 0 : 250,
      });
    }
    lastPitch.current = threeD;
  }, [
    position?.timestamp,
    focus?.time,
    signature,
    mapReady,
    reducedMotion,
    follow,
    threeD,
    course,
    recenterKey,
    followTick,
    navigationMode,
    previewMode,
  ]);
  return (
    <View style={{ flex: 1, overflow: "hidden" }}>
      <Map
        ref={map}
        style={{ flex: 1 }}
        mapStyle={styleUrl || "https://tiles.openfreemap.org/styles/liberty"}
        logo={true}
        attribution={true}
        attributionPosition={{ bottom, right: 12 }}
        logoPosition={{ bottom, left: 12 }}
        compassPosition={{ top: 16, right: 16 }}
        onDidFinishLoadingMap={() => {
          setMapReady(true);
          setError(false);
        }}
        onDidFailLoadingMap={() => setError(true)}
        onRegionWillChange={(e) => {
          if (e.nativeEvent.userInteraction) pauseFollow();
        }}
        onRegionDidChange={(e) => {
          if (e.nativeEvent.userInteraction && !previewMode) userZoom.current = e.nativeEvent.zoom;
        }}
        onLongPress={(e) => {
          longPressAt.current = Date.now();
          const [lng, lat] = e.nativeEvent.lngLat;
          onLongPress?.({ lat, lng });
        }}
        onPress={(e) => {
          if (Date.now() - longPressAt.current < 700) return;
          const [lng, lat] = e.nativeEvent.lngLat;
          onTap?.({ lat, lng });
        }}
      >
        <Camera
          ref={camera}
          initialViewState={{
            center: [2.288, 48.909],
            zoom: initialThreeD ? 16 : 13,
            pitch: initialThreeD ? 70 : 0,
          }}
        />
        {shape.geometry.coordinates.length > 0 && (
          <GeoJSONSource id="route" data={shape}>
            <Layer
              id="route-casing"
              type="line"
              style={{
                lineColor: colors.paper,
                lineWidth: 9,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Layer
              id="route-line"
              type="line"
              style={{
                lineColor: colors.wine,
                lineWidth: 5,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </GeoJSONSource>
        )}
        {points.map((p) => {
          const next = p.id === highlightId;
          return (
          <Marker
            key={`${p.id}${next ? "-next" : ""}`}
            id={p.id}
            lngLat={[p.lng, p.lat]}
            anchor={next ? "bottom" : "center"}
            onPress={(e) => {
              e.stopPropagation();
              onPoint?.(p);
            }}
          >
            <View style={{ alignItems: "center" }}>
              {next && (
                <View style={{ backgroundColor: colors.paper, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6, maxWidth: 220, borderWidth: 1, borderColor: colors.line }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: colors.wine }}>{p.name}</Text>
                </View>
              )}
              <View
                style={{
                  width: next ? 56 : 44,
                  height: next ? 56 : 44,
                  borderRadius: next ? 28 : 22,
                  backgroundColor: tones[filterTone(p.category)].ink,
                  borderColor: colors.paper,
                  borderWidth: next ? 4 : 3,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                accessible
                accessibilityLabel={`${next ? "Prochain repère, " : ""}${p.category} : ${p.name}`}
                accessibilityRole="button"
              >
                <Icon name={categoryIcons[p.category]} size={next ? 24 : 19} color={colors.paper} />
              </View>
            </View>
          </Marker>
          );
        })}
        {position && (
          <Marker
            id="actual-gps"
            lngLat={[position.longitude, position.latitude]}
          >
            <View
              style={{
                height: 22,
                width: 22,
                borderRadius: 11,
                backgroundColor: "rgba(37,94,165,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  height: 12,
                  width: 12,
                  borderRadius: 6,
                  backgroundColor: colors.blue,
                  borderWidth: 2,
                  borderColor: colors.paper,
                }}
              />
            </View>
          </Marker>
        )}
        {focus && (
          <Marker id="replay-progress" lngLat={[focus.lng, focus.lat]}>
            <View
              style={{
                height: 20,
                width: 20,
                borderRadius: 10,
                backgroundColor: colors.green,
                borderWidth: 3,
                borderColor: colors.paper,
              }}
            />
          </Marker>
        )}
      </Map>
      {zoomControls && (
        <View pointerEvents="box-none" style={{ position: "absolute", right: 12, top: "38%", gap: 8 }}>
          {([[-1, "remove", "Zoom arrière (dézoomer)"], [1, "add", "Zoom avant"]] as const).map(([delta, icon, label]) => (
            <Pressable
              key={icon}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => void zoomBy(delta)}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.paper,
                borderWidth: 1,
                borderColor: colors.line,
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Icon name={icon} size={24} />
            </Pressable>
          ))}
        </View>
      )}
      {showPanControls && (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 12,
            bottom: bottom + 38,
            width: 132,
            height: 132,
          }}
        >
          {(
            [
              [-0, -1, "arrow-up", "Déplacer la carte vers le haut"],
              [-1, 0, "arrow-back", "Déplacer la carte vers la gauche"],
              [1, 0, "arrow-forward", "Déplacer la carte vers la droite"],
              [0, 1, "arrow-down", "Déplacer la carte vers le bas"],
            ] as const
          ).map(([dx, dy, icon, label]) => (
            <Pressable
              key={icon}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => void pan(dx, dy)}
              style={({ pressed }) => ({
                position: "absolute",
                left: (dx + 1) * 44,
                top: (dy + 1) * 44,
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.paper,
                borderWidth: 1,
                borderColor: colors.line,
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Icon name={icon} size={21} />
            </Pressable>
          ))}
        </View>
      )}
      {show3DToggle && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            threeD ? "Passer en carte 2D" : "Passer en carte 3D"
          }
          accessibilityState={{ selected: threeD }}
          onPress={() => setThreeD((value) => !value)}
          style={({ pressed }) => ({
            position: "absolute",
            top: 76,
            right: 16,
            minWidth: 48,
            minHeight: 48,
            borderRadius: 18,
            backgroundColor: colors.paper,
            borderWidth: 1,
            borderColor: colors.line,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.wine, fontWeight: "700" }}>
            {threeD ? "2D" : "3D"}
          </Text>
        </Pressable>
      )}
      {error && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            padding: 12,
            borderRadius: 14,
            backgroundColor: colors.paper,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.wine }}>
            Fond de carte indisponible. Votre GPS et vos repères restent
            conservés.
          </Text>
        </View>
      )}
    </View>
  );
}
