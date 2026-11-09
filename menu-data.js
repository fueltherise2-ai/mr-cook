// ==========================================================
// Mr. Cook - Official Menu Data
// Location: Pakistan | Phone: 03144108033 | WhatsApp: 923144108033
// 100% Accurate Base Prices, Authentic Images & Full Customization Options
// ==========================================================

const OFFICIAL_MENU_DATA = [
  // --------------------------------------------------------
  // 1. Exclusive Deals
  // --------------------------------------------------------
  {
    id: "deals",
    name: "Exclusive Deals",
    badge: "Special Bundles",
    items: [
      {
        id: "deal-1",
        name: "Deal 1",
        price: "Rs. 2,677.50",
        numPrice: 2677.50,
        desc: "8 zinger burgers, french fries & 2.25 ltr soft drink",
        img: "./images/deal-1.jpg",
        tag: "Mega Saver",
        options: {
          drink: ["Pepsi 2.25 Ltr", "7Up 2.25 Ltr", "Mirinda 2.25 Ltr", "Mountain Dew 2.25 Ltr"],
          spice: ["Regular Crispy", "Spicy Zinger 🔥", "Half & Half (4 Mild / 4 Spicy)"],
          addOns: [
            { name: "Extra Large Fries", price: 200 },
            { name: "Extra Dip Sauce Set", price: 90 }
          ]
        }
      },
      {
        id: "deal-2",
        name: "Deal 2",
        price: "Rs. 2,125.00",
        numPrice: 2125.00,
        desc: "5 zinger burgers, 5 wings, small fries & 1.5 ltr soft drink",
        img: "./images/deal-2.jpg",
        tag: "Family Feast",
        options: {
          drink: ["Pepsi 1.5 Ltr", "7Up 1.5 Ltr", "Mirinda 1.5 Ltr"],
          wingsFlavor: ["Crispy Fried Wings", "Honey Glazed Wings", "Chili Spicy Wings"],
          spice: ["Crispy Mild", "Spicy Zinger"],
          addOns: [
            { name: "Add Cheese to Burgers (5x)", price: 200 },
            { name: "Garlic Mayo Dip", price: 60 }
          ]
        }
      },
      {
        id: "deal-3",
        name: "Deal 3",
        price: "Rs. 1,402.50",
        numPrice: 1402.50,
        desc: "4 zinger burgers, small fries & 1.5 ltr soft drink",
        img: "./images/deal-3.jpg",
        tag: "Popular Deal",
        options: {
          drink: ["Pepsi 1.5 Ltr", "7Up 1.5 Ltr", "Mirinda 1.5 Ltr"],
          spice: ["Crispy Mild", "Spicy Zinger 🔥", "Half & Half (2 Mild / 2 Spicy)"],
          addOns: [
            { name: "Extra Small Fries", price: 150 },
            { name: "Chili Garlic Dip", price: 50 }
          ]
        }
      },
      {
        id: "deal-4",
        name: "Deal 4",
        price: "Rs. 1,105.00",
        numPrice: 1105.00,
        desc: "3 zinger burgers, small fries & 1 ltr soft drink",
        img: "./images/deal-4.jpg",
        tag: "Budget Combo",
        options: {
          drink: ["Pepsi 1.0 Ltr", "7Up 1.0 Ltr", "Mirinda 1.0 Ltr"],
          spice: ["Crispy Mild", "Spicy Zinger"],
          addOns: [
            { name: "Add Cheese Slice (3x)", price: 120 },
            { name: "Signature Garlic Dip", price: 60 }
          ]
        }
      }
    ]
  },

  // --------------------------------------------------------
  // 2. New on Mr. Cook
  // --------------------------------------------------------
  {
    id: "new-on-mr-cook",
    name: "New on Mr. Cook",
    badge: "Chef's Specials",
    items: [
      {
        id: "new-1",
        name: "Chicken Steak Tarragon",
        price: "Rs. 1,020.00",
        numPrice: 1020.00,
        desc: "Grilled chicken fillet topped with a smooth, creamy white tarragon sauce",
        img: "./images/steak-tarragon.jpg",
        tag: "Chef Special",
        options: {
          side: ["Mashed Potatoes & Sautéed Veggies", "Crispy French Fries & Sautéed Veggies", "Steamed Rice & Veggies"],
          addOns: [
            { name: "Extra Tarragon Sauce", price: 120 },
            { name: "Melted Cheese Top", price: 100 }
          ]
        }
      },
      {
        id: "new-2",
        name: "Alfredo Pasta",
        price: "Rs. 680.00",
        numPrice: 680.00,
        desc: "Indulge in our creamy, cheesy Alfredo Pasta, a rich and comforting classic",
        img: "./images/pasta-alfredo.jpg",
        tag: "Italian Classic",
        options: {
          pastaType: ["Fettuccine", "Penne"],
          style: ["Classic Creamy White Sauce", "Spicy Garlic Herb White Sauce"],
          addOns: [
            { name: "Extra Grilled Chicken Fillet", price: 150 },
            { name: "Extra Parmesan Cheese", price: 90 },
            { name: "Garlic Bread (2 Slices)", price: 120 }
          ]
        }
      },
      {
        id: "new-3",
        name: "Moroccan Pasta",
        price: "Rs. 595.00",
        numPrice: 595.00,
        desc: "Pasta tossed in a rich, spiced tomato-based sauce infused with Moroccan herbs, garlic, and a hint of spice",
        img: "./images/pasta-moroccan.jpg",
        tag: "Spiced & Saucy",
        options: {
          spice: ["Authentic Moroccan Medium", "Spicy Fiery Moroccan 🔥"],
          addOns: [
            { name: "Extra Grilled Chicken Chunks", price: 140 },
            { name: "Black Olives & Jalapenos", price: 70 },
            { name: "Garlic Bread (2 Slices)", price: 120 }
          ]
        }
      },
      {
        id: "new-4",
        name: "Moroccan Steak",
        price: "Rs. 1,530.00",
        numPrice: 1530.00,
        desc: "Juicy chicken steak seasoned with authentic Moroccan spices and delicious mushroom sauce",
        img: "./images/steak-moroccan.jpg",
        tag: "Signature Steak",
        options: {
          side: ["Mashed Potatoes & Sautéed Veggies", "French Fries & Veggies", "Moroccan Herb Rice"],
          sauce: ["Signature Mushroom Sauce", "Spicy Moroccan Pepper Sauce"],
          addOns: [
            { name: "Extra Mushroom Sauce", price: 130 },
            { name: "Double Grilled Fillet", price: 400 }
          ]
        }
      },
      {
        id: "new-5",
        name: "Stuffed Chicken",
        price: "Rs. 680.00",
        numPrice: 680.00,
        desc: "Tender chicken breast stuffed with creamy goodness and herbs",
        img: "./images/stuffed-chicken.jpg",
        tag: "Gourmet",
        options: {
          side: ["Crispy Fries & Fresh Salad", "Mashed Potatoes & Steamed Veggies"],
          addOns: [
            { name: "Creamy Garlic Cheese Dip", price: 80 },
            { name: "Garlic Bread Slice", price: 60 }
          ]
        }
      }
    ]
  },

  // --------------------------------------------------------
  // 3. Mr Zinger Burgers & Burgers
  // --------------------------------------------------------
  {
    id: "burgers",
    name: "Mr Zinger Burgers & Burgers",
    badge: "Crispy & Cheesy",
    items: [
      {
        id: "burger-1",
        name: "Zinger Burger",
        price: "Rs. 323.00",
        numPrice: 323.00,
        desc: "A well-seasoned, fried chicken fillet with a special sauce and cheese inside a fluffy Brioche bun",
        img: "./images/burger-zinger.jpg",
        tag: "Bestseller",
        options: {
          spice: ["Crispy Mild", "Spicy Zinger 🔥"],
          sauce: ["Special Secret Sauce", "Garlic Mayo Sauce", "Spicy Chipotle"],
          addOns: [
            { name: "Extra Cheese Slice", price: 45 },
            { name: "Small Fries", price: 120 },
            { name: "Cold Drink Can (250ml)", price: 90 }
          ]
        }
      },
      {
        id: "burger-2",
        name: "Zinger Burger with Cheese",
        price: "Rs. 365.50",
        numPrice: 365.50,
        desc: "Crispy chicken fillet topped with spicy mayo and lettuce enclosed in a soft bun",
        img: "./images/burger-zinger-cheese.jpg",
        tag: "Cheesy Zinger",
        options: {
          spice: ["Crispy Mild", "Spicy Zinger 🔥"],
          addOns: [
            { name: "Double Cheese Slice", price: 45 },
            { name: "Fries & Drink Combo", price: 190 }
          ]
        }
      },
      {
        id: "burger-3",
        name: "Zinger Burger with Wings",
        price: "Rs. 365.50",
        numPrice: 365.50,
        desc: "Classic signature crispy burger served with delicious crispy chicken wings",
        img: "./images/burger-zinger-wings.jpg",
        tag: "Combo Hit",
        options: {
          wingsStyle: ["Crispy Wings", "Spicy Chili Wings"],
          spice: ["Mild", "Spicy"],
          addOns: [
            { name: "Add Cheese Slice", price: 45 },
            { name: "Dip Sauce Cup", price: 50 }
          ]
        }
      },
      {
        id: "burger-4",
        name: "Zinger Burger with Wings & Cheese",
        price: "Rs. 416.50",
        numPrice: 416.50,
        desc: "Crispy chicken topped with cheese, enclosed in a soft bun and served with a side of delicious wings",
        img: "./images/burger-zinger-wings-cheese.jpg",
        tag: "Loaded",
        options: {
          spice: ["Mild Crispy", "Spicy Hot"],
          addOns: [
            { name: "Extra Garlic Dip", price: 50 },
            { name: "French Fries", price: 120 }
          ]
        }
      },
      {
        id: "burger-5",
        name: "Double Decker Zinger Burger with Wings",
        price: "Rs. 654.50",
        numPrice: 654.50,
        desc: "Double decker zinger burger paired with crispy chicken wings and served with our special dips",
        img: "./images/burger-double-decker-wings.jpg",
        tag: "Double Feast",
        options: {
          spice: ["Double Crispy Mild", "Double Spicy 🔥"],
          addOns: [
            { name: "Add Cheese Slice", price: 45 },
            { name: "Soft Drink Can", price: 90 }
          ]
        }
      },
      {
        id: "burger-6",
        name: "Double Decker Zinger Burger with Wings & Cheese",
        price: "Rs. 680.00",
        numPrice: 680.00,
        desc: "Cheesy double decker zinger burger paired with crispy chicken wings, and served with dips",
        img: "./images/burger-double-decker-wings-cheese.jpg",
        tag: "Super Cheesy",
        options: {
          spice: ["Crispy Mild", "Hot & Spicy"],
          addOns: [
            { name: "Large Fries Basket", price: 180 },
            { name: "Garlic Mayo Sauce", price: 50 }
          ]
        }
      },
      {
        id: "burger-7",
        name: "Double Decker Zinger Burger",
        price: "Rs. 552.50",
        numPrice: 552.50,
        desc: "Delicious burger that satisfies your crunchy burger cravings",
        img: "./images/burger-double-decker.jpg",
        tag: "Double Fillet",
        options: {
          spice: ["Crispy Mild", "Spicy Zinger 🔥"],
          addOns: [
            { name: "Cheese Slice", price: 45 },
            { name: "Jalapenos Top", price: 40 },
            { name: "French Fries", price: 120 }
          ]
        }
      },
      {
        id: "burger-8",
        name: "Chicken Tikka Burger",
        price: "Rs. 255.00",
        numPrice: 255.00,
        desc: "Roasted chicken fillet, with a side of cucumber, tomatoes and lettuces, topped with our secret sauce",
        img: "./images/burger-chicken-tikka.jpg",
        tag: "Desi Classic",
        options: {
          sauce: ["Secret Tikka Sauce", "Creamy Mint Mayo"],
          addOns: [
            { name: "Add Cheese Slice", price: 45 },
            { name: "Regular Fries", price: 120 }
          ]
        }
      },
      {
        id: "burger-9",
        name: "Chicken Tikka Burger with Cheese",
        price: "Rs. 297.50",
        numPrice: 297.50,
        desc: "Tender chicken tikka, creamy sauce, some cheese, and fresh veggies, all packed in a soft bun",
        img: "./images/burger-chicken-tikka-cheese.jpg",
        tag: "Tikka & Cheese",
        options: {
          sauce: ["Creamy Tikka Sauce", "Spicy Desi Sauce"],
          addOns: [
            { name: "Extra Cheese Slice", price: 45 },
            { name: "Cold Drink Can", price: 90 }
          ]
        }
      },
      {
        id: "burger-10",
        name: "Grilled Burger",
        price: "Rs. 297.50",
        numPrice: 297.50,
        desc: "Enjoy the smoky goodness of our Grilled Burger - juicy, perfectly grilled patty topped with fresh veggies",
        img: "./images/burger-grilled.jpg",
        tag: "Smoky Grilled",
        options: {
          patty: ["Grilled Chicken Breast", "Smoky Beef Patty"],
          sauce: ["Smoky BBQ Sauce", "Garlic Herb Sauce"],
          addOns: [
            { name: "Melted Cheese Slice", price: 45 },
            { name: "Caramelized Grilled Onions", price: 40 }
          ]
        }
      },
      {
        id: "burger-11",
        name: "Pizza Burger",
        price: "Rs. 297.50",
        numPrice: 297.50,
        desc: "Combine the best of both worlds in a fusion of Pizza and Burger",
        img: "./images/burger-pizza.jpg",
        tag: "Pizza Fusion",
        options: {
          style: ["Mozzarella & Pepperoni Fusion", "Tandoori Chicken Pizza Fusion"],
          addOns: [
            { name: "Extra Mozzarella Pull", price: 60 },
            { name: "Black Olives & Jalapenos", price: 40 }
          ]
        }
      }
    ]
  },

  // --------------------------------------------------------
  // 4. Pizzas (Small, Medium, Large size selection in Modal)
  // --------------------------------------------------------
  {
    id: "pizzas",
    name: "Pizzas",
    badge: "Fresh Baked • All Sizes",
    items: [
      {
        id: "pizza-1",
        name: "Mr Cook Special Pizza",
        price: "from Rs. 552.50",
        numPrice: 552.50,
        desc: "If you taste what is cooking you will not be able to resist finishing it",
        img: "./images/pizza-special.jpg",
        tag: "House Special",
        options: {
          size: [
            { label: "Small (7\")", price: 552.50 },
            { label: "Medium (10\")", price: 1020.00 },
            { label: "Large (13\")", price: 1487.50 }
          ],
          crust: ["Pan Crust (Standard)", "Thin & Crispy Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Mozzarella Cheese", price: 120 },
            { name: "Extra Meat Topping", price: 140 },
            { name: "Garlic Dip Sauce", price: 60 }
          ]
        }
      },
      {
        id: "pizza-2",
        name: "Chicken Tikka Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "Infusion of smoky bbq & desi spices that give a very unique and savory taste",
        img: "./images/pizza-chicken-tikka.jpg",
        tag: "Desi Favorite",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Chicken Tikka Chunks", price: 120 },
            { name: "Extra Cheese", price: 100 }
          ]
        }
      },
      {
        id: "pizza-3",
        name: "Chicken Fajita Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "A blend of various flavor profiles that come in sync to produce a vibrant taste",
        img: "./images/pizza-chicken-fajita.jpg",
        tag: "Vibrant Flavor",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Bell Peppers & Onions", price: 60 },
            { name: "Extra Mozzarella", price: 100 }
          ]
        }
      },
      {
        id: "pizza-4",
        name: "Chicken BBQ Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "A perfect blend of tender chicken, smoky BBQ sauce, and melted cheese",
        img: "./images/pizza-chicken-bbq.jpg",
        tag: "Smoky BBQ",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra BBQ Sauce Drizzle", price: 50 },
            { name: "Extra Smoked Chicken", price: 120 }
          ]
        }
      },
      {
        id: "pizza-5",
        name: "Arabian Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "Spice up your meal with our Arabian Pizza - topped with savoury spiced meats, fresh veggies",
        img: "./images/pizza-arabian.jpg",
        tag: "Arabian Touch",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Spiced Meat", price: 120 },
            { name: "Black Olives", price: 60 }
          ]
        }
      },
      {
        id: "pizza-6",
        name: "Chicken Supreme Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "Pizza topped with tandoori chicken, jalapenos, onions & mushrooms",
        img: "./images/pizza-chicken-supreme.jpg",
        tag: "Supreme",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Mushrooms & Jalapenos", price: 80 },
            { name: "Extra Cheese", price: 100 }
          ]
        }
      },
      {
        id: "pizza-7",
        name: "Vegetable Pizza",
        price: "from Rs. 467.50",
        numPrice: 467.50,
        desc: "Pizza loaded with fresh veggies, savoury sauce, and melted cheese on a crisp crust",
        img: "./images/pizza-vegetable.jpg",
        tag: "Veggie Fresh",
        options: {
          size: [
            { label: "Small (7\")", price: 467.50 },
            { label: "Medium (10\")", price: 850.00 },
            { label: "Large (13\")", price: 1232.50 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Black Olives", price: 60 },
            { name: "Extra Sweet Corn", price: 60 }
          ]
        }
      },
      {
        id: "pizza-8",
        name: "Cheese Lover Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "A pizza so good that it drips with cheese",
        img: "./images/pizza-cheese-lover.jpg",
        tag: "Triple Cheese",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Mozzarella & Cheddar", price: 130 },
            { name: "Garlic Butter Crust Brush", price: 50 }
          ]
        }
      },
      {
        id: "pizza-9",
        name: "Garlic Chili Pizza",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "A perfect kick of garlic and chili, topped with melted cheese and savory toppings",
        img: "./images/pizza-garlic-chili.jpg",
        tag: "Spicy Garlic",
        options: {
          size: [
            { label: "Small (7\")", price: 510.00 },
            { label: "Medium (10\")", price: 935.00 },
            { label: "Large (13\")", price: 1360.00 }
          ],
          crust: ["Pan Crust", "Thin Crust", "Cheese Stuffed Crust (+Rs. 150)"],
          addOns: [
            { name: "Extra Garlic Dip", price: 50 },
            { name: "Spicy Red Chili Flakes Cup", price: 30 }
          ]
        }
      }
    ]
  },

  // --------------------------------------------------------
  // 5. Shawarma & Paratha Rolls
  // --------------------------------------------------------
  {
    id: "shawarma-rolls",
    name: "Shawarma & Paratha Rolls",
    badge: "Wraps & Platters",
    items: [
      {
        id: "roll-1",
        name: "Chicken Shawarma",
        price: "from Rs. 127.50",
        numPrice: 127.50,
        desc: "Tender chicken wrapped in warm pita bread, topped with fresh veggies and creamy sauce",
        img: "./images/shawarma-chicken.jpg",
        tag: "Classic Wrap",
        options: {
          size: [
            { label: "Regular Pita Wrap", price: 127.50 },
            { label: "Jumbo Pita Wrap", price: 178.50 }
          ],
          sauce: ["Garlic White Sauce", "Spicy Tahini Sauce"],
          addOns: [
            { name: "Add Cheese", price: 35 },
            { name: "Extra Pickles & Olives", price: 30 }
          ]
        }
      },
      {
        id: "roll-2",
        name: "Chicken Shawarma with Cheese",
        price: "from Rs. 153.00",
        numPrice: 153.00,
        desc: "Succulent chicken, creamy sauce and rich cheese in pita bread",
        img: "./images/shawarma-chicken-cheese.jpg",
        tag: "Cheesy Shawarma",
        options: {
          size: [
            { label: "Regular Cheesy Wrap", price: 153.00 },
            { label: "Jumbo Cheesy Wrap", price: 212.50 }
          ],
          addOns: [
            { name: "Extra Cheese", price: 35 },
            { name: "Garlic Mayo Sauce Dip", price: 40 }
          ]
        }
      },
      {
        id: "roll-3",
        name: "Shawarma Platter",
        price: "Rs. 340.00",
        numPrice: 340.00,
        desc: "Signature lebanese inspired shawarma packed with flavor",
        img: "./images/shawarma-platter.jpg",
        tag: "Platter Meal",
        options: {
          style: ["Authentic Lebanese Style", "Spicy Shawarma Style"],
          addOns: [
            { name: "Extra Pita Bread (2 Pcs)", price: 60 },
            { name: "Extra Garlic Dip", price: 50 },
            { name: "French Fries", price: 100 }
          ]
        }
      },
      {
        id: "roll-4",
        name: "Shawarma Platter with Cheese",
        price: "Rs. 382.50",
        numPrice: 382.50,
        desc: "Signature cheesy lebanese inspired shawarma packed with flavour",
        img: "./images/shawarma-platter-cheese.jpg",
        tag: "Cheesy Platter",
        options: {
          addOns: [
            { name: "Extra Melted Cheese", price: 60 },
            { name: "Extra Pita Bread", price: 60 }
          ]
        }
      },
      {
        id: "roll-5",
        name: "Zinger Shawarma",
        price: "Rs. 297.50",
        numPrice: 297.50,
        desc: "Crispy zinger pieces, wrapped inside a soft pita, topped with olives, pickles and sauces",
        img: "./images/shawarma-zinger.jpg",
        tag: "Crispy Shawarma",
        options: {
          spice: ["Crispy Mild", "Spicy Hot 🔥"],
          addOns: [
            { name: "Add Cheese Slice", price: 40 },
            { name: "Garlic Mayo Sauce", price: 40 }
          ]
        }
      },
      {
        id: "roll-6",
        name: "Zinger Shawarma with Cheese",
        price: "Rs. 340.00",
        numPrice: 340.00,
        desc: "Zinger pieces, topped with hummus, pickles, olives, lettuce and cheese wrapped in a charred pita",
        img: "./images/shawarma-zinger-cheese.jpg",
        tag: "Zinger & Cheese",
        options: {
          spice: ["Mild", "Spicy"],
          addOns: [
            { name: "Extra Cheese", price: 40 },
            { name: "French Fries Side", price: 100 }
          ]
        }
      },
      {
        id: "roll-7",
        name: "Chicken Achari Shawarma",
        price: "Rs. 136.00",
        numPrice: 136.00,
        desc: "Spiced chicken marinated in achari flavours, wrapped in soft pita bread with fresh veggies",
        img: "./images/shawarma-achari.jpg",
        tag: "Achari Tangy",
        options: {
          spice: ["Medium Achari", "Spicy Achari 🔥"],
          addOns: [
            { name: "Add Cheese", price: 35 }
          ]
        }
      },
      {
        id: "roll-8",
        name: "Vegetable Shawarma",
        price: "Rs. 85.00",
        numPrice: 85.00,
        desc: "Fresh, crispy veggies wrapped in soft pita bread with a creamy sauce and aromatic spices",
        img: "./images/shawarma-veg.jpg",
        tag: "Pure Veg",
        options: {
          sauce: ["Creamy Garlic Sauce", "Tangy Mint Sauce"],
          addOns: [
            { name: "Add Cheese", price: 35 },
            { name: "Black Olives", price: 25 }
          ]
        }
      },
      {
        id: "roll-9",
        name: "Chicken BBQ Shawarma",
        price: "from Rs. 153.00",
        numPrice: 153.00,
        desc: "Tender chicken marinated in BBQ spices, grilled to perfection, and wrapped in a warm shawarma roll",
        img: "./images/shawarma-bbq.jpg",
        tag: "Smoky BBQ",
        options: {
          size: [
            { label: "Regular BBQ Wrap", price: 153.00 },
            { label: "Jumbo BBQ Wrap", price: 212.50 }
          ],
          addOns: [
            { name: "Add Cheese", price: 35 },
            { name: "BBQ Sauce Cup", price: 40 }
          ]
        }
      },
      {
        id: "roll-10",
        name: "Chicken Paratha Roll",
        price: "Rs. 255.00",
        numPrice: 255.00,
        desc: "Why wait to order this, you'll be amazed at how this tastes",
        img: "./images/roll-chicken.jpg",
        tag: "Crispy Paratha",
        options: {
          chutney: ["Mint Green Chutney", "Garlic Mayo Chutney", "Tangy Imli Chutney"],
          addOns: [
            { name: "Cheese Slice", price: 42 },
            { name: "Extra Chicken Boti", price: 80 }
          ]
        }
      },
      {
        id: "roll-11",
        name: "Chicken Paratha Roll with Cheese",
        price: "Rs. 297.50",
        numPrice: 297.50,
        desc: "An on-the-go cheesy snack that is fulfilling and packed with deliciousness",
        img: "./images/roll-chicken-cheese.jpg",
        tag: "Cheesy Paratha",
        options: {
          chutney: ["Mint Garlic Chutney", "Spicy Mayo"],
          addOns: [
            { name: "Double Cheese", price: 42 },
            { name: "Fries Side", price: 100 }
          ]
        }
      },
      {
        id: "roll-12",
        name: "Zinger Paratha Roll",
        price: "Rs. 297.50",
        numPrice: 297.50,
        desc: "The perfect night out gets even better with this",
        img: "./images/roll-zinger.jpg",
        tag: "Zinger Roll",
        options: {
          spice: ["Crispy Mild", "Spicy Zinger 🔥"],
          addOns: [
            { name: "Cheese Slice", price: 42 },
            { name: "Garlic Mayo Dip", price: 40 }
          ]
        }
      },
      {
        id: "roll-13",
        name: "Zinger Paratha Roll with Cheese",
        price: "Rs. 340.00",
        numPrice: 340.00,
        desc: "Crispy boneless fried chicken done justice with our cheesy recipe",
        img: "./images/roll-zinger-cheese.jpg",
        tag: "Cheesy Zinger Roll",
        options: {
          spice: ["Crispy Mild", "Spicy Hot"],
          addOns: [
            { name: "Extra Cheese", price: 42 },
            { name: "Cold Drink Can", price: 90 }
          ]
        }
      },
      {
        id: "roll-14",
        name: "Boom Boom Arabic Roll",
        price: "Rs. 552.50",
        numPrice: 552.50,
        desc: "Spicy, savoury filling wrapped in soft Arabic bread with creamy sauce and fresh veggies",
        img: "./images/roll-arabic-boom.jpg",
        tag: "Arabic Style",
        options: {
          spice: ["Authentic Savory", "Spicy Hot Arabic 🔥"],
          addOns: [
            { name: "Extra Arabic Garlic Dip", price: 60 },
            { name: "French Fries", price: 120 }
          ]
        }
      }
    ]
  },

  // --------------------------------------------------------
  // 6. Appetizers, Soups, Fried Items & Gravies
  // --------------------------------------------------------
  {
    id: "appetizers-soups",
    name: "Appetizers, Soups, Fried Items & Gravies",
    badge: "Starters • Soups • Crunchy Bites",
    items: [
      {
        id: "app-1",
        name: "Dynamite Prawns",
        price: "Rs. 1,200.00",
        numPrice: 1200.00,
        desc: "Dynamite Prawns",
        img: "./images/dynamite-prawns.jpg",
        tag: "Chef Special",
        options: {
          spice: ["Mild Dynamite", "Fiery Spicy Dynamite 🔥"],
          addOns: [
            { name: "Extra Dynamite Mayo Sauce", price: 90 }
          ]
        }
      },
      {
        id: "app-2",
        name: "Dynamite Chicken",
        price: "Rs. 800.00",
        numPrice: 800.00,
        desc: "Deep fried crispy chicken featuring a savory and spicy flavor",
        img: "./images/dynamite-chicken.jpg",
        tag: "Crispy Bites",
        options: {
          spice: ["Savory Mild", "Spicy Dynamite Glaze 🔥"],
          addOns: [
            { name: "Extra Dynamite Dip", price: 80 }
          ]
        }
      },
      {
        id: "app-3",
        name: "Chicken Drumstick",
        price: "Rs. 180.00",
        numPrice: 180.00,
        desc: "Per piece crispy spiced chicken drumstick",
        img: "./images/drumstick.jpg",
        tag: "Per Piece",
        options: {
          style: ["Golden Crispy", "Spicy Seasoned"],
          addOns: [
            { name: "Garlic Mayo Dip", price: 50 },
            { name: "French Fries Side", price: 120 }
          ]
        }
      },
      {
        id: "app-4",
        name: "Honey Wings (6 Pieces)",
        price: "Rs. 550.00",
        numPrice: 550.00,
        desc: "Crispy chicken with savory honey flavor",
        img: "./images/honey-wings.jpg",
        tag: "6 Pieces",
        options: {
          glaze: ["Sweet Honey Glaze", "Honey Mustard Glaze"],
          addOns: [
            { name: "Ranch Dip", price: 60 }
          ]
        }
      },
      {
        id: "app-5",
        name: "Chili Wings (6 Pieces)",
        price: "Rs. 580.00",
        numPrice: 580.00,
        desc: "Crispy spicy chicken wings",
        img: "./images/chili-wings.jpg",
        tag: "6 Pieces",
        options: {
          heat: ["Spicy Tangy Chili", "Fiery Red Chili 🔥"],
          addOns: [
            { name: "Cooling Garlic Dip", price: 60 }
          ]
        }
      },
      {
        id: "app-6",
        name: "Crispy Fish Fillet",
        price: "Rs. 900.00",
        numPrice: 900.00,
        desc: "Golden, crunchy fried fish fillets bursting with flavor",
        img: "./images/crispy-fish.jpg",
        tag: "Crispy Seafood",
        options: {
          side: ["With Tartar Sauce & Fries", "With Spicy Dip & Fries"],
          addOns: [
            { name: "Extra Tartar Dip", price: 70 }
          ]
        }
      },
      {
        id: "app-7",
        name: "Chicken Wings",
        price: "from Rs. 510.00",
        numPrice: 510.00,
        desc: "The most saucy, crispy and tender pieces of chicken you have ever tasted",
        img: "./images/wings.jpg",
        tag: "Saucy Wings",
        options: {
          size: [
            { label: "5 Pieces", price: 510.00 },
            { label: "10 Pieces", price: 950.00 }
          ],
          flavor: ["Classic Crispy", "Smoky BBQ", "Spicy Buffalo"],
          addOns: [
            { name: "Garlic Mayo Dip", price: 60 }
          ]
        }
      },
      {
        id: "soup-1",
        name: "Chicken Corn Soup Simple With Egg",
        price: "Rs. 270.00",
        numPrice: 270.00,
        desc: "Classic warm comforting soup",
        img: "./images/soup-corn-egg.jpg",
        tag: "With Egg",
        options: {
          condiments: ["Soy Sauce, Chili Sauce & Vinegar (Included)", "Extra Boiled Egg (+Rs. 50)"],
          addOns: [
            { name: "Crispy Crackers / Papri", price: 40 }
          ]
        }
      },
      {
        id: "soup-2",
        name: "Chicken Corn Soup Simple",
        price: "Rs. 220.00",
        numPrice: 220.00,
        desc: "Traditional style warm soup",
        img: "./images/soup-corn-simple.jpg",
        tag: "Classic Warm",
        options: {
          condiments: ["Soy Sauce, Chili Sauce & Vinegar (Included)"],
          addOns: [
            { name: "Crispy Crackers", price: 40 }
          ]
        }
      },
      {
        id: "soup-3",
        name: "Mr Cook Special Soup",
        price: "from Rs. 370.00",
        numPrice: 370.00,
        desc: "Chinese style simmered chicken and corn soup",
        img: "./images/soup-special.jpg",
        tag: "Chef Special",
        options: {
          size: [
            { label: "Single Serving Bowl", price: 370.00 },
            { label: "Family Bowl (Serves 3-4)", price: 720.00 }
          ],
          addOns: [
            { name: "Extra Chicken & Prawn Chunks", price: 120 },
            { name: "Extra Crispy Crackers", price: 40 }
          ]
        }
      },
      {
        id: "soup-4",
        name: "Hot & Sour Soup",
        price: "from Rs. 250.00",
        numPrice: 250.00,
        desc: "Chinese style chicken soup featuring savory, spicy, and tangy flavors",
        img: "./images/soup-hot-sour.jpg",
        tag: "Tangy & Spicy",
        options: {
          size: [
            { label: "Single Serving Bowl", price: 250.00 },
            { label: "Family Bowl (Serves 3-4)", price: 490.00 }
          ],
          spice: ["Traditional Tangy Hot", "Extra Spicy Hot 🔥"],
          addOns: [
            { name: "Crispy Crackers", price: 40 }
          ]
        }
      },
      {
        id: "soup-5",
        name: "Chicken Corn Soup",
        price: "from Rs. 250.00",
        numPrice: 250.00,
        desc: "Pakistani style chicken and corn soup",
        img: "./images/soup-corn-desi.jpg",
        tag: "Pakistani Style",
        options: {
          size: [
            { label: "Single Serving Bowl", price: 250.00 },
            { label: "Family Bowl (Serves 3-4)", price: 490.00 }
          ],
          addOns: [
            { name: "Extra Shredded Chicken", price: 80 },
            { name: "Crispy Crackers", price: 40 }
          ]
        }
      },
      {
        id: "soup-6",
        name: "Thai Soup",
        price: "from Rs. 250.00",
        numPrice: 250.00,
        desc: "Thai style soup featuring a savory and aromatic light broth",
        img: "./images/soup-thai.jpg",
        tag: "Aromatic Thai",
        options: {
          size: [
            { label: "Single Serving Bowl", price: 250.00 },
            { label: "Family Bowl (Serves 3-4)", price: 490.00 }
          ],
          spice: ["Aromatic Mild Broth", "Zesty Spicy Lemongrass Broth"],
          addOns: [
            { name: "Extra Prawns & Chicken", price: 120 }
          ]
        }
      }
    ]
  },

  // --------------------------------------------------------
  // 7. Drinks & Beverages
  // --------------------------------------------------------
  {
    id: "drinks-beverages",
    name: "Drinks & Beverages",
    badge: "Chilled & Refreshing",
    items: [
      {
        id: "drink-pepsi",
        name: "Pepsi Cold Drink",
        price: "from Rs. 100.00",
        numPrice: 100.00,
        desc: "Chilled carbonated soft drink served ice-cold with classic cola fizz.",
        img: "./images/beverage-pepsi.svg",
        tag: "Best Seller",
        options: {
          size: [
            { label: "Regular (345ml Can)", price: 100.00 },
            { label: "Medium (500ml Bottle)", price: 140.00 },
            { label: "Large (1 Ltr Bottle)", price: 180.00 },
            { label: "Jumbo (1.5 Ltr Bottle)", price: 230.00 }
          ]
        }
      },
      {
        id: "drink-7up",
        name: "7Up Cold Drink",
        price: "from Rs. 100.00",
        numPrice: 100.00,
        desc: "Crisp, clean lemon-lime sparkling soda, wonderfully refreshing.",
        img: "./images/beverage-7up.svg",
        tag: "Refreshing",
        options: {
          size: [
            { label: "Regular (345ml Can)", price: 100.00 },
            { label: "Medium (500ml Bottle)", price: 140.00 },
            { label: "Large (1 Ltr Bottle)", price: 180.00 },
            { label: "Jumbo (1.5 Ltr Bottle)", price: 230.00 }
          ]
        }
      },
      {
        id: "drink-mirinda",
        name: "Mirinda Orange",
        price: "from Rs. 100.00",
        numPrice: 100.00,
        desc: "Sweet and tangy sparkling orange beverage with lively fizz.",
        img: "./images/beverage-mirinda.svg",
        tag: "Citrus Fizz",
        options: {
          size: [
            { label: "Regular (345ml Can)", price: 100.00 },
            { label: "Medium (500ml Bottle)", price: 140.00 },
            { label: "Large (1 Ltr Bottle)", price: 180.00 },
            { label: "Jumbo (1.5 Ltr Bottle)", price: 230.00 }
          ]
        }
      },
      {
        id: "drink-dew",
        name: "Mountain Dew",
        price: "from Rs. 100.00",
        numPrice: 100.00,
        desc: "Exhilarating bold citrus punch sparkling drink with high energy.",
        img: "./images/beverage-dew.svg",
        tag: "Bold Citrus",
        options: {
          size: [
            { label: "Regular (345ml Can)", price: 100.00 },
            { label: "Medium (500ml Bottle)", price: 140.00 },
            { label: "Large (1 Ltr Bottle)", price: 180.00 },
            { label: "Jumbo (1.5 Ltr Bottle)", price: 230.00 }
          ]
        }
      },
      {
        id: "drink-diet-pepsi",
        name: "Diet Pepsi",
        price: "from Rs. 120.00",
        numPrice: 120.00,
        desc: "Crisp and light zero calorie cola with full refreshment and zero sugar.",
        img: "./images/beverage-diet-pepsi.svg",
        tag: "Zero Sugar",
        options: {
          size: [
            { label: "Regular (345ml Can)", price: 120.00 },
            { label: "Medium (500ml Bottle)", price: 160.00 },
            { label: "Large (1.5 Ltr Bottle)", price: 250.00 }
          ]
        }
      },
      {
        id: "water-nestle",
        name: "Nestle Pure Life Mineral Water",
        price: "from Rs. 60.00",
        numPrice: 60.00,
        desc: "Pure, crystal-clear packaged drinking water bottle, sealed and chilled.",
        img: "./images/beverage-water.svg",
        tag: "Pure & Clean",
        options: {
          size: [
            { label: "Small (500ml Bottle)", price: 60.00 },
            { label: "Medium (1 Ltr Bottle)", price: 100.00 },
            { label: "Large (1.5 Ltr Bottle)", price: 140.00 }
          ]
        }
      },
      {
        id: "water-aquafina",
        name: "Aquafina Drinking Water",
        price: "from Rs. 60.00",
        numPrice: 60.00,
        desc: "Premium purified packaged drinking water, sealed for pure hydration.",
        img: "./images/beverage-aquafina.svg",
        tag: "Pure Hydration",
        options: {
          size: [
            { label: "Small (500ml Bottle)", price: 60.00 },
            { label: "Medium (1 Ltr Bottle)", price: 100.00 },
            { label: "Large (1.5 Ltr Bottle)", price: 140.00 }
          ]
        }
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OFFICIAL_MENU_DATA };
}
