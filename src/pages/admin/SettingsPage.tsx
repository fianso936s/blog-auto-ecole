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
        // Settings pas encore configur\u00e9es
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

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Param&egrave;tres</h1>
        <p className="text-gray-500 text-sm">
          Configurez les param&egrave;tres g&eacute;n&eacute;raux de votre blog.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">G&eacute;n&eacute;ral</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom du blog
            </label>
            <input
              value={blogName}
              onChange={(e) => setBlogName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email de notification
            </label>
            <input
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#cf5c36] focus:ring-1 focus:ring-[#cf5c36]"
              placeholder="admin@auto-ecole.fr"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              Adresse qui recevra les notifications de nouvelles r&eacute;servations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#cf5c36] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#b8502f] transition-colors disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" /> Sauvegard&eacute;
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
