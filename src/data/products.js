// Vite sirve correctamente la coma literal del nombre; codificarla como %2C
// hace que su fallback devuelva index.html en vez de la imagen.
const imageBase = "/products/Imagen%20de%20ChatGPT%2016%20oct%202026, ";
const image = (fileName) => `${imageBase}${fileName}.png`;

export const featuredProducts = [
  { id: "run-aero-celeste", name: "Aero Flow Celeste", category: "Running", price: "$ 112.900", priceValue: 112900, imageUrl: image("11_40_03-1"), colors: ["Blanco hielo", "Celeste"], variants: ["Talles 35 al 40"], description: "Malla respirable y amortiguación liviana para entrenamientos urbanos.", stock: 7 },
  { id: "futbol-strike-verde", name: "Strike Pro Verde", category: "Fútbol", price: "$ 128.500", priceValue: 128500, imageUrl: image("11_40_05-3"), colors: ["Negro", "Verde lima"], variants: ["Talles 39 al 45"], description: "Botín con tapones y empeine texturado para cambios de dirección.", stock: 3 },
  { id: "handball-court-azul", name: "Court Drive Azul", category: "Handball", price: "$ 106.900", priceValue: 106900, imageUrl: image("11_40_07-5"), colors: ["Blanco", "Azul", "Naranja"], variants: ["Talles 36 al 44"], description: "Suela indoor y refuerzos laterales para pivotes y frenadas.", stock: 9 },
  { id: "formal-oxford-negro", name: "Oxford Clásico Negro", category: "Zapatos de hombre", price: "$ 119.900", priceValue: 119900, imageUrl: image("11_40_09-7"), colors: ["Negro"], variants: ["Talles 39 al 45"], description: "Silueta formal sobria, ideal para oficina, eventos y trajes.", stock: 6 },
  { id: "stiletto-nude-elegance", name: "Stiletto Nude Elegance", category: "Tacos mujer", price: "$ 134.900", priceValue: 134900, imageUrl: image("11_40_12-9"), colors: ["Nude"], variants: ["Talles 35 al 40"], description: "Punta fina y taco alto para eventos y looks elegantes.", stock: 4 },
  { id: "run-pace-coral", name: "Pace Max Coral", category: "Running", price: "$ 124.900", priceValue: 124900, imageUrl: image("11_41_51-1"), colors: ["Negro grafito", "Coral"], variants: ["Talles 36 al 45"], description: "Amortiguación generosa y detalles reflectivos para rodajes diarios.", stock: 8 },
  { id: "tenis-rally-turquesa", name: "Rally Court Turquesa", category: "Tenis", price: "$ 121.500", priceValue: 121500, imageUrl: image("11_41_53-3"), colors: ["Blanco", "Turquesa"], variants: ["Talles 36 al 44"], description: "Base estable y tracción para desplazamientos laterales en cancha dura.", stock: 5 },
  { id: "stiletto-rojo-nocturno", name: "Stiletto Rojo Nocturno", category: "Tacos mujer", price: "$ 142.900", priceValue: 142900, imageUrl: image("11_41_55-5"), colors: ["Rojo brillante"], variants: ["Talles 35 al 40"], description: "Stiletto de acabado brillante para salidas y ocasiones especiales.", stock: 2 },
];
