import React, { useCallback, useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import * as Crypto from "expo-crypto";
import { categories, type RouteSummary } from "@repere/core";
import { pickableCenters } from "../services/route-directory";
import { request } from "../services/auth";
import { Badge, Button, Dropdown, Field, LinkButton, Sheet } from "./UI";
import { colors, styles as s } from "../theme";

export type Proposal = { id: string; studentName: string; name: string; category: string; lat: number; lng: number; remark: string; routeId: string | null; routeName: string | null; examCenter: string | null; status: string; createdAt: string };

/** A student proposes a repère (website ProposalForm): name, category, remark, and the route or exam centre. */
export function ProposalSheet({ at, routes, defaultRouteId, onClose, onSent }: { at: { lat: number; lng: number } | null; routes: RouteSummary[]; defaultRouteId?: string; onClose: () => void; onSent: () => void }) {
  const [name, setName] = useState(""), [category, setCategory] = useState<string>(categories[0]), [remark, setRemark] = useState(""),
    [target, setTarget] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { if (at) { setName(""); setRemark(""); setError(""); setTarget(defaultRouteId ? `route:${defaultRouteId}` : ""); } }, [at, defaultRouteId]);
  async function send() {
    if (!at) return;
    setError("");
    if (!name.trim()) return setError("Donne un nom à ce repère.");
    if (!target) return setError("Indique le parcours ou le centre d’examen concerné.");
    setBusy(true);
    try {
      const i = target.indexOf(":"), kind = target.slice(0, i), value = target.slice(i + 1);
      await request("/v1/proposals", { method: "POST", body: JSON.stringify({ id: Crypto.randomUUID(), name: name.trim(), category, lat: at.lat, lng: at.lng, remark: remark.trim(), routeId: kind === "route" ? value : null, examCenter: kind === "center" ? value : null }) });
      onSent();
    } catch (e) { setError(e instanceof Error ? e.message : "Envoi impossible."); } finally { setBusy(false); }
  }
  const options = [
    { id: "", label: "Choisir…" },
    ...routes.map((r) => ({ id: `route:${r.id}`, label: `${r.name}${r.examCenter ? ` · ${r.examCenter}` : ""}`, section: "Parcours" })),
    ...pickableCenters(routes).map((c) => ({ id: `center:${c}`, label: c, section: "Centre d’examen" })),
  ];
  return (
    <Sheet visible={!!at} onClose={onClose} title="Proposer un repère">
      <Text style={s.caption}>Ton moniteur reçoit ta proposition, complète le commentaire et la publie sur la carte.</Text>
      <Field label="Nom du repère" value={name} onChangeText={setName} placeholder="Ex. Stop caché après le virage" maxLength={120} />
      <Dropdown label="Catégorie" value={category} onChange={setCategory} options={categories.map((c) => ({ id: c, label: c }))} />
      <Dropdown label="Parcours ou centre d’examen" value={target} onChange={setTarget} options={options} />
      <Field label="Ta remarque (facultatif)" value={remark} onChangeText={setRemark} placeholder="Ce que tu as remarqué à cet endroit" maxLength={1000} multiline />
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      <Button label={busy ? "Envoi…" : "Envoyer la proposition"} icon="checkmark" busy={busy} onPress={() => void send()} />
    </Sheet>
  );
}

/** Teacher's queue (website ProposalsPanel): complete and publish, look at it on the map, or decline. */
export function ProposalsSheet({ visible, onClose, onFocus, onComplete, onChanged }: { visible: boolean; onClose: () => void; onFocus: (p: Proposal) => void; onComplete: (p: Proposal) => void; onChanged: (count: number) => void }) {
  const [items, setItems] = useState<Proposal[] | null>(null), [error, setError] = useState("");
  const load = useCallback(async () => {
    try { const r = await request<{ proposals: Proposal[] }>("/v1/proposals"); setItems(r.proposals); onChanged(r.proposals.length); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : "Chargement impossible."); setItems([]); }
  }, [onChanged]);
  useEffect(() => { if (visible) void load(); }, [visible, load]);
  function decline(p: Proposal) {
    Alert.alert("Refuser la proposition ?", `« ${p.name} » de ${p.studentName}`, [
      { text: "Garder", style: "cancel" },
      { text: "Refuser", style: "destructive", onPress: () => void request(`/v1/proposals/${p.id}/resolve`, { method: "POST", body: JSON.stringify({ status: "rejected" }) }).then(load).catch((e) => setError(e instanceof Error ? e.message : "Action impossible.")) },
    ]);
  }
  return (
    <Sheet visible={visible} onClose={onClose} title="Repères proposés par les élèves">
      {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
      {!items ? <Text style={s.muted}>Chargement…</Text> : !items.length ? <Text style={s.muted}>Aucune proposition en attente.</Text> : items.map((p) => (
        <View key={p.id} style={[s.card, { gap: 8 }]}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            <Badge label={p.category} />
            <Badge label={p.routeName ? `Parcours : ${p.routeName}` : `Centre : ${p.examCenter}`} tone="green" />
          </View>
          <Text style={s.heading}>{p.name}</Text>
          <Text style={s.caption}>Proposé par {p.studentName} · {new Date(p.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</Text>
          {!!p.remark && <Text style={[s.body, { color: colors.ink }]}>« {p.remark} »</Text>}
          <Button label="Compléter et publier" icon="checkmark" onPress={() => onComplete(p)} />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <LinkButton label="Voir le lieu" onPress={() => onFocus(p)} />
            <LinkButton label="Refuser" onPress={() => decline(p)} />
          </View>
        </View>
      ))}
    </Sheet>
  );
}
