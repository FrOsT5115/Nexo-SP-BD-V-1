-- ============================================
-- SEED SAMPLE RECIPES
-- ============================================

INSERT INTO recipes (title, description, image_url, category, difficulty, prep_time_minutes, calories, protein_grams, carbs_grams, fats_grams, ingredients, steps, suitable_for_conditions) VALUES
(
  'Ensalada Fresca de Verano',
  'Una ensalada colorida llena de vegetales frescos y nutritivos, perfecta para mantenerte saludable.',
  '/fresh-colorful-healthy-salad-bowl-with-vegetables-.jpg',
  'lunch',
  'easy',
  15,
  250,
  8.5,
  35.0,
  10.0,
  '[
    "2 tazas de lechuga mixta",
    "1 tomate grande cortado",
    "1 pepino en rodajas",
    "1/2 aguacate",
    "2 cucharadas de aceite de oliva",
    "Jugo de 1 limón",
    "Sal y pimienta al gusto"
  ]'::jsonb,
  '[
    "Lava y corta todos los vegetales en trozos del tamaño deseado.",
    "Coloca la lechuga como base en un tazón grande.",
    "Añade el tomate, pepino y aguacate encima.",
    "En un tazón pequeño, mezcla el aceite de oliva, jugo de limón, sal y pimienta.",
    "Vierte el aderezo sobre la ensalada y mezcla suavemente.",
    "Sirve inmediatamente y disfruta."
  ]'::jsonb,
  ARRAY['diabetes', 'hypertension', 'weight_loss']
),
(
  'Bowl de Smoothie Verde Energizante',
  'Un delicioso bowl de smoothie lleno de nutrientes para comenzar tu día con energía.',
  '/vibrant-green-smoothie-bowl-with-berries-and-grano.jpg',
  'breakfast',
  'easy',
  10,
  320,
  12.0,
  52.0,
  8.0,
  '[
    "2 plátanos congelados",
    "1 taza de espinacas frescas",
    "1/2 taza de leche de almendras",
    "1 cucharada de mantequilla de maní",
    "1/2 taza de arándanos",
    "2 cucharadas de granola",
    "Semillas de chía para decorar"
  ]'::jsonb,
  '[
    "Coloca los plátanos, espinacas, leche de almendras y mantequilla de maní en una licuadora.",
    "Licúa hasta obtener una consistencia suave y cremosa.",
    "Vierte el smoothie en un tazón.",
    "Decora con arándanos, granola y semillas de chía.",
    "Sirve inmediatamente."
  ]'::jsonb,
  ARRAY['energy_boost', 'digestive_health']
),
(
  'Bowl de Pollo a la Parrilla con Proteínas',
  'Un bowl completo de proteínas con pollo a la parrilla, quinoa y vegetales asados.',
  '/grilled-chicken-salad-with-mixed-greens-avocado-an.jpg',
  'dinner',
  'medium',
  35,
  450,
  38.0,
  42.0,
  15.0,
  '[
    "200g de pechuga de pollo",
    "1 taza de quinoa cocida",
    "1 taza de brócoli",
    "1/2 pimiento rojo",
    "1/4 aguacate",
    "2 cucharaditas de aceite de oliva",
    "Especias al gusto (comino, paprika, ajo en polvo)"
  ]'::jsonb,
  '[
    "Sazona la pechuga de pollo con especias y déjala reposar 10 minutos.",
    "Calienta una parrilla o sartén a fuego medio-alto.",
    "Cocina el pollo 6-7 minutos por lado hasta que esté completamente cocido.",
    "Mientras tanto, cuece el brócoli al vapor durante 5 minutos.",
    "Asa el pimiento rojo con un poco de aceite de oliva.",
    "Arma el bowl: coloca la quinoa como base, añade el pollo cortado, brócoli, pimiento y aguacate.",
    "Sirve caliente y disfruta."
  ]'::jsonb,
  ARRAY['muscle_building', 'weight_loss', 'high_protein']
),
(
  'Buddha Bowl de Quinoa y Garbanzos',
  'Un bowl nutritivo y completo con quinoa, garbanzos asados y vegetales coloridos. Ideal para vegetarianos.',
  '/quinoa-buddha-bowl-with-roasted-vegetables-chickpe.jpg',
  'lunch',
  'medium',
  40,
  520,
  18.0,
  68.0,
  18.0,
  '[
    "1 taza de quinoa cruda",
    "1 lata de garbanzos escurridos",
    "1 camote mediano cortado en cubos",
    "1 taza de col rizada (kale) picada",
    "1/2 taza de zanahoria rallada",
    "2 cucharadas de tahini",
    "1 cucharada de jugo de limón",
    "1 cucharadita de comino",
    "Sal y pimienta al gusto"
  ]'::jsonb,
  '[
    "Precalienta el horno a 200°C.",
    "Cocina la quinoa según las instrucciones del paquete (aproximadamente 15 minutos).",
    "Mezcla los garbanzos y el camote con aceite de oliva, comino, sal y pimienta.",
    "Coloca los garbanzos y el camote en una bandeja y hornea por 25-30 minutos hasta que estén dorados.",
    "Masajea la col rizada con un poco de aceite de oliva para suavizarla.",
    "Prepara el aderezo mezclando tahini, jugo de limón, y un poco de agua hasta obtener consistencia cremosa.",
    "Arma el bowl: coloca la quinoa como base, añade los garbanzos asados, camote, col rizada y zanahoria.",
    "Rocía el aderezo de tahini por encima y sirve."
  ]'::jsonb,
  ARRAY['vegetarian', 'high_fiber', 'weight_loss', 'digestive_health']
),
(
  'Parfait de Chía con Berries',
  'Un desayuno ligero y delicioso con semillas de chía, yogur griego y frutas frescas. Rico en omega-3.',
  '/chia-seed-pudding-parfait-with-fresh-berries-and-c.jpg',
  'breakfast',
  'easy',
  10,
  280,
  15.0,
  35.0,
  10.0,
  '[
    "3 cucharadas de semillas de chía",
    "1 taza de leche de almendras",
    "1 cucharadita de miel o jarabe de maple",
    "1/2 taza de yogur griego natural",
    "1/2 taza de fresas frescas",
    "1/4 taza de arándanos",
    "2 cucharadas de granola",
    "Hojas de menta para decorar"
  ]'::jsonb,
  '[
    "En un frasco o tazón, mezcla las semillas de chía con la leche de almendras y la miel.",
    "Revuelve bien para evitar grumos y refrigera durante mínimo 4 horas o toda la noche.",
    "Al momento de servir, coloca una capa de pudding de chía en el fondo de un vaso.",
    "Añade una capa de yogur griego.",
    "Agrega otra capa de pudding de chía.",
    "Corona con fresas, arándanos y granola.",
    "Decora con hojas de menta y sirve frío."
  ]'::jsonb,
  ARRAY['heart_health', 'digestive_health', 'energy_boost']
),
(
  'Salmón al Horno con Vegetales Mediterráneos',
  'Filete de salmón jugoso horneado con vegetales mediterráneos. Alto en omega-3 y proteínas de calidad.',
  '/placeholder.svg?height=400&width=600',
  'dinner',
  'medium',
  30,
  485,
  42.0,
  28.0,
  22.0,
  '[
    "2 filetes de salmón (150g cada uno)",
    "1 calabacín cortado en rodajas",
    "1 berenjena pequeña en cubos",
    "10 tomates cherry",
    "1/2 cebolla roja en gajos",
    "2 dientes de ajo picados",
    "2 cucharadas de aceite de oliva extra virgen",
    "Jugo de 1/2 limón",
    "Orégano, tomillo y romero al gusto",
    "Sal y pimienta"
  ]'::jsonb,
  '[
    "Precalienta el horno a 190°C.",
    "En una bandeja para hornear, coloca el calabacín, berenjena, tomates cherry y cebolla.",
    "Rocía los vegetales con 1 cucharada de aceite de oliva, ajo, orégano y sal.",
    "Hornea los vegetales durante 15 minutos.",
    "Mientras tanto, sazona los filetes de salmón con sal, pimienta, tomillo y romero.",
    "Retira la bandeja del horno, haz espacio en el centro y coloca los filetes de salmón.",
    "Rocía el salmón con el resto del aceite de oliva y jugo de limón.",
    "Hornea todo junto por 12-15 minutos más hasta que el salmón esté cocido pero jugoso.",
    "Sirve caliente acompañado de los vegetales asados."
  ]'::jsonb,
  ARRAY['heart_health', 'brain_health', 'anti_inflammatory', 'high_protein']
);
