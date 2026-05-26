export type Locale = "pt" | "en" | "es" | "fr";

export const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "pt", label: "PT", flag: "🇵🇹" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

export type TKeys = {
  // Menu UI
  featured: string;
  close: string;
  soldOut: string;
  popular: string;
  tab_info: string;
  tab_ai: string;
  nutrition: string;
  calories: string;
  proteins: string;
  carbs: string;
  fat: string;
  allergens: string;
  no_info: string;
  // AI pairing
  ai_cta_idle: string;
  ai_cta_done: string;
  ai_sub_before: string;
  ai_sub_after: string;
  ai_loading: string;
  ai_analyzing: string;
  ai_sommelier: string;
  ai_wines: string;
  ai_starters: string;
  ai_mains: string;
  ai_desserts: string;
  ai_why: string;
  ai_regenerate: string;
  ai_credit: string;
  ai_empty_title: string;
  ai_empty_desc: string;
  ai_empty_cta: string;
  ai_fallback_reasoning: string;
  ai_generate_auto: string;
  // Manual pairings
  manual_sub: string;
  // Fallback pairing descriptions
  fallback_w_sf_1: string;
  fallback_w_sf_2: string;
  fallback_w_mt_1: string;
  fallback_w_mt_2: string;
  fallback_w_df_1: string;
  fallback_w_df_2: string;
  fallback_s_why: string;
  fallback_m_1_why: string;
  fallback_m_2_why: string;
  fallback_d_why: string;
  fallback_wd_why: string;
  fallback_r_wine: string;
  fallback_r_starter: string;
  fallback_r_dessert: string;
  fallback_r_seafood: string;
  fallback_r_meat: string;
  fallback_r_default: string;
  // Category names (common)
  cat_starters: string;
  cat_mains: string;
  cat_desserts: string;
  cat_wines: string;
  cat_beverages: string;
  cat_palate: string;
  // Dish count
  dish_one: string;
  dish_many: string;
  // Dish tags (common)
  tag_popular: string;
  tag_sem_gluten: string;
  tag_saudavel: string;
  tag_sem_lactose: string;
  tag_tradicional: string;
  tag_tinto: string;
  tag_branco: string;
  tag_rose: string;
  tag_cocktail: string;
  tag_com_alcool: string;
  tag_sem_alcool: string;
  tag_cerveja: string;
  tag_cafe: string;
  tag_vegetariano: string;
  tag_vegan: string;
  // Menu filters
  filter_label: string;
  filter_clear: string;
  filter_none: string;
  // Allergens
  allergen_gluten: string;
  allergen_crustaceos: string;
  allergen_ovos: string;
  allergen_peixe: string;
  allergen_amendoins: string;
  allergen_soja: string;
  allergen_leite: string;
  allergen_frutos_casca: string;
  allergen_aipo: string;
  allergen_mostarda: string;
  allergen_sesamo: string;
  allergen_sulfitos: string;
  allergen_tremocos: string;
  allergen_moluscos: string;
  // Misc
  ai_rec_available: string;
  // Chef's picks carousel
  chefs_pick: string;
  // Review section
  review_title: string;
  review_sub: string;
  review_cta: string;
  review_scan: string;
  // Footer
  footer_by: string;
  // Landing page
  home_badge: string;
  home_tagline: string;
  home_demo_btn: string;
  home_learn_more: string;
  home_feature_ai_title: string;
  home_feature_ai_desc: string;
  home_feature_qr_title: string;
  home_feature_qr_desc: string;
  home_feature_dash_title: string;
  home_feature_dash_desc: string;
};

