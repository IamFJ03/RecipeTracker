import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { useLocation } from "react-router-dom";

export default function Recipe() {
  const location = useLocation();
  const { meal } = location.state || {};
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    if (meal) {
      console.log(meal);
    }
  }, [meal]);

  const handleIngredientClick = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  if (!meal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <p className="text-lg sm:text-xl text-red-500 text-center px-4">
            No recipe data found. Please go back and select a meal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-10">

        <h1 className="text-3xl sm:text-4xl font-bold font-mono text-center lg:text-left mb-10">
          {meal.label}
        </h1>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-20">

          <div className="w-full lg:w-1/2 flex justify-center">
            <img
              src={meal.image}
              alt={meal.label}
              className="rounded-2xl w-full max-w-sm sm:max-w-md shadow-lg object-cover"
            />
          </div>

          <div className="w-full lg:w-1/2">
            <p className="text-2xl font-semibold font-mono mb-6">
              Meal Recipe Includes:
            </p>

            <div className="space-y-4">
              {meal.ingredients.map((i, index) => (
                <div
                  key={index}
                  onClick={() => handleIngredientClick(index)}
                  className="rounded-2xl px-5 py-3 cursor-pointer shadow-md transition-all duration-300 hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(to right, #bfdbfe, #ffffff)",
                  }}
                >
                  
                  <p className="font-semibold text-base sm:text-lg">
                    {i.text}
                  </p>

                  <div
                    className={`
                      overflow-hidden transition-all duration-500 ease-in-out
                      ${
                        expandedIndex === index
                          ? "max-h-96 mt-4 opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">

                      {i.image && (
                        <img
                          src={i.image}
                          alt={i.food}
                          className="h-24 w-24 rounded-2xl object-cover shadow-sm"
                        />
                      )}

                      <div className="font-mono text-sm sm:text-base text-center sm:text-left">
                        <div>
                          <span className="font-bold">Food: </span>
                          <span>{i.food}</span>
                        </div>

                        <div className="my-2">
                          <span className="font-bold">Category: </span>
                          <span>{i.foodCategory || "N/A"}</span>
                        </div>

                        <div>
                          <span className="font-bold">Weight: </span>
                          <span>{Math.round(i.weight)} g</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
