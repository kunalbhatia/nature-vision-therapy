import { useEffect, useState } from "react";
import { useSnackbar } from "../hooks/Snackbar";
import { usePreloader } from "../hooks/Preloader";

const currentYear = new Date().getFullYear();

const defaultCharacters = [
  { key: "me", label: "Your name (e.g. Jhalak)" },
  { key: "behan", label: "Your sister's name" },
  { key: "mummy", label: "Your mother's name" },
  { key: "papa", label: "Your father's name" },
  { key: "mama", label: "Your maternal uncle's name" },
  { key: "dada", label: "Your grandfather's name (father's side)" },
  { key: "dadi", label: "Your grandmother's name (father's side)" },
  { key: "nani", label: "Your grandmother's name (mother's side)" },
  { key: "nanu", label: "Your grandfather's name (mother's side)" },
  { key: "bhai", label: "Your brother's name" },
];

const Personalization = ({ onSave }: { onSave?: () => void }) => {
  const { showMessage } = useSnackbar();
  const [formData, setFormData] = useState<
    Record<string, { name: string; birthYear: string; gender: string }>
  >({});
  const [customCharacters, setCustomCharacters] = useState<
    { key: string; label: string }[]
  >([]);
  const [newLabel, setNewLabel] = useState("");
  const { showPreloader, hidePreloader } = usePreloader();
  // Auto-fill from API if available
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        showPreloader();
        const res = await fetch("/api/get-characters-details", {
          credentials: "include",
        });
        if (!res.ok) return;
        
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await res.text();
          console.error("Expected JSON but received:", contentType, text.slice(0, 100));
          throw new Error("API returned non-JSON response. Ensure you are running with 'pnpm dev:vercel'.");
        }

        const { characterDetails } = await res.json();

        if (characterDetails) {
          // Convert API response into formData shape
          const newFormData: Record<
            string,
            { name: string; birthYear: string; gender: string }
          > = {};
          const newCustoms: { key: string; label: string }[] = [];

          Object.entries(characterDetails).forEach(([key, value]) => {
            const { name, birthYear, gender, relationshipWithMe } = value as {
              name: string;
              birthYear: number;
              gender?: string;
              relationshipWithMe: string;
            };

            newFormData[key] = {
              name,
              birthYear: birthYear.toString(),
              gender: gender || "",
            };

            if (key.startsWith("custom_")) {
              newCustoms.push({
                key,
                label: relationshipWithMe || "Custom Character",
              });
            }
          });

          setFormData(newFormData);
          setCustomCharacters(newCustoms);
          hidePreloader();
        }
      } catch (err) {
        console.error("Failed to fetch character details:", err);
      }
    };

    fetchCharacters();
  }, []);

  const handleChange = (
    key: string,
    field: "name" | "birthYear" | "gender",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleAddCharacter = () => {
    if (!newLabel.trim()) return;
    const key = `custom_${customCharacters.length}`;
    setCustomCharacters((prev) => [...prev, { key, label: newLabel }]);
    setNewLabel("");
  };

  const handleSubmit = async () => {
    if (typeof onSave === "function") onSave();
    const characterDetails = Object.fromEntries(
      Object.entries(formData).map(([key, { name, birthYear, gender }]) => {
        const isCustom = key.startsWith("custom_");

        let relationshipWithMe: string;

        if (isCustom) {
          relationshipWithMe =
            customCharacters.find((c) => c.key === key)?.label || "custom";
        } else if (key === "me") {
          relationshipWithMe = "self";
        } else {
          relationshipWithMe =
            defaultCharacters.find((c) => c.key === key)?.label || "unknown";
        }

        const entry: {
          name: string;
          birthYear: number;
          gender?: string;
          relationshipWithMe: string;
        } = {
          name,
          birthYear: parseInt(birthYear),
          relationshipWithMe,
        };

        if (gender) entry.gender = gender;

        return [key, entry];
      }),
    );
    showPreloader();
    const res = await fetch("/api/save-characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ characterDetails }),
    });

    const data = await res.json();
    if (data.status === "success") {
      showMessage(data.message || "Details saved", data.status);
    } else {
      showMessage(
        data.message || "Failed to save details",
        data.status || "error",
      );
    }
    hidePreloader();
  };

  const allCharacters = [...defaultCharacters, ...customCharacters];

  return (
    <div className="h-full flex flex-col text-gray-800">
      <p className="mb-4 text-gray-500 text-sm shrink-0">
        Enter names and birth years for each character to personalize stories and exercises:
      </p>

      {/* Grid Headers for Large Screens */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 items-center mb-2 pb-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider pr-3 shrink-0">
        <div className="md:col-span-2">Relationship / Character</div>
        <div>Name</div>
        <div>Birth Year</div>
        <div>Gender</div>
      </div>

      {/* Inner Scroll Container for Characters */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-thin min-h-0">
        {allCharacters.map(({ key, label }) => {
          const birthYear = formData[key]?.birthYear || "";
          const age = birthYear ? currentYear - parseInt(birthYear) : "";
          return (
            <div key={key} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center py-1.5 border-b border-gray-100 last:border-b-0">
              <label className="text-sm font-semibold text-gray-700 md:col-span-2 truncate">{label}</label>

              <div className="w-full md:col-span-1">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData[key]?.name || ""}
                  onChange={(e) => handleChange(key, "name", e.target.value)}
                  className="input input-bordered input-sm w-full bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm h-9"
                />
              </div>

              <div className="w-full md:col-span-1 flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Year"
                  value={formData[key]?.birthYear || ""}
                  onChange={(e) => handleChange(key, "birthYear", e.target.value)}
                  className="input input-bordered input-sm w-24 flex-shrink-0 bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm h-9"
                />
                {formData[key]?.birthYear && (
                  <span className="text-xs md:text-sm text-emerald-600 font-bold select-none whitespace-nowrap">
                    {age} yrs
                  </span>
                )}
              </div>

              <div className="w-full md:col-span-1">
                {key === "me" || key.startsWith("custom_") ? (
                  <select
                    value={formData[key]?.gender || ""}
                    onChange={(e) => handleChange(key, "gender", e.target.value)}
                    className="select select-bordered select-sm w-full bg-white text-gray-900 border-gray-300 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm h-9 min-h-fit"
                  >
                    <option value="" className="bg-white text-gray-950">Gender</option>
                    <option value="male" className="bg-white text-gray-950">Male</option>
                    <option value="female" className="bg-white text-gray-950">Female</option>
                    <option value="other" className="bg-white text-gray-950">Other</option>
                  </select>
                ) : (
                  <div className="text-gray-400 text-sm italic pl-4 select-none hidden md:block">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Character Section */}
      <div className="mt-4 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
        <div className="w-full md:flex-1">
          <input
            type="text"
            placeholder="Add another character (e.g. best friend, cousin)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="input input-bordered input-sm w-full bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm h-9"
          />
        </div>
        <button
          onClick={handleAddCharacter}
          className="btn bg-green-800 hover:bg-green-700 text-white rounded-xl px-5 font-bold text-sm h-9 min-h-fit w-full md:w-auto border-none"
        >
          Add Character
        </button>
      </div>

      {/* Submit Button */}
      <div className="mt-4 flex justify-end shrink-0">
        <button
          onClick={handleSubmit}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-48 text-sm"
        >
          Save Details
        </button>
      </div>
    </div>
  );
};

export default Personalization;
