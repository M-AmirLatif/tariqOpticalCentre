/**
 * طارق آپٹیکل سنٹر (Tariq Optical Centre) - مرکزی ترتیبات (Master Configuration)
 * دکان کی تمام معلومات یہاں سے آسانی سے تبدیل کی جا سکتی ہیں۔
 */

const SHOP_CONFIG = {
  // کاروباری معلومات (Business Info)
  shopNameUrdu: "طارق آپٹیکل سنٹر",
  shopNameEnglish: "Tariq Optical Centre",
  ownerName: "طارق عزیز",
  ownerNameEnglish: "Tariq Aziz",
  tagline: "ہر قسم کے خوبصورت فریم، لینز اور دھوپ کے چشمے دستیاب ہیں۔",
  shortDesc: "قصور میں آنکھوں کے نمبر والے چشموں، فینسی فریمز اور معیاری لینز کا بااعتماد مرکز۔",

  // رابطہ اور فون نمبرز (Contact & Phones)
  primaryPhone: "0308-4454785",
  secondaryPhone: "0319-4309408",
  primaryPhoneRaw: "03084454785",
  secondaryPhoneRaw: "03194309408",
  
  // واٹس ایپ نمبر آرڈرز کے لیے (WhatsApp Number for orders - no +)
  whatsappNumber: "923084454785",
  
  // پتہ اور لوکیشن (Address & Location)
  addressUrdu: "نیاز بازار، قصور، پنجاب، پاکستان",
  addressEnglish: "Niaz Bazar, Kasur, Punjab, Pakistan",
  city: "قصور (Kasur)",
  mapsSearchUrl: "https://www.google.com/maps/search/?api=1&query=Niaz+Bazar+Kasur",
  
  // دکان کے اوقات (Store Timings)
  timings: {
    days: "پیر تا اتوار (تمام دن کھلا ہے)",
    hours: "صبح 9:00 بجے تا رات 9:00 بجے",
    opensAt: "09:00",
    closesAt: "21:00"
  },

  // سوشل لنکس (Social Links)
  socialLinks: {
    whatsapp: "https://wa.me/923084454785",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com"
  },

  // کیٹیگریز (Categories Master Definition)
  categories: [
    { id: "all", name: "تمام مصنوعات", icon: "✨" },
    { id: "frame", name: "فریم", icon: "👓" },
    { id: "sun", name: "دھوپ کے چشمے", icon: "🕶️" },
    { id: "lens", name: "لینز", icon: "🔍" },
    { id: "mirror", name: "آئینے", icon: "🪞" },
    { id: "accessory", name: "لوازمات", icon: "🧰" }
  ],

  // ذیلی کیٹیگریز (Subcategories Chips)
  subcategories: {
    frame: [
      { id: "all", name: "سب فریم" },
      { id: "چوکور", name: "چوکور (Rectangle/Square)" },
      { id: "گول", name: "گول (Round)" },
      { id: "کیٹ آئی", name: "کیٹ آئی (Cat-Eye)" },
      { id: "بغیر فریم", name: "بغیر فریم (Rimless)" },
      { id: "بچوں کے", name: "بچوں کے فریم" }
    ],
    sun: [
      { id: "all", name: "سب سن گلاسز" },
      { id: "پائلٹ", name: "پائلٹ / ایوی ایٹر" },
      { id: "ویفیرر", name: "ویفیرر (Wayfarer)" },
      { id: "اسپورٹس", name: "اسپورٹس" },
      { id: "پولرائزڈ", name: "پولرائزڈ لینز" }
    ],
    lens: [
      { id: "all", name: "سب لینز" },
      { id: "سادہ", name: "سادہ / سنگل وژن" },
      { id: "ہارڈ کوٹنگ (اینٹی اسکریچ)", name: "ہارڈ کوٹ" },
      { id: "بلیو کٹ + فوٹو کرومک", name: "بلیو کٹ + دھوپ چھاؤں" },
      { id: "فوٹو کرومک (دھوپ چھاؤں)", name: "فوٹو کرومک (Photochromic)" },
      { id: "بلیو کٹ (Hard Multi Coating)", name: "اینٹی بلیو لائٹ" }
    ],
    mirror: [
      { id: "all", name: "سب آئینے" },
      { id: "گول", name: "گول آئینہ" },
      { id: "چوکور", name: "چوکور آئینہ" },
      { id: "کاؤنٹر", name: "کاؤنٹر ٹرائل آئینہ" }
    ],
    accessory: [
      { id: "all", name: "سب لوازمات" },
      { id: "کیس و اسپرے", name: "چشمہ باکس و کلینر" },
      { id: "کپڑا", name: "مائیکرو فائبر کپڑا" },
      { id: "چین", name: "چشمے کی چین" }
    ]
  },

  // ماسٹر فیلڈ لیبل میپ فی کیٹیگری (Master Field-Label Map per category)
  // کارڈ اور ڈیٹیل ویو میں قطاروں کی ترتیب اس لسٹ کے مطابق ہوگی
  specsFieldOrder: {
    frame: [
      { key: "code", label: "ماڈل کوڈ" },
      { key: "brand", label: "برانڈ" },
      { key: "color", label: "رنگ" },
      { key: "gender", label: "کس کے لیے" },
      { key: "material", label: "میٹریل" },
      { key: "shape", label: "شکل" },
      { key: "size", label: "سائز" },
      { key: "weight", label: "وزن" },
      { key: "flexible", label: "لچکدار" },
      { key: "condition", label: "حالت" },
      { key: "note", label: "اضافی معلومات" }
    ],
    sun: [
      { key: "code", label: "ماڈل کوڈ" },
      { key: "brand", label: "برانڈ" },
      { key: "color", label: "فریم رنگ" },
      { key: "gender", label: "کس کے لیے" },
      { key: "lensColor", label: "شیشے کا رنگ" },
      { key: "polarized", label: "پولرائزڈ" },
      { key: "uv", label: "UV تحفظ" },
      { key: "frameMaterial", label: "فریم میٹریل" },
      { key: "shape", label: "شکل" },
      { key: "size", label: "سائز" },
      { key: "condition", label: "حالت" },
      { key: "note", label: "اضافی معلومات" }
    ],
    lens: [
      { key: "code", label: "ماڈل کوڈ" },
      { key: "brand", label: "برانڈ" },
      { key: "lensType", label: "قسم" },
      { key: "material", label: "میٹریل" },
      { key: "index", label: "انڈیکس" },
      { key: "coating", label: "کوٹنگ" },
      { key: "powerRange", label: "پاور کی حد" },
      { key: "thickness", label: "موٹائی" },
      { key: "pairNote", label: "پیکنگ" },
      { key: "gender", label: "کس کے لیے" },
      { key: "condition", label: "حالت" },
      { key: "note", label: "اضافی معلومات" }
    ],
    mirror: [
      { key: "code", label: "ماڈل کوڈ" },
      { key: "brand", label: "برانڈ" },
      { key: "color", label: "رنگ" },
      { key: "size", label: "سائز" },
      { key: "shapeMirror", label: "شکل" },
      { key: "frameMaterial", label: "فریم میٹریل" },
      { key: "useFor", label: "استعمال" },
      { key: "condition", label: "حالت" },
      { key: "note", label: "اضافی معلومات" }
    ],
    accessory: [
      { key: "code", label: "ماڈل کوڈ" },
      { key: "brand", label: "برانڈ" },
      { key: "kind", label: "قسم" },
      { key: "material", label: "میٹریل" },
      { key: "color", label: "رنگ" },
      { key: "size", label: "سائز" },
      { key: "quantity", label: "تعداد" },
      { key: "condition", label: "حالت" },
      { key: "note", label: "اضافی معلومات" }
    ]
  },

  // اعتماد کے 4 نکات (Trust Strip Points)
  trustPoints: [
    { icon: "🛡️", title: "اصلی اور معیاری مصنوعات", text: "ہمارے تمام فریم اور لینز پائیداری اور کوالٹی کے ضامن ہیں۔" },
    { icon: "👓", title: "ہر قسم کے فریم اور لینز", text: "بچوں سے لے کر بڑوں تک، فینسی اور روزمرہ استعمال کے فریم۔" },
    { icon: "🩺", title: "آنکھوں کے مشورے کی سہولت", text: "آپ کے نظر کے نمبر کے عین مطابق لینز لگانے کی پیشہ ورانہ رہنمائی۔" },
    { icon: "📦", title: "قصور میں ہوم ڈلیوری", text: "قصور شہر میں بذریعہ رابطہ آرڈر گھر پر منگوانے کی آسانی۔" }
  ],

  // آرڈر کا آسان طریقہ (How to order - 3 steps)
  orderSteps: [
    { step: 1, numUrdu: "۱", title: "چشمہ چنیں", text: "اپنی پسند کا فریم، سن گلاسز یا لینز سلیکٹ کریں۔" },
    { step: 2, numUrdu: "۲", title: "نام اور پتہ لکھیں", text: "اپنا نام، موبائل نمبر اور مکمل پتہ فارم میں درج کریں۔" },
    { step: 3, numUrdu: "۳", title: "واٹس ایپ پر بھیجیں", text: "ایک کلک سے آرڈر واٹس ایپ پر ارسال کریں اور کنفرمیشن حاصل کریں۔" }
  ],

  // خدمات (Services)
  services: [
    {
      id: "consultation",
      icon: "👁️",
      title: "آنکھوں کا مشورہ و رہنمائی",
      desc: "آپ کے ڈاکٹر کے نسخے کے مطابق شیشوں کے صحیح سائز اور انڈیکس کے انتخاب میں مکمل رہنمائی۔"
    },
    {
      id: "fitting",
      icon: "🔧",
      title: "فریم فٹنگ اور ایڈجسٹمنٹ",
      desc: "چشمے کا چہرے پر ٹھیک نہ بیٹھنا یا ڈھیلا ہونا؟ ہم فریم کی درست ایڈجسٹمنٹ کرتے ہیں۔"
    },
    {
      id: "replacement",
      icon: "✨",
      title: "لینز کی تبدیلی و اپگریڈ",
      desc: "پرانے فریم میں نیا نمبر والا، اینٹی ریفلیکشن، یا بلو کٹ لینز تبدیل کروائیں۔"
    },
    {
      id: "repair",
      icon: "🛠️",
      title: "چشمے کی فوری مرمت",
      desc: "پیچ گرنا، نوز پیڈ بدلنا یا ڈنڈی کی ترتیب درست کرنے کی فوری سروس۔"
    }
  ],

  // دکان اور مالک کا تعارف (About the shop & owner)
  about: {
    heading: "طارق آپٹیکل سنٹر کے بارے میں",
    ownerTitle: "پروپرائیٹر: طارق عزیز",
    text1: "طارق آپٹیکل سنٹر قصور کے معروف نیاز بازار میں واقع ہے جہاں ہم پچھلے کئی سالوں سے اپنے معزز گاہکوں کو دیدہ زیب فریمز، دھوپ کے چشمے، اور معیاری آپٹیکل لینز کی فراہمی میں پیش پیش ہیں۔",
    text2: "ہمارا بنیادی مقصد یہ ہے کہ ہر گاہک کو اس کی ضرورت اور بجٹ کے مطابق بہترین چشمہ ملے، تاکہ ان کی بینائی محفوظ رہے اور وہ جدید فیشن سے بھی ہم آہنگ رہیں۔ ہم گاہکوں کے اعتماد کو اپنی اصل کمائی سمجھتے ہیں۔"
  }
};

// فریزر تاکہ غیر ارادی تبدیلی نہ ہو
if (typeof Object.freeze === 'function') {
  Object.freeze(SHOP_CONFIG);
}
