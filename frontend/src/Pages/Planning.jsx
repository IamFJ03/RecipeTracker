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
  <div
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    className={`fixed inset-0 z-50 flex items-end md:items-center md:justify-center transition-all duration-500 ${
      modal
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`}
  >
    <div
      className={`bg-white w-full md:w-[700px] max-h-[90vh] overflow-auto rounded-t-3xl md:rounded-2xl shadow-xl transform transition-transform duration-500 ${
        modal ? "scale-100" : "scale-0"
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-8 pt-8">
        <p className="font-bold font-mono text-2xl">
          Meal Details:
        </p>
        <X
          color="black"
          size={25}
          onClick={() => setModal(false)}
          className="cursor-pointer"
        />
      </div>

      {/* CONTENT */}
      <div className="flex md:flex-row flex-col items-center justify-between px-8 gap-10 py-8">
        {/* IMAGE */}
        <img
          src={details.recipe?.image}
          alt="meal"
          className="md:h-72 md:w-72 h-40 w-40 rounded-2xl"
        />

        {/* DETAILS */}
        <div className="font-mono text-lg w-full">
          <div>
            <span className="font-bold">Name: </span>
            <span>{details.recipe?.label}</span>
          </div>

          {/* DIETS */}
          <div className="flex flex-wrap items-center mt-5">
            <span className="font-bold mr-3">Diets:</span>
            {details.recipe?.dietLabels?.map((item, index) => (
              <p
                key={index}
                style={{ backgroundColor: "#BFDBFE" }}
                className="py-1 px-3 mr-3 my-2 rounded-2xl text-sm"
              >
                {item}
              </p>
            ))}
          </div>

          {/* MEAL TYPE */}
          <div className="mt-5">
            <span className="font-bold">Meal Type: </span>
            <span
              style={{ backgroundColor: "#BFDBFE" }}
              className="px-5 py-2 rounded-2xl text-sm"
            >
              {details.recipe?.mealType}
            </span>
          </div>

          {/* HEALTH LABELS */}
          <div className="flex flex-wrap my-5">
            <span className="font-bold mr-3">Health Labels:</span>
            {details.recipe?.healthLabels
              ?.slice(0, 10)
              .map((item, index) => (
                <p
                  key={index}
                  style={{ backgroundColor: "#BFDBFE" }}
                  className="py-1 px-3 mr-3 my-2 rounded-2xl text-sm"
                >
                  {item}
                </p>
              ))}
          </div>

          {/* ADD TO FAVOURITES BUTTON */}
          <div className="mt-6">
            <p
              style={{
                backgroundImage:
                  "linear-gradient(to right, #bfdbfe, white)",
              }}
              className="w-60 text-center rounded px-7 py-2 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-500 shadow-md"
              onClick={() => handleFavourites(details)}
            >
              Add to Favourites
            </p>
          </div>
        </div>
      </div>
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
