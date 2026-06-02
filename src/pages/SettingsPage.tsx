import Personalization from "../components/Personalization";

export default function SettingsPage() {
  return (
    <div className="w-full max-w-2xl p-6 bg-white/95 rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Settings</h1>
      <Personalization onSave={() => {}} />
    </div>
  );
}
