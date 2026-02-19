import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import { Search, Settings, X, CheckCircle, AlertCircle } from "lucide-react";
import { useCart } from "../Context/CartContext";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";

export default function Planning() {
  const currScreen = window.location.pathname;
  const { allMeals, setFavourites } = useCart();
  const { isLoggedIn } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchMeals, setSearchMeals] = useState([]);
  const [allSearchMeals, setAllSearchMeals] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [details, setDetails] = useState({});
  const [msg, setMsg] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");
  const [icon, setIcon] = useState("Alert");

  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedHealth, setSelectedHealth] = useState([]);
  const [visibleHealthCount, setVisibleHealthCount] = useState(8);

  const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
  const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

  const dietLabels = [
    "Balanced",
    "High-Fiber",
    "Low-Fat",
    "Low-Sodium",
    "Low-Carb",
  ];

  const cuisineTypes = [
    "italian",
    "mediterranean",
    "american",
    "greek",
    "asian",
    "french",
  ];

  const healthLabels = [
    "Sugar-Conscious",
    "Low Potassium",
    "Kidney-Friendly",
    "Egg-Free",
    "Peanut-Free",
    "Tree-Nut-Free",
    "Soy-Free",
    "Fish-Free",
    "Shellfish-Free",
    "Crustacean-Free",
    "Celery-Free",
    "Mustard-Free",
    "Sesame-Free",
    "Lupine-Free",
    "Mollusk-Free",
    "Alcohol-Free",
    "No oil added",
    "Sulfite-Free",
    "Vegetarian",
    "Pescatarian",
    "Pork-Free",
    "Red-Meat-Free",
    "Dairy-Free",
    "Kosher",
    "Vegan",
    "DASH",
    "Immuno-Supportive",
  ];

  useEffect(() => {
    setSearchMeals(allMeals);
    setAllSearchMeals(allMeals);
  }, []);

  const fetchMeals = async () => {
    if (!searchTerm) return;

    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${searchTerm}&app_id=${APP_ID}&app_key=${APP_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setSearchMeals(data.hits);
      setAllSearchMeals(data.hits);
      setSearchTerm("");
    } catch (err) {
      console.log(err);
    }
  };

  const applyFilters = () => {
    let filtered = allSearchMeals;

    if (selectedDiet) {
      filtered = filtered.filter((item) =>
        item.recipe.dietLabels?.includes(selectedDiet)
      );
    }

    if (selectedCuisine) {
      filtered = filtered.filter((item) =>
        item.recipe.cuisineType?.includes(selectedCuisine)
      );
    }

    if (selectedHealth.length > 0) {
      filtered = filtered.filter((item) =>
        selectedHealth.every((label) =>
          item.recipe.healthLabels?.includes(label)
        )
      );
    }

    setSearchMeals(filtered);
  };

  const toggleHealthLabel = (label) => {
    setSelectedHealth((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const handleFavourites = async (item) => {
    if (!isLoggedIn) {
      setInfoMsg("Login Required");
      setIcon("Alert");
      setMsg(true);
      setTimeout(() => setMsg(false), 4000);
      return;
    }

    setFavourites((prev) => [...prev, item]);

    try {
      const res = await axios.post(
        "https://recipetracker-fg4e.onrender.com/api/cart/addtocart",
        {
          title: item.recipe.label,
          image: item.recipe.image,
          label: item.recipe.label,
          ingredients: item.recipe.ingredients,
        },
        { withCredentials: true }
      );

      if (res.data.message === "Meal already present") {
        setInfoMsg("Meal Already in Favourites");
        setIcon("Alert");
      } else {
        setInfoMsg("Meal Added to Favourites");
        setIcon("Check");
      }
    } catch (err) {
      console.log(err);
    }

    setMsg(true);
    setModal(false);
    setTimeout(() => setMsg(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection path={currScreen} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* SEARCH */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
          <input
            type="text"
            placeholder="Find Your Next Delicious Meal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:flex-1 py-3 px-5 rounded-lg shadow border focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex gap-3 items-center">
            <button
              onClick={fetchMeals}
              style={{ backgroundColor: "#bfdbfe" }}
              className=" p-3 rounded-lg hover:scale-105 transition"
            >
              <Search size={20} color="white" />
            </button>

            <Settings
              size={28}
              className="cursor-pointer"
              onClick={() => setFilterOpen(!filterOpen)}
            />
          </div>
        </div>

        {filterOpen && (
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-10 space-y-6">

            <div>
              <h3 className="font-semibold mb-3">Diet</h3>
              <div className="flex flex-wrap gap-3">
                {dietLabels.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDiet(d)}
                    className={`px-4 py-2 rounded-full`}
                    style={{
                      backgroundColor: selectedDiet === d ? "#60a5fa" : "#dbeafe",
                      color: selectedDiet === d ? "#ffffff" : "#000000"
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Cuisine</h3>
              <div className="flex flex-wrap gap-3">
                {cuisineTypes.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCuisine(c)}
                    className={`px-4 py-2 rounded-full`}
                    style={{
                      backgroundColor: selectedCuisine === c ? "#60a5fa" : "#dbeafe",
                      color: selectedCuisine === c ? "#ffffff" : "#000000"
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Health */}
            <div>
              <h3 className="font-semibold mb-3">Health Labels</h3>
              <div className="flex flex-wrap gap-3">
                {healthLabels
                  .slice(0, visibleHealthCount)
                  .map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleHealthLabel(label)}
                      className={`px-4 py-2 rounded-full text-sm`}
                      style={{
                        backgroundColor: selectedHealth.includes(label)
                          ? "#60a5fa"
                          : "#dbeafe",
                        color: selectedHealth.includes(label)
                          ? "#ffffff"
                          : "#000000"
                      }}
                    >
                      {label}
                    </button>
                  ))}
              </div>

              <div className="mt-4">
                {visibleHealthCount < healthLabels.length ? (
                  <button
                    onClick={() =>
                      setVisibleHealthCount((prev) => prev + 8)
                    }
                    className="text-blue-500 font-medium hover:underline"
                    style={{ color: "#3b82f6" }}
                  >
                    Show More...
                  </button>
                ) : (
                  <button
                    onClick={() => setVisibleHealthCount(8)}
                    className="text-blue-500 font-medium hover:underline"
                    style={{ color: "#3b82f6" }}
                  >
                    Show Less
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={applyFilters}
              className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:scale-105 transition"
              style={{ backgroundColor: "#bfdbfe" }}
            >
              Apply Filters
            </button>
          </div>
        )}

        {searchMeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {searchMeals.map((item) => (
              <div
                key={item.recipe.uri}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
                onClick={() => {
                  setDetails(item);
                  setModal(true);
                }}
              >
                <img
                  src={item.recipe.image}
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <h3 className="font-semibold text-lg">
                    {item.recipe.label}
                  </h3>
                  <p className="text-gray-500">
                    {Math.round(item.recipe.calories)} calories
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No meals found.</p>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {details.recipe?.label}
              </h2>
              <X onClick={() => setModal(false)} className="cursor-pointer" />
            </div>

            <img
              src={details.recipe?.image}
              className="w-full md:w-72 rounded-xl"
            />

            <button
              onClick={() => handleFavourites(details)}
              className="mt-6 bg-blue-200 px-6 py-2 rounded-lg hover:scale-105 transition"
              style={{ backgroundColor: "#bfdbfe" }}
            >
              Add to Favourites
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div className="fixed bottom-6 right-6 bg-white shadow-lg rounded-2xl px-6 py-4 flex items-center gap-4">
          {icon === "Check" ? (
            <CheckCircle size={30} />
          ) : (
            <AlertCircle size={30} />
          )}
          <p>{infoMsg}</p>
        </div>
      )}
    </div>
  );
}
