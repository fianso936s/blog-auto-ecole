import { StudentDashboard, TeacherSchedule } from "../components/Teaching";
import { clearPrivateVideos } from "../services/private-videos";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Share, Text, TextInput, View } from "react-native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import type { Profile } from "@repere/core";
import { useApp } from "../state";
import { Badge, Button, Dropdown, Empty, Field, Icon, LinkButton, PageHeading, Segmented, Sheet } from "../components/UI";
import { ProgressBar } from "../components/CourseLearning";
import { colors, fonts, radius, styles as s } from "../theme";
import { request } from "../services/auth";
import { clearUserData } from "../services/local";
import { DiagnosticsPanel } from "../components/DiagnosticsPanel";
import { LearningDashboard } from "../components/LearningDashboard";
import product from "../../../../packages/product/product.json";

type Role = Profile["role"];
const roleLabel = (role: Role) => (role === "admin" ? "Administrateur" : role === "teacher" ? "Enseignant" : "Élève");
type Progress = { id?: string; name: string; fix_index: number; fixes: number; attempts: number; correct: number };
type Report = { id: string; kind: string; reason: string; details?: string };

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.soft, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.42, color: colors.wine }}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

/** Mirrors the website's "Mon espace": profile, acquired landmarks, students / invitation, blocked authors, moderation, data. */
export function Account() {
  const app = useApp(),
    p = app.profile!;
  const teacher = p.role !== "student";
  const [view, setView] = useState<"profile" | "students" | "schedule">("profile");
  const [name, setName] = useState(p.name),
    [code, setCode] = useState(""),
    [invite, setInvite] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [gps, setGps] = useState("À autoriser"),
    [users, setUsers] = useState<Profile[]>([]),
    [progress, setProgress] = useState<Progress[]>([]),
    [stats, setStats] = useState<{ totals?: { views?: number; attempts?: number; firstCorrect?: number } } | null>(null),
    [blocked, setBlocked] = useState<{ id: string; name: string }[]>([]),
    [reports, setReports] = useState<Report[]>([]),
    [inspect, setInspect] = useState<any>(null),
    [learning, setLearning] = useState(false);
  const [createOpen, setCreateOpen] = useState(false),
    [newName, setNewName] = useState(""),
    [newEmail, setNewEmail] = useState(""),
    [newRole, setNewRole] = useState<"student" | "teacher">("student"),
    [createdEmail, setCreatedEmail] = useState(""),
    [createError, setCreateError] = useState("");
  const dirty = app.locals.filter((r) => r.revision !== r.syncedRevision && r.fixes.length > 0).length;
  const showError = (e: unknown) => app.setMessage(e instanceof Error ? e.message : "Action impossible.");
  const refresh = useCallback(async () => {
    setError("");
    const tasks: [string, string, (value: any) => void][] = [
      ["Progression", "/v1/progress", (v) => setProgress(v.progress)],
      ["Statistiques", "/v1/learning/stats", setStats],
      ["Blocages", "/v1/blocked-authors", (v) => setBlocked(v.authors)],
    ];
    if (p.role !== "student") tasks.push(["Comptes", p.role === "admin" ? "/v1/users" : "/v1/students", (v) => setUsers(v.students)]);
    if (p.role === "admin") tasks.push(["Signalements", "/v1/moderation/reports", (v) => setReports(v.reports)]);
    const results = await Promise.allSettled(tasks.map(async ([, path, apply]) => apply(await request(path))));
    setError(results.flatMap((r, i) => (r.status === "rejected" ? [`${tasks[i]![0]} : ${(r.reason as Error).message}`] : [])).join(" "));
    setLoading(false);
  }, [p.id, p.role]);
  useEffect(() => {
    void refresh();
    Location.getBackgroundPermissionsAsync().then((r) => setGps(r.granted ? "Arrière-plan autorisé" : "Pendant l’utilisation"));
  }, [refresh]);
  async function run(fn: () => Promise<unknown>, message?: string) {
    setBusy(true);
    try {
      await fn();
      if (message) app.setMessage(message);
      await refresh();
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (app.active) {
      Alert.alert("Un enregistrement est en cours", "Terminez le parcours avant de vous déconnecter.");
      return;
    }
    Alert.alert(
      "Se déconnecter ?",
      dirty
        ? `${dirty} parcours en attente de synchronisation resteront sur cet iPhone, rattachés à votre compte.`
        : "Vous retrouverez vos parcours sauvegardés à la prochaine connexion.",
      [{ text: "Annuler", style: "cancel" }, { text: "Se déconnecter", onPress: () => void app.logout() }],
    );
  }
  function deleteAccount() {
    if (app.active) {
      Alert.alert("Terminez d’abord votre enregistrement.");
      return;
    }
    Alert.alert(
      "Supprimer mon compte ?",
      "Votre compte et vos données applicatives seront supprimés. Cette action concerne également le site et ne peut pas être annulée.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer définitivement",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await request("/v1/me", { method: "DELETE", body: JSON.stringify({ confirmation: "SUPPRIMER" }) });
              await clearPrivateVideos(p.id);
              await clearUserData(p.id);
              await app.logout();
            } catch (e) {
              showError(e);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }
  async function createAccount() {
    setBusy(true);
    setCreateError("");
    try {
      const r = await request<{ user: Profile }>("/v1/users", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim(), email: newEmail.trim(), role: newRole }),
      });
      setCreatedEmail(r.user.email);
      setNewName("");
      setNewEmail("");
      app.setMessage("Espace créé. Cette personne doit maintenant s’inscrire avec cette même adresse pour activer son compte.");
      await refresh();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Création impossible.");
    } finally {
      setBusy(false);
    }
  }
  const panel = [s.card, { padding: 20, gap: 14 }];
  if (teacher && view !== "profile")
    return (
      <ScrollView contentContainerStyle={[s.content, { gap: 18 }]}>
        <PageHeading eyebrow="ESPACE ENSEIGNANT" title={view === "students" ? "Mes élèves" : "Mon planning"} />
        <Segmented
          label="Espace enseignant"
          value={view}
          onChange={setView}
          options={[
            { id: "profile", label: "Mon espace" },
            { id: "students", label: "Statistiques élèves" },
            { id: "schedule", label: "Planning" },
          ]}
        />
        {view === "students" ? <StudentDashboard /> : <TeacherSchedule userId={p.id} />}
      </ScrollView>
    );
  return (
    <>
      <ScrollView contentContainerStyle={[s.content, { gap: 18 }]} keyboardShouldPersistTaps="handled">
        <PageHeading eyebrow="VOTRE ESPACE, VOTRE PROGRESSION" title="Mon espace" dot subtitle="Tout ce qui vous accompagne sur la route." icon="person-outline" />
        {teacher && (
          <Segmented
            label="Administration et enseignement"
            value={view}
            onChange={setView}
            options={[
              { id: "students", label: "Statistiques par élève" },
              { id: "schedule", label: "Planning enseignant" },
            ]}
          />
        )}
        {/* Profile panel */}
        <View style={panel}>
          <View style={[s.row, { gap: 14 }]}>
            <Avatar name={p.name} size={56} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[s.heading, { fontSize: 19 }]}>{p.name}</Text>
              <Text style={s.muted}>{p.email}</Text>
              <Badge label={roleLabel(p.role)} />
            </View>
          </View>
          <Field label="Votre nom" value={name} onChangeText={setName} maxLength={100} />
          <Button
            secondary
            label="Enregistrer mon profil"
            busy={busy}
            disabled={!name.trim() || name.trim() === p.name}
            onPress={() =>
              void run(async () => {
                await app.updateProfile(await request<Profile>("/v1/me", { method: "PATCH", body: JSON.stringify({ name: name.trim() }) }));
              }, "Profil mis à jour.")
            }
          />
          <View style={{ height: 1, backgroundColor: colors.line }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14 }}>
            {[
              ["Confidentialité", "/privacy"],
              ["Conditions", "/terms"],
              ["Assistance", "/support"],
            ].map(([label, path]) => (
              <LinkButton key={label} label={label!} icon="open-outline" onPress={() => void Linking.openURL(`${product.webOrigin}${path}`)} />
            ))}
          </View>
          <Button secondary icon="log-out-outline" label="Se déconnecter" onPress={() => void logout()} />
          <Text style={s.caption}>Le site et l’application utilisent le même compte et les mêmes permissions.</Text>
        </View>
        {/* "Mes repères acquis" */}
        <View style={panel}>
          <View style={s.between}>
            <Text style={[s.heading, { fontSize: 19 }]}>Mes repères acquis</Text>
            <Icon name="book-outline" />
          </View>
          <Text style={s.muted}>Consultations et quiz · 30 derniers jours</Text>
          {loading ? (
            <Text style={s.body}>Chargement…</Text>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[
                  [stats?.totals?.views, "consultations"],
                  [stats?.totals?.attempts, "réponses quiz"],
                  [stats?.totals?.firstCorrect, "bonnes réponses"],
                ].map(([value, label]) => (
                  <View key={label as string} style={{ flex: 1, padding: 12, borderRadius: radius.md, backgroundColor: colors.cream, gap: 2 }}>
                    <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>{Number(value || 0)}</Text>
                    <Text style={s.caption}>{label as string}</Text>
                  </View>
                ))}
              </View>
              {progress.map((r, i) => (
                <View key={r.id || `${r.name}-${i}`} style={{ gap: 6 }}>
                  <Text style={[s.body, { fontFamily: fonts.bodySemi }]}>{r.name}</Text>
                  <ProgressBar value={r.fix_index + 1} max={Math.max(1, r.fixes)} label={`Progression sur ${r.name}`} />
                  <Text style={s.caption}>
                    {r.correct}/{r.attempts} réponses correctes
                  </Text>
                </View>
              ))}
              {!progress.length && <Text style={s.caption}>Votre progression apparaîtra après la lecture de vos premiers parcours.</Text>}
              <LinkButton label="Voir le détail par repère" icon="arrow-forward" onPress={() => setLearning(true)} />
            </>
          )}
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
        </View>
        {/* Students: join the teacher. Teachers: students and invitations. */}
        {!teacher ? (
          <View style={panel}>
            <Text style={[s.heading, { fontSize: 19 }]}>Rejoindre mon enseignant</Text>
            <Text style={s.muted}>Saisissez le code d’invitation transmis par votre auto-école.</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
                placeholder="Code d’invitation"
                accessibilityLabel="Code d’invitation"
                placeholderTextColor={colors.muted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={30}
                style={[s.field, { flex: 1 }]}
              />
              <Button
                label="Rejoindre"
                busy={busy}
                disabled={code.trim().length < 12}
                onPress={() =>
                  void run(async () => {
                    await request("/v1/invitations/claim", { method: "POST", body: JSON.stringify({ code: code.trim() }) });
                    setCode("");
                    await app.refresh();
                  }, "Votre compte est rattaché à votre enseignant.")
                }
              />
            </View>
          </View>
        ) : (
          <View style={panel}>
            <View style={{ gap: 4 }}>
              <Text style={[s.heading, { fontSize: 19 }]}>{p.role === "admin" ? "Comptes et permissions" : "Mes élèves"}</Text>
              <Text style={s.muted}>
                {users.length} compte{users.length > 1 ? "s" : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  compact
                  secondary
                  label="Créer une invitation"
                  busy={busy && !createOpen}
                  onPress={() =>
                    void run(async () => {
                      setInvite((await request<{ code: string }>("/v1/invitations", { method: "POST", body: "{}" })).code);
                    })
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  compact
                  icon="add"
                  label="Créer un compte"
                  onPress={() => {
                    setCreatedEmail("");
                    setCreateError("");
                    setNewRole("student");
                    setCreateOpen(true);
                  }}
                />
              </View>
            </View>
            {!!invite && (
              <View style={{ padding: 16, borderRadius: radius.md, backgroundColor: colors.greenSoft, gap: 6 }}>
                <Text style={[s.body, { fontFamily: fonts.bodyBold, color: colors.green }]}>Code d’invitation</Text>
                <Text selectable style={{ fontFamily: fonts.display, fontSize: 24, letterSpacing: 2, color: colors.ink }}>{invite}</Text>
                <Text style={s.muted}>Transmettez ce code à votre élève. Il le saisira dans son espace personnel.</Text>
                <LinkButton
                  label="Partager le code"
                  icon="share-outline"
                  onPress={() =>
                    void Share.share({ message: `Rejoignez mon espace élève dans LE REPÈRE PERMIS. Dans « Mon espace », saisissez ce code : ${invite}.` }).catch(showError)
                  }
                />
              </View>
            )}
            {users.map((u) => (
              <View key={u.id} style={[s.row, { gap: 12, paddingVertical: 6 }]}>
                <Avatar name={u.name} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[s.body, { fontFamily: fonts.bodySemi }]}>{u.name}</Text>
                  <Text numberOfLines={1} style={s.caption}>{u.email}</Text>
                </View>
                {p.role === "admin" && u.id !== p.id ? (
                  <View style={{ width: 150 }}>
                    <Dropdown
                      inline
                      label="Rôle"
                      value={u.role}
                      options={[
                        { id: "student", label: "Élève" },
                        { id: "teacher", label: "Enseignant" },
                        { id: "admin", label: "Administrateur" },
                      ]}
                      onChange={(role) =>
                        void run(
                          () => request(`/v1/users/${encodeURIComponent(u.id)}/role`, { method: "PATCH", body: JSON.stringify({ role }) }),
                          "Rôle enregistré. Une reconnexion sera demandée à cet utilisateur.",
                        )
                      }
                    />
                  </View>
                ) : (
                  <Badge label={roleLabel(u.role)} />
                )}
              </View>
            ))}
            {!users.length && !loading && <Empty title="Vos élèves vous attendent" description="Créez un compte ou partagez une invitation." />}
          </View>
        )}
        {blocked.length > 0 && (
          <View style={panel}>
            <Text style={[s.heading, { fontSize: 19 }]}>Auteurs bloqués</Text>
            {blocked.map((b) => (
              <View key={b.id} style={s.between}>
                <Text style={[s.body, { flex: 1 }]}>{b.name}</Text>
                <LinkButton
                  label="Débloquer"
                  disabled={busy}
                  onPress={() =>
                    void run(async () => {
                      await request(`/v1/blocked-authors/${encodeURIComponent(b.id)}`, { method: "DELETE" });
                      await app.refresh();
                    }, "Auteur débloqué.")
                  }
                />
              </View>
            ))}
          </View>
        )}
        {p.role === "admin" && (
          <View style={panel}>
            <Text style={[s.heading, { fontSize: 19 }]}>Modération des contenus</Text>
            {reports.length ? (
              reports.map((r) => (
                <View key={r.id} style={{ gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderColor: colors.line }}>
                  <View style={[s.row, { gap: 8 }]}>
                    <Badge label={r.kind} tone="red" />
                    <Text style={[s.body, { flex: 1 }]}>{r.reason}</Text>
                  </View>
                  {!!r.details && <Text style={s.caption}>{r.details}</Text>}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: 14 }}>
                    <LinkButton label="Consulter" onPress={() => void run(async () => setInspect(await request(`/v1/moderation/reports/${r.id}/content`)))} />
                    <LinkButton
                      label="Masquer"
                      disabled={busy}
                      onPress={() => void run(() => request(`/v1/moderation/reports/${r.id}/resolve`, { method: "POST", body: JSON.stringify({ action: "hide" }) }), "Contenu masqué.")}
                    />
                    <LinkButton
                      label="Classer"
                      disabled={busy}
                      onPress={() => void run(() => request(`/v1/moderation/reports/${r.id}/resolve`, { method: "POST", body: JSON.stringify({ action: "dismiss" }) }), "Signalement classé.")}
                    />
                  </View>
                </View>
              ))
            ) : (
              <Text style={s.muted}>Aucun signalement en attente.</Text>
            )}
          </View>
        )}
        {/* iPhone only: offline sync and background GPS, which the website does not need. */}
        <View style={panel}>
          <Text style={[s.heading, { fontSize: 19 }]}>Sur cet iPhone</Text>
          <View style={s.between}>
            <Text style={s.body}>Sauvegarde</Text>
            <Text style={[s.caption, { color: dirty ? colors.wine : app.online ? colors.green : colors.muted }]}>
              {dirty ? `${dirty} parcours à synchroniser` : app.online ? "À jour" : "Hors connexion"}
            </Text>
          </View>
          <Button compact secondary icon="sync-outline" label="Synchroniser maintenant" onPress={() => void app.sync()} />
          <View style={s.between}>
            <Text style={s.body}>Localisation</Text>
            <Text style={s.caption}>{gps}</Text>
          </View>
          <Text style={s.caption}>
            Autorisez la localisation « Toujours » pour enregistrer un parcours écran verrouillé. Une interruption crée un nouveau segment à la reprise.
          </Text>
          <Button compact secondary icon="settings-outline" label="Réglages de localisation" onPress={() => void Linking.openSettings()} />
        </View>
        <View style={[panel, { backgroundColor: colors.cream, shadowOpacity: 0 }]}>
          <Text style={[s.heading, { fontSize: 17 }]}>Gérer mes données</Text>
          <Text style={s.muted}>La suppression du compte concerne aussi votre accès sur le site.</Text>
          <Button secondary danger compact icon="trash-outline" label="Supprimer mon compte" busy={busy} onPress={deleteAccount} />
        </View>
        <Text style={[s.caption, { textAlign: "center" }]}>
          LE REPÈRE PERMIS · {product.version}
          {"\n"}Le calme vous mène loin.
        </Text>
        <DiagnosticsPanel />
      </ScrollView>
      <Sheet visible={createOpen} title="Créer un compte" onClose={() => !busy && setCreateOpen(false)}>
        <Field label="Nom" value={newName} onChangeText={setNewName} maxLength={100} />
        <Field label="Adresse e-mail" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" autoCorrect={false} maxLength={254} />
        <Dropdown
          label="Rôle"
          value={newRole}
          options={[{ id: "student", label: "Élève" }, ...(p.role === "admin" ? [{ id: "teacher" as const, label: "Enseignant" }] : [])]}
          onChange={setNewRole}
        />
        <Text style={s.caption}>Vous préparez son espace. L’utilisateur choisira son propre mot de passe lors de l’inscription.</Text>
        {!!createError && <Text style={s.error}>{createError}</Text>}
        <Button label="Créer cet espace" busy={busy} disabled={!newName.trim() || !newEmail.trim()} onPress={() => void createAccount()} />
        {!!createdEmail && (
          <View style={{ gap: 8, paddingTop: 6 }}>
            <Text style={s.body}>Espace préparé pour {createdEmail}.</Text>
            <Button
              secondary
              icon="share-outline"
              label="Partager les instructions"
              onPress={() =>
                void Share.share({
                  message: `Votre espace Le Repère Permis est prêt pour ${createdEmail}. Créez votre compte avec cette même adresse et choisissez votre mot de passe : ${product.webOrigin}. Connectez-vous ensuite sur le site ou dans l’application.`,
                }).catch(showError)
              }
            />
          </View>
        )}
      </Sheet>
      <Sheet visible={!!inspect} title={inspect?.title || "Contenu signalé"} onClose={() => setInspect(null)}>
        <Text style={s.body}>{inspect?.text}</Text>
        {inspect?.points?.map((pt: any, i: number) => (
          <View key={i} style={{ gap: 4 }}>
            <Text style={s.heading}>{pt.name}</Text>
            <Text style={s.body}>{pt.explanation}</Text>
          </View>
        ))}
        {inspect?.photos?.map((ph: any, i: number) => (
          <Image key={i} source={{ uri: ph.dataUrl }} resizeMode="contain" style={{ width: "100%", height: 220, borderRadius: radius.md }} accessibilityLabel="Contenu signalé" />
        ))}
      </Sheet>
      <LearningDashboard visible={learning} onClose={() => setLearning(false)} />
    </>
  );
}
