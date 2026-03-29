import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function SettingsPage() {
  const [notificationEmail, setNotificationEmail] = useState("");
  const [blogName, setBlogName] = useState("Auto-Blog");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase.from("settings").select("key, value");
        if (data) {
          data.forEach((setting) => {
            if (setting.key === "notification_email") setNotificationEmail(setting.value);
            if (setting.key === "blog_name") setBlogName(setting.value);
          });
        }
      } catch {
        // Settings pas encore configurées
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await supabase
        .from("settings")
        .upsert([
          { key: "notification_email", value: notificationEmail },
          { key: "blog_name", value: blogName },
        ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // Erreur silencieuse
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 rounded-xl border border-border bg-surface text-sm text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200";

  return (
    <div className="max-w-2xl">
      <div className="mb-10 animate-fade-up">
        <h1 className="font-serif text-3xl font-bold text-secondary mb-2">Paramètres</h1>
        <p className="text-text-muted text-sm">
          Configurez les paramètres généraux de votre blog.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-surface rounded-2xl border border-border p-6 space-y-6 animate-fade-up delay-100">
          <h2 className="font-serif text-lg font-bold text-secondary">Général</h2>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Nom du blog
            </label>
            <input
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text mb-2">
              Email de notification
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className={inputClasses}
              placeholder="admin@auto-ecole.fr"
            />
            <p className="text-xs text-text-muted mt-2">
              Adresse qui recevra les notifications de nouvelles réservations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 animate-fade-up delay-200">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm disabled:opacity-50 ${
              saved
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-primary text-white hover:bg-primary-dark hover:shadow-md"
            }`}
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Sauvegardé
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {saving ? "Sauvegarde..." : "Sauvegarder"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
