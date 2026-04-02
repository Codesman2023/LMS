"use client";

import { useEffect, useState } from "react";

const locationData = {
 India: {
    AndhraPradesh: [
      "Visakhapatnam",
      "Vijayawada",
      "Guntur",
      "Nellore",
      "Tirupati",
      "Kakinada",
    ],

    ArunachalPradesh: [
      "Itanagar",
      "Naharlagun",
      "Pasighat",
      "Tawang",
      "Ziro",
    ],

    Assam: [
      "Guwahati",
      "Silchar",
      "Dibrugarh",
      "Jorhat",
      "Tezpur",
      "Nagaon",
    ],

    Bihar: [
      "Patna",
      "Gaya",
      "Bhagalpur",
      "Muzaffarpur",
      "Darbhanga",
      "Purnia",
    ],

    Chhattisgarh: [
      "Raipur",
      "Bilaspur",
      "Durg",
      "Bhilai",
      "Korba",
      "Raigarh",
    ],

    Goa: [
      "Panaji",
      "Margao",
      "Vasco da Gama",
      "Mapusa",
      "Ponda",
    ],

    Gujarat: [
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Bhavnagar",
      "Jamnagar",
    ],

    Haryana: [
      "Gurugram",
      "Faridabad",
      "Panipat",
      "Ambala",
      "Karnal",
      "Rohtak",
    ],

    HimachalPradesh: [
      "Shimla",
      "Solan",
      "Mandi",
      "Dharamshala",
      "Kullu",
    ],

    Jharkhand: [
      "Ranchi",
      "Jamshedpur",
      "Dhanbad",
      "Bokaro",
      "Hazaribagh",
    ],

    Karnataka: [
      "Bengaluru",
      "Mysuru",
      "Mangaluru",
      "Hubballi",
      "Belagavi",
      "Shivamogga",
    ],

    Kerala: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Thrissur",
      "Kannur",
      "Alappuzha",
    ],

    MadhyaPradesh: [
      "Bhopal",
      "Indore",
      "Jabalpur",
      "Gwalior",
      "Ujjain",
      "Sagar",
    ],

    Maharashtra: [
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Aurangabad",
      "Kolhapur",
    ],

    Manipur: [
      "Imphal",
      "Thoubal",
      "Bishnupur",
      "Churachandpur",
    ],

    Meghalaya: [
      "Shillong",
      "Tura",
      "Jowai",
      "Nongpoh",
    ],

    Mizoram: [
      "Aizawl",
      "Lunglei",
      "Champhai",
      "Serchhip",
    ],

    Nagaland: [
      "Kohima",
      "Dimapur",
      "Mokokchung",
      "Wokha",
    ],

    Odisha: [
      "Bhubaneswar",
      "Cuttack",
      "Rourkela",
      "Sambalpur",
      "Berhampur",
      "Balasore",
    ],

    Punjab: [
      "Ludhiana",
      "Amritsar",
      "Jalandhar",
      "Patiala",
      "Bathinda",
      "Mohali",
    ],

    Rajasthan: [
      "Jaipur",
      "Jodhpur",
      "Udaipur",
      "Kota",
      "Bikaner",
      "Ajmer",
    ],

    Sikkim: [
      "Gangtok",
      "Namchi",
      "Gyalshing",
      "Mangan",
    ],

    TamilNadu: [
      "Chennai",
      "Coimbatore",
      "Madurai",
      "Salem",
      "Tiruchirappalli",
      "Erode",
    ],

    Telangana: [
      "Hyderabad",
      "Warangal",
      "Karimnagar",
      "Nizamabad",
      "Khammam",
    ],

    Tripura: [
      "Agartala",
      "Udaipur",
      "Dharmanagar",
      "Kailashahar",
    ],

    UttarPradesh: [
      "Lucknow",
      "Kanpur",
      "Noida",
      "Ghaziabad",
      "Agra",
      "Varanasi",
    ],

    Uttarakhand: [
      "Dehradun",
      "Haridwar",
      "Roorkee",
      "Haldwani",
      "Rishikesh",
    ],

    WestBengal: [
      "Kolkata",
      "Howrah",
      "Durgapur",
      "Asansol",
      "Siliguri",
      "Kharagpur",
    ],
  },
  USA: {
    California: ["Los Angeles", "San Francisco"],
    Texas: ["Austin", "Dallas"],
  },
};

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    dob: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/user/profile");
      const data = await res.json();

     setForm({
  name: data.username || "",
  email: data.email || "",
  mobile: data.mobile || "",
  country: data.country || "",
  state: data.state || "",
  city: data.city || "",
  pincode: data.pincode || "",
  dob: data.dob ? data.dob.slice(0, 10) : "",
  gender: data.gender || "",
});
    }
    fetchProfile();
  }, []);

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });

  setLoading(false);

  // 🔁 fetch updated data again
  const res = await fetch("/api/user/profile");
  const data = await res.json();
  setForm({
    ...data,
    dob: data.dob ? data.dob.slice(0, 10) : "",
  });

  alert("Profile updated successfully");
}

  const inputClass =
    "w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black px-4 py-10">
      <div className="max-w-5xl mx-auto">
       <div className="flex flex-col items-center">
         <h1 className="text-5xl font-bold mb-2 text-zinc-900 dark:text-white">
          My Profile
        </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-10">
            Manage your personal information and preferences
          </p>
       </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ================= BASIC INFO ================= */}
          <section className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className={`${inputClass} opacity-70 cursor-not-allowed`}
                />
              </div>
            </div>
          </section>

          {/* ================= LOCATION INFO ================= */}
          <section className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Location Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-1">Country</label>
                <select
                  value={form.country}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      country: e.target.value,
                      state: "",
                      city: "",
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Select Country</option>
                  {Object.keys(locationData).map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">State</label>
                <select
                  value={form.state}
                  onChange={(e) =>
                    setForm({ ...form, state: e.target.value, city: "" })
                  }
                  disabled={!form.country}
                  className={inputClass}
                >
                  <option value="">Select State</option>
                  {form.country &&
                    Object.keys(locationData[form.country]).map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">City</label>
                <select
                  value={form.city}
                  onChange={(e) =>
                    setForm({ ...form, city: e.target.value })
                  }
                  disabled={!form.state}
                  className={inputClass}
                >
                  <option value="">Select City</option>
                  {form.country &&
                    form.state &&
                    locationData[form.country][form.state].map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) =>
                    setForm({ ...form, pincode: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* ================= PERSONAL INFO ================= */}
          <section className="bg-white dark:bg-white/5 border dark:border-white/10 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-6">Personal Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={form.mobile}
                  onChange={(e) =>
                    setForm({ ...form, mobile: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) =>
                    setForm({ ...form, dob: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* ================= SAVE BUTTON ================= */}
          <div className="flex justify-end">
            <button
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium 
                         hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black 
                         transition disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
