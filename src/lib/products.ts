import type { Lang } from "@/lib/i18n";
import type { RingStyle } from "@/lib/brand";
import plusSlide1 from "@/assets/plus/one-plus-slide-1.webp";
import plusSlide2 from "@/assets/plus/one-plus-slide-2.webp";
import plusSlide3 from "@/assets/plus/one-plus-slide-3.webp";
import plusSlide4 from "@/assets/plus/one-plus-slide-4.webp";
import plusSlide5 from "@/assets/plus/one-plus-slide-5.webp";
import plusSlide6 from "@/assets/plus/one-plus-slide-6.webp";

export type Localized<T> = Partial<Record<Lang, T>>;

export type Product = {
  slug: string;
  name: string;
  status: "live" | "soon";
  ring: RingStyle;
  tagline: Localized<string>;
  description: Localized<string>;
  features: Localized<string[]>;
  gallery: string[];
  url: string | null;
};

/**
 * Every product on the site, in display order (live products first).
 * To add or change a product, edit this list — there is no database or admin panel.
 */
export const PRODUCTS: Product[] = [
  {
    slug: "plus",
    name: "Plus",
    status: "live",
    ring: "plus",
    tagline: {
      uz: "Marketpleys biznesingiz — bir qarashda",
      ru: "Ваш бизнес на маркетплейсах — с одного взгляда",
      en: "Your marketplace business at a glance",
    },
    description: {
      uz: "Uzum Market, Ozon, Wildberries va Yandex Market’dagi tushum, xarajat, qoldiq va sof foydangizni bitta ekranda ko‘ring. Ma’lumotlar rasmiy API orqali avtomatik yangilanadi.",
      ru: "Выручка, расходы, остатки и чистая прибыль с Uzum Market, Ozon, Wildberries и Яндекс Маркета — на одном экране. Данные обновляются автоматически через официальные API.",
      en: "Revenue, expenses, stock and net profit from Uzum Market, Ozon, Wildberries and Yandex Market on one screen. Data syncs automatically through official APIs.",
    },
    features: {
      uz: [
        "Pul qayerga ketdi: komissiya, logistika, reklama, tannarx va soliqdan keyingi sof foyda",
        "Qaysi tovar foyda, qaysi biri zarar — tugayotgan va pulni muzlatgan tovarlarni o‘zi topadi",
        "Pul qachon keladi: marketpleys to‘lovlari, balans va xavfdagi pul oldindan",
        "Nima o‘sdi, nima tushdi: sotuv voronkasi, reja va reyting bir ekranda",
        "Sharhlarga AI javob: sun’iy intellekt javob tayyorlaydi, siz faqat tasdiqlaysiz",
        "Jamoa a’zolari va rollar, bir nechta kabinet",
      ],
      ru: [
        "Куда ушли деньги: чистая прибыль после комиссии, логистики, рекламы, себестоимости и налогов",
        "Какой товар в плюсе, а какой в минусе — сам находит заканчивающиеся товары и замороженные деньги",
        "Когда придут деньги: выплаты маркетплейсов, баланс и деньги под риском заранее",
        "Что выросло, что упало: воронка продаж, план и рейтинг на одном экране",
        "AI-ответы на отзывы: ИИ готовит ответ, вы только подтверждаете",
        "Сотрудники и роли, несколько кабинетов",
      ],
      en: [
        "Where the money went: net profit after commission, logistics, ads, cost of goods and tax",
        "Which product earns and which loses — finds running-out items and frozen cash for you",
        "When the money arrives: marketplace payouts, balance and money at risk in advance",
        "What grew, what dropped: sales funnel, plan and rating on one screen",
        "AI replies to reviews: AI drafts the answer, you just approve",
        "Team members, roles and multiple seller accounts",
      ],
    },
    gallery: [plusSlide1, plusSlide2, plusSlide3, plusSlide4, plusSlide5, plusSlide6],
    url: null,
  },
  {
    slug: "agent",
    name: "Agent",
    status: "soon",
    ring: "brand",
    tagline: {
      uz: "Ijtimoiy tarmoqlarda siz kabi gaplashadigan va sotadigan AI agent",
      ru: "AI-агент, который общается и продаёт в соцсетях как вы",
      en: "An AI agent that chats and sells on social media just like you",
    },
    description: {
      uz: "Instagram, Telegram va boshqa tarmoqlarda mijozlarga biznes egasidek javob beradi: savollarga javob beradi, tovarni tavsiya qiladi va buyurtmani rasmiylashtiradi. Kechayu kunduz, dam olishsiz.",
      ru: "Отвечает клиентам в Instagram, Telegram и других сетях как владелец бизнеса: отвечает на вопросы, советует товар и оформляет заказ. Круглосуточно и без выходных.",
      en: "Answers customers on Instagram, Telegram and other networks like the business owner: replies to questions, recommends products and takes the order. Day and night, no days off.",
    },
    features: {
      uz: [
        "Instagram va Telegram’da 24/7 javob",
        "Sizning ohangingizda gaplashadi",
        "Tovar tavsiya qiladi va buyurtma oladi",
        "Murakkab savollarni sizga uzatadi",
      ],
      ru: ["Ответы 24/7 в Instagram и Telegram", "Говорит вашим тоном", "Советует товар и принимает заказ", "Сложные вопросы передаёт вам"],
      en: [
        "24/7 replies on Instagram and Telegram",
        "Speaks in your tone of voice",
        "Recommends products and takes orders",
        "Hands tricky questions over to you",
      ],
    },
    gallery: [],
    url: null,
  },
  {
    slug: "market",
    name: "Market",
    status: "soon",
    ring: "brand",
    tagline: {
      uz: "Tovarlaringiz uchun bitta katalog",
      ru: "Один каталог для всех ваших товаров",
      en: "One catalogue for all your products",
    },
    description: {
      uz: "Tovarni bir marta kiriting — u barcha marketplace’larga chiqadi. Narx, qoldiq va kartochkalarni bir joydan boshqaring.",
      ru: "Добавьте товар один раз — он появится на всех маркетплейсах. Управляйте ценами, остатками и карточками из одного места.",
      en: "Add a product once and it appears on every marketplace. Manage prices, stock and listings from one place.",
    },
    features: {
      uz: ["Bitta kartochka — 4 marketplace", "Narx va qoldiqni bir joydan boshqarish", "Rasm va tavsiflarni avtomatik moslash"],
      ru: ["Одна карточка — 4 маркетплейса", "Цены и остатки из одного места", "Автоподгонка фото и описаний"],
      en: ["One listing, 4 marketplaces", "Prices and stock from one place", "Photos and descriptions adapted automatically"],
    },
    gallery: [],
    url: null,
  },
  {
    slug: "crm",
    name: "CRM",
    status: "soon",
    ring: "brand",
    tagline: {
      uz: "Mijozlar va buyurtmalar bitta bazada",
      ru: "Клиенты и заказы в одной базе",
      en: "Customers and orders in one place",
    },
    description: {
      uz: "Marketplace, ijtimoiy tarmoq va do‘kondan kelgan har bir mijoz va buyurtma bitta ro‘yxatda. Hech bir mijoz yo‘qolmaydi.",
      ru: "Каждый клиент и заказ с маркетплейсов, соцсетей и магазина — в одном списке. Ни один клиент не потеряется.",
      en: "Every customer and order from marketplaces, social media and your shop in one list. No customer gets lost.",
    },
    features: {
      uz: ["Barcha kanallardan mijozlar", "Buyurtma holatlari", "Takroriy sotuv uchun eslatmalar"],
      ru: ["Клиенты из всех каналов", "Статусы заказов", "Напоминания для повторных продаж"],
      en: ["Customers from every channel", "Order statuses", "Reminders for repeat sales"],
    },
    gallery: [],
    url: null,
  },
];

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