const translations: Record<Locale, TKeys> = {
  pt: {
    featured: "Em Destaque",
    close: "Fechar",
    soldOut: "Esgotado",
    popular: "Best Seller",
    chefs_pick: "Sugestões do Chefe",
    review_title: "Como foi a sua experiência?",
    review_sub: "A sua avaliação ajuda-nos a crescer e inspira outros a descobrir-nos.",
    review_cta: "Avaliar no Google",
    review_scan: "ou leia o QR code",
    tab_info: "Informação",
    tab_ai: "Sugestão da Casa",
    nutrition: "Informação Nutricional",
    calories: "Calorias",
    proteins: "Proteínas",
    carbs: "Hidratos",
    fat: "Gorduras",
    allergens: "Alergénios",
    no_info: "Informação nutricional não disponível.",
    ai_cta_idle: "Sugestão da Casa",
    ai_cta_done: "Ver sugestões",
    ai_sub_before: "Maridagem · Vinhos · Entradas · Sobremesas",
    ai_sub_after: "Vinho · Entrada · Sobremesa sugeridos",
    ai_loading: "A preparar sugestões...",
    ai_analyzing: "A analisar o perfil de sabores do prato...",
    ai_sommelier: "Nota do chef",
    ai_wines: "Vinhos Sugeridos",
    ai_starters: "Entradas a Combinar",
    ai_mains: "Pratos a Combinar",
    ai_desserts: "Sobremesas Ideais",
    ai_why: "Porquê:",
    ai_regenerate: "Atualizar sugestões",
    ai_credit: "✦ Sugestão da Casa",
    ai_empty_title: "Sugestão da Casa",
    ai_empty_desc: "O nosso chef sugere o vinho, entrada e sobremesa ideais para acompanhar este prato.",
    ai_empty_cta: "Ver sugestões",
    ai_fallback_reasoning: "Sugestões de maridagem cuidadosamente selecionadas pelo chef.",
    ai_generate_auto: "Gerar sugestão automática",
    manual_sub: "Selecionado pelo chef",
    fallback_w_sf_1: "A acidez fresca potencia a delicadeza do marisco",
    fallback_w_sf_2: "A frescura do rosé combina sem sobrepor os sabores do mar",
    fallback_w_mt_1: "Taninos maduros e fruta escura — parceiros clássicos de carnes intensas",
    fallback_w_mt_2: "Estrutura alentejana que aguenta a gordura e o sabor da carne",
    fallback_w_df_1: "Estrutura e elegância que complementam os sabores do prato",
    fallback_w_df_2: "Frescura e acidez para equilibrar a intensidade do prato",
    fallback_s_why: "Entrada elegante que prepara o palato para sabores intensos",
    fallback_m_1_why: "Prato clássico com intensidade equilibrada",
    fallback_m_2_why: "Opção mais leve que complementa bem",
    fallback_d_why: "A acidez do limão fecha a refeição com elegância",
    fallback_wd_why: "A doçura oxidativa amplifica as notas caramelizadas da sobremesa",
    fallback_r_wine: "Este vinho abre possibilidades — aqui estão os pratos que melhor o acompanham.",
    fallback_r_starter: "Depois desta entrada, eis o que melhor completa a refeição.",
    fallback_r_dessert: "Para esta sobremesa, um Porto Tawny é a escolha clássica.",
    fallback_r_seafood: "Pratos de mar pedem vinhos brancos com boa acidez — Douro e Alentejo lideram.",
    fallback_r_meat: "Carnes intensas exigem tintos com estrutura — Douro e Alentejo são as escolhas certas.",
    fallback_r_default: "Sugestões baseadas no perfil aromático e intensidade do prato.",
    cat_starters: "Entradas",
    cat_mains: "Pratos Principais",
    cat_desserts: "Sobremesas",
    cat_wines: "Vinhos",
    cat_beverages: "Bebidas",
    cat_palate: "Corta-Sabores",
    dish_one: "prato",
    dish_many: "pratos",
    tag_popular: "popular",
    tag_sem_gluten: "sem glúten",
    tag_saudavel: "saudável",
    tag_sem_lactose: "sem lactose",
    tag_vegetariano: "vegetariano",
    tag_vegan: "vegan",
    filter_label: "Filtrar",
    filter_clear: "Limpar",
    filter_none: "Nenhum prato corresponde aos filtros",
    tag_tradicional: "tradicional",
    tag_tinto: "tinto",
    tag_branco: "branco",
    tag_rose: "rosé",
    tag_cocktail: "cocktail",
    tag_com_alcool: "com álcool",
    tag_sem_alcool: "sem álcool",
    tag_cerveja: "cerveja",
    tag_cafe: "café",
    allergen_gluten: "Glúten",
    allergen_crustaceos: "Crustáceos",
    allergen_ovos: "Ovos",
    allergen_peixe: "Peixe",
    allergen_amendoins: "Amendoins",
    allergen_soja: "Soja",
    allergen_leite: "Leite",
    allergen_frutos_casca: "Frutos de Casca Rija",
    allergen_aipo: "Aipo",
    allergen_mostarda: "Mostarda",
    allergen_sesamo: "Sésamo",
    allergen_sulfitos: "Sulfitos",
    allergen_tremocos: "Tremoços",
    allergen_moluscos: "Moluscos",
    ai_rec_available: "Recomendações disponíveis",
    footer_by: "Menu digital por",
    home_badge: "Menu digital com IA",
    home_tagline: "O menu digital que aumenta o ticket médio do seu restaurante com recomendações inteligentes de vinho, entradas e sobremesas.",
    home_demo_btn: "Ver demo do menu",
    home_learn_more: "Saber mais",
    home_feature_ai_title: "IA de Maridagem",
    home_feature_ai_desc: "Sugestões automáticas de vinho, entrada e sobremesa para cada prato selecionado.",
    home_feature_qr_title: "QR Code Instantâneo",
    home_feature_qr_desc: "Cada restaurante tem o seu link único acessível pelo telemóvel sem instalar app.",
    home_feature_dash_title: "Dashboard Completo",
    home_feature_dash_desc: "Gere pratos, preços e fotos em tempo real. Veja estatísticas de pratos mais vistos.",
  },
  en: {
    featured: "Featured",
    close: "Close",
    soldOut: "Sold out",
    popular: "Best Seller",
    chefs_pick: "Chef's Picks",
    review_title: "How was your experience?",
    review_sub: "Your review helps us grow and inspires others to discover us.",
    review_cta: "Review on Google",
    review_scan: "or scan the QR code",
    tab_info: "Information",
    tab_ai: "House Suggestion",
    nutrition: "Nutritional Info",
    calories: "Calories",
    proteins: "Proteins",
    carbs: "Carbs",
    fat: "Fat",
    allergens: "Allergens",
    no_info: "Nutritional information not available.",
    ai_cta_idle: "House Suggestion",
    ai_cta_done: "View suggestions",
    ai_sub_before: "Pairing · Wines · Starters · Desserts",
    ai_sub_after: "Wine · Starter · Dessert suggested",
    ai_loading: "Preparing suggestions...",
    ai_analyzing: "Analysing the flavour profile...",
    ai_sommelier: "Chef's note",
    ai_wines: "Suggested Wines",
    ai_starters: "Starters to Pair",
    ai_mains: "Dishes to Pair",
    ai_desserts: "Ideal Desserts",
    ai_why: "Why:",
    ai_regenerate: "Refresh suggestions",
    ai_credit: "✦ House Suggestion",
    ai_empty_title: "House Suggestion",
    ai_empty_desc: "Our chef suggests the ideal wine, starter and dessert to pair with this dish.",
    ai_empty_cta: "See suggestions",
    ai_fallback_reasoning: "Pairing suggestions carefully selected by the chef.",
    ai_generate_auto: "Generate AI suggestion",
    manual_sub: "Selected by the chef",
    fallback_w_sf_1: "The crisp acidity enhances the delicacy of the seafood",
    fallback_w_sf_2: "The freshness of the rosé pairs without overpowering the sea flavours",
    fallback_w_mt_1: "Ripe tannins and dark fruit — classic partners for intense meats",
    fallback_w_mt_2: "Robust structure that stands up to the richness and flavour of the meat",
    fallback_w_df_1: "Structure and elegance that complement the dish's flavours",
    fallback_w_df_2: "Freshness and acidity to balance the dish's intensity",
    fallback_s_why: "An elegant starter that prepares the palate for intense flavours",
    fallback_m_1_why: "A classic dish with balanced intensity",
    fallback_m_2_why: "A lighter option that pairs well",
    fallback_d_why: "The lemon's acidity closes the meal with elegance",
    fallback_wd_why: "The oxidative sweetness amplifies the caramelised notes of the dessert",
    fallback_r_wine: "This wine opens possibilities — here are the dishes that pair best with it.",
    fallback_r_starter: "After this starter, here is what best completes the meal.",
    fallback_r_dessert: "For this dessert, a Tawny Port is the classic choice.",
    fallback_r_seafood: "Seafood dishes call for whites with good acidity — Douro and Alentejo lead the way.",
    fallback_r_meat: "Intense meats require structured reds — Douro and Alentejo are the right choices.",
    fallback_r_default: "Suggestions based on the dish's aromatic profile and intensity.",
    cat_starters: "Starters",
    cat_mains: "Main Courses",
    cat_desserts: "Desserts",
    cat_wines: "Wines",
    cat_beverages: "Beverages",
    cat_palate: "Palate Cleansers",
    dish_one: "dish",
    dish_many: "dishes",
    tag_popular: "popular",
    tag_sem_gluten: "gluten-free",
    tag_saudavel: "healthy",
    tag_sem_lactose: "lactose-free",
    tag_vegetariano: "vegetarian",
    tag_vegan: "vegan",
    filter_label: "Filter",
    filter_clear: "Clear",
    filter_none: "No dishes match the filters",
    tag_tradicional: "traditional",
    tag_tinto: "red",
    tag_branco: "white",
    tag_rose: "rosé",
    tag_cocktail: "cocktail",
    tag_com_alcool: "with alcohol",
    tag_sem_alcool: "alcohol-free",
    tag_cerveja: "beer",
    tag_cafe: "coffee",
    allergen_gluten: "Gluten",
    allergen_crustaceos: "Crustaceans",
    allergen_ovos: "Eggs",
    allergen_peixe: "Fish",
    allergen_amendoins: "Peanuts",
    allergen_soja: "Soya",
    allergen_leite: "Milk",
    allergen_frutos_casca: "Tree Nuts",
    allergen_aipo: "Celery",
    allergen_mostarda: "Mustard",
    allergen_sesamo: "Sesame",
    allergen_sulfitos: "Sulphites",
    allergen_tremocos: "Lupin",
    allergen_moluscos: "Molluscs",
    ai_rec_available: "Recommendations available",
    footer_by: "Digital menu by",
    home_badge: "Digital menu with AI",
    home_tagline: "The digital menu that increases your restaurant's average ticket with intelligent wine, starter and dessert recommendations.",
    home_demo_btn: "View menu demo",
    home_learn_more: "Learn more",
    home_feature_ai_title: "AI Pairing",
    home_feature_ai_desc: "Automatic wine, starter and dessert suggestions for each selected dish.",
    home_feature_qr_title: "Instant QR Code",
    home_feature_qr_desc: "Each restaurant has its own unique link accessible by phone without installing an app.",
    home_feature_dash_title: "Full Dashboard",
    home_feature_dash_desc: "Manage dishes, prices and photos in real time. See statistics for most viewed dishes.",
  },
  es: {
    featured: "Destacados",
    close: "Cerrar",
    soldOut: "Agotado",
    popular: "Best Seller",
    chefs_pick: "Sugerencias del Chef",
    review_title: "¿Cómo fue tu experiencia?",
    review_sub: "Tu valoración nos ayuda a crecer e inspira a otros a descubrirnos.",
    review_cta: "Valorar en Google",
    review_scan: "o escanea el código QR",
    tab_info: "Información",
    tab_ai: "Sugerencia de la Casa",
    nutrition: "Información Nutricional",
    calories: "Calorías",
    proteins: "Proteínas",
    carbs: "Hidratos",
    fat: "Grasas",
    allergens: "Alérgenos",
    no_info: "Información nutricional no disponible.",
    ai_cta_idle: "Sugerencia de la Casa",
    ai_cta_done: "Ver sugerencias",
    ai_sub_before: "Maridaje · Vinos · Entrantes · Postres",
    ai_sub_after: "Vino · Entrante · Postre sugeridos",
    ai_loading: "Preparando sugerencias...",
    ai_analyzing: "Analizando el perfil de sabores...",
    ai_sommelier: "Nota del chef",
    ai_wines: "Vinos Sugeridos",
    ai_starters: "Entrantes a Combinar",
    ai_mains: "Platos a Combinar",
    ai_desserts: "Postres Ideales",
    ai_why: "Por qué:",
    ai_regenerate: "Actualizar sugerencias",
    ai_credit: "✦ Sugerencia de la Casa",
    ai_empty_title: "Sugerencia de la Casa",
    ai_empty_desc: "Nuestro chef sugiere el vino, entrante y postre ideales para acompañar este plato.",
    ai_empty_cta: "Ver sugerencias",
    ai_fallback_reasoning: "Sugerencias de maridaje cuidadosamente seleccionadas por el chef.",
    ai_generate_auto: "Generar sugerencia automática",
    manual_sub: "Seleccionado por el chef",
    fallback_w_sf_1: "La acidez fresca realza la delicadeza del marisco",
    fallback_w_sf_2: "La frescura del rosado combina sin sobreponerse a los sabores del mar",
    fallback_w_mt_1: "Taninos maduros y fruta oscura — compañeros clásicos de carnes intensas",
    fallback_w_mt_2: "Estructura robusta que aguanta la grasa y el sabor de la carne",
    fallback_w_df_1: "Estructura y elegancia que complementan los sabores del plato",
    fallback_w_df_2: "Frescura y acidez para equilibrar la intensidad del plato",
    fallback_s_why: "Entrante elegante que prepara el paladar para sabores intensos",
    fallback_m_1_why: "Plato clásico con intensidad equilibrada",
    fallback_m_2_why: "Opción más ligera que combina bien",
    fallback_d_why: "La acidez del limón cierra la comida con elegancia",
    fallback_wd_why: "La dulzura oxidativa amplifica las notas caramelizadas del postre",
    fallback_r_wine: "Este vino abre posibilidades — aquí están los platos que mejor lo acompañan.",
    fallback_r_starter: "Después de este entrante, esto es lo que mejor completa la comida.",
    fallback_r_dessert: "Para este postre, un Oporto Tawny es la elección clásica.",
    fallback_r_seafood: "Los platos de mar piden blancos con buena acidez — Douro y Alentejo lideran.",
    fallback_r_meat: "Las carnes intensas exigen tintos con estructura — Douro y Alentejo son las opciones correctas.",
    fallback_r_default: "Sugerencias basadas en el perfil aromático e intensidad del plato.",
    cat_starters: "Entrantes",
    cat_mains: "Platos Principales",
    cat_desserts: "Postres",
    cat_wines: "Vinos",
    cat_beverages: "Bebidas",
    cat_palate: "Limpiadores de Paladar",
    dish_one: "plato",
    dish_many: "platos",
    tag_popular: "popular",
    tag_sem_gluten: "sin gluten",
    tag_saudavel: "saludable",
    tag_sem_lactose: "sin lactosa",
    tag_vegetariano: "vegetariano",
    tag_vegan: "vegano",
    filter_label: "Filtrar",
    filter_clear: "Limpiar",
    filter_none: "Ningún plato coincide con los filtros",
    tag_tradicional: "tradicional",
    tag_tinto: "tinto",
    tag_branco: "blanco",
    tag_rose: "rosado",
    tag_cocktail: "cóctel",
    tag_com_alcool: "con alcohol",
    tag_sem_alcool: "sin alcohol",
    tag_cerveja: "cerveza",
    tag_cafe: "café",
    allergen_gluten: "Gluten",
    allergen_crustaceos: "Crustáceos",
    allergen_ovos: "Huevos",
    allergen_peixe: "Pescado",
    allergen_amendoins: "Cacahuetes",
    allergen_soja: "Soja",
    allergen_leite: "Leche",
    allergen_frutos_casca: "Frutos de Cáscara",
    allergen_aipo: "Apio",
    allergen_mostarda: "Mostaza",
    allergen_sesamo: "Sésamo",
    allergen_sulfitos: "Sulfitos",
    allergen_tremocos: "Altramuces",
    allergen_moluscos: "Moluscos",
    ai_rec_available: "Recomendaciones disponibles",
    footer_by: "Menú digital por",
    home_badge: "Menú digital con IA",
    home_tagline: "El menú digital que aumenta el ticket medio de tu restaurante con recomendaciones inteligentes de vino, entrantes y postres.",
    home_demo_btn: "Ver demo del menú",
    home_learn_more: "Saber más",
    home_feature_ai_title: "IA de Maridaje",
    home_feature_ai_desc: "Sugerencias automáticas de vino, entrante y postre para cada plato seleccionado.",
    home_feature_qr_title: "Código QR Instantáneo",
    home_feature_qr_desc: "Cada restaurante tiene su propio enlace único accesible por el móvil sin instalar app.",
    home_feature_dash_title: "Dashboard Completo",
    home_feature_dash_desc: "Gestiona platos, precios y fotos en tiempo real. Ve estadísticas de platos más vistos.",
  },
  fr: {
    featured: "En Vedette",
    close: "Fermer",
    soldOut: "Épuisé",
    popular: "Best Seller",
    chefs_pick: "Sélection du Chef",
    review_title: "Comment s'est passée votre expérience ?",
    review_sub: "Votre avis nous aide à grandir et inspire d'autres à nous découvrir.",
    review_cta: "Évaluer sur Google",
    review_scan: "ou scannez le QR code",
    tab_info: "Information",
    tab_ai: "Suggestion Maison",
    nutrition: "Informations Nutritionnelles",
    calories: "Calories",
    proteins: "Protéines",
    carbs: "Glucides",
    fat: "Lipides",
    allergens: "Allergènes",
    no_info: "Informations nutritionnelles non disponibles.",
    ai_cta_idle: "Suggestion Maison",
    ai_cta_done: "Voir les suggestions",
    ai_sub_before: "Accord · Vins · Entrées · Desserts",
    ai_sub_after: "Vin · Entrée · Dessert suggérés",
    ai_loading: "Préparation des suggestions...",
    ai_analyzing: "Analyse du profil de saveurs...",
    ai_sommelier: "Note du chef",
    ai_wines: "Vins Suggérés",
    ai_starters: "Entrées à Associer",
    ai_mains: "Plats à Associer",
    ai_desserts: "Desserts Idéaux",
    ai_why: "Pourquoi :",
    ai_regenerate: "Actualiser les suggestions",
    ai_credit: "✦ Suggestion Maison",
    ai_empty_title: "Suggestion Maison",
    ai_empty_desc: "Notre chef suggère le vin, l'entrée et le dessert idéaux pour accompagner ce plat.",
    ai_empty_cta: "Voir les suggestions",
    ai_fallback_reasoning: "Suggestions d'accord soigneusement sélectionnées par le chef.",
    ai_generate_auto: "Générer une suggestion automatique",
    manual_sub: "Sélectionné par le chef",
    fallback_w_sf_1: "L'acidité fraîche met en valeur la délicatesse des fruits de mer",
    fallback_w_sf_2: "La fraîcheur du rosé s'accorde sans dominer les saveurs marines",
    fallback_w_mt_1: "Tanins mûrs et fruits noirs — partenaires classiques des viandes intenses",
    fallback_w_mt_2: "Structure robuste qui tient tête à la richesse et à la saveur de la viande",
    fallback_w_df_1: "Structure et élégance qui complètent les saveurs du plat",
    fallback_w_df_2: "Fraîcheur et acidité pour équilibrer l'intensité du plat",
    fallback_s_why: "Une entrée élégante qui prépare le palais aux saveurs intenses",
    fallback_m_1_why: "Un plat classique à l'intensité équilibrée",
    fallback_m_2_why: "Une option plus légère qui se marie bien",
    fallback_d_why: "L'acidité du citron clôture le repas avec élégance",
    fallback_wd_why: "La douceur oxydative amplifie les notes caramélisées du dessert",
    fallback_r_wine: "Ce vin ouvre des possibilités — voici les plats qui lui conviennent le mieux.",
    fallback_r_starter: "Après cette entrée, voici ce qui complète le mieux le repas.",
    fallback_r_dessert: "Pour ce dessert, un Porto Tawny est le choix classique.",
    fallback_r_seafood: "Les plats de mer réclament des blancs avec une bonne acidité — Douro et Alentejo sont en tête.",
    fallback_r_meat: "Les viandes intenses nécessitent des rouges structurés — Douro et Alentejo sont les bons choix.",
    fallback_r_default: "Suggestions basées sur le profil aromatique et l'intensité du plat.",
    cat_starters: "Entrées",
    cat_mains: "Plats Principaux",
    cat_desserts: "Desserts",
    cat_wines: "Vins",
    cat_beverages: "Boissons",
    cat_palate: "Trous Normands",
    dish_one: "plat",
    dish_many: "plats",
    tag_popular: "populaire",
    tag_sem_gluten: "sans gluten",
    tag_saudavel: "sain",
    tag_sem_lactose: "sans lactose",
    tag_vegetariano: "végétarien",
    tag_vegan: "vegan",
    filter_label: "Filtrer",
    filter_clear: "Effacer",
    filter_none: "Aucun plat ne correspond aux filtres",
    tag_tradicional: "traditionnel",
    tag_tinto: "rouge",
    tag_branco: "blanc",
    tag_rose: "rosé",
    tag_cocktail: "cocktail",
    tag_com_alcool: "avec alcool",
    tag_sem_alcool: "sans alcool",
    tag_cerveja: "bière",
    tag_cafe: "café",
    allergen_gluten: "Gluten",
    allergen_crustaceos: "Crustacés",
    allergen_ovos: "Œufs",
    allergen_peixe: "Poisson",
    allergen_amendoins: "Arachides",
    allergen_soja: "Soja",
    allergen_leite: "Lait",
    allergen_frutos_casca: "Fruits à Coque",
    allergen_aipo: "Céleri",
    allergen_mostarda: "Moutarde",
    allergen_sesamo: "Sésame",
    allergen_sulfitos: "Sulfites",
    allergen_tremocos: "Lupin",
    allergen_moluscos: "Mollusques",
    ai_rec_available: "Recommandations disponibles",
    footer_by: "Menu numérique par",
    home_badge: "Menu numérique avec IA",
    home_tagline: "Le menu numérique qui augmente le ticket moyen de votre restaurant avec des recommandations intelligentes de vin, entrées et desserts.",
    home_demo_btn: "Voir la démo du menu",
    home_learn_more: "En savoir plus",
    home_feature_ai_title: "Accord par IA",
    home_feature_ai_desc: "Suggestions automatiques de vin, entrée et dessert pour chaque plat sélectionné.",
    home_feature_qr_title: "QR Code Instantané",
    home_feature_qr_desc: "Chaque restaurant dispose de son propre lien unique accessible par téléphone sans installer d'appli.",
    home_feature_dash_title: "Tableau de Bord Complet",
    home_feature_dash_desc: "Gérez plats, prix et photos en temps réel. Consultez les statistiques des plats les plus vus.",
  },
};

