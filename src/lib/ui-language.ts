import type { AppLanguage } from "@/lib/app-settings";

const translations: Record<Exclude<AppLanguage, "uk">, Record<string, string>> = {
  en: {
    "Огляд": "Overview",
    "Продукти": "Products",
    "Шоп-ліст": "Shopping list",
    "План тижня": "Weekly plan",
    "Історія": "History",
    "Строки": "Expiry",
    "Аналітика": "Analytics",
    "Налаштування": "Settings",
    "Тижневий бюджет": "Weekly budget",
    "Заплановано": "Planned",
    "Магазини": "Stores",
    "Додати": "Add",
    "Поточний список": "Current list",
    "Найвигідніший магазин": "Best-value store",
    "Потенційна економія": "Potential savings",
    "Найближчий строк": "Nearest expiry",
    "Список покупки": "Shopping list",
    "Покупку завершено": "Complete purchase",
    "До списку": "Add to list",
    "План покупок на тиждень": "Weekly shopping plan",
    "Історія покупок": "Purchase history",
    "Повторити": "Repeat",
    "Загальні витрати": "Total spending",
    "Середній чек": "Average receipt",
    "Остання покупка": "Latest purchase",
    "Строки придатності": "Expiry dates",
    "Використано": "Consumed",
    "Детальна аналітика": "Detailed analytics",
    "Фактичні витрати": "Actual spending",
    "План на тиждень": "Weekly plan",
    "Можлива економія": "Potential savings",
    "Excel": "Excel",
    "PDF": "PDF",
    "Зовнішність теми": "Appearance",
    "Стандартна": "Standard",
    "Темна": "Dark",
    "Світла": "Light",
    "Мова": "Language",
    "Папка експорту": "Export folder",
    "Обрати папку": "Choose folder",
    "Завантаження Windows": "Windows Downloads",
    "Закрити": "Close",
    "Скинути": "Reset",
    "Пошук продукту або магазину": "Search product or store",
  },
  fr: {
    "Огляд": "Aperçu",
    "Продукти": "Produits",
    "Шоп-ліст": "Liste de courses",
    "План тижня": "Plan hebdomadaire",
    "Історія": "Historique",
    "Строки": "Expiration",
    "Аналітика": "Analytique",
    "Налаштування": "Paramètres",
    "Тижневий бюджет": "Budget hebdomadaire",
    "Заплановано": "Planifié",
    "Магазини": "Magasins",
    "Додати": "Ajouter",
    "Поточний список": "Liste actuelle",
    "Найвигідніший магазин": "Magasin le plus avantageux",
    "Потенційна економія": "Économie potentielle",
    "Найближчий строк": "Expiration la plus proche",
    "Список покупки": "Liste de courses",
    "Покупку завершено": "Terminer l'achat",
    "До списку": "Ajouter à la liste",
    "План покупок на тиждень": "Plan de courses hebdomadaire",
    "Історія покупок": "Historique des achats",
    "Повторити": "Répéter",
    "Загальні витрати": "Dépenses totales",
    "Середній чек": "Ticket moyen",
    "Остання покупка": "Dernier achat",
    "Строки придатності": "Dates d'expiration",
    "Використано": "Utilisé",
    "Детальна аналітика": "Analytique détaillée",
    "Фактичні витрати": "Dépenses réelles",
    "План на тиждень": "Plan hebdomadaire",
    "Можлива економія": "Économie possible",
    "Зовнішність теми": "Apparence",
    "Стандартна": "Standard",
    "Темна": "Sombre",
    "Світла": "Claire",
    "Мова": "Langue",
    "Папка експорту": "Dossier d'exportation",
    "Обрати папку": "Choisir un dossier",
    "Завантаження Windows": "Téléchargements Windows",
    "Закрити": "Fermer",
    "Скинути": "Réinitialiser",
    "Пошук продукту або магазину": "Rechercher un produit ou magasin",
  },
  es: {
    "Огляд": "Resumen",
    "Продукти": "Productos",
    "Шоп-ліст": "Lista de compras",
    "План тижня": "Plan semanal",
    "Історія": "Historial",
    "Строки": "Caducidad",
    "Аналітика": "Analítica",
    "Налаштування": "Configuración",
    "Тижневий бюджет": "Presupuesto semanal",
    "Заплановано": "Planificado",
    "Магазини": "Tiendas",
    "Додати": "Añadir",
    "Поточний список": "Lista actual",
    "Найвигідніший магазин": "Tienda más económica",
    "Потенційна економія": "Ahorro potencial",
    "Найближчий строк": "Caducidad más cercana",
    "Список покупки": "Lista de compras",
    "Покупку завершено": "Completar compra",
    "До списку": "Añadir a la lista",
    "План покупок на тиждень": "Plan semanal de compras",
    "Історія покупок": "Historial de compras",
    "Повторити": "Repetir",
    "Загальні витрати": "Gasto total",
    "Середній чек": "Ticket promedio",
    "Остання покупка": "Última compra",
    "Строки придатності": "Fechas de caducidad",
    "Використано": "Consumido",
    "Детальна аналітика": "Analítica detallada",
    "Фактичні витрати": "Gastos reales",
    "План на тиждень": "Plan semanal",
    "Можлива економія": "Ahorro posible",
    "Зовнішність теми": "Apariencia",
    "Стандартна": "Estándar",
    "Темна": "Oscura",
    "Світла": "Clara",
    "Мова": "Idioma",
    "Папка експорту": "Carpeta de exportación",
    "Обрати папку": "Elegir carpeta",
    "Завантаження Windows": "Descargas de Windows",
    "Закрити": "Cerrar",
    "Скинути": "Restablecer",
    "Пошук продукту або магазину": "Buscar producto o tienda",
  },
};

