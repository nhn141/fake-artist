"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomCategoryAndWord = exports.wordCategories = void 0;
exports.wordCategories = {
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
const getRandomCategoryAndWord = () => {
    const categories = Object.keys(exports.wordCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const words = exports.wordCategories[randomCategory];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return { category: randomCategory, word: randomWord };
};
exports.getRandomCategoryAndWord = getRandomCategoryAndWord;
//# sourceMappingURL=words.js.map