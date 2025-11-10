/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            screens: {
                phone: { max: '430px' }, // s'applique uniquement pour écrans ≤430px
            },
        },
    },
    plugins: [],
};