const sharedTranslations: Record<string, [string, string, string]> = {
  "Помічник": ["Assistant", "Assistant", "Asistente"],
  "Помічник для нових користувачів": [
    "Assistant for new users",
    "Assistant pour les nouveaux utilisateurs",
    "Asistente para nuevos usuarios",
  ],
  "Автоматично показувати знайомство з можливостями застосунку.": [
    "Automatically show an introduction to the app.",
    "Afficher automatiquement une présentation de l'application.",
    "Mostrar automáticamente una introducción a la aplicación.",
  ],
  "Запустити помічника": [
    "Start assistant",
    "Lancer l'assistant",
    "Iniciar asistente",
  ],
  "Ласкаво просимо до Smart Grocery": [
    "Welcome to Smart Grocery",
    "Bienvenue dans Smart Grocery",
    "Bienvenido a Smart Grocery",
  ],
  "Застосунок допомагає створити власну базу продуктів, скласти список покупок, знайти вигідні магазини, спланувати тиждень і зрозуміти свої витрати.": [
    "The app helps you build a product catalog, prepare shopping lists, find better stores, plan the week and understand your spending.",
    "L'application vous aide à créer un catalogue, préparer vos courses, trouver les meilleurs magasins, planifier la semaine et comprendre vos dépenses.",
    "La aplicación te ayuda a crear un catálogo, preparar compras, encontrar mejores tiendas, planificar la semana y entender tus gastos.",
  ],
  "За кілька кроків пройдемо весь шлях: від додавання товару до завершеної покупки й аналітики.": [
    "In a few steps, we will cover the full flow: from adding a product to completing a purchase and reviewing analytics.",
    "En quelques étapes, nous verrons tout le parcours : de l'ajout d'un produit à l'achat terminé et aux analyses.",
    "En pocos pasos veremos todo el proceso: desde añadir un producto hasta completar la compra y revisar la analítica.",
  ],
  "Огляд: головний екран": ["Overview: home screen", "Aperçu : écran principal", "Resumen: pantalla principal"],
  "Це коротке зведення перед покупкою. Тут видно поточну суму списку, найвигідніший магазин, можливу економію та найближчий строк придатності.": [
    "This is a quick summary before shopping. It shows the current list total, best-value store, potential savings and nearest expiry.",
    "Voici un résumé avant les courses : total actuel, magasin le plus avantageux, économies possibles et expiration la plus proche.",
    "Este es un resumen antes de comprar: total actual, tienda más económica, ahorro posible y caducidad más próxima.",
  ],
  "Починай звідси, коли хочеш швидко зрозуміти стан покупок і бюджету.": [
    "Start here whenever you want a quick view of your shopping and budget.",
    "Commencez ici pour voir rapidement l'état de vos courses et de votre budget.",
    "Empieza aquí para ver rápidamente el estado de tus compras y presupuesto.",
  ],
  "Контролюй загальний бюджет": ["Control the overall budget", "Contrôlez le budget global", "Controla el presupuesto general"],
  "Блок показує загальний бюджет тижня та вже заплановану суму. Він допомагає побачити перевитрату ще до походу в магазин.": [
    "This block shows the weekly budget and planned total, helping you spot overspending before visiting the store.",
    "Ce bloc affiche le budget hebdomadaire et le total prévu afin de repérer les dépassements avant les courses.",
    "Este bloque muestra el presupuesto semanal y el total previsto para detectar excesos antes de comprar.",
  ],
  "Щоб встановити або змінити бюджети окремих днів, відкрий вкладку «План тижня».": [
    "To set or change daily budgets, open Weekly plan.",
    "Pour définir ou modifier les budgets quotidiens, ouvrez le plan hebdomadaire.",
    "Para definir o cambiar presupuestos diarios, abre Plan semanal.",
  ],
  "Продукти: створи власний каталог": ["Products: build your catalog", "Produits : créez votre catalogue", "Productos: crea tu catálogo"],
  "У цій вкладці зберігаються товари, їхні фото, категорії, ціни та магазини. Один товар може мати різні ціни в різних магазинах.": [
    "This section stores products, photos, categories, prices and stores. One product can have different prices across stores.",
    "Cette section conserve les produits, photos, catégories, prix et magasins. Un produit peut avoir plusieurs prix.",
    "Esta sección guarda productos, fotos, categorías, precios y tiendas. Un producto puede tener precios distintos.",
  ],
  "Знайди готовий товар, імпортуй актуальну ціну або створи власний продукт кнопкою «Додати».": [
    "Find an existing item, import a current price or create your own product with Add.",
    "Trouvez un article, importez un prix actuel ou créez votre produit avec Ajouter.",
    "Busca un artículo, importa un precio actual o crea tu producto con Añadir.",
  ],
  "Додай свій продукт": ["Add your product", "Ajoutez votre produit", "Añade tu producto"],
  "Кнопка відкриває форму нового продукту. Вкажи назву, категорію, тип ціни, магазин, строк придатності та фото.": [
    "The button opens the new-product form. Enter its name, category, price type, store, shelf life and photo.",
    "Le bouton ouvre le formulaire produit. Indiquez le nom, la catégorie, le type de prix, le magasin, la durée et la photo.",
    "El botón abre el formulario. Indica nombre, categoría, tipo de precio, tienda, caducidad y foto.",
  ],
  "Після збереження продукт з’явиться у каталозі й буде доступний для шоп-ліста та плану тижня.": [
    "After saving, the product appears in the catalog and becomes available for the shopping list and weekly plan.",
    "Après l'enregistrement, le produit apparaît dans le catalogue, la liste et le plan hebdomadaire.",
    "Después de guardar, el producto aparecerá en el catálogo, la lista y el plan semanal.",
  ],
  "Обери магазини для порівняння": ["Choose stores to compare", "Choisissez les magasins à comparer", "Elige tiendas para comparar"],
  "Фільтр визначає, у яких магазинах застосунок шукатиме найкращі ціни. Вимкни магазини, до яких не плануєш їхати.": [
    "The filter controls where the app searches for the best prices. Turn off stores you do not plan to visit.",
    "Le filtre détermine où rechercher les meilleurs prix. Désactivez les magasins que vous ne visiterez pas.",
    "El filtro determina dónde buscar los mejores precios. Desactiva las tiendas que no visitarás.",
  ],
  "Вибрані магазини впливають на підсумок шоп-ліста, оптимізатор маршруту та аналітику.": [
    "Selected stores affect the shopping-list total, route optimizer and analytics.",
    "Les magasins sélectionnés influencent le total, l'optimiseur et les analyses.",
    "Las tiendas seleccionadas afectan al total, optimizador y analítica.",
  ],
  "Шоп-ліст: підготуй покупку": ["Shopping list: prepare your trip", "Liste : préparez vos courses", "Lista: prepara la compra"],
  "Тут знаходиться список того, що потрібно купити. Змінюй кількість, прибирай зайве та бач загальну суму за найкращими цінами.": [
    "This is everything you need to buy. Adjust quantities, remove extras and see the total at the best prices.",
    "Vous trouverez ici tout ce qu'il faut acheter. Ajustez les quantités, retirez le superflu et consultez le total.",
    "Aquí está todo lo que necesitas comprar. Ajusta cantidades, elimina extras y consulta el total.",
  ],
  "Коли все придбано, заверши покупку. Вона потрапить в історію, аналітику та нагадування про строки.": [
    "When everything is purchased, complete the purchase. It will feed history, analytics and expiry reminders.",
    "Une fois les courses terminées, validez l'achat. Il alimentera l'historique, les analyses et les expirations.",
    "Cuando termines, completa la compra. Pasará al historial, la analítica y los recordatorios.",
  ],
  "Оптимізатор: знайди вигідний маршрут": ["Optimizer: find a better route", "Optimiseur : trouvez le meilleur parcours", "Optimizador: encuentra la mejor ruta"],
  "Оптимізатор порівнює весь шоп-ліст і пропонує, де купити товари дешевше: в одному магазині, у двох або за максимальною економією.": [
    "The optimizer compares the whole list and suggests where to buy cheaper: one store, two stores or maximum savings.",
    "L'optimiseur compare toute la liste et propose l'option la moins chère : un magasin, deux magasins ou économies maximales.",
    "El optimizador compara toda la lista y propone dónde comprar más barato: una tienda, dos o máximo ahorro.",
  ],
  "Застосуй рекомендований маршрут, щоб автоматично прив’язати позиції списку до вигідних магазинів.": [
    "Apply the recommended route to assign list items to better-value stores automatically.",
    "Appliquez le parcours recommandé pour attribuer automatiquement les articles aux magasins avantageux.",
    "Aplica la ruta recomendada para asignar automáticamente los artículos a las tiendas más económicas.",
  ],
  "План тижня: плануй наперед": ["Weekly plan: plan ahead", "Plan hebdomadaire : anticipez", "Plan semanal: planifica"],
  "Розподіляй майбутні покупки по днях і встановлюй денний бюджет. Так легше не забути потрібне та уникнути імпульсивних витрат.": [
    "Distribute upcoming purchases by day and set daily budgets to avoid forgotten items and impulse spending.",
    "Répartissez les achats par jour et fixez des budgets pour éviter les oublis et les dépenses impulsives.",
    "Distribuye las compras por día y fija presupuestos para evitar olvidos y gastos impulsivos.",
  ],
  "Додай товари до потрібного дня, а перед походом у магазин перенеси весь день у шоп-ліст.": [
    "Add products to the right day, then move the whole day to the shopping list before going out.",
    "Ajoutez les produits au bon jour, puis transférez la journée entière vers la liste avant de partir.",
    "Añade productos al día correcto y pasa todo el día a la lista antes de salir.",
  ],
  "Строки: менше зіпсованих продуктів": ["Expiry: waste less food", "Expirations : moins de gaspillage", "Caducidad: desperdicia menos"],
  "Після завершення покупки застосунок відстежує строки придатності та показує, що потрібно використати першочергово.": [
    "After completing a purchase, the app tracks expiry dates and shows what should be used first.",
    "Après un achat, l'application suit les expirations et indique ce qu'il faut utiliser en premier.",
    "Después de una compra, la aplicación controla caducidades y muestra qué usar primero.",
  ],
  "Позначай використані продукти, щоб список нагадувань залишався актуальним.": [
    "Mark consumed products to keep reminders accurate.",
    "Marquez les produits utilisés pour garder les rappels à jour.",
    "Marca los productos consumidos para mantener los recordatorios actualizados.",
  ],
  "Історія: усі завершені покупки": ["History: completed purchases", "Historique : achats terminés", "Historial: compras completadas"],
  "Тут зберігаються чеки та склад минулих покупок. Покупку можна швидко повторити або експортувати у PDF чи Excel.": [
    "Receipts and past purchase contents are stored here. You can repeat a purchase or export it to PDF or Excel.",
    "Les reçus et achats passés sont conservés ici. Vous pouvez répéter un achat ou l'exporter en PDF ou Excel.",
    "Aquí se guardan recibos y compras anteriores. Puedes repetir una compra o exportarla a PDF o Excel.",
  ],
  "Використовуй повторення для регулярних закупівель, а експорт — для власного обліку.": [
    "Use repeat for regular shopping and export for your own records.",
    "Utilisez la répétition pour les achats réguliers et l'exportation pour vos archives.",
    "Usa repetir para compras habituales y exportar para tus registros.",
  ],
  "Аналітика: зрозумій свої витрати": ["Analytics: understand your spending", "Analyses : comprenez vos dépenses", "Analítica: entiende tus gastos"],
  "Графіки показують витрати за категоріями, днями й покупками, середній чек, план бюджету та потенційну економію.": [
    "Charts show spending by category, day and purchase, average receipt, budget plan and potential savings.",
    "Les graphiques montrent les dépenses par catégorie, jour et achat, le ticket moyen, le budget et les économies possibles.",
    "Los gráficos muestran gastos por categoría, día y compra, ticket medio, presupuesto y ahorro posible.",
  ],
  "Переглядай аналітику після кількох завершених покупок, щоб знаходити зайві витрати й точніше планувати бюджет.": [
    "Review analytics after several purchases to find unnecessary spending and plan the budget more accurately.",
    "Consultez les analyses après plusieurs achats pour repérer les dépenses inutiles et mieux planifier.",
    "Revisa la analítica tras varias compras para detectar gastos innecesarios y planificar mejor.",
  ],
  "Налаштуй застосунок під себе": ["Make the app yours", "Personnalisez l'application", "Personaliza la aplicación"],
  "У налаштуваннях можна змінити тему, мову, папку експорту та вимкнути автоматичний запуск цього навчання.": [
    "Settings let you change the theme, language, export folder and automatic launch of this guide.",
    "Les paramètres permettent de modifier le thème, la langue, le dossier d'exportation et le lancement automatique de ce guide.",
    "La configuración permite cambiar tema, idioma, carpeta de exportación e inicio automático de esta guía.",
  ],
  "Помічник завжди доступний через лампочку біля пошуку. Тепер можна починати власний список покупок.": [
    "The assistant is always available through the lightbulb near search. You are ready to start your shopping list.",
    "L'assistant reste disponible via l'ampoule près de la recherche. Vous pouvez commencer votre liste.",
    "El asistente siempre está disponible mediante la bombilla junto a la búsqueda. Ya puedes empezar tu lista.",
  ],
  "Що робити": ["What to do", "Que faire", "Qué hacer"],
  "Очистити пошук": ["Clear search", "Effacer la recherche", "Borrar búsqueda"],
  "підключено": ["connected", "connecté", "conectado"],
  "очікує API": ["awaiting API", "API en attente", "esperando API"],
  "вигідніше": ["best value", "meilleur prix", "mejor precio"],
  "Обрано": ["Selected", "Sélectionné", "Seleccionado"],
  "Разом": ["Total", "Total", "Total"],
  "Сума, якщо купувати все в одному магазині": [
    "Total when buying everything in one store",
    "Total en achetant tout dans un seul magasin",
    "Total comprando todo en una tienda",
  ],
  "дешевше": ["cheapest", "moins cher", "más barato"],
  "Зовнішність, мова інтерфейсу та місце збереження звітів.": [
    "Appearance, interface language and report location.",
    "Apparence, langue de l'interface et emplacement des rapports.",
    "Apariencia, idioma de la interfaz y ubicación de informes.",
  ],
  "Налаштування збережено": ["Settings saved", "Paramètres enregistrés", "Configuración guardada"],
  "Особисті дані зберігаються локально": [
    "Personal data is stored locally",
    "Les données personnelles sont stockées localement",
    "Los datos personales se guardan localmente",
  ],
  "Списки, план тижня та історія покупок залишаються на цьому ПК.": [
    "Lists, weekly plans and purchase history stay on this PC.",
    "Les listes, plans hebdomadaires et l'historique restent sur ce PC.",
    "Las listas, planes semanales y el historial permanecen en este PC.",
  ],
  "версія": ["version", "version", "versión"],
  "Зменшити кількість": ["Decrease quantity", "Réduire la quantité", "Reducir cantidad"],
  "Збільшити кількість": ["Increase quantity", "Augmenter la quantité", "Aumentar cantidad"],
  "Видалити зі списку": ["Remove from list", "Retirer de la liste", "Eliminar de la lista"],
  "Видалити з плану": ["Remove from plan", "Retirer du plan", "Eliminar del plan"],
  "Завершити покупку?": ["Complete purchase?", "Terminer l'achat ?", "¿Completar compra?"],
  "буде збережено в історії. Після цього поточний шоп-ліст очиститься.": [
    "will be saved to history. The current shopping list will then be cleared.",
    "sera enregistré dans l'historique. La liste actuelle sera ensuite vidée.",
    "se guardará en el historial. Después se vaciará la lista actual.",
  ],
  "на суму": ["for a total of", "pour un total de", "por un total de"],
  "Продовжити покупки": ["Continue shopping", "Continuer les courses", "Seguir comprando"],
  "Так, завершити": ["Yes, complete", "Oui, terminer", "Sí, completar"],
  "Тиждень": ["Week", "Semaine", "Semana"],
  "Категорія": ["Category", "Catégorie", "Categoría"],
  "Підкатегорія": ["Subcategory", "Sous-catégorie", "Subcategoría"],
  "Назва": ["Name", "Nom", "Nombre"],
  "Ціна": ["Price", "Prix", "Precio"],
  "Тип ціни": ["Price type", "Type de prix", "Tipo de precio"],
  "Магазин": ["Store", "Magasin", "Tienda"],
  "Фото": ["Photo", "Photo", "Foto"],
  "Фото URL": ["Photo URL", "URL de la photo", "URL de la foto"],
  "Придатний, днів": ["Shelf life, days", "Conservation, jours", "Duración, días"],
  "Скасувати": ["Cancel", "Annuler", "Cancelar"],
  "Зберегти": ["Save", "Enregistrer", "Guardar"],
  "Позиція": ["Item", "Article", "Artículo"],
  "Позицій": ["Items", "Articles", "Artículos"],
  "позицій": ["items", "articles", "artículos"],
  "позиції": ["items", "articles", "artículos"],
  "товарів": ["products", "produits", "productos"],
  "магазинів у фільтрі": ["stores selected", "magasins sélectionnés", "tiendas seleccionadas"],
  "разом": ["total", "total", "total"],
  "за найкращими цінами": ["at the best prices", "aux meilleurs prix", "a los mejores precios"],
  "за весь список": ["for the entire list", "pour toute la liste", "para toda la lista"],
  "від бюджету": ["of budget", "du budget", "del presupuesto"],
  "завершених покупок": ["completed purchases", "achats terminés", "compras completadas"],
  "покупок збережено у SQLite": ["purchases saved in SQLite", "achats enregistrés dans SQLite", "compras guardadas en SQLite"],
  "Акції": ["Discounts", "Promotions", "Ofertas"],
  "Обране": ["Favorites", "Favoris", "Favoritos"],
  "Всі товари": ["All products", "Tous les produits", "Todos los productos"],
  "З фото": ["With photo", "Avec photo", "Con foto"],
  "Без фото": ["Without photo", "Sans photo", "Sin foto"],
  "Усі категорії": ["All categories", "Toutes les catégories", "Todas las categorías"],
  "Активних фільтрів": ["Active filters", "Filtres actifs", "Filtros activos"],
  "Live ціни магазинів": ["Live store prices", "Prix magasins en direct", "Precios de tiendas en vivo"],
  "Знайти ціни": ["Find prices", "Trouver les prix", "Buscar precios"],
  "Шукаю": ["Searching", "Recherche", "Buscando"],
  "Імпорт": ["Import", "Importer", "Importar"],
  "Порівняння кошика": ["Basket comparison", "Comparaison du panier", "Comparación de cesta"],
  "Витрати по категоріях": ["Spending by category", "Dépenses par catégorie", "Gastos por categoría"],
  "SQLite статус": ["SQLite status", "Statut SQLite", "Estado SQLite"],
  "Локальне збереження активне": ["Local storage is active", "Stockage local actif", "Almacenamiento local activo"],
  "Додати продукт": ["Add product", "Ajouter un produit", "Añadir producto"],
  "Усі продукти додано": ["All products added", "Tous les produits ajoutés", "Todos los productos añadidos"],
  "У шоп-ліст": ["To shopping list", "Vers la liste", "A la lista"],
  "Бюджет дня": ["Daily budget", "Budget quotidien", "Presupuesto diario"],
  "в бюджеті": ["within budget", "dans le budget", "dentro del presupuesto"],
  "понад": ["over budget", "hors budget", "sobre el presupuesto"],
  "Потребують уваги": ["Needs attention", "À surveiller", "Requieren atención"],
  "Прострочені продукти": ["Expired products", "Produits expirés", "Productos caducados"],
  "Скоро використати": ["Use soon", "À utiliser bientôt", "Usar pronto"],
  "У нормі": ["All good", "En bon état", "En buen estado"],
  "Використати сьогодні": ["Use today", "À utiliser aujourd'hui", "Usar hoy"],
  "Придатний до": ["Best before", "À consommer avant", "Consumir antes de"],
  "Кількість": ["Quantity", "Quantité", "Cantidad"],
  "Фактичні витрати за покупками": ["Actual spending by purchase", "Dépenses réelles par achat", "Gastos reales por compra"],
  "Планові витрати по днях": ["Planned spending by day", "Dépenses prévues par jour", "Gastos previstos por día"],
  "Структура шоп-ліста": ["Shopping-list breakdown", "Répartition de la liste", "Distribución de la lista"],
  "Порівняння вартості кошика": ["Basket cost comparison", "Comparaison du coût du panier", "Comparación del coste de la cesta"],
  "Оптимізатор": ["Optimizer", "Optimiseur", "Optimizador"],
  "Оптимізатор покупки": ["Shopping optimizer", "Optimiseur d'achats", "Optimizador de compras"],
  "Один магазин": ["One store", "Un magasin", "Una tienda"],
  "До двох магазинів": ["Up to two stores", "Jusqu'à deux magasins", "Hasta dos tiendas"],
  "Максимальна економія": ["Maximum savings", "Économie maximale", "Ahorro máximo"],
  "Найпростіший маршрут": ["Simplest route", "Itinéraire le plus simple", "Ruta más sencilla"],
  "Рекомендований баланс": ["Recommended balance", "Équilibre recommandé", "Equilibrio recomendado"],
  "Найнижча ціна кожної позиції": ["Lowest price per item", "Prix le plus bas par article", "Precio mínimo por artículo"],
  "Застосувати маршрут": ["Apply route", "Appliquer l'itinéraire", "Aplicar ruta"],
  "Рекомендований маршрут": ["Recommended route", "Itinéraire recommandé", "Ruta recomendada"],
  "Результат оптимізації": ["Optimization result", "Résultat de l'optimisation", "Resultado de optimización"],
  "Економія маршруту": ["Route savings", "Économie de l'itinéraire", "Ahorro de la ruta"],
  "Максимально можливо": ["Maximum possible", "Maximum possible", "Máximo posible"],
  "Застосувати рекомендований маршрут": ["Apply recommended route", "Appliquer l'itinéraire recommandé", "Aplicar ruta recomendada"],
  "Немає всіх цін": ["Some prices are missing", "Certains prix manquent", "Faltan algunos precios"],
  "Заплановано": ["Planned", "Planifié", "Planificado"],
  "Бюджет": ["Budget", "Budget", "Presupuesto"],
  "Кошик": ["Basket", "Panier", "Cesta"],
  "Чек": ["Receipt", "Ticket", "Recibo"],
  "Формую...": ["Generating...", "Génération...", "Generando..."],
  "Нічого не знайдено": ["Nothing found", "Aucun résultat", "No se encontró nada"],
  "Новий продукт": ["New product", "Nouveau produit", "Nuevo producto"],
  "Нова позиція": ["New item", "Nouvel article", "Nuevo artículo"],
  "Овочі та фрукти": ["Fruit and vegetables", "Fruits et légumes", "Frutas y verduras"],
  "Напої": ["Drinks", "Boissons", "Bebidas"],
  "Молочні продукти": ["Dairy products", "Produits laitiers", "Productos lácteos"],
  "М'ясо": ["Meat", "Viande", "Carne"],
  "Снеки": ["Snacks", "Snacks", "Aperitivos"],
  "Заморожені продукти": ["Frozen foods", "Produits surgelés", "Alimentos congelados"],
  "Готові страви": ["Ready meals", "Plats préparés", "Platos preparados"],
  "Побутові товари": ["Household goods", "Produits ménagers", "Artículos del hogar"],
  "Інше": ["Other", "Autre", "Otros"],
  "Свіжі овочі": ["Fresh vegetables", "Légumes frais", "Verduras frescas"],
  "Йогурти": ["Yogurts", "Yaourts", "Yogures"],
  "Птиця": ["Poultry", "Volaille", "Aves"],
  "Горіхи": ["Nuts", "Noix", "Frutos secos"],
  "Вода": ["Water", "Eau", "Agua"],
  "Овочі": ["Vegetables", "Légumes", "Verduras"],
  "Помідори": ["Tomatoes", "Tomates", "Tomates"],
  "Грецький йогурт": ["Greek yogurt", "Yaourt grec", "Yogur griego"],
  "Куряче філе": ["Chicken fillet", "Filet de poulet", "Filete de pollo"],
  "Мигдаль": ["Almonds", "Amandes", "Almendras"],
  "Мінеральна вода": ["Mineral water", "Eau minérale", "Agua mineral"],
  "Овочева суміш": ["Vegetable mix", "Mélange de légumes", "Mezcla de verduras"],
  "Авокадо": ["Avocado", "Avocat", "Aguacate"],
  "Банани": ["Bananas", "Bananes", "Plátanos"],
  "Яблука": ["Apples", "Pommes", "Manzanas"],
  "Огірки": ["Cucumbers", "Concombres", "Pepinos"],
  "Сир": ["Cheese", "Fromage", "Queso"],
  "Риба": ["Fish", "Poisson", "Pescado"],
  "Хліб": ["Bread", "Pain", "Pan"],
  "Яйця": ["Eggs", "Œufs", "Huevos"],
  "Кава": ["Coffee", "Café", "Café"],
  "Чай": ["Tea", "Thé", "Té"],
  "Морозиво": ["Ice cream", "Glace", "Helado"],
  "Піца": ["Pizza", "Pizza", "Pizza"],
  "Паста": ["Pasta", "Pâtes", "Pasta"],
  "Зелень": ["Greens", "Herbes", "Verduras de hoja"],
  "Пн": ["Mon", "Lun", "Lun"],
  "Вт": ["Tue", "Mar", "Mar"],
  "Ср": ["Wed", "Mer", "Mié"],
  "Чт": ["Thu", "Jeu", "Jue"],
  "Пт": ["Fri", "Ven", "Vie"],
  "Сб": ["Sat", "Sam", "Sáb"],
  "Нд": ["Sun", "Dim", "Dom"],
  "кг": ["kg", "kg", "kg"],
  "шт.": ["pcs", "pcs", "uds."],
  "уп.": ["pack", "paquet", "paq."],
  "за кг": ["per kg", "par kg", "por kg"],
  "за штуку": ["per item", "par pièce", "por unidad"],
  "за упаковку": ["per pack", "par paquet", "por paquete"],
};

