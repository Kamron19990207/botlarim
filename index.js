const { Telegraf, Markup } = require('telegraf');

// Bot tokeningizni o'rnatish
const bot = new Telegraf('6450644934:AAFZdU_RXs_NtdgmsGhSvZSsq7kcUZOhi-Y');

// Kanalning username yoki ID-si
const channelId = '@Toshkent_portal';

// Foydalanuvchi ma'lumotlarini saqlash uchun obyekt
let userData = {};

// Start buyrug'i
bot.start((ctx) => {
  userData[ctx.chat.id] = {}; // Foydalanuvchi ma'lumotlarini saqlash uchun bo'sh obyekt yaratish
  ctx.reply('Assalomu alaykum! Tibbiy so\'rovnomaga xush kelibsiz. Iltimos, kontakt ma\'lumotlaringizni yuboring:', 
    Markup.keyboard([
      [Markup.button.contactRequest('📱 Telefon raqamni yuborish')]
    ]).resize()
  );
});

// Telefon raqami yuborilganda
bot.on('contact', (ctx) => {
  const chatId = ctx.chat.id;
  userData[chatId] = userData[chatId] || {}; // Tekshiruv: userData[chatId] mavjudligini ta'minlash
  userData[chatId].phoneNumber = ctx.message.contact.phone_number;
  
  // Kontakt yuborilganidan keyin tugmani olib tashlash
  ctx.reply('Rahmat! Endi ismingizni kiriting:', Markup.removeKeyboard());
});

// Ism kiritilganda
bot.on('text', (ctx) => {
  const chatId = ctx.chat.id;
  userData[chatId] = userData[chatId] || {}; // Tekshiruv: userData[chatId] mavjudligini ta'minlash

  // Ism va familiyani olish
  if (!userData[chatId].name) {
    userData[chatId].name = ctx.message.text;
    ctx.reply('Familiyangizni kiriting:');
  } else if (!userData[chatId].surname) {
    userData[chatId].surname = ctx.message.text;
    ctx.reply('Endi yashash joyingizni tanlang:', 
      Markup.keyboard([
        ['Toshkent', 'Samarqand'],
        ['Andijon', 'Farg‘ona'],
        ['Qashqadaryo', 'Surxondaryo'],
        ['Namangan', 'Buxoro'],
        ['Jizzax', 'Sirdaryo'],
        ['Xorazm', 'Navoiy'],
        ['Qoraqolpogiston', 'Toshkent Shahri'],
        // Yana boshqa viloyatlar qo'shilishi mumkin
      ]).resize()
    );
  } else if (!userData[chatId].region) {
    userData[chatId].region = ctx.message.text;
    ctx.reply('Iltimos, tuman yoki shahar nomini kiriting:', Markup.removeKeyboard());
  } else if (!userData[chatId].city) {
    userData[chatId].city = ctx.message.text;
    ctx.reply('Bo\'yingizni kiriting (sm):');
  } else if (!userData[chatId].height && ctx.message.text.match(/^\d+$/)) {
    userData[chatId].height = ctx.message.text;
    ctx.reply('Vazningizni kiriting (kg):');
  } else if (!userData[chatId].weight && ctx.message.text.match(/^\d+$/)) {
    userData[chatId].weight = ctx.message.text;
    ctx.reply('Qon guruhiingizni tanlang:', 
      Markup.inlineKeyboard([
        [Markup.button.callback('O(I)', 'bloodType_O')],
        [Markup.button.callback('A(II)', 'bloodType_A')],
        [Markup.button.callback('B(III)', 'bloodType_B')],
        [Markup.button.callback('AB(IV)', 'bloodType_AB')]
      ])
    );
  }
});

// Qon guruhi tugmalari tugmachalarini ushlab olish
bot.action(['bloodType_O', 'bloodType_A', 'bloodType_B', 'bloodType_AB'], (ctx) => {
  const chatId = ctx.chat.id;
  userData[chatId] = userData[chatId] || {}; // Tekshiruv: userData[chatId] mavjudligini ta'minlash
  const bloodType = ctx.match[0].split('_')[1];
  userData[chatId].bloodType = bloodType;
  ctx.reply('Sizda yuqumli kasalliklar bormi?', 
    Markup.inlineKeyboard([
      [Markup.button.callback('Ha', 'infectiousDisease_yes')],
      [Markup.button.callback('Yo\'q', 'infectiousDisease_no')]
    ])
  );
  ctx.answerCbQuery();
});

// Yuqumli kasalliklar tugmachalarini ushlab olish
bot.action(['infectiousDisease_yes', 'infectiousDisease_no'], (ctx) => {
  const chatId = ctx.chat.id;
  userData[chatId] = userData[chatId] || {}; // Tekshiruv: userData[chatId] mavjudligini ta'minlash
  userData[chatId].infectiousDisease = ctx.match[0] === 'infectiousDisease_yes';
  
  // Foydalanuvchi ma'lumotlarini kanalga yuborish
  const userInfo = 
    `Sizning ma'lumotlaringiz:\n` +
    `Ism: ${userData[chatId].name}\n` +
    `Familiya: ${userData[chatId].surname}\n` +
    `Telefon raqami: ${userData[chatId].phoneNumber}\n` +
    `Manzil: ${userData[chatId].region}, ${userData[chatId].city}\n` +
    `Bo'yi: ${userData[chatId].height} sm\n` +
    `Vazni: ${userData[chatId].weight} kg\n` +
    `Qon guruhi: ${userData[chatId].bloodType}\n` +
    `Yuqumli kasalliklar: ${userData[chatId].infectiousDisease ? 'Ha' : 'Yoq'}`;

  ctx.telegram.sendMessage(channelId, userInfo)
    .catch(err => console.error('Telegram xatoligi:', err)); // Xatolikni qayd etish

  // Foydalanuvchiga javob berish
  ctx.reply(userInfo);

  ctx.answerCbQuery();
});

// Botni ishga tushirish
bot.launch().then(() => console.log('Bot ishga tushdi...'))
  .catch(err => console.error('Botni ishga tushirishda xatolik:', err)); // Xatolikni qayd etish
