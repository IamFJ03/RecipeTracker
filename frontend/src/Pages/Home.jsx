import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";
import { useLocation } from "react-router-dom";

const MEALS_BATCH_SIZE = 4;

export default function Home() {
  const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
  const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

  const [foods, setFoods] = useState([]);
  const [trendFoods, setTrendFoods] = useState([]);
  const [visibleMeals, setVisibleMeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currIdx, setCurrIdx] = useState(0);
  const [modal, setModal] = useState(false);
  const [details, setDetails] = useState({});
  const [infoMsg, setInfoMsg] = useState("");
  const [msg, setMsg] = useState(false);
  const [icon, setIcon] = useState("");

  const { setFavourites, setAllMeals } = useCart();
  const { isLoggedIn } = useAuth();
  const location = useLocation();

useEffect(() => {
  const cached = localStorage.getItem("allMeals");

  if (cached) {
    const parsedMeals = JSON.parse(cached);

    setAllMeals(parsedMeals);

    const topFiveFoods = parsedMeals.slice(0, 8);
    const allFoods = parsedMeals.slice(8, 20);

    setFoods(allFoods);
    setTrendFoods(topFiveFoods);
    setVisibleMeals(allFoods.slice(0, MEALS_BATCH_SIZE));
    setIsLoading(false);
    return;
  }

  const fetchRecipes = async () => {
    try {
      const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${searchTerm}&app_id=${APP_ID}&app_key=${APP_KEY}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const fetchedRecipes = data.hits;

      setAllMeals(fetchedRecipes);
      localStorage.setItem("allMeals", JSON.stringify(fetchedRecipes));

      const topFiveFoods = fetchedRecipes.slice(0, 8);
      const allFoods = fetchedRecipes.slice(8, 20);

      setFoods(allFoods);
      setTrendFoods(topFiveFoods);
      setVisibleMeals(allFoods.slice(0, MEALS_BATCH_SIZE));
      setIsLoading(false);

    } catch (error) {
      console.error("API Call Failed:", error);
    }
  };

  fetchRecipes();
}, []);


useEffect(() => {
  if (trendFoods.length > 0) {
    const interval = setInterval(() => {
      setCurrIdx((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }
}, [trendFoods]);


// LOAD MORE
const hasMoreMeals = visibleMeals.length < foods.length;

const handleLoadMore = () => {
  const nextBatchStart = visibleMeals.length;
  const nextBatchEnd = nextBatchStart + MEALS_BATCH_SIZE;
  const nextBatch = foods.slice(nextBatchStart, nextBatchEnd);

  setVisibleMeals((prev) => [...prev, ...nextBatch]);
};


// VIEW DETAILS
const handleViewDetails = (item) => {
  setDetails(item);
  setModal(true);
  console.log(item);
};


// ADD TO FAVOURITES
const handleFavourites = async (item) => {
  if (!isLoggedIn) {
    setMsg(true);
    setInfoMsg("Login Required");
    setIcon("Alert");

    setTimeout(() => {
      setMsg(false);
    }, 5000);

    return;
  }

  setFavourites((prev) => [...prev, item]);
  console.log("Meal Added to Cart", item);

  const recipeTitle = item.recipe.text;
  const recipeImage = item.recipe.image;
  const recipeLabel = item.recipe.label;
  const recipeIngredients = item.recipe.ingredients;

  setTitle(recipeTitle);
  setImage(recipeImage);
  setLabel(recipeLabel);
  setIngredients(recipeIngredients);

  const res = await axios.post(
    "https://recipetracker-fg4e.onrender.com/api/cart/addtocart",
    {
      title: recipeTitle,
      image: recipeImage,
      label: recipeLabel,
      ingredients: recipeIngredients,
    },
    { withCredentials: true }
  );

  if (res.data.message === "Meal already present") {
    console.log("Meal Already Present");
    setInfoMsg("Meal Already in Favourites");
    setIcon("Alert");
  } else if (res.data.message === "Meal Added") {
    console.log("Meal Added Successfully", res.data.newRecipe);
    setInfoMsg("Meal Added to favourites");
    setIcon("Check");
  }

  setMsg(true);
  setTimeout(() => setMsg(false), 5000);
};


// MOUNT / UNMOUNT
useEffect(() => {
  console.log("HOME MOUNTED");
  return () => console.log("HOME UNMOUNTED");
}, []);



  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar foods={foods} />
      <HeroSection path={location.pathname} />

      {/* TRENDING */}
      <p className="text-3xl font-bold px-6 md:px-20 mb-8 py-10">
        Trending Recipes
      </p>

      <div
        className="py-16"
        style={{ background: "linear-gradient(to right, #bfdbfe, white)" }}
      >
        {!isLoading && (
          <div className="w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currIdx * 100}%)` }}
            >
              {trendFoods.map((item, index) => (
                <div key={index} className="min-w-full md:min-w-[25%] p-4">
                  <img
                    src={item.recipe.image}
                    className="rounded-2xl w-full h-60 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ALL MEALS */}
      <div className="px-6 md:px-20 py-10">
        <p className="text-3xl font-bold mb-10">All Meals</p>

        <div className="flex flex-col gap-10">
          {visibleMeals.map((food, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-6 md:gap-16 items-center"
            >
              <img
                src={food.recipe.image}
                className="w-60 h-60 rounded-2xl object-cover"
              />

              <div>
                <p className="text-2xl font-bold mb-3">
                  {food.recipe.label}
                </p>

                <p><b>Calories:</b> {Math.round(food.recipe.calories)}</p>
                <p><b>Cuisine:</b> {food.recipe.cuisineType?.join(", ")}</p>
                <p><b>Dish:</b> {food.recipe.dishType?.join(", ")}</p>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    onClick={() => handleViewDetails(food)}
                    className="px-6 py-2 rounded hover:scale-105 transition"
                    style={{ backgroundColor: "#bfdbfe" }}
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleFavourites(food)}
                    className="px-6 py-2 rounded hover:scale-105 transition"
                    style={{ backgroundColor: "#bfdbfe" }}
                  >
                    Add to Favourites
                  </button>
                </div>
              </div>
            </div>
          ))}

          {hasMoreMeals && (
            <p
              onClick={handleLoadMore}
              className="text-gray-500 cursor-pointer"
            >
              Load More...
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <p className="text-2xl font-bold">Meal Details</p>
              <X
                size={25}
                className="cursor-pointer"
                onClick={() => setModal(false)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <img
                src={details.recipe?.image}
                className="w-60 h-60 rounded-2xl object-cover"
              />

              <div>
                <p><b>Name:</b> {details.recipe?.label}</p>

                <div className="mt-4">
                  <b>Diets:</b>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {details.recipe?.dietLabels?.map((item, i) => (
                      <span
                        key={i}
                        style={{ backgroundColor: "#bfdbfe" }}
                        className="px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <b>Health Labels:</b>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {details.recipe?.healthLabels
                      ?.slice(0, 8)
                      .map((item, i) => (
                        <span
                          key={i}
                          style={{ backgroundColor: "#bfdbfe" }}
                          className="px-3 py-1 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}
      {msg && (
        <div className="fixed bottom-5 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0 bg-white w-[90%] md:w-96 h-20 rounded-2xl shadow flex items-center transition-all duration-300">
          {icon === "Check" ? (
            <CheckCircle size={30} className="mx-4 text-green-500" />
          ) : (
            <AlertCircle size={30} className="mx-4 text-red-500" />
          )}
          <p className="font-mono">{infoMsg}</p>
        </div>
      )}
    </div>
  );
}
