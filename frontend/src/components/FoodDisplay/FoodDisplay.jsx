import React, { useContext } from "react";
import { StoreContext } from "../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import "./FoodDisplay.css";

const FoodDisplay = ({ category }) => {
  const { foodList, url } = useContext(StoreContext);

  console.log("FoodList:", foodList);

  if (!foodList || foodList.length === 0) {
    return <p className="empty-food-message">No food items available.</p>;
  }

  return (
    <div className="food-display" id="food-display">
      <h3>Top Dishes near you</h3>
      <div className="food-display-list">
        {foodList.map((item, index) => {
          if (category === "All" || category === item.category) {
            return (
              <FoodItem
                key={index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={`${url}/images/${item.image}`}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;
