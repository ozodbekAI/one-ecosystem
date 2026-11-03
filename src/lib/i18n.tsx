import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "uz" | "ru" | "en";
export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "uz", label: "O‘zbekcha", short: "UZ" },
  { code: "ru", label: "Русский", short: "RU" },
  { code: "en", label: "English", short: "EN" },
];
export const DEFAULT_LANG: Lang = "uz";

const uz = {
  "nav.home": "Bosh sahifa",
  "nav.products": "Mahsulotlar",
  "nav.about": "Biz haqimizda",
  "nav.brand": "Brend",
  "nav.contact": "Aloqa",
  "nav.menu": "Menyu",

  "cta.contact": "Bog‘lanish",
  "cta.explore": "Mahsulotlarni ko‘rish",
  "cta.telegram": "Telegram’da yozish",
  "cta.call": "Qo‘ng‘iroq qilish",
  "cta.open": "Ochish",
  "cta.connect": "Ulanish uchun yozing",
  "cta.notify": "Ishga tushganda xabar olish",
  "cta.more": "Batafsil",
  "cta.all": "Barcha mahsulotlar",

  "status.live": "Ishlamoqda",
  "status.soon": "Tez orada",

  slogan: "Barchasi biz bilan",

  "home.kicker": "ONE Ecosystem",
  "home.title.a": "Barchasi",
  "home.title.hi": "biz bilan",
  "home.title.b": "",
  "home.lead":
    "ONE — marketpleys sotuvchilari va tadbirkorlar uchun bir-biriga ulangan xizmatlar oilasi. Hisob-kitob, savdo va mijozlar — hammasi bitta ekotizimda.",
  "home.ring": "Har bir yangi mahsulot shu halqaga ulanadi",
  "home.products.title": "Ekotizim mahsulotlari",
  "home.products.lead": "Har biri alohida ishlaydi, birgalikda esa kuchliroq.",
  "home.plus.kicker": "Hozir ishlayapti",
  "home.plus.title.a": "Marketpleys biznesingiz —",
  "home.plus.title.hi": "bir qarashda",
  "home.plus.lead":
    "Uzum Market, Ozon, Wildberries va Yandex Market. Tushum, xarajat, qoldiq va sof foyda — bitta ekranda.",
  "home.plus.stat1": "marketpleys",
  "home.plus.stat2": "ekran",
  "home.plus.stat3": "so‘mda aniq foyda",
  "home.why.title": "Nega aynan ONE?",
  "home.why.1.t": "Bitta hisob",
  "home.why.1.d": "Bir marta ro‘yxatdan o‘ting — barcha ONE mahsulotlariga shu hisob bilan kirasiz.",
  "home.why.2.t": "O‘zbekiston uchun",
  "home.why.2.d": "So‘mda hisob-kitob, o‘zbek tilidagi interfeys va mahalliy marketpleyslar.",
  "home.why.3.t": "Rasmiy ma’lumotlar",
  "home.why.3.d": "Marketpleyslarning rasmiy API’lari orqali — taxmin emas, aniq raqamlar.",
  "home.why.4.t": "Doim o‘sib boradi",
  "home.why.4.d": "Ekotizimga yangi mahsulotlar qo‘shiladi, siz esa ulardan birinchilardan bo‘lib foydalanasiz.",
  "home.logo.kicker": "Logotip ma’nosi",
  "home.logo.title": "«O» — bitta butunga yopiladigan halqa",
  "home.logo.text":
    "ONE so‘zidagi «O» harfi — halqa diagramma. Bo‘laklar bitta butunga yopiladi: har bir mahsulot shu halqaning bir bo‘lagi. ONE Plus’da halqa to‘rt marketpleys ulushidan iborat — xuddi dasturning o‘zidagi diagramma kabi.",
  "home.cta.title": "Birinchilardan bo‘lib foydalanmoqchimisiz?",
  "home.cta.lead": "Bizga yozing — biznesingizga mos mahsulotni tanlab, ulab beramiz.",

  "products.kicker": "Ekotizim",
  "products.title": "ONE mahsulotlari",
  "products.lead": "Bitta ekotizimdagi barcha xizmatlar. Yangilari doimiy qo‘shilib boradi.",
  "products.empty": "Hozircha mahsulotlar yo‘q.",

  "product.features": "Imkoniyatlar",
  "product.gallery": "Qanday ko‘rinadi",
  "product.others": "Ekotizimdagi boshqa mahsulotlar",
  "product.soon": "Bu mahsulot tez orada ishga tushadi. Birinchilardan bo‘lib xabar olish uchun bizga yozing.",
  "product.notFound": "Mahsulot topilmadi",
  "product.notFoundLead": "Bunday mahsulot yo‘q yoki u hali e’lon qilinmagan.",

  "about.kicker": "Biz haqimizda",
  "about.title.a": "Biz tadbirkorlar uchun",
  "about.title.hi": "bitta ekotizim",
  "about.title.b": "quryapmiz",
  "about.lead":
    "Marketpleysda sotish, mijozlar bilan ishlash, hisob-kitob va o‘qish uchun tadbirkor o‘nlab turli dasturlardan foydalanadi. ONE ularni bitta oilaga birlashtiradi.",
  "about.mission.t": "Maqsadimiz",
  "about.mission.d":
    "O‘zbekistondagi har bir sotuvchi o‘z biznesini aniq raqamlar bilan boshqarishi, vaqtini esa o‘sishga sarflashi kerak. Biz murakkab ishlarni avtomatlashtiramiz.",
  "about.name.t": "Nega «ONE»?",
  "about.name.d":
    "ONE — «bitta» degani: bitta hisob, bitta ekran, bitta jamoa. So‘zning boshida esa ON bor — biznesingizni yoqing.",
  "about.principles": "Tamoyillarimiz",
  "about.p1.t": "Aniqlik",
  "about.p1.d": "Har bir so‘m hisobda. Raqamlar rasmiy manbalardan olinadi va tushunarli ko‘rsatiladi.",
  "about.p2.t": "Soddalik",
  "about.p2.d": "Murakkab hisob-kitob — oddiy ekranda. O‘rgatishsiz tushunarli.",
  "about.p3.t": "Birlik",
  "about.p3.d": "Har bir yangi mahsulot ekotizimga ulanadi va boshqalari bilan birga ishlaydi.",
  "about.roadmap": "Ekotizim tarkibi",

  "brand.kicker": "Brend",
  "brand.title": "Logotiplar va ranglar",
  "brand.lead": "ONE ekotizimining rasmiy logotiplari. SVG yoki PNG formatida yuklab oling.",
  "brand.main": "ONE — kompaniya va ekotizim",
  "brand.products": "Mahsulot logotiplari",
  "brand.rule":
    "Har bir mahsulot bir xil qoida bilan yoziladi: ONE + mahsulot nomi binafsha rangda. Rangli to‘rt bo‘lakli halqa faqat ONE Plus’da, chunki u to‘rt marketpleysni birlashtiradi.",
  "brand.onLight": "Oq fonda",
  "brand.onDark": "To‘q fonda",
  "brand.appIcon": "Ilova ikonkasi",
  "brand.mark": "Belgi",
  "brand.colors": "Ranglar",
  "brand.type": "Shrift",
  "brand.typeNote": "Barcha sarlavha va matnlar uchun Plus Jakarta Sans.",
  "brand.copied": "Nusxa olindi",

  "contact.kicker": "Aloqa",
  "contact.title": "Keling, gaplashamiz",
  "contact.lead": "Savol, hamkorlik yoki mahsulotga ulanish bo‘yicha — yozing yoki qo‘ng‘iroq qiling.",
  "contact.phone": "Telefon",
  "contact.telegram": "Telegram",
  "contact.reply": "Odatda bir necha soat ichida javob beramiz.",

  "footer.tagline": "Tadbirkorlar uchun bitta ekotizim.",
  "footer.rights": "Barcha huquqlar himoyalangan.",
  "footer.products": "Mahsulotlar",
  "footer.company": "Kompaniya",
  "home.scroll": "Pastga suring",
  "home.manifesto": "ONE nima?",
  "slides.prev": "Oldingi slayd",
  "slides.next": "Keyingi slayd",
  "slides.slide": "Slayd",
};

