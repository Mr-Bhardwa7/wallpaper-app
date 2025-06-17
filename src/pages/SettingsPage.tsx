import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Settings, Image, Globe } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useWallpaperStore } from "@/store/useWallpaperStore";
import { appThemeOptions, resolutionOptions, updateInterval } from "@/constants";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { useTheme } from "@/contexts/ThemeContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Option = string | { label: string; value: string | number };

const Section = ({
  title,
  icon,
  children,
  isDarkMode,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isDarkMode: boolean;
}) => (
  <section
    className={`rounded-2xl p-6 shadow-sm backdrop-blur-xl border ${
      isDarkMode ? "bg-gray-900/60 border-gray-700/40" : "bg-white/70 border-gray-300"
    }`}
  >
    <h3
      className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
        isDarkMode ? "text-white" : "text-gray-900"
      }`}
    >
      {icon} {title}
    </h3>
    {children}
  </section>
);

const SettingsPage = () => {
  const {
    settings,
    settingsLoaded,
    fetchSetting,
    updateSetting,
    resetSettings,
  } = useWallpaperStore();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (!settingsLoaded) {
      fetchSetting();
    }
  }, [fetchSetting, settingsLoaded]);

  useEffect(() => {
    const checkAutoStart = async () => {
      const result = await isEnabled();
      console.log("Auto start is", result ? "enabled" : "disabled");
    };
    checkAutoStart();
  }, []);

  return (
    <div className="flex-1 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <h2 className={`text-4xl font-bold flex items-center gap-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          <Settings className="w-8 h-8 text-cyan-500" />
          Settings
        </h2>

        <Section title="Wallpaper Settings" icon={<Image className="w-5 h-5 text-cyan-400" />} isDarkMode={isDarkMode}>
          <div className="space-y-6">
            <ToggleRow
              isDarkMode={isDarkMode}
              label="Auto-update wallpaper"
              description="Automatically change wallpaper at set intervals"
              checked={settings ? settings.autoUpdate : true}
              onChange={(val) => updateSetting("autoUpdate", val, "wallpaper")}
            />
            <DropdownRow
              isDarkMode={isDarkMode}
              label="Update interval"
              value={settings ? settings.updateInterval : "86400000"}
              options={updateInterval}
              onChange={(val) => updateSetting("updateInterval", val, "wallpaper")}
            />
            <DropdownRow
              isDarkMode={isDarkMode}
              label="Preferred Resolution"
              value={settings ? settings.preferredResolution : "1920x1080"}
              options={resolutionOptions}
              onChange={(val) => updateSetting("preferredResolution", val, "wallpaper")}
            />
            {/* <ToggleRow
              isDarkMode={isDarkMode}
              label="Save wallpaper automatically"
              description="Downloaded images will be saved to your gallery"
              checked={settings ? settings.saveWallpaper : true}
              onChange={(val) => updateSetting("saveWallpaper", val, "wallpaper")}
            /> */}
          </div>
        </Section>

        <Section title="Preferences" icon={<Settings className="w-5 h-5 text-green-400" />} isDarkMode={isDarkMode}>
          <div className="space-y-6">
            <DropdownRow
              isDarkMode={isDarkMode}
              label="App Theme"
              value={settings ? settings.appTheme : "system"}
              options={appThemeOptions}
              onChange={(val) =>
                updateSetting("appTheme", val.toLowerCase() as "light" | "dark" | "system", "preferences")
              }
            />
            {/* <ToggleRow
              isDarkMode={isDarkMode}
              label="Enable notifications"
              description="Show toast when download completes or fails"
              checked={settings ? settings.notifications : true}
              onChange={(val) => updateSetting("notifications", val, "preferences")}
            /> */}
            <ToggleRow
              isDarkMode={isDarkMode}
              label="Auto-start on boot"
              description="Launch app when system starts (desktop only)"
              checked={settings ? settings.autoStart : true}
              onChange={async (val) => {
                const currentlyEnabled = await isEnabled();
                if (currentlyEnabled) {
                  await disable();
                  console.log("Auto-start disabled");
                } else {
                  await enable();
                  console.log("Auto-start enabled");
                }
                updateSetting("autoStart", val, "preferences");
              }}
            />
            <ToggleRow
              isDarkMode={isDarkMode}
              label="Enable experimental features"
              description="Try new beta tools before public release"
              checked={settings ? settings.experimental : true}
              onChange={(val) => updateSetting("experimental", val, "preferences")}
            />
          </div>
        </Section>

        <section
          className={`rounded-2xl p-6 shadow-sm backdrop-blur-xl border ${
            isDarkMode ? "bg-gray-900/60 border-gray-700/40" : "bg-white/70 border-gray-300"
          }`}
        >
          <h3 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <Globe className={`w-5 h-5 ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`} />
            General
          </h3>
          <div>
            <label className={`block font-medium mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Language</label>
            <p className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>Interface language</p>
            <LanguageSwitcher />
          </div>
        </section>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={() => setConfirmResetOpen(true)}
            className={`border text-sm font-semibold px-6 py-2 rounded-xl transition cursor-pointer ${
              isDarkMode
                ? "border-gray-700 text-white hover:bg-gray-700/60"
                : "border-gray-300 text-gray-900 hover:bg-gray-100"
            }`}
          >
            Reset to Defaults
          </button>
        </div>

        <ConfirmDialog
          open={confirmResetOpen}
          onClose={() => setConfirmResetOpen(false)}
          onConfirm={() => {
            resetSettings();
            setConfirmResetOpen(false);
          }}
          description="Are you sure you want to reset all settings to default values? This cannot be undone."
          confirmLabel="Reset"
        />
      </div>
    </div>
  );
};

const ToggleRow = ({
  label,
  description,
  checked,
  onChange,
  isDarkMode,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isDarkMode: boolean;
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>{label}</p>
      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{description}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const DropdownRow = ({
  label,
  value,
  options,
  onChange,
  isDarkMode,
}: {
  label: string;
  value: string | number;
  options: Option[];
  onChange: (value: string) => void;
  isDarkMode: boolean;
}) => (
  <div>
    <label className={`block font-medium mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{label}</label>
    <select
      className={`w-full rounded-xl px-4 py-2 border transition focus:outline-none focus:ring-2  ${
        isDarkMode
           ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-300 text-gray-800"
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => {
        const key = typeof option === "string" ? option : option.value;
        const display = typeof option === "string" ? option : option.label;
        return (
          <option key={key} value={key}>
            {display}
          </option>
        );
      })}
    </select>
  </div>
);

export default SettingsPage;
