import { useState, useEffect, useContext } from "react";
import Input from "./Input";
import { AuthContext } from "../context/AuthContext";
import { profileAPI } from "../services/api";

function Account() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    businessName: "",
    owner: "",
    phone: "",
    gst: "",
    address: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await profileAPI.get();
        if (res.data) {
          setProfile({
            businessName: res.data.businessName || "",
            owner: res.data.owner || "",
            phone: res.data.phone || "",
            gst: res.data.gst || "",
            address: res.data.address || "",
          });
        }
      } catch (err) {
        console.log("Could not fetch profile");
      }
      setLoading(false);
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      await profileAPI.update(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.log("Could not save profile");
    }
  };

  if (loading) return <div className="p-8 text-center" style={{ color: "var(--text3)" }}>Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Account Settings</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--text3)" }}>Manage your wholesaler profile</p>
      </div>
      <div className="rounded-2xl border p-6 space-y-4 theme-transition" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text3)" }}>Business Profile</h3>
        {[
          ["businessName", "Business Name"],
          ["owner", "Owner / Manager"],
          ["phone", "Phone"],
          ["gst", "GST Number"],
          ["address", "Address"],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="text-xs font-semibold uppercase tracking-widest mb-1 block" style={{ color: "var(--text3)" }}>{label}</label>
            <Input
              value={profile[key]}
              onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
            />
          </div>
        ))}
        <button
          onClick={handleSave}
          className={"mt-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-white " + (saved ? "bg-emerald-600" : "bg-blue-600 hover:bg-blue-500")}
        >
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default Account;
