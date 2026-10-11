/**
 * COWBOY BURGER — CONTENT
 * ------------------------------------------------------------------
 * All copy lives here so it can be replaced without touching layout.
 * Items marked `PLACEHOLDER` must be confirmed by the client before
 * launch (prices, contact, ordering links, locations).
 * No awards, reviews, statistics or history have been invented.
 */

export const brand = {
  name: "Cowboy Burger",
  tagline: "Forged in fire. Built by hand.",
  // PLACEHOLDER — replace with the real ordering / delivery URL
  orderUrl: "#order",
  // PLACEHOLDER — replace with the real locations page
  locationsUrl: "#visit",
  // PLACEHOLDER — replace with real contact details
  email: "hello@cowboyburger.example",
  instagram: "#",
};

export const chapters = [
  { id: "opening", label: "Opening" },
  { id: "reveal", label: "The Burger" },
  { id: "anatomy", label: "Anatomy" },
  { id: "craft", label: "The Craft" },
  { id: "menu", label: "The Lineup" },
  { id: "story", label: "Our Code" },
  { id: "visit", label: "Saddle Up" },
] as const;

export type Ingredient = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  accent: string;
  body: string;
  side: "left" | "right";
};

export const ingredients: Ingredient[] = [
  {
    id: "bun",
    index: "01",
    kicker: "The Crown",
    title: "Glazed",
    accent: "brioche",
    body: "A soft, butter-rich brioche, toasted on the flat-top until the cut face turns golden and crisp. Built to hold everything without stealing the show.",
    side: "left",
  },
  {
    id: "beef",
    index: "02",
    kicker: "The Heart",
    title: "Smash-seared",
    accent: "beef",
    body: "Fresh beef, pressed hard against screaming-hot iron. The edges lace and caramelise, the centre stays juicy. Finished under a blanket of aged cheddar.",
    side: "right",
  },
  {
    id: "fresh",
    index: "03",
    kicker: "The Crunch",
    title: "Cold &",
    accent: "crisp",
    body: "Crisp lettuce, ripe tomato and sharp red onion — cut daily, kept cold, layered so every bite has contrast against the heat.",
    side: "left",
  },
  {
    id: "sauce",
    index: "04",
    kicker: "The Signature",
    title: "House",
    accent: "smoke sauce",
    body: "Our own smoky, tangy house sauce, made in the kitchen. Spread edge to edge — because the last bite should be as good as the first.",
    side: "right",
  },
];

export const craftSteps = [
  {
    index: "I",
    title: "Fire",
    body: "Everything starts with heat. The iron is brought up hot before a single patty touches it.",
    image: "fire",
    alt: "Glowing charcoal embers and flames beneath a cast-iron grill grate",
  },
  {
    index: "II",
    title: "Sear",
    body: "Smashed thin and hard. Seconds of contact build the deep, crackling crust.",
    image: "sear",
    alt: "A beef patty searing on a black cast-iron griddle with smoke rising",
  },
  {
    index: "III",
    title: "Melt",
    body: "Cheddar goes on while the beef is still talking, draping over every edge.",
    image: "melt",
    alt: "Golden cheddar melting over a charred beef patty",
  },
  {
    index: "IV",
    title: "Stack",
    body: "Built in order, by hand, and sent out the moment it's done. No heat lamps.",
    image: "stack",
    alt: "A finished cheeseburger on a dark background lit by warm rim light",
  },
] as const;

export type MenuItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  build: string[];
  // PLACEHOLDER — prices to be confirmed by client
  price: string;
  heat: number; // 0-3 spice indicator
  config: { double: number; bacon: number; jalapeno: number; onion: number };
};

export const menu: MenuItem[] = [
  {
    id: "outlaw",
    name: "The Outlaw",
    subtitle: "The original",
    description: "Where it all starts. One smash-seared patty, aged cheddar, cold crunch and house smoke sauce.",
    build: ["Beef patty", "Aged cheddar", "Lettuce", "Tomato", "Red onion", "Smoke sauce"],
    price: "PKR 1,450",
    heat: 0,
    config: { double: 0, bacon: 0, jalapeno: 0, onion: 1 },
  },
  {
    id: "ranch-hand",
    name: "The Ranch Hand",
    subtitle: "Double down",
    description: "Two patties, two slices of cheddar. For the appetite that's been working since sunrise.",
    build: ["2× Beef patty", "2× Aged cheddar", "Lettuce", "Tomato", "Smoke sauce"],
    price: "PKR 1,950",
    heat: 0,
    config: { double: 1, bacon: 0, jalapeno: 0, onion: 0 },
  },
  {
    id: "smokestack",
    name: "The Smokestack",
    subtitle: "Beef & smoke",
    description: "Crisp smoked beef bacon and onion over a cheddar-draped patty. Deep, savoury, unapologetic.",
    build: ["Beef patty", "Aged cheddar", "Smoked beef bacon", "Red onion", "Smoke sauce"],
    price: "PKR 1,750",
    heat: 1,
    config: { double: 0, bacon: 1, jalapeno: 0, onion: 1 },
  },
  {
    id: "rattlesnake",
    name: "The Rattlesnake",
    subtitle: "Bite back",
    description: "Fresh jalapeños and a hotter pour of house sauce. It warns you first — then it bites.",
    build: ["Beef patty", "Aged cheddar", "Jalapeños", "Lettuce", "Hot smoke sauce"],
    price: "PKR 1,650",
    heat: 3,
    config: { double: 0, bacon: 0, jalapeno: 1, onion: 0 },
  },
];

export const story = {
  kicker: "The Cowboy Code",
  statement:
    "We don't do shortcuts. We do fire, fresh beef, honest ingredients and hands that know the work. Every burger is built the way a good day on the range is earned — one deliberate move at a time.",
  values: [
    { title: "Fire first", body: "Real heat, real crust. The grill sets the pace of the kitchen." },
    { title: "Made by hand", body: "Pressed, seared, stacked and wrapped by people — never a conveyor." },
    { title: "Nothing to hide", body: "Short ingredient lists. If it isn't adding flavour, it isn't on the burger." },
  ],
};
