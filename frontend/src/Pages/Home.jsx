import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../Components/Navbar';
import HeroSection from '../Components/HeroSection';
import Food1 from '../assets/Food1.jpg';
import { FaUserGear, FaBowlFood, FaPlateWheat } from "react-icons/fa6";
import { X, CheckCircle, BookmarkPlus, AlertCircle } from 'lucide-react';
import { useCart } from '../Context/CartContext';
import { useAuth } from "../Context/AuthContext";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const MEALS_BATCH_SIZE = 4;

export default function Home() {

  const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
  const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;

  const searchTerm = 'recipe';

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

  // FETCH RECIPES
  useEffect(() => {
    const cached = localStorage.getItem("allMeals");
    if (cached) {
      const parsedMeals = JSON.parse(cached);
      setAllMeals(parsedMeals);

      const trending = parsedMeals.slice(0, 8);
      const meals = parsedMeals.slice(8, 20);

      setTrendFoods(trending);
      setFoods(meals);
      setVisibleMeals(meals.slice(0, MEALS_BATCH_SIZE));
      setIsLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      try {
        const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${searchTerm}&app_id=${APP_ID}&app_key=${APP_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        const fetched = data.hits;
        localStorage.setItem("allMeals", JSON.stringify(fetched));
        setAllMeals(fetched);

        const trending = fetched.slice(0, 8);
        const meals = fetched.slice(8, 20);

        setTrendFoods(trending);
        setFoods(meals);
        setVisibleMeals(meals.slice(0, MEALS_BATCH_SIZE));
        setIsLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecipes();
  }, []);

  // TREND SLIDER AUTO
  useEffect(() => {
    if (trendFoods.length > 0) {
      const interval = setInterval(() => {
        setCurrIdx(prev => (prev + 1) % trendFoods.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [trendFoods]);

  const handleLoadMore = () => {
    const next = foods.slice(
      visibleMeals.length,
      visibleMeals.length + MEALS_BATCH_SIZE
    );
    setVisibleMeals(prev => [...prev, ...next]);
  };

  const handleViewDetails = (item) => {
    setDetails(item);
    setModal(true);
  };

  const handleFavourites = async (item) => {
    if (!isLoggedIn) {
      setIcon("Alert");
      setInfoMsg("Login Required");
      setMsg(true);
      setTimeout(() => setMsg(false), 3000);
      return;
    }

    setFavourites(prev => [...prev, item]);

    const { label, image, ingredients } = item.recipe;

    try {
      const res = await axios.post(
        "https://recipetracker-fg4e.onrender.com/api/cart/addtocart",
        { title: label, image, ingredients },
        { withCredentials: true }
      );

      if (res.data.message === "Meal Added") {
        setIcon("Check");
        setInfoMsg("Meal Added to Favourites");
      } else {
        setIcon("Alert");
        setInfoMsg("Meal Already Present");
      }

      setMsg(true);
      setTimeout(() => setMsg(false), 3000);

    } catch (err) {
      console.error(err);
    }
  };

  const hasMoreMeals = visibleMeals.length < foods.length;

  return (
    <div className="min-h-screen overflow-x-hidden">

      <Navbar foods={foods} />
      <HeroSection path={location.pathname} />
      <p className="text-3xl font-bold px-6 md:px-20 mb-8 py-10">
        Trending Recipes
      </p>
      <div className="py-16" style={{ background: "linear-gradient(to right, #bfdbfe, white)" }}>

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

      <div className="px-6 md:px-20 py-10">
        <p className="text-3xl font-bold mb-10">All Meals</p>

        {!isLoading && (
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
                  <p><b>Cuisine:</b> {food.recipe.cuisineType}</p>
                  <p><b>Dish:</b> {food.recipe.dishType}</p>

                  <div className="flex flex-col gap-3 mt-4">
                    <button
                      onClick={() => handleViewDetails(food)}
                      style={{ backgroundColor: "#bfdbfe" }}
                      className=" px-6 py-2 rounded hover:scale-105 transition"
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
        )}
      </div>


      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[70%] max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Meal Details</h2>
              <X onClick={() => setModal(false)} className="cursor-pointer" />
            </div>

            <img
              src={details.recipe?.image}
              className="w-full md:w-80 rounded-2xl mb-6"
            />

            <p><b>Name:</b> {details.recipe?.label}</p>
            <p><b>Meal Type:</b> {details.recipe?.mealType}</p>
            <p><b>Diets:</b> {details.recipe?.dietLabels.join(", ")}</p>
          </div>
        </div>
      )}

      {/* TOAST */}
      <div
        className={`fixed bottom-5 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0 bg-white w-[90%] md:w-96 h-20 rounded-2xl shadow flex items-center transition-all duration-300 ${msg ? 'opacity-100' : 'opacity-0'
          }`}
      >
        {icon === "Check" ? (
          <CheckCircle size={30} className="mx-4" />
        ) : (
          <AlertCircle size={30} className="mx-4" />
        )}
        <p className="font-mono">{infoMsg}</p>
      </div>

    </div>
  );
}