export function t(locale: Locale, key: keyof TKeys): string {
  return translations[locale][key];
}

export function getLocalized(
  item: { name: string; description?: string; translations?: Record<string, { name?: string; description?: string }> },
  locale: string,
  field: "name" | "description"
): string {
  const val = item.translations?.[locale]?.[field];
  if (val) return val;
  return field === "name" ? item.name : (item.description ?? "");
}

export function translateTag(tag: string, tr: (key: keyof TKeys) => string): string {
  const t = tag.toLowerCase().trim();
  if (t === "popular") return tr("tag_popular");
  if (t === "sem-glúten" || t === "sem glúten" || t === "sem-gluten") return tr("tag_sem_gluten");
  if (t === "saudável" || t === "saudavel") return tr("tag_saudavel");
  if (t === "sem-lactose" || t === "sem lactose") return tr("tag_sem_lactose");
  if (t === "vegetariano" || t === "vegetariana") return tr("tag_vegetariano");
  if (t === "vegan" || t === "vegano" || t === "vegana") return tr("tag_vegan");
  if (t === "tradicional") return tr("tag_tradicional");
  if (t === "tinto") return tr("tag_tinto");
  if (t === "branco") return tr("tag_branco");
  if (t === "rosé" || t === "rose") return tr("tag_rose");
  if (t === "cocktail" || t === "cóctel") return tr("tag_cocktail");
  if (t === "com álcool" || t === "com alcool") return tr("tag_com_alcool");
  if (t === "sem álcool" || t === "sem alcool") return tr("tag_sem_alcool");
  if (t === "cerveja") return tr("tag_cerveja");
  if (t === "café" || t === "cafe") return tr("tag_cafe");
  return tag;
}

export function translateCategoryName(name: string, tr: (key: keyof TKeys) => string): string {
  const n = name.toLowerCase();
  if (n.includes("entrada") || n.includes("starter") || n.includes("entrante") || n.includes("entrée")) return tr("cat_starters");
  if (n.includes("principal") || n.includes("main") || n.includes("prato")) return tr("cat_mains");
  if (n.includes("sobremesa") || n.includes("dessert") || n.includes("postre")) return tr("cat_desserts");
  if (n.includes("vinho") || n.includes("wine") || n.includes("vino") || n.includes("vin")) return tr("cat_wines");
  if (n.includes("bebida") || n.includes("drink") || n.includes("beverage") || n.includes("boisson")) return tr("cat_beverages");
  if (n.includes("corta")) return tr("cat_palate");
  return name;
}
