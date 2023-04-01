/** @type {import("prettier").Config} */
const config = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  trailingComma: "all",
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  printWidth: 80
};

module.exports = config;