for (const [source, values] of Object.entries(sharedTranslations)) {
  translations.en[source] = values[0];
  translations.fr[source] = values[1];
  translations.es[source] = values[2];
}

const originals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();
const lastAppliedTexts = new WeakMap<Text, string>();
const lastAppliedAttributes = new WeakMap<Element, Map<string, string>>();
const sortedTranslationEntries = {
  en: Object.entries(translations.en).sort(([a], [b]) => b.length - a.length),
  fr: Object.entries(translations.fr).sort(([a], [b]) => b.length - a.length),
  es: Object.entries(translations.es).sort(([a], [b]) => b.length - a.length),
};

function translateValue(value: string, language: AppLanguage) {
  if (language === "uk") return value;
  const exact = translations[language][value];
  if (exact) return exact;

  return sortedTranslationEntries[language].reduce(
    (result, [source, translated]) => result.split(source).join(translated),
    value,
  );
}

function translateNode(node: Node, language: AppLanguage) {
  if (node instanceof Text) {
    const current = node.textContent ?? "";
    if (!originals.has(node) || current !== lastAppliedTexts.get(node)) {
      originals.set(node, current);
    }
    const original = originals.get(node) ?? "";
    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = original.replace(trimmed, translateValue(trimmed, language));
    lastAppliedTexts.set(node, translated);
    if (current !== translated) node.textContent = translated;
    return;
  }

  if (!(node instanceof Element)) return;

  for (const attribute of ["placeholder", "aria-label", "title", "alt"]) {
    const current = node.getAttribute(attribute);
    if (!current) continue;
    if (!attributeOriginals.has(node)) attributeOriginals.set(node, new Map());
    if (!lastAppliedAttributes.has(node)) lastAppliedAttributes.set(node, new Map());
    const originalsMap = attributeOriginals.get(node)!;
    const appliedMap = lastAppliedAttributes.get(node)!;
    if (!originalsMap.has(attribute) || current !== appliedMap.get(attribute)) {
      originalsMap.set(attribute, current);
    }
    const translated = translateValue(originalsMap.get(attribute) ?? current, language);
    appliedMap.set(attribute, translated);
    if (current !== translated) node.setAttribute(attribute, translated);
  }

  node.childNodes.forEach((child) => translateNode(child, language));
}

export function applyUiLanguage(language: AppLanguage) {
  document.documentElement.lang = language;
  translateNode(document.body, language);
}

export function observeUiLanguage(language: AppLanguage) {
  applyUiLanguage(language);
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => translateNode(node, language));
      if (mutation.type === "characterData") translateNode(mutation.target, language);
    });
  });
  observer.observe(document.body, {
    characterData: true,
    childList: true,
    subtree: true,
  });
  return () => observer.disconnect();
}
