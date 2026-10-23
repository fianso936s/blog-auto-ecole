import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AppState, Alert } from "react-native";
import * as Network from "expo-network";
import * as Linking from "expo-linking";
import type { Profile, Route, RouteSummary, MapSpot } from "@repere/core";
import {
  request,
  loadSession,
  rememberProfile,
  signIn,
  clearSession,
  finishLogin,
} from "./services/auth";
import {
  listLocal,
  getLocal,
  db,
  clearUserData,
  type LocalRoute,
} from "./services/local";
import { syncAll } from "./services/sync";
import {
  mergeCatalog,
  type Catalog,
  type PointChange,
} from "./services/catalog";
import {
  recoverRecording,
  setRecorderListener,
  stopRecording,
} from "./services/recorder";
type ServerConfig = {
  mapStyleUrl: string | null;
  streetViewEnabled: boolean;
  spotPhotosEnabled?: boolean;
  learningEnabled?: boolean;
  privacyUrl: string;
  termsUrl: string;
};
type AppContext = {
  mapThreeD: boolean;
  setMapThreeD: (value: boolean) => void;
  profile: Profile | null;
  loading: boolean;
  authBusy: boolean;
  online: boolean;
  message: string;
  setMessage: (s: string) => void;
  login: (mode?: "signin" | "signup") => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  sync: () => Promise<void>;
  locals: LocalRoute[];
  active: LocalRoute | null;
  routes: RouteSummary[];
  spots: MapSpot[];
  archivedPointIds: string[];
  selected: Route | null;
  select: (r: Route | null) => void;
  config: ServerConfig | null;
  reloadLocal: () => Promise<void>;
  updateProfile: (p: Profile) => Promise<void>;
};
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [mapThreeD, setMapThreeD] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null),
    [loading, setLoading] = useState(true),
    [authBusy, setAuthBusy] = useState(false),
    [online, setOnline] = useState(true),
    [message, setMessage] = useState(""),
    [locals, setLocals] = useState<LocalRoute[]>([]),
    [routes, setRoutes] = useState<RouteSummary[]>([]),
    [spots, setSpots] = useState<MapSpot[]>([]),
    [archivedPointIds, setArchivedPointIds] = useState<string[]>([]),
    [selected, select] = useState<Route | null>(null),
    [config, setConfig] = useState<ServerConfig | null>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const refreshBusy = useRef(false);
  const catalogTicket = useRef(0),
    serverArchived = useRef<string[]>([]);
  const applyCatalog = useCallback(
    async (p: Profile, remote?: Catalog, ticket?: number) => {
      const changes = await (
        await db()
      ).getAllAsync<PointChange>(
        "SELECT id,data,deleted,route_id FROM local_points WHERE user_id=? AND (dirty=1 OR deleted=1)",
        p.id,
      );
      if (
        profileRef.current?.id !== p.id ||
        (ticket !== undefined && ticket !== catalogTicket.current)
      )
        return;
      if (remote) serverArchived.current = remote.archivedIds || [];
      setSpots(
        (current) =>
          mergeCatalog(
            remote || { spots: current, archivedIds: serverArchived.current },
            changes,
          ).spots,
      );
      setArchivedPointIds([
        ...new Set([
          ...serverArchived.current,
          ...changes.filter((p) => p.deleted).map((p) => p.id),
        ]),
      ]);
    },
    [],
  );
  const active = locals.find((r) => r.state !== "finished") || null;
  const reloadLocal = useCallback(async () => {
    const p = profileRef.current;
    if (!p) return;
    const local = await listLocal(p.id);
    if (profileRef.current?.id !== p.id) return;
    setLocals(local);
    await applyCatalog(p);
  }, [applyCatalog]);
  const refresh = useCallback(async () => {
    const p = profileRef.current;
    if (!p || refreshBusy.current) return;
    refreshBusy.current = true;
    const ticket = ++catalogTicket.current;
    try {
      const [me, remote, remoteSpots, config] = await Promise.all([
        request<Profile>("/v1/me"),
        request<{ routes: RouteSummary[] }>("/v1/routes"),
        request<Catalog>("/v1/spots?summary=1"),
        request<ServerConfig>("/v1/config"),
      ]);
      if (profileRef.current?.id !== p.id) return;
      setProfile(me);
      await rememberProfile(me);
      setRoutes(remote.routes);
      setConfig(config);
      await applyCatalog(p, remoteSpots, ticket);
      setOnline(true);
      await reloadLocal();
    } catch (e) {
      setOnline(false);
      if ((e as { status?: number }).status === 401)
        setMessage(
          "Votre session a expiré. Reconnectez-vous depuis votre espace.",
        );
    } finally {
      refreshBusy.current = false;
    }
  }, [reloadLocal, applyCatalog]);
  const sync = useCallback(async () => {
    const p = profileRef.current;
    if (!p) return;
    try {
      const result = await syncAll(p.id);
      if (result.errors.length) setMessage(result.errors[0]!);
      else if (result.saved) setMessage("Vos modifications sont sauvegardées.");
      if (result.saved || result.errors.length) await refresh();
      await reloadLocal();
    } catch {
      setOnline(false);
      setMessage(
        "Hors connexion. Vos enregistrements sont conservés sur cet iPhone.",
      );
    }
  }, [refresh, reloadLocal]);
  const updateProfile = useCallback(
    async (p: Profile) => {
      if (profileRef.current?.id !== p.id) {
        ++catalogTicket.current; serverArchived.current = [];
        setRoutes([]);setSpots([]);setArchivedPointIds([]);setLocals([]);select(null);setConfig(null);
      }
      profileRef.current = p;
      setProfile(p);
      await rememberProfile(p);
      await reloadLocal();
    },
    [reloadLocal],
  );
  const login = useCallback(async (mode: "signin" | "signup" = "signin") => {
    setAuthBusy(true);
    setMessage("");
    try {
      const p = await signIn(mode);
      if (p) {
        await updateProfile(p);
        await refresh();
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Connexion impossible.");
    } finally {
      setAuthBusy(false);
    }
  }, [refresh, updateProfile]);
  const logout = useCallback(async () => {
    const p = profileRef.current;
    if (!p) return;
    await stopRecording();
    try {
      await request("/v1/logout", { method: "POST" });
    } catch {
      setMessage(
        "Session supprimée de cet iPhone. La révocation serveur sera effective à son expiration.",
      );
    }
    await clearSession();
    await (
      await db()
    ).runAsync("DELETE FROM route_cache WHERE user_id=?", p.id);
    profileRef.current = null;
    setProfile(null);
    setLocals([]);
    setRoutes([]);
    setSpots([]);
    setArchivedPointIds([]);
    serverArchived.current = [];
    ++catalogTicket.current;
    select(null);
    setConfig(null);
  }, []);
  useEffect(() => {
    let alive = true;
    db()
      .then(async () => {
        const p = await loadSession();
        if (!alive) return;
        if (p) {
          profileRef.current = p;
          setProfile(p);
          const local = await listLocal(p.id);
          for (const r of local)
            if (r.state !== "finished") await recoverRecording(r.id);
          await reloadLocal();
        }
        setLoading(false);
        const url = await Linking.getInitialURL();
        if (url?.startsWith("reperespot://auth?"))
          try {
            const next = await finishLogin(url);
            if (next) await updateProfile(next);
          } catch {}
        await refresh();
      })
      .catch(() => {
        setMessage("Le stockage de l’iPhone ne peut pas être ouvert.");
        setLoading(false);
      });
    setRecorderListener(() => {
      void reloadLocal();
    });
    return () => {
      alive = false;
      setRecorderListener(() => {});
    };
  }, [refresh, reloadLocal, updateProfile]);
  useEffect(() => {
    if (!profile) return;
    const timer = setInterval(() => void reloadLocal(), 1500);
    const syncTimer = setInterval(() => {if(AppState.currentState === "active")void sync();}, 30000);
    let catalogBusy = false,catalogFailures=0,nextCatalogAt=0;
    const catalogTimer = setInterval(async () => {
      const p = profileRef.current;
      if (!p || catalogBusy || AppState.currentState !== "active" || Date.now()<nextCatalogAt) return;
      catalogBusy = true;
      const ticket = ++catalogTicket.current;
      try {
        const [remote,routeList]=await Promise.all([request<Catalog>("/v1/spots?summary=1"),request<{routes:RouteSummary[]}>("/v1/routes")]);
        if(profileRef.current?.id===p.id && ticket===catalogTicket.current)setRoutes(routeList.routes);
        await applyCatalog(p, remote, ticket);catalogFailures=0;nextCatalogAt=0;
      } catch {
        catalogFailures=Math.min(catalogFailures+1,4);nextCatalogAt=Date.now()+Math.min(60000,5000*2**catalogFailures);
        /* Retain the current catalog while offline. */
      } finally {
        catalogBusy = false;
      }
    }, 5000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void reloadLocal();
        void refresh();
      }
    });
    const net = Network.addNetworkStateListener((s) => {
      setOnline(s.isInternetReachable ?? s.isConnected ?? false);
      if (s.isConnected) void sync();
    });
    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
      clearInterval(catalogTimer);
      sub.remove();
      net.remove();
    };
  }, [profile?.id, reloadLocal, refresh, sync, applyCatalog]);
  return (
    <Context.Provider
      value={{
        mapThreeD,
        setMapThreeD,
        profile,
        loading,
        authBusy,
        online,
        message,
        setMessage,
        login,
        logout,
        refresh,
        sync,
        locals,
        active,
        routes,
        spots,
        archivedPointIds,
        selected,
        select,
        config,
        reloadLocal,
        updateProfile,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const c = useContext(Context);
  if (!c) throw Error("AppProvider manquant");
  return c;
}
