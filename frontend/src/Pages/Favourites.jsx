import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';
import HeroSection from '../Components/HeroSection';
import { useCart } from '../Context/CartContext';
import { useAuth } from '../Context/AuthContext';
import { X, Trash2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Favourites() {

  const [meals, setMeals] = useState([]);
  const [modal, setModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState({});
  const [msg, setMsg] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  const { favourites } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {

    const loadCart = async () => {
      if (!isLoggedIn) {
        setMeals([]);
        return;
      }

      try {
        const res = await axios.get(
          "https://recipetracker-fg4e.onrender.com/api/cart/fetchcart",
          { withCredentials: true }
        );

        if (res.data.message === "meals found") {
          setMeals(res.data.cartInfo);
        }

      } catch (e) {
        console.log("Error fetching cart", e);
      }
    };

    loadCart();

  }, [favourites, isLoggedIn]);

  const handleModal = (item) => {
    setSelectedMeal(item);
    setModal(true);
  };

  const handleProceed = async () => {

    try {
      const res = await axios.post(
        "https://recipetracker-fg4e.onrender.com/api/recipe/updateAccess",
        {},
        { withCredentials: true }
      );

      if (res.data.message === "Access to free meal recipe reached its limit") {
        setInfoMsg("You need Premium Subscription to view more recipes.");
        setMsg(true);
        setModal(false);
        setTimeout(() => setMsg(false), 4000);
        return;
      }

      if (res.data.message === "User Access Granted") {
        navigate('/recipe', {
          state: { meal: selectedMeal }
        });
        setModal(false);
        setSelectedMeal({});
      }

    } catch (e) {
      console.log("Error updating access", e);
    }
  };

  const handleRemove = async (label) => {
    try {
      const res = await axios.delete(
        "https://recipetracker-fg4e.onrender.com/api/cart/deleteMeal",
        {
          data: { label },
          withCredentials: true
        }
      );

      if (res.data.message === "Meal Removed") {
        setMeals(prev => prev.filter(item => item.label !== label));
      }

    } catch (e) {
      console.log("Error removing meal", e);
    }
  };

  const pathname = window.location.pathname;

  return (
    <div className="min-h-screen overflow-x-hidden">

      <Navbar />
      <HeroSection path={pathname} />

      <div className="px-6 md:px-20 mt-10">
        <p className="text-2xl font-semibold mb-8">Favourites:</p>

        {meals.length > 0 ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {meals.map((item, index) => (
              <div
                key={index}
                className="shadow-lg rounded-2xl overflow-hidden"
                style={{ background: "linear-gradient(to right, #bfdbfe, white)" }}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-48 object-cover hover:scale-105 transition duration-500"
                />

                <div className="p-4">
                  <p className="text-lg font-bold mb-4">
                    {item.label}
                  </p>

                  <div className="flex justify-between items-center">
                    <Trash2
                      size={22}
                      className="cursor-pointer"
                      onClick={() => handleRemove(item.label)}
                    />

                    <button
                      onClick={() => handleModal(item)}
                      className="bg-blue-300 px-4 py-1 rounded hover:scale-105 transition"
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}

          </div>

        ) : (
          <p className="text-gray-400 text-lg">
            No Meals added in favourites yet...
          </p>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] md:w-[450px] p-6 rounded-2xl shadow-lg relative">

            <X
              size={22}
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setModal(false)}
            />

            <p className="text-lg font-bold mt-4 mb-4 text-center">
              Are you sure you want to proceed?
            </p>

            <p className="text-sm text-gray-600 text-center mb-6">
              You are using 1 of your 3 free recipe accesses.
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => setModal(false)}
                className="px-4 py-1 bg-gray-200 rounded hover:scale-105 transition"
                style={{ backgroundColor: "#93C5FD" }}

              >
                Cancel
              </button>

              <button
                onClick={handleProceed}
                className="px-4 py-1  rounded hover:scale-105 transition"
                style={{ backgroundColor: "#93C5FD" }}

              >
                Proceed
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOAST */}
      <div
        className={`fixed bottom-5 right-1/2 translate-x-1/2 md:right-10 md:translate-x-0 bg-white w-[90%] md:w-96 p-4 rounded-2xl shadow-lg flex items-center transition-all duration-300 ${msg ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <AlertCircle size={30} className="mr-4" />
        <p className="text-sm md:text-base">{infoMsg}</p>
      </div>

    </div>
  );
}
