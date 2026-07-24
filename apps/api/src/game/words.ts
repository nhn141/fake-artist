export const wordCategories = {
  Animals: [
    'Lion',
    'Elephant',
    'Tiger',
    'Giraffe',
    'Penguin',
    'Kangaroo',
    'Dolphin',
    'Monkey',
    'Zebra',
    'Octopus',
  ],
  Vehicles: [
    'Car',
    'Bicycle',
    'Train',
    'Airplane',
    'Helicopter',
    'Motorcycle',
    'Bus',
    'Submarine',
    'Boat',
    'Tractor',
  ],
  Food: [
    'Pizza',
    'Hamburger',
    'Sushi',
    'Taco',
    'Ice Cream',
    'Pancake',
    'Spaghetti',
    'Hot Dog',
    'Sandwich',
    'Salad',
  ],
  Jobs: [
    'Doctor',
    'Teacher',
    'Police Officer',
    'Firefighter',
    'Chef',
    'Astronaut',
    'Pilot',
    'Artist',
    'Farmer',
    'Scientist',
  ],
  Buildings: [
    'Hospital',
    'School',
    'Library',
    'Bank',
    'Supermarket',
    'Museum',
    'Stadium',
    'Lighthouse',
    'Castle',
    'Factory',
  ],
};

export const getRandomCategoryAndWord = (): { category: string; word: string } => {
  const categories = Object.keys(wordCategories);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const words = wordCategories[randomCategory as keyof typeof wordCategories];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  return { category: randomCategory, word: randomWord };
};
