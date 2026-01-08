export const DEFAULT_VEGETABLES = [
    'Tomato',
    'Potato',
    'Onion',
    'Carrot',
    'Cabbage',
    'Cauliflower',
    'Brinjal',
    'Beans',
    'Ladyfinger',
    'Capsicum',
    'Cucumber',
    'Pumpkin',
    'Spinach',
    'Coriander',
    'Mint',
    'Chilli',
    'Beetroot',
    'Radish',
    'Bitter Gourd',
    'Bottle Gourd',
    'Green Peas',
    'Drumstick',
    'Cluster Beans',
    'Ridge Gourd'
];

export const isValidVegetable = (name) => {
    return DEFAULT_VEGETABLES.includes(name);
};
