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

const Personalization = ({ onSave }: { onSave: () => void }) => {
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
    <div className="p-6 bg-white rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Personalization</h2>
      <p className="mb-4 text-gray-600">
        Enter names and birth years for each character:
      </p>

      <div className="space-y-4">
        {allCharacters.map(({ key, label }) => {
          const birthYear = formData[key]?.birthYear || "";
          const age = birthYear ? currentYear - parseInt(birthYear) : "";
          return (
            <div key={key} className="grid grid-cols-4 gap-4 items-center">
              <label className="text-gray-700">{label}</label>

              <input
                type="text"
                placeholder="Name"
                value={formData[key]?.name || ""}
                onChange={(e) => handleChange(key, "name", e.target.value)}
                className="border px-2 py-1 rounded"
              />

              <input
                type="number"
                placeholder="Birth Year"
                value={formData[key]?.birthYear || ""}
                onChange={(e) => handleChange(key, "birthYear", e.target.value)}
                className="border px-2 py-1 rounded"
              />

              {key === "me" || key.startsWith("custom_") ? (
                <select
                  value={formData[key]?.gender || ""}
                  onChange={(e) => handleChange(key, "gender", e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              ) : (
                <div /> // keeps grid aligned
              )}

              {formData[key]?.birthYear && (
                <p className="text-sm text-gray-500 col-span-4">
                  Age: {age} years
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Add another character (e.g. best friend)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleAddCharacter}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
        >
          Add
        </button>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-green-600 text-white py-2 rounded hover:bg-green-500"
      >
        Save Details
      </button>
    </div>
  );
};

export default Personalization;