type Dict = typeof uz;
export type TKey = keyof Dict;

const ru: Dict = {
  "nav.home": "Главная",
  "nav.products": "Продукты",
  "nav.about": "О нас",
  "nav.brand": "Бренд",
  "nav.contact": "Контакты",
  "nav.menu": "Меню",

  "cta.contact": "Связаться",
  "cta.explore": "Смотреть продукты",
  "cta.telegram": "Написать в Telegram",
  "cta.call": "Позвонить",
  "cta.open": "Открыть",
  "cta.connect": "Написать для подключения",
  "cta.notify": "Узнать о запуске",
  "cta.more": "Подробнее",
  "cta.all": "Все продукты",

  "status.live": "Работает",
  "status.soon": "Скоро",

  slogan: "Всё вместе с нами",

  "home.kicker": "ONE Ecosystem",
  "home.title.a": "Всё",
  "home.title.hi": "вместе с нами",
  "home.title.b": "",
  "home.lead":
    "ONE — семейство связанных сервисов для продавцов на маркетплейсах и предпринимателей. Учёт, продажи и клиенты — в одной экосистеме.",
  "home.ring": "Каждый новый продукт подключается к этому кольцу",
  "home.products.title": "Продукты экосистемы",
  "home.products.lead": "Каждый работает сам по себе, а вместе — сильнее.",
  "home.plus.kicker": "Уже работает",
  "home.plus.title.a": "Ваш бизнес на маркетплейсах —",
  "home.plus.title.hi": "с одного взгляда",
  "home.plus.lead":
    "Uzum Market, Ozon, Wildberries и Яндекс Маркет. Выручка, расходы, остатки и чистая прибыль — на одном экране.",
  "home.plus.stat1": "маркетплейса",
  "home.plus.stat2": "экран",
  "home.plus.stat3": "точная прибыль в сумах",
  "home.why.title": "Почему ONE?",
  "home.why.1.t": "Один аккаунт",
  "home.why.1.d": "Зарегистрируйтесь один раз — и входите во все продукты ONE с этим аккаунтом.",
  "home.why.2.t": "Для Узбекистана",
  "home.why.2.d": "Расчёты в сумах, интерфейс на узбекском и местные маркетплейсы.",
  "home.why.3.t": "Официальные данные",
  "home.why.3.d": "Через официальные API маркетплейсов — не догадки, а точные цифры.",
  "home.why.4.t": "Постоянно растёт",
  "home.why.4.d": "В экосистему добавляются новые продукты, а вы пользуетесь ими одними из первых.",
  "home.logo.kicker": "Смысл логотипа",
  "home.logo.title": "«O» — кольцо, которое замыкается в одно целое",
  "home.logo.text":
    "Буква «O» в слове ONE — кольцевая диаграмма. Части замыкаются в одно целое: каждый продукт — часть этого кольца. В ONE Plus кольцо состоит из долей четырёх маркетплейсов — как диаграмма в самой программе.",
  "home.cta.title": "Хотите пользоваться одними из первых?",
  "home.cta.lead": "Напишите нам — подберём и подключим продукт под ваш бизнес.",

  "products.kicker": "Экосистема",
  "products.title": "Продукты ONE",
  "products.lead": "Все сервисы одной экосистемы. Новые добавляются постоянно.",
  "products.empty": "Пока продуктов нет.",

  "product.features": "Возможности",
  "product.gallery": "Как это выглядит",
  "product.others": "Другие продукты экосистемы",
  "product.soon": "Этот продукт скоро запустится. Напишите нам, чтобы узнать о запуске первыми.",
  "product.notFound": "Продукт не найден",
  "product.notFoundLead": "Такого продукта нет или он ещё не анонсирован.",

  "about.kicker": "О нас",
  "about.title.a": "Мы строим",
  "about.title.hi": "одну экосистему",
  "about.title.b": "для предпринимателей",
  "about.lead":
    "Чтобы продавать на маркетплейсах, работать с клиентами, вести учёт и учиться, предприниматель пользуется десятками разных программ. ONE объединяет их в одну семью.",
  "about.mission.t": "Наша цель",
  "about.mission.d":
    "Каждый продавец в Узбекистане должен управлять бизнесом по точным цифрам, а время тратить на рост. Мы автоматизируем сложную работу.",
  "about.name.t": "Почему «ONE»?",
  "about.name.d":
    "ONE — значит «один»: один аккаунт, один экран, одна команда. А в начале слова — ON: включите свой бизнес.",
  "about.principles": "Наши принципы",
  "about.p1.t": "Точность",
  "about.p1.d": "Каждый сум на счету. Цифры берутся из официальных источников и показываются понятно.",
  "about.p2.t": "Простота",
  "about.p2.d": "Сложные расчёты — на простом экране. Понятно без обучения.",
  "about.p3.t": "Единство",
  "about.p3.d": "Каждый новый продукт подключается к экосистеме и работает вместе с остальными.",
  "about.roadmap": "Состав экосистемы",

  "brand.kicker": "Бренд",
  "brand.title": "Логотипы и цвета",
  "brand.lead": "Официальные логотипы экосистемы ONE. Скачивайте в SVG или PNG.",
  "brand.main": "ONE — компания и экосистема",
  "brand.products": "Логотипы продуктов",
  "brand.rule":
    "Каждый продукт пишется по одному правилу: ONE + название продукта фиолетовым. Цветное кольцо из четырёх частей — только у ONE Plus, потому что он объединяет четыре маркетплейса.",
  "brand.onLight": "На светлом",
  "brand.onDark": "На тёмном",
  "brand.appIcon": "Иконка приложения",
  "brand.mark": "Знак",
  "brand.colors": "Цвета",
  "brand.type": "Шрифт",
  "brand.typeNote": "Plus Jakarta Sans для всех заголовков и текстов.",
  "brand.copied": "Скопировано",

  "contact.kicker": "Контакты",
  "contact.title": "Давайте поговорим",
  "contact.lead": "Вопросы, партнёрство или подключение продукта — пишите или звоните.",
  "contact.phone": "Телефон",
  "contact.telegram": "Telegram",
  "contact.reply": "Обычно отвечаем в течение нескольких часов.",

  "footer.tagline": "Одна экосистема для предпринимателей.",
  "footer.rights": "Все права защищены.",
  "footer.products": "Продукты",
  "footer.company": "Компания",
  "home.scroll": "Листайте вниз",
  "home.manifesto": "Что такое ONE?",
  "slides.prev": "Предыдущий слайд",
  "slides.next": "Следующий слайд",
  "slides.slide": "Слайд",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.products": "Products",
  "nav.about": "About",
  "nav.brand": "Brand",
  "nav.contact": "Contact",
  "nav.menu": "Menu",

  "cta.contact": "Get in touch",
  "cta.explore": "Explore products",
  "cta.telegram": "Message on Telegram",
  "cta.call": "Call us",
  "cta.open": "Open",
  "cta.connect": "Message us to connect",
  "cta.notify": "Get notified at launch",
  "cta.more": "Learn more",
  "cta.all": "All products",

  "status.live": "Live",
  "status.soon": "Coming soon",

  slogan: "All of it, with us",

  "home.kicker": "ONE Ecosystem",
  "home.title.a": "All of it,",
  "home.title.hi": "with us",
  "home.title.b": "",
  "home.lead":
    "ONE is a family of connected services for marketplace sellers and entrepreneurs. Accounting, sales and customers — all in one ecosystem.",
  "home.ring": "Every new product plugs into this ring",
  "home.products.title": "Ecosystem products",
  "home.products.lead": "Each one works on its own — and they are stronger together.",
  "home.plus.kicker": "Live now",
  "home.plus.title.a": "Your marketplace business,",
  "home.plus.title.hi": "at a glance",
  "home.plus.lead":
    "Uzum Market, Ozon, Wildberries and Yandex Market. Revenue, expenses, stock and net profit on one screen.",
  "home.plus.stat1": "marketplaces",
  "home.plus.stat2": "screen",
  "home.plus.stat3": "exact profit in soum",
  "home.why.title": "Why ONE?",
  "home.why.1.t": "One account",
  "home.why.1.d": "Sign up once and use the same account across every ONE product.",
  "home.why.2.t": "Built for Uzbekistan",
  "home.why.2.d": "Numbers in soum, an Uzbek-language interface and local marketplaces.",
  "home.why.3.t": "Official data",
  "home.why.3.d": "Pulled from the marketplaces’ official APIs — exact numbers, not guesses.",
  "home.why.4.t": "Always growing",
  "home.why.4.d": "New products keep joining the ecosystem, and you get to use them first.",
  "home.logo.kicker": "The logo",
  "home.logo.title": "The “O” is a ring that closes into one whole",
  "home.logo.text":
    "The “O” in ONE is a ring chart. Its pieces close into one whole: every product is a piece of that ring. In ONE Plus, the ring is made of four marketplace shares — just like the chart inside the app.",
  "home.cta.title": "Want to be among the first?",
  "home.cta.lead": "Message us — we’ll pick the right product for your business and set it up.",

  "products.kicker": "Ecosystem",
  "products.title": "ONE products",
  "products.lead": "Every service in one ecosystem. New ones are added all the time.",
  "products.empty": "No products yet.",

  "product.features": "What it does",
  "product.gallery": "How it looks",
  "product.others": "More from the ecosystem",
  "product.soon": "This product is launching soon. Message us to hear about it first.",
  "product.notFound": "Product not found",
  "product.notFoundLead": "This product doesn’t exist or hasn’t been announced yet.",

  "about.kicker": "About us",
  "about.title.a": "We are building",
  "about.title.hi": "one ecosystem",
  "about.title.b": "for entrepreneurs",
  "about.lead":
    "To sell on marketplaces, serve customers, keep the books and keep learning, an entrepreneur juggles dozens of different tools. ONE brings them into one family.",
  "about.mission.t": "Our mission",
  "about.mission.d":
    "Every seller in Uzbekistan should run their business on exact numbers and spend their time on growth. We automate the hard parts.",
  "about.name.t": "Why “ONE”?",
  "about.name.d": "ONE means one account, one screen, one team. And it starts with ON — switch your business on.",
  "about.principles": "Our principles",
  "about.p1.t": "Accuracy",
  "about.p1.d": "Every soum counts. Numbers come from official sources and are shown clearly.",
  "about.p2.t": "Simplicity",
  "about.p2.d": "Complex calculations on a simple screen. Clear without training.",
  "about.p3.t": "Unity",
  "about.p3.d": "Every new product plugs into the ecosystem and works together with the rest.",
  "about.roadmap": "What’s in the ecosystem",

  "brand.kicker": "Brand",
  "brand.title": "Logos and colors",
  "brand.lead": "Official logos of the ONE ecosystem. Download them as SVG or PNG.",
  "brand.main": "ONE — company and ecosystem",
  "brand.products": "Product logos",
  "brand.rule":
    "Every product follows one rule: ONE + the product name in purple. The four-color ring belongs to ONE Plus only, because it brings four marketplaces together.",
  "brand.onLight": "On light",
  "brand.onDark": "On dark",
  "brand.appIcon": "App icon",
  "brand.mark": "Mark",
  "brand.colors": "Colors",
  "brand.type": "Typeface",
  "brand.typeNote": "Plus Jakarta Sans for all headings and text.",
  "brand.copied": "Copied",

  "contact.kicker": "Contact",
  "contact.title": "Let’s talk",
  "contact.lead": "Questions, partnerships or getting connected — message or call us.",
  "contact.phone": "Phone",
  "contact.telegram": "Telegram",
  "contact.reply": "We usually reply within a few hours.",

  "footer.tagline": "One ecosystem for entrepreneurs.",
  "footer.rights": "All rights reserved.",
  "footer.products": "Products",
  "footer.company": "Company",
  "home.scroll": "Scroll down",
  "home.manifesto": "What is ONE?",
  "slides.prev": "Previous slide",
  "slides.next": "Next slide",
  "slides.slide": "Slide",
};

export const DICTS: Record<Lang, Dict> = { uz, ru, en };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string };
const LangContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "one-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "uz" || saved === "ru" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (k) => DICTS[lang][k] ?? DICTS.uz[k] }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}

/** Pick the current-language value from a {uz, ru, en} object, falling back to Uzbek. */
export function pick<T>(value: Partial<Record<Lang, T>> | null | undefined, lang: Lang): T | undefined {
  if (!value) return undefined;
  return value[lang] ?? value.uz ?? value.ru ?? value.en;
}
