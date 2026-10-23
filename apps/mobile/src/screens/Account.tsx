import {StudentDashboard,TeacherSchedule} from "../components/Teaching";
import { clearPrivateVideos } from "../services/private-videos";
import { SafetySettings } from "../components/ContentSafety";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import type { Profile } from "@repere/core";
import { useApp } from "../state";
import { Button, Chip, Field, Icon, Sheet } from "../components/UI";
import { colors, styles as s } from "../theme";
import { request, clearSession } from "../services/auth";
import { clearUserData } from "../services/local";
import { API_URL } from "../config";
import { DiagnosticsPanel } from "../components/DiagnosticsPanel";
import { LearningDashboard } from "../components/LearningDashboard";
export function Account() {
  const app = useApp(),
    p = app.profile!;
  const [name, setName] = useState(p.name),
    [edit, setEdit] = useState(false),
    [code, setCode] = useState(""),
    [busy, setBusy] = useState(false),
    [gps, setGps] = useState("À autoriser"),
    [users, setUsers] = useState<Profile[] | null>(null),
    [progress, setProgress] = useState<
      {
        name: string;
        fix_index: number;
        fixes: number;
        attempts: number;
        correct: number;
      }[]
    >([]);
  const [learning, setLearning] = useState(false);
  const [teachingView,setTeachingView]=useState("profile");
  const [createOpen, setCreateOpen] = useState(false),
    [newName, setNewName] = useState(""),
    [newEmail, setNewEmail] = useState(""),
    [newRole, setNewRole] = useState<"student" | "teacher">("student"),
    [createdEmail, setCreatedEmail] = useState("");
  async function createAccess() {
    if (!newName.trim() || !newEmail.trim()) {
      app.setMessage("Renseignez le nom et l’adresse e-mail.");
      return;
    }
    setBusy(true);
    try {
      const r = await request<{ user: Profile }>("/v1/users", {
        method: "POST",
        body: JSON.stringify({
          name: newName.trim(),
          email: newEmail.trim(),
          role: newRole,
        }),
      });
      setCreatedEmail(r.user.email);
      setNewName("");
      setNewEmail("");
      if (users)
        setUsers((previous) => (previous ? [...previous, r.user] : previous));
      app.setMessage(
        "Accès préparé. La personne doit créer son mot de passe et vérifier son adresse e-mail.",
      );
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }
  const teacher = p.role !== "student";
  const dirty = app.locals.filter(
    (r) => r.revision !== r.syncedRevision && r.fixes.length > 0,
  ).length;
  useEffect(() => {
    Location.getBackgroundPermissionsAsync().then((s) =>
      setGps(s.granted ? "Arrière-plan autorisé" : "Pendant l’utilisation"),
    );
    request<{ progress: typeof progress }>("/v1/progress")
      .then((r) => setProgress(r.progress))
      .catch(() => {});
  }, [p.id]);
  const showError = (e: unknown) =>
    app.setMessage(e instanceof Error ? e.message : "Action impossible.");
  async function invite() {
    setBusy(true);
    try {
      const r = await request<{ code: string; expiresInDays: number }>(
        "/v1/invitations",
        { method: "POST" },
      );
      await Share.share({
        message: `Rejoignez mon espace élève dans LE REPÈRE PERMIS. Dans « Mon espace », saisissez ce code : ${r.code}. Valable ${r.expiresInDays} jours.`,
      });
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }
  async function claim() {
    setBusy(true);
    try {
      await request("/v1/invitations/claim", {
        method: "POST",
        body: JSON.stringify({ code }),
      });
      setCode("");
      await app.refresh();
      app.setMessage("Votre compte est relié à votre enseignant.");
    } catch (e) {
      showError(e);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (app.active) {
      Alert.alert(
        "Un enregistrement est en cours",
        "Terminez le parcours avant de vous déconnecter.",
      );
      return;
    }
    Alert.alert(
      "Se déconnecter ?",
      dirty
        ? `${dirty} parcours en attente de synchronisation resteront sur cet iPhone, rattachés à votre compte.`
        : "Vous retrouverez vos parcours sauvegardés à la prochaine connexion.",
      [
        { text: "Annuler" },
        { text: "Se déconnecter", onPress: () => void app.logout() },
      ],
    );
  }
  async function deleteAccount() {
    if (app.active) {
      Alert.alert("Terminez d’abord votre enregistrement.");
      return;
    }
    Alert.alert(
      "Supprimer votre compte ?",
      "Vos parcours, photographies, repères et réponses seront définitivement supprimés. Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer définitivement",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await request("/v1/me", {
                method: "DELETE",
                body: JSON.stringify({ confirmation: "SUPPRIMER" }),
              });
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
  if(p.role!=="student"&&teachingView!=="profile")return <ScrollView contentContainerStyle={s.content}><Button secondary label="Retour à mon espace" onPress={()=>setTeachingView("profile")}/><View style={s.row}><Chip label="Statistiques élèves" active={teachingView==="students"} onPress={()=>setTeachingView("students")}/><Chip label="Planning" active={teachingView==="schedule"} onPress={()=>setTeachingView("schedule")}/></View>{teachingView==="students"?<StudentDashboard/>:<TeacherSchedule userId={p.id}/>}</ScrollView>;
  return (
    <>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.eyebrow}>VOTRE ESPACE</Text>
        <Text style={s.title}>Bonjour, {p.name.split(" ")[0]}.</Text>
        {p.role!=="student"&&<View style={{gap:10}}><Button label="Statistiques par élève" onPress={()=>setTeachingView("students")}/><Button secondary label="Planning enseignant" onPress={()=>setTeachingView("schedule")}/></View>}
        <View style={s.card}>
          <View style={s.between}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={s.heading}>{p.name}</Text>
              <Text style={s.muted}>{p.email}</Text>
              <Text style={s.eyebrow}>
                {p.role === "admin"
                  ? "Administrateur"
                  : teacher
                    ? "Enseignant"
                    : "Élève"}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                setName(p.name);
                setEdit(true);
              }}
              accessibilityLabel="Modifier mon prénom"
            >
              <Icon name="create-outline" />
            </Pressable>
          </View>
        </View>
        <View style={s.card}>
          <View style={s.between}>
            <Text style={s.heading}>Votre sauvegarde</Text>
            <Icon
              name={app.online ? "cloud-done-outline" : "cloud-offline-outline"}
              color={app.online ? colors.green : colors.muted}
            />
          </View>
          <Text style={s.muted}>
            {dirty
              ? `${dirty} parcours sur cet iPhone attendent leur synchronisation.`
              : app.online
                ? "Vos parcours sont reliés à votre espace."
                : "Hors connexion. Vos brouillons restent sur cet iPhone."}
          </Text>
          <Button
            label="Synchroniser maintenant"
            secondary
            icon="sync-outline"
            onPress={() => void app.sync()}
          />
        </View>
        <View style={s.card}>
          <Text style={s.heading}>
            {teacher ? "Suivi pédagogique" : "Mon apprentissage"}
          </Text>
          <Text style={s.muted}>
            {teacher
              ? "Consultez les ouvertures des repères, les photos et les réponses aux quiz, par élève et par période."
              : "Retrouvez votre activité et vos résultats aux quiz des repères."}
          </Text>
          <Button
            label={teacher ? "Voir les statistiques" : "Voir ma progression"}
            secondary
            icon="stats-chart-outline"
            onPress={() => setLearning(true)}
          />
        </View>
        {teacher ? (
          <View style={s.card}>
            <Text style={s.heading}>Vos élèves</Text>
            <Text style={s.muted}>
              Partagez un code d’invitation. Votre élève le saisit depuis son
              espace pour recevoir vos parcours privés.
            </Text>
            <Button
              label={p.role === "admin" ? "Créer un accès" : "Créer un élève"}
              icon="person-add-outline"
              secondary
              onPress={() => {
                setCreatedEmail("");
                setNewRole("student");
                setCreateOpen(true);
              }}
            />
            <Button
              label="Inviter un élève"
              secondary
              icon="person-add-outline"
              busy={busy}
              onPress={() => void invite()}
            />
            <Button
              label={
                p.role === "admin" ? "Gérer les comptes" : "Voir mes élèves"
              }
              secondary
              icon="people-outline"
              onPress={async () => {
                try {
                  const r = await request<{ students: Profile[] }>(
                    p.role === "admin" ? "/v1/users" : "/v1/students",
                  );
                  setUsers(r.students);
                } catch (e) {
                  showError(e);
                }
              }}
            />
          </View>
        ) : (
          <View style={s.card}>
            <Text style={s.heading}>Votre enseignant</Text>
            <Text style={s.muted}>
              Saisissez son code d’invitation pour accéder aux parcours qui vous
              seront attribués.
            </Text>
            <Field
              label="Code d’invitation"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              maxLength={30}
            />
            <Button
              label="Rejoindre mon enseignant"
              secondary
              disabled={!code.trim()}
              busy={busy}
              onPress={() => void claim()}
            />
          </View>
        )}
        {progress.length > 0 && (
          <View style={s.card}>
            <Text style={s.heading}>Votre progression</Text>
            {progress.map((r) => (
              <View key={r.name} style={{ gap: 6 }}>
                <View style={s.between}>
                  <Text style={[s.body, { flex: 1 }]}>{r.name}</Text>
                  <Text style={s.muted}>
                    {Math.round((r.fix_index / Math.max(1, r.fixes - 1)) * 100)}{" "}
                    %
                  </Text>
                </View>
                <Text style={s.caption}>
                  {r.correct} réponse{r.correct > 1 ? "s" : ""} correcte
                  {r.correct > 1 ? "s" : ""} sur {r.attempts} tentative
                  {r.attempts > 1 ? "s" : ""}
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={s.card}>
          <Text style={s.heading}>Sur cet iPhone</Text>
          <View style={s.between}>
            <Text style={s.body}>Localisation</Text>
            <Text style={s.muted}>{gps}</Text>
          </View>
          <Text style={s.caption}>
            L’iPhone peut interrompre l’application après un arrêt forcé ou une
            restriction système. Les positions déjà reçues sont conservées. Une
            interruption crée un nouveau segment à la reprise.
          </Text>
          <Button
            label="Réglages de localisation"
            secondary
            icon="settings-outline"
            onPress={() => void Linking.openSettings()}
          />
        </View>
        <SafetySettings />
        <View style={{ gap: 18, paddingVertical: 10 }}>
          {[
            ["Confidentialité", `${API_URL}/privacy`],
            ["Conditions d’utilisation", `${API_URL}/terms`],
          ].map(([title, url]) => (
            <Pressable
              key={title}
              style={s.between}
              onPress={() => void Linking.openURL(url!)}
            >
              <Text style={s.body}>{title}</Text>
              <Icon name="arrow-up-right-box" size={17} />
            </Pressable>
          ))}
          <Button
            label="Me reconnecter"
            secondary
            onPress={() => void app.login()}
            busy={app.authBusy}
          />
          <Button
            label="Me déconnecter"
            secondary
            onPress={() => void logout()}
          />
          <Pressable onPress={() => void deleteAccount()} disabled={busy}>
            <Text
              style={[
                s.caption,
                { color: colors.red, textAlign: "center", padding: 12 },
              ]}
            >
              Supprimer mon compte et mes données
            </Text>
          </Pressable>
        </View>
        <Text style={[s.caption, { textAlign: "center" }]}>
          LE REPÈRE PERMIS · 1.6.0{`\n`}Le calme vous mène loin.
        </Text>
        <DiagnosticsPanel />
      </ScrollView>
      <Sheet visible={edit} title="Votre profil" onClose={() => setEdit(false)}>
        <Field
          label="Votre prénom / nom"
          value={name}
          onChangeText={setName}
          maxLength={100}
        />
        <Button
          label="Enregistrer"
          onPress={async () => {
            try {
              const next = await request<Profile>("/v1/me", {
                method: "PATCH",
                body: JSON.stringify({ name }),
              });
              await app.updateProfile(next);
              setEdit(false);
            } catch (e) {
              showError(e);
            }
          }}
        />
      </Sheet>
      <Sheet
        visible={createOpen}
        title="Créer un accès"
        onClose={() => {
          if (!busy) setCreateOpen(false);
        }}
      >
        <Text style={s.body}>
          La personne choisira son mot de passe et vérifiera son e-mail. Aucun
          mot de passe n’est partagé.
        </Text>
        {p.role === "admin" && (
          <View style={s.row}>
            <Chip
              label="Élève"
              active={newRole === "student"}
              onPress={() => setNewRole("student")}
            />
            <Chip
              label="Enseignant"
              active={newRole === "teacher"}
              onPress={() => setNewRole("teacher")}
            />
          </View>
        )}
        <Text style={s.caption}>
          {newRole === "teacher"
            ? "Peut créer ses parcours, ses repères et ses élèves. N’administre pas les autres enseignants."
            : "Accède aux parcours, repères et directs qui lui sont partagés. Ne peut pas gérer les comptes."}
        </Text>
        <Field
          label="Nom"
          value={newName}
          onChangeText={setNewName}
          maxLength={100}
        />
        <Field
          label="Adresse e-mail"
          value={newEmail}
          onChangeText={setNewEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          maxLength={254}
        />
        <Button
          label="Créer l’accès"
          busy={busy}
          onPress={() => void createAccess()}
        />
        {!!createdEmail && (
          <>
            <Text style={s.body}>Accès préparé pour {createdEmail}.</Text>
            <Button
              secondary
              label="Partager les instructions"
              onPress={() =>
                void Share.share({
                  message: `Votre espace Le Repère Permis est prêt pour ${createdEmail}. Créez votre compte avec cette même adresse, choisissez votre mot de passe et vérifiez votre e-mail : ${API_URL}/auth?mode=signup. Connectez-vous ensuite dans l’application.`,
                }).catch(showError)
              }
            />
          </>
        )}
      </Sheet>
      <Sheet
        visible={users !== null}
        title={p.role === "admin" ? "Comptes" : "Mes élèves"}
        onClose={() => setUsers(null)}
      >
        {users?.length === 0 && (
          <Text style={s.muted}>
            Vos élèves apparaîtront après acceptation d’une invitation.
          </Text>
        )}
        {users?.map((user) => (
          <View key={user.id} style={s.card}>
            <Text style={s.heading}>{user.name}</Text>
            <Text style={s.muted}>{user.email}</Text>
            {p.role === "admin" && user.id !== p.id ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
                {(["student", "teacher", "admin"] as const).map((role) => (
                  <Chip
                    key={role}
                    label={
                      role === "student"
                        ? "Élève"
                        : role === "teacher"
                          ? "Enseignant"
                          : "Admin"
                    }
                    active={role === user.role}
                    onPress={() =>
                      Alert.alert(
                        "Modifier le rôle ?",
                        `${user.name} deviendra ${role === "student" ? "élève" : role === "teacher" ? "enseignant" : "administrateur"}.`,
                        [
                          { text: "Annuler" },
                          {
                            text: "Confirmer",
                            onPress: async () => {
                              try {
                                await request(
                                  `/v1/users/${encodeURIComponent(user.id)}/role`,
                                  {
                                    method: "PATCH",
                                    body: JSON.stringify({ role }),
                                  },
                                );
                                setUsers((a) =>
                                  a!.map((u) =>
                                    u.id === user.id ? { ...u, role } : u,
                                  ),
                                );
                              } catch (e) {
                                showError(e);
                              }
                            },
                          },
                        ],
                      )
                    }
                  />
                ))}
              </View>
            ) : (
              <Text style={s.eyebrow}>
                {user.role === "student"
                  ? "Élève"
                  : user.role === "teacher"
                    ? "Enseignant"
                    : "Administrateur"}
              </Text>
            )}
          </View>
        ))}
      </Sheet>
      <LearningDashboard
        visible={learning}
        onClose={() => setLearning(false)}
      />
    </>
  );
}
