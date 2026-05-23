// ═══════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════
function sv(k,v){try{localStorage.setItem('rt3_'+k,JSON.stringify(v));}catch(e){}}
function ld(k,d){try{var x=localStorage.getItem('rt3_'+k);return x!==null?JSON.parse(x):d;}catch(e){return d;}}

// ═══════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════
var lang=ld('lang','ar'), theme=ld('theme','dark');
var city=ld('city','Cairo'), country=ld('country','Egypt'), method=ld('method','5');
var qPages=ld('qPages',267), qTotal=604;
var tasks=ld('tasks',[]), habitDone=ld('habitDone',{}), taskFlt='all';
var totFocus=ld('focusToday',0), sessions=ld('sessions',[]);
var tSecs=25*60, tTotal=25*60, tRun=false, tInt=null, tLbl='';
var apiTimes={}, mealHistory=ld('mealHistory',[]);
var _audioCtx=null, isSending=false;
var aiMode=ld('aiMode','local');
var groqKey=ld('groqKey','');
var claudeKey=ld('claudeKey','');
var groqHistory=[], claudeHistory=[];
var aiCurDay=new Date().getDay();
var openYTSet={};
var usedIdx={};

// ═══════════════════════════════════════════════════
// 7-DAY MEAL PLAN (بدون تكرار)
// ═══════════════════════════════════════════════════
var DAY_AR=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
var DAY_EN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var FAST_DAYS=[1,4];

var WEEK=[
  {bf:{ar:'بيض مقلي بالطماطم والزيت',en:'Fried Eggs & Tomatoes',cal:320,pro:18,iar:'بيضتان، طماطم، زيت زيتون',ien:'2 eggs, tomato, olive oil'},
   ln:{ar:'صدر دجاج مشوي + أرز بني + سلطة',en:'Grilled Chicken + Brown Rice',cal:520,pro:45,iar:'دجاج، أرز بني، خس، طماطم',ien:'Chicken, brown rice, lettuce'},
   sk:{ar:'مكسرات مشكلة',en:'Mixed Nuts',cal:180,pro:6,iar:'لوز، جوز، كاجو',ien:'Almonds, walnuts, cashews'},
   sh:{ar:'شوفان بالتمر والحليب',en:'Oatmeal with Dates',cal:450,pro:16,iar:'شوفان، تمر، حليب، عسل',ien:'Oats, dates, milk, honey'}},
  {bf:{ar:'⭐ يوم صيام — السحور بدلاً من الإفطار',en:'⭐ Fasting Day — See Suhoor',cal:0,pro:0,iar:'انظر خانة السحور',ien:'See Suhoor card'},
   ln:{ar:'شوربة عدس خفيفة',en:'Light Lentil Soup',cal:280,pro:14,iar:'عدس، بصل، ليمون، كمون',ien:'Lentils, onion, lemon, cumin'},
   sk:{ar:'تمر وماء عند الإفطار',en:'Dates & Water at Iftar',cal:100,pro:2,iar:'٣ تمرات + ماء',ien:'3 dates + water'},
   sh:{ar:'بيض مسلوق + خبز أسمر + لبن',en:'Boiled Eggs + Wheat Bread',cal:400,pro:22,iar:'بيضتان، خبز قمح، لبن طبيعي',ien:'2 eggs, wheat bread, yogurt'}},
  {bf:{ar:'شوفان بالموز والعسل',en:'Banana Oatmeal with Honey',cal:380,pro:12,iar:'شوفان، موزة، عسل، حليب',ien:'Oats, banana, honey, milk'},
   ln:{ar:'سمك مشوي + بطاطا مسلوقة',en:'Grilled Fish + Potatoes',cal:450,pro:38,iar:'سمك، بطاطا، ليمون',ien:'Fish, potatoes, lemon'},
   sk:{ar:'تفاحة + زبدة فول سوداني',en:'Apple + Peanut Butter',cal:220,pro:7,iar:'تفاحة، ملعقتان زبدة فول سوداني',ien:'Apple, 2 tbsp peanut butter'},
   sh:{ar:'فول مدمس بالزيت والليمون',en:'Fava Beans with Olive Oil',cal:320,pro:15,iar:'فول مدمس، زيت زيتون، ليمون',ien:'Fava beans, olive oil, lemon'}},
  {bf:{ar:'لبنة + زعتر + زيت زيتون',en:'Labneh + Za\'atar + Olive Oil',cal:250,pro:10,iar:'لبنة، زيت زيتون، زعتر، خبز',ien:'Labneh, olive oil, za\'atar'},
   ln:{ar:'مكرونة قمح كامل + دجاج',en:'Whole Wheat Pasta + Chicken',cal:560,pro:30,iar:'مكرونة قمح، دجاج، طماطم، ثوم',ien:'Whole wheat pasta, chicken, tomato'},
   sk:{ar:'زبادي يوناني + عسل',en:'Greek Yogurt + Honey',cal:200,pro:14,iar:'زبادي يوناني، ملعقة عسل',ien:'Greek yogurt, 1 tsp honey'},
   sh:{ar:'زبادي + بذور شيا + موز',en:'Yogurt + Chia Seeds + Banana',cal:350,pro:18,iar:'زبادي يوناني، بذور شيا، موز',ien:'Greek yogurt, chia seeds, banana'}},
  {bf:{ar:'⭐ يوم صيام — السحور بدلاً من الإفطار',en:'⭐ Fasting Day — See Suhoor',cal:0,pro:0,iar:'انظر خانة السحور',ien:'See Suhoor card'},
   ln:{ar:'شوربة خضار بالدجاج',en:'Chicken Vegetable Soup',cal:380,pro:25,iar:'دجاج، خضار مشكلة، شعيرية',ien:'Chicken, mixed vegetables'},
   sk:{ar:'تمر + ماء + نعناع',en:'Dates + Water + Mint',cal:120,pro:2,iar:'٣ تمرات + ماء + نعناع',ien:'3 dates, water, fresh mint'},
   sh:{ar:'عجة خضار + خبز أسمر',en:'Veggie Omelette + Wheat Bread',cal:370,pro:20,iar:'٣ بيضات، فلفل، بصل، خبز أسمر',ien:'3 eggs, peppers, onion, wheat bread'}},
  {bf:{ar:'بيض مسلوق + أفوكادو',en:'Boiled Eggs + Avocado',cal:350,pro:20,iar:'بيضتان مسلوقتان، نصف أفوكادو',ien:'2 boiled eggs, half avocado'},
   ln:{ar:'كبسة دجاج',en:'Chicken Kabsa',cal:580,pro:35,iar:'دجاج، أرز بسمتي، بهارات، طماطم',ien:'Chicken, basmati rice, spices'},
   sk:{ar:'موز + جوز',en:'Banana + Walnuts',cal:190,pro:5,iar:'موزة + ١٠ حبات جوز',ien:'1 banana + 10 walnuts'},
   sh:{ar:'توست + جبن أبيض + زيتون',en:'Toast + White Cheese + Olives',cal:310,pro:12,iar:'خبز أسمر، جبن أبيض، زيتون',ien:'Wheat bread, white cheese, olives'}},
  {bf:{ar:'يوغرت + عسل + مكسرات',en:'Yogurt + Honey + Nuts',cal:300,pro:15,iar:'يوغرت يوناني، عسل، لوز، جوز',ien:'Greek yogurt, honey, almonds'},
   ln:{ar:'سالمون + كينوا + سلطة خضراء',en:'Salmon + Quinoa + Salad',cal:520,pro:40,iar:'سالمون، كينوا، خضار مشكلة',ien:'Salmon, quinoa, mixed greens'},
   sk:{ar:'جزر + حمص',en:'Carrot Sticks + Hummus',cal:150,pro:6,iar:'جزرة + ملعقتان حمص',ien:'Carrot sticks, 2 tbsp hummus'},
   sh:{ar:'موسلي + حليب + فواكه جافة',en:'Muesli + Milk + Dried Fruits',cal:410,pro:12,iar:'موسلي، حليب، زبيب، مشمش',ien:'Muesli, milk, raisins, apricot'}}
];

// ═══════════════════════════════════════════════════
// LOCAL RESPONSES — Pool متنوع بدون تكرار
// ═══════════════════════════════════════════════════
var LOCAL_R={
ar:{
  greeting:[
    'وعليكم السلام ورحمة الله وبركاته 🌙\n\nأهلاً بك! كيف يمكنني مساعدتك اليوم؟\nالخطة الغذائية الأسبوعية جاهزة أعلاه 💪',
    'السلام عليكم ورحمة الله وبركاته 😊\n\nسعيد بوجودك! يمكنني مساعدتك في:\n🍳 الوجبات · 🎯 الإنتاجية · 📖 القرآن · 🔥 التحفيز',
    'وعليكم السلام ورحمة الله وبركاته 🌟\n\nبارك الله في يومك! اسألني عن وجباتك أو روتينك أو حفظك للقرآن. 🤲'
  ],
  breakfast:[
    'السلام عليكم ورحمة الله 🍳\n\n**أهمية الإفطار الصحي:**\nوجبة بروتينية صباحاً تعزز التركيز ٤-٥ ساعات وتمنع الإفراط في الغداء.\n\nانظر بطاقة الإفطار في الخطة الغذائية أعلاه 📋',
    'السلام عليكم ورحمة الله 🌅\n\n**سر الإفطار المثالي:**\nبروتين + دهون صحية = طاقة مستدامة بدون انخفاض مفاجئ للسكر.\n\nأفضل وقت: بعد أذكار الصباح وصلاة الضحى 🌿'
  ],
  lunch:[
    'السلام عليكم ورحمة الله 🍽️\n\n**وجبة الغداء المثالية بعد الجيم:**\nبروتين عالٍ + كربوهيدرات معقدة + خضار\n\n**النافذة الذهبية:** خلال ٤٥ دقيقة من انتهاء التمرين 💪',
    'السلام عليكم ورحمة الله 🌿\n\n**نصيحة الغداء:**\nلا تأكل كثيراً بحيث تشعر بالثقل — هذا يقتل إنتاجيتك في العصر.\n\nوجبة معتدلة + قيلولة قصيرة = طاقة متجددة 🔋'
  ],
  suhoor:[
    'السلام عليكم ورحمة الله 🌙\n\n**نصائح السحور:**\n✅ بروتين عالٍ (يبقيك ممتلئاً أطول)\n✅ شوفان بالتمر (كربوهيدرات بطيئة)\n✅ ١-١.٥ لتر ماء قبل الأذان\n❌ تجنب الأكل المالح (يزيد العطش)',
    'السلام عليكم ورحمة الله ✨\n\nقال النبي ﷺ: "تسحروا فإن في السحور بركة"\n\nالسحور المتوازن = صيام أسهل + تركيز أعلى + جسم محمي. 🤲'
  ],
  productivity:[
    'السلام عليكم ورحمة الله 🎯\n\n**تقنية بومودورو الإسلامية:**\n• ٢٥ دقيقة تركيز كامل 📵\n• ٥ دقائق راحة (قم وتحرك واذكر الله)\n• بعد ٤ جلسات: ٢٠ دقيقة راحة\n\n**القاعدة الذهبية:** هاتفك في غرفة أخرى',
    'السلام عليكم ورحمة الله 💡\n\n**قاعدة ٣ مهام يومياً:**\nكل ليلة اكتب ٣ مهام أساسية فقط لغدٍ.\nابدأ بالأصعب صباحاً (Eat the Frog). 🐸',
    'السلام عليكم ورحمة الله 🌅\n\n**الوقت الذهبي للإنتاجية:**\nمن الفجر حتى الظهر = أثمن ٦ ساعات في يومك.\n\nدماغ في ذروة اليقظة + هواء نقي + هدوء + بركة إن شاء الله. ⏰'
  ],
  quran:[
    'السلام عليكم ورحمة الله 📖\n\n**تقنية الحفظ ٣-٢-١:**\n1. اقرأ الصفحة ٣ مرات بصوت عالٍ\n2. أغمض عينيك وكررها من الذاكرة\n3. افتح وتحقق ثم أعد مرتين\n\n🌙 أفضل وقت: بعد الفجر مباشرة',
    'السلام عليكم ورحمة الله 🤲\n\n**المراجعة أهم من الحفظ الجديد:**\n• اليوم الأول: الصفحة الجديدة\n• اليوم الثاني: الجديدة + أمس\n• كل أسبوع: راجع كل الأسبوع\n\nهذا يثبت الحفظ في الذاكرة طويلة المدى. 🌟'
  ],
  motivation:[
    'السلام عليكم ورحمة الله 🔥\n\n{إن مع العسر يسرا}\n\nكل يوم صعب تتجاوزه يبني قوة لا تراها الآن لكنها ستظهر لاحقاً.\nروتينك استثمار — كل يوم يضيف على ما قبله. 💪',
    'السلام عليكم ورحمة الله ⭐\n\nقال النبي ﷺ: "أحب الأعمال إلى الله أدومها وإن قل"\n\nلا تنتظر الحماسة — ابدأ وستأتي.\nالانضباط يبني الحضور، الحضور يبني النتائج. 🚀',
    'السلام عليكم ورحمة الله 🌙\n\n٦٦ يوماً فقط حتى يصبح روتينك تلقائياً كالتنفس.\n\nأنت لست متأخراً — كل يوم تبدأ فيه هو يوم مبكر قياساً بمن لم يبدأ. ✨'
  ],
  sleep:[
    'السلام عليكم ورحمة الله 😴\n\n**قاعدة ٣-٢-١ للنوم الجيد:**\n• لا أكل ٣ ساعات قبل النوم\n• لا شرب كثير ٢ ساعة قبل النوم\n• لا شاشات ساعة قبل النوم\n\n💡 ضع هاتفك خارج الغرفة',
    'السلام عليكم ورحمة الله 🌙\n\n**للنوم السريع:**\nاقرأ آية الكرسي والمعوذتين وانفث على جسدك كما علّمنا النبي ﷺ.\n\nهذه السنة لها أثر عجيب في تهدئة النفس. 🤲'
  ],
  exercise:[
    'السلام عليكم ورحمة الله 🏋️\n\n**توقيت الجيم الأمثل:**\nبعد الظهر والقيلولة (١:٣٠-٣:٠٠ م)\n\nدرجة حرارة الجسم في أعلاها + هرمونات البناء العضلي نشطة.\n\n**أيام الصيام (الإثنين والخميس):** لا جيم — راحة كاملة. 💪',
    'السلام عليكم ورحمة الله 💪\n\n**توزيع أيام الجيم:**\n✅ الأحد · الثلاثاء · الأربعاء · السبت: تمرين\n❌ الإثنين والخميس: صيام = راحة\n\nبعد الجيم: بروتين + كربوهيدرات خلال ٤٥ دقيقة = البناء الأمثل'
  ],
  fasting:[
    'السلام عليكم ورحمة الله 🌙\n\n**فوائد صيام الإثنين والخميس:**\n• يحسن حساسية الإنسولين\n• يحرق الدهون المخزنة\n• يمنح الجهاز الهضمي راحة\n• يحسن التركيز والإنتاجية\n• سنة نبوية مباركة 🤲',
    'السلام عليكم ورحمة الله ⭐\n\n**نصائح لتحمل الصيام:**\n1. سحور متوازن (بروتين + شوفان + ماء)\n2. تجنب الملح في السحور\n3. القيلولة بعد الظهر مهمة\n4. لا جيم يوم الصيام\n\nالجسم يتكيف بعد ٣-٤ أسابيع. 💪'
  ],
  thanks:[
    'السلام عليكم ورحمة الله 💛\n\nوفقك الله وبارك في يومك وصحتك وعلمك!\n\nتذكر: الاستمرارية أهم من الكمال. 🤲',
    'السلام عليكم ورحمة الله 🌟\n\nجزاك الله خيراً! أنت على طريق صحيح إن شاء الله.\n\nكل خطوة صغيرة تعملها اليوم هي بنيان غدك. 💪'
  ],
  default:[
    'السلام عليكم ورحمة الله 🌙\n\nيمكنني مساعدتك في:\n🍳 الوجبات — إفطار أو غداء أو سحور\n🎯 الإنتاجية — نصائح التركيز\n📖 القرآن — تقنيات الحفظ\n🔥 التحفيز — لإكمال روتينك\n😴 النوم — الاستيقاظ للفجر\n🏋️ الرياضة — مع الصيام\n\nماذا تريد؟',
    'السلام عليكم ورحمة الله 💡\n\nجرب أن تسألني بشكل أكثر تحديداً:\n- "اقترح إفطاراً صحياً"\n- "أعطني نصيحة إنتاجية"\n- "كيف أحفظ القرآن أسرع؟"\n- "حفزني لإكمال يومي"\n\nأنا هنا! 🤲'
  ]
},
en:{
  greeting:[
    'Peace and blessings! 🌙\n\nWelcome! How can I help today?\nThe weekly meal plan is ready above 💪',
    'As-salamu alaykum wa rahmatullahi wa barakatuh! 😊\n\nHappy to have you! I can help with:\n🍳 Meals · 🎯 Productivity · 📖 Quran · 🔥 Motivation'
  ],
  breakfast:[
    'Peace be upon you! 🍳\n\n**Why breakfast matters:**\nProtein-rich morning meal boosts focus for 4-5 hours and prevents overeating at lunch.\n\nCheck the breakfast card in the meal plan above! 📋',
    'Peace be upon you! 🌅\n\n**Perfect breakfast formula:**\nProtein + healthy fats = sustained energy without blood sugar crashes. 🌿'
  ],
  lunch:[
    'Peace be upon you! 🍽️\n\n**Perfect post-gym lunch:**\nHigh protein + complex carbs + vegetables\n\n**Golden window:** Within 45 min of finishing your workout 💪'
  ],
  suhoor:[
    'Peace be upon you! 🌙\n\n**Suhoor Tips:**\n✅ High protein (keeps you full longer)\n✅ Oatmeal with dates (slow carbs)\n✅ 1-1.5L water before Fajr\n❌ Avoid salty food (increases thirst)'
  ],
  productivity:[
    'Peace be upon you! 🎯\n\n**Islamic Pomodoro:**\n• 25 min deep work 📵\n• 5 min break (move + dhikr)\n• After 4 sessions: 20 min break\n\n**Key:** Phone in another room',
    'Peace be upon you! 🌅\n\n**Golden hours:**\nFajr to Dhuhr = your 6 most valuable hours.\n\nBrain at peak + fresh air + silence + blessing. ⏰'
  ],
  quran:[
    'Peace be upon you! 📖\n\n**3-2-1 Memorization:**\n1. Read page 3 times aloud\n2. Close eyes and recall\n3. Open and verify, repeat twice\n\n🌙 Best time: right after Fajr'
  ],
  motivation:[
    'Peace be upon you! 🔥\n\n"Verily, with hardship comes ease." (94:6)\n\nEvery hard day builds hidden strength.\nYour routine is compound interest 💪',
    'Peace be upon you! ⭐\n\nThe Prophet ﷺ said: "The most beloved deeds to Allah are the most consistent."\n\nDon\'t wait for motivation — start and it will follow. 🚀'
  ],
  sleep:[
    'Peace be upon you! 😴\n\n**3-2-1 Sleep Rule:**\n• No food 3 hours before sleep\n• No excess drinks 2 hours before\n• No screens 1 hour before\n\n💡 Put phone outside bedroom'
  ],
  exercise:[
    'Peace be upon you! 🏋️\n\n**Best workout timing:**\nAfter Dhuhr nap (1:30-3:00 PM)\n\nFasting days (Mon/Thu): No workout — complete rest. 💪'
  ],
  fasting:[
    'Peace be upon you! 🌙\n\n**Mon & Thu Fasting Benefits:**\n• Improves insulin sensitivity\n• Burns stored fat\n• Rests digestive system\n• Improves focus & productivity\n• Blessed Prophetic Sunnah 🤲'
  ],
  thanks:[
    'Peace be upon you! 💛\n\nMay Allah bless your day and health!\n\nRemember: Consistency beats perfection. 🤲'
  ],
  default:[
    'Peace be upon you! 🌙\n\nI can help with:\n🍳 Meals — breakfast, lunch, or suhoor\n🎯 Productivity — focus tips\n📖 Quran — memorization techniques\n🔥 Motivation — to keep your routine\n😴 Sleep — waking for Fajr\n🏋️ Exercise — around fasting\n\nWhat do you need?'
  ]
}
};

// ═══════════════════════════════════════════════════
// INTENT DETECTION
// ═══════════════════════════════════════════════════
var INTENTS=[
  {name:'greeting',   kw:['سلام','مرحب','أهل','صباح','مساء','هاي','هلا','hello','hi','hey','greet','السلام عليكم']},
  {name:'breakfast',  kw:['إفطار','فطور','فطار','أكل صبح','breakfast','morning meal','morning food']},
  {name:'lunch',      kw:['غداء','أكل ظهر','وجبة ظهر','lunch','midday','noon meal']},
  {name:'suhoor',     kw:['سحور','قبل الفجر','قبل الصيام','suhoor','pre-dawn','before fasting']},
  {name:'productivity',kw:['إنتاجية','تركيز','ديب ووك','deep work','مذاكرة','دراسة','شغل','productivity','focus','study','work']},
  {name:'quran',      kw:['قرآن','حفظ','تلاوة','ختم','ورد','quran','memorize','recite','hifz']},
  {name:'motivation', kw:['حفزن','تحفيز','ملل','تعب','ما عندي نفس','motivat','tired','lazy','inspire']},
  {name:'sleep',      kw:['نوم','نعسان','أرق','فجر','sleep','insomnia','wake']},
  {name:'exercise',   kw:['رياضة','جيم','تمرين','لياقة','gym','workout','exercise','fitness']},
  {name:'fasting',    kw:['صيام','صوم','صائم','إثنين','خميس','fasting','fast']},
  {name:'thanks',     kw:['شكر','جزاك','بارك','ممتاز','رائع','thanks','thank you','great','awesome']}
];

function detectIntent(msg){
  var m=msg.toLowerCase();
  var scores={};
  INTENTS.forEach(function(it){
    var s=0;
    it.kw.forEach(function(kw){if(m.indexOf(kw.toLowerCase())!==-1)s+=kw.length;});
    if(s>0)scores[it.name]=s;
  });
  var best=null,bestScore=0;
  Object.keys(scores).forEach(function(k){if(scores[k]>bestScore){bestScore=scores[k];best=k;}});
  return best||'default';
}

function getLocalReply(msg){
  var intent=detectIntent(msg);
  var pool=(LOCAL_R[lang]&&LOCAL_R[lang][intent])?LOCAL_R[lang][intent]:(LOCAL_R[lang]&&LOCAL_R[lang]['default']?LOCAL_R[lang]['default']:LOCAL_R['ar']['default']);
  if(!usedIdx[lang])usedIdx[lang]={};
  if(!usedIdx[lang][intent])usedIdx[lang][intent]=[];
  var used=usedIdx[lang][intent];
  var avail=[];
  for(var i=0;i<pool.length;i++){if(used.indexOf(i)===-1)avail.push(i);}
  if(!avail.length){usedIdx[lang][intent]=[];avail=pool.map(function(_,i){return i;});}
  var idx=avail[Math.floor(Math.random()*avail.length)];
  usedIdx[lang][intent].push(idx);
  return pool[idx];
}

// ═══════════════════════════════════════════════════
// GROQ API
// ═══════════════════════════════════════════════════
async function callGroq(userMsg){
  if(!groqKey){
    return lang==='ar'
      ?'السلام عليكم ورحمة الله 🔑\n\nلم يتم إدخال مفتاح Groq بعد.\nأدخله في الحقل أعلاه أو بدّل إلى الوضع المحلي.'
      :'Peace be upon you! 🔑\n\nGroq API key not entered yet.\nAdd it in the field above or switch to Local mode.';
  }
  var sys=lang==='ar'
    ?'أنت مساعد شخصي إسلامي لتطبيق روتيني المثالي. المستخدم يتبع روتيناً يشمل قيام الليل، صلاة الفجر، حفظ القرآن يومياً، عمل عميق من الفجر للظهر، قيلولة، رياضة، صيام الإثنين والخميس. ابدأ دائماً بـ "السلام عليكم ورحمة الله". أجب باختصار وعملية وبأسلوب إسلامي دافئ.'
    :'You are a personal Islamic assistant for My Ideal Routine app. User follows: Night prayer, Fajr, daily Quran memorization, deep work from Fajr to Dhuhr, nap, exercise, fasting Mon/Thu. Be concise, practical, warm Islamic tone.';
  groqHistory.push({role:'user',content:userMsg});
  try{
    var r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+groqKey},
      body:JSON.stringify({model:'llama-3.1-8b-instant',max_tokens:600,temperature:0.75,messages:[{role:'system',content:sys}].concat(groqHistory.slice(-8))})
    });
    var d=await r.json();
    if(d.error){groqHistory.pop();return(lang==='ar'?'⚠️ خطأ Groq: ':'⚠️ Groq Error: ')+d.error.message;}
    var rep=d.choices[0].message.content;
    groqHistory.push({role:'assistant',content:rep});
    return rep;
  }catch(e){groqHistory.pop();return(lang==='ar'?'⚠️ خطأ في الاتصال: ':'⚠️ Connection error: ')+e.message;}
}

// ═══════════════════════════════════════════════════
// CLAUDE API
// ═══════════════════════════════════════════════════
function getClaudeSystem(){
  var recent=getRecentMeals();
  var mealStr=recent.length?recent.map(function(m){return m.type+': '+m.name;}).join(' | '):'none yet';
  return 'You are a personal AI assistant for a Muslim productivity app called "My Ideal Routine" (روتيني المثالي).\n\nThe user follows this daily schedule:\n- 3:00 AM: Wake up for Tahajjud (11 Rakaas)\n- Fajr: Prayer + Morning Adhkar\n- After Fajr: Quran memorization (1 page daily, '+qPages+' pages remaining out of 604)\n- Morning to Dhuhr: Deep Work / Study (no phone)\n- After Dhuhr: Nap (20-30 min)\n- Afternoon: Exercise (3-4 days/week, NO exercise on fasting days)\n- Fasting days: Mondays, Thursdays, White Days (13-14-15 Hijri)\n- 9:30 PM: Sleep\n\nMEAL PLANNING:\n- Meals used this week (avoid repeating): '+mealStr+'\n- If you suggest a meal, end with [MEAL:meal_name:breakfast|lunch|suhoor] for tracking\n\nSTYLE: Concise (3-4 sentences), warm Islamic tone, respond in the same language the user writes in.';
}

async function callClaude(userMsg){
  if(!claudeKey){
    return lang==='ar'
      ?'السلام عليكم ورحمة الله 🔑\n\nلم يتم إدخال مفتاح Claude API بعد.\nأدخله في الحقل أعلاه.'
      :'Peace be upon you! 🔑\n\nClaude API key not entered yet.\nAdd it in the field above.';
  }
  claudeHistory.push({role:'user',content:userMsg});
  try{
    var r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':claudeKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:getClaudeSystem(),messages:claudeHistory.slice(-10)})
    });
    var d=await r.json();
    if(d.error){claudeHistory.pop();return(lang==='ar'?'⚠️ خطأ Claude: ':'⚠️ Claude Error: ')+d.error.message;}
    var rep=d.content&&d.content[0]?d.content[0].text:(lang==='ar'?'⚠️ لم أتلق رداً':'⚠️ No response received');
    claudeHistory.push({role:'assistant',content:rep});
    return rep;
  }catch(e){claudeHistory.pop();return(lang==='ar'?'⚠️ خطأ في الاتصال: ':'⚠️ Connection error: ')+e.message;}
}

// ═══════════════════════════════════════════════════
// AI MODE UI
// ═══════════════════════════════════════════════════
function setAIMode(m,btn){
  aiMode=m; sv('aiMode',m);
  document.querySelectorAll('.ai-mode-btn').forEach(function(b){b.classList.remove('on');});
  btn.classList.add('on');
  document.getElementById('groqKeyBox').style.display=(m==='groq')?'block':'none';
  document.getElementById('claudeKeyBox').style.display=(m==='claude')?'block':'none';
}
function saveGroqKey(){
  groqKey=document.getElementById('groqKeyInp').value.trim();
  sv('groqKey',groqKey);
  appendMsg('ai',lang==='ar'?'السلام عليكم ورحمة الله 🔑\n\nتم حفظ مفتاح Groq! يمكنك الآن الدردشة باستخدام Llama 3.1 مجاناً. 🦙':'Peace be upon you! 🔑\n\nGroq key saved! You can now chat with Llama 3.1 for free. 🦙');
}
function saveClaudeKey(){
  claudeKey=document.getElementById('claudeKeyInp').value.trim();
  sv('claudeKey',claudeKey);
  appendMsg('ai',lang==='ar'?'السلام عليكم ورحمة الله 🤖\n\nتم حفظ مفتاح Claude! يمكنك الآن الدردشة باستخدام Claude Sonnet. 🌟':'Peace be upon you! 🤖\n\nClaude key saved! You can now chat with Claude Sonnet. 🌟');
}

// ═══════════════════════════════════════════════════
// MEAL PLAN (AI TAB)
// ═══════════════════════════════════════════════════
function rendMealGridAI(){
  var isAr=lang==='ar';
  var p=WEEK[aiCurDay];
  var isFast=FAST_DAYS.indexOf(aiCurDay)!==-1;
  var dayLbl=(isAr?DAY_AR[aiCurDay]:DAY_EN[aiCurDay])+(isFast?(isAr?' ⭐ صيام':' ⭐ Fast'):'');
  document.getElementById('dayNameAI').textContent=dayLbl;
  var cards=[
    {k:'bf',cls:'bf',ei:'🌅',ar:'الإفطار',en:'Breakfast'},
    {k:'ln',cls:'ln',ei:'🍽️',ar:'الغداء',en:'Lunch'},
    {k:'sk',cls:'sk',ei:'🫐',ar:'السناك',en:'Snack'},
    {k:'sh',cls:'sh',ei:'🌙',ar:'السحور',en:'Suhoor'}
  ];
  document.getElementById('mealGridAI').innerHTML=cards.map(function(c){
    var m=p[c.k];
    var nm=isAr?m.ar:m.en, ing=isAr?m.iar:m.ien;
    var askLbl=isAr?'اسألني عنها':'Ask me about it';
    var askMsg=isAr?('أخبرني عن هذه الوجبة: '+nm):('Tell me more about this meal: '+nm);
    var calStr=m.cal>0?('~'+m.cal+' kcal · '+m.pro+'g protein'):'—';
    return '<div class="mc '+c.cls+'"><div class="mc-type">'+c.ei+' '+(isAr?c.ar:c.en)+'</div>'+
      '<div class="mc-name">'+nm+'</div>'+
      '<div class="mc-cal">'+calStr+'</div>'+
      '<div class="mc-ing">'+ing+'</div>'+
      '<button class="mc-ask" onclick="quickMsg(\''+askMsg.replace(/'/g,"\\'")+'\')">' +askLbl+'</button></div>';
  }).join('');
}
function chDayAI(d){aiCurDay=(aiCurDay+d+7)%7;rendMealGridAI();}

// ═══════════════════════════════════════════════════
// QUICK BUTTONS
// ═══════════════════════════════════════════════════
function rendQuickBtns(){
  var isAr=lang==='ar';
  var btns=isAr?[
    {l:'🥗 اقترح إفطاراً',m:'اقترح لي وجبة إفطار صحية'},
    {l:'🍽️ اقترح غداءً',m:'اقترح لي وجبة غداء صحية بعد الجيم'},
    {l:'💡 نصيحة إنتاجية',m:'أعطني نصيحة إنتاجية عملية'},
    {l:'📖 تقنية حفظ',m:'أعطني تقنية فعالة لحفظ القرآن'},
    {l:'🔥 حفزني',m:'حفزني بكلمة أو آية لإكمال يومي'},
    {l:'😴 نصيحة نوم',m:'كيف أحسن نومي وأستيقظ للفجر؟'},
    {l:'🌙 نصائح سحور',m:'أعطني نصائح للسحور في يوم الصيام'},
    {l:'🏋️ رياضة + صيام',m:'كيف أمارس الرياضة مع الصيام؟'}
  ]:[
    {l:'🥗 Suggest Breakfast',m:'Suggest a healthy breakfast for me'},
    {l:'🍽️ Suggest Lunch',m:'Suggest a healthy post-gym lunch'},
    {l:'💡 Productivity',m:'Give me one practical productivity tip'},
    {l:'📖 Quran Tip',m:'Give me an effective Quran memorization technique'},
    {l:'🔥 Motivate Me',m:'Motivate me to complete my daily routine'},
    {l:'😴 Sleep Tips',m:'How to improve sleep and wake up for Fajr?'},
    {l:'🌙 Suhoor Tips',m:'Give me suhoor tips for a fasting day'},
    {l:'🏋️ Gym + Fasting',m:'How to exercise around fasting days?'}
  ];
  var el=document.getElementById('quickBtns');
  if(el)el.innerHTML=btns.map(function(b){return'<button class="qk-btn" onclick="quickMsg(\''+b.m.replace(/'/g,"\\'")+'\')">' +b.l+'</button>';}).join('');
}
function quickMsg(msg){document.getElementById('chatInp').value=msg;sendMsg();}

// ═══════════════════════════════════════════════════
// CHAT FUNCTIONS
// ═══════════════════════════════════════════════════
function appendMsg(role,text){
  var msgs=document.getElementById('chatMsgs');
  var div=document.createElement('div');
  div.className='msg '+role;
  var ico=role==='ai'?'🤖':'👤';
  var processed=text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  var mealMatch=text.match(/\[MEAL:([^:]+):(breakfast|lunch|suhoor|iftar|snack)\]/i);
  if(mealMatch){
    saveMeal(mealMatch[1].trim(),mealMatch[2].trim());
    processed=processed.replace(/\[MEAL:[^\]]+\]/g,'<br><span class="meal-chip">✓ '+(lang==='ar'?'تم حفظ الوجبة':'Meal saved')+'</span>');
  }
  div.innerHTML='<div class="msg-ico '+role+'">'+ico+'</div><div class="msg-bubble">'+processed+'</div>';
  msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}

function showTyping(){
  var msgs=document.getElementById('chatMsgs');
  var div=document.createElement('div');
  div.className='msg ai';div.id='typingInd';
  div.innerHTML='<div class="msg-ico ai">🤖</div><div class="msg-bubble"><div class="typing-ind"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;
}
function hideTyping(){var el=document.getElementById('typingInd');if(el)el.remove();}

async function sendMsg(){
  var inp=document.getElementById('chatInp'),send=document.getElementById('chatSend');
  var msg=inp.value.trim();if(!msg||isSending)return;
  isSending=true;send.disabled=true;
  inp.value='';inp.style.height='auto';
  appendMsg('user',msg);
  showTyping();
  var reply;
  try{
    if(aiMode==='local'){
      await new Promise(function(r){setTimeout(r,500+Math.random()*500);});
      reply=getLocalReply(msg);
    } else if(aiMode==='groq'){
      reply=await callGroq(msg);
    } else {
      reply=await callClaude(msg);
    }
  }catch(e){
    reply=(lang==='ar'?'⚠️ حدث خطأ: ':'⚠️ Error: ')+e.message;
  }
  hideTyping();
  appendMsg('ai',reply);
  isSending=false;send.disabled=false;inp.focus();
}

document.getElementById('chatInp').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';});

// ═══════════════════════════════════════════════════
// MEAL HISTORY
// ═══════════════════════════════════════════════════
function getRecentMeals(){var weekAgo=Date.now()-7*24*60*60*1000;return mealHistory.filter(function(m){return m.date>weekAgo;});}
function saveMeal(name,type){mealHistory.push({name:name,type:type,date:Date.now()});sv('mealHistory',mealHistory);rendMealHistory();}
function rendMealHistory(){
  var el=document.getElementById('mealHistDiv');if(!el)return;
  var recent=getRecentMeals();
  if(!recent.length){el.innerHTML='';return;}
  var isAr=lang==='ar';
  var chips=recent.slice(-10).reverse().map(function(m){return'<span class="meal-chip">'+m.type+': '+m.name+'</span>';}).join('');
  el.innerHTML='<div class="meal-hist-wrap"><div class="meal-hist-title">'+(isAr?'🍽️ وجبات هذا الأسبوع (لن تتكرر في Claude):':'🍽️ This week\'s meals (won\'t repeat with Claude):')+' </div>'+chips+'</div>';
}

// ═══════════════════════════════════════════════════
// SCHEDULE DATA
// ═══════════════════════════════════════════════════
var schedNormal=ld('schedNormal',[
  {id:'n1',time:'٣:٠٠ ص',time_en:'3:00 AM',icon:'🌙',name:'استيقاظ — قيام الليل',name_en:'Wake Up — Night Prayer',note:'١١ ركعة (٨ قيام + ٣ وتر)',note_en:'11 Rakaas (8+3 Witr)',type:'sleep',timer:60},
  {id:'n2',time:'أذان الفجر',time_en:'Fajr Time',icon:'🕌',name:'صلاة الفجر',name_en:'Fajr Prayer',note:'في أول وقتها',note_en:'At earliest time',type:'prayer',timer:10,apiKey:'Fajr'},
  {id:'n3',time:'بعد الفجر',time_en:'After Fajr',icon:'📿',name:'أذكار الصباح',name_en:'Morning Adhkar',note:'خذ وقتك',note_en:'Take your time',type:'quran',timer:20},
  {id:'n4',time:'+٢٥ د',time_en:'+25 min',icon:'📖',name:'حفظ القرآن — صفحة',name_en:'Quran Memorization',note:'أقوى وقت للحفظ',note_en:'Best memorization time',type:'quran',timer:30},
  {id:'n5',time:'بعد الشروق',time_en:'After Sunrise',icon:'☀️',name:'صلاة الضحى',name_en:'Duha Prayer',note:'ركعتان على الأقل',note_en:'At least 2 Rakaas',type:'prayer',timer:5,apiKey:'Sunrise',apiPlus:15},
  {id:'n6',time:'بعد الضحى',time_en:'After Duha',icon:'🎯',name:'Deep Work — مذاكرة',name_en:'Deep Work — Study',note:'لا هاتف · تركيز كامل',note_en:'No phone · Full focus',type:'work',timer:90},
  {id:'n7',time:'٧:٣٠ ص',time_en:'7:30 AM',icon:'🥗',name:'الإفطار',name_en:'Breakfast',note:'بروتين + كربوهيدرات',note_en:'Protein + Carbs',type:'meal',timer:20},
  {id:'n8',time:'أذان الظهر',time_en:'Dhuhr Time',icon:'🕌',name:'صلاة الظهر',name_en:'Dhuhr Prayer',note:'توقف عن العمل',note_en:'Stop working',type:'prayer',timer:10,apiKey:'Dhuhr'},
  {id:'n9',time:'بعد الظهر',time_en:'After Dhuhr',icon:'😴',name:'قيلولة',name_en:'Nap',note:'٢٠-٣٠ دقيقة',note_en:'20-30 min only',type:'sleep',timer:25},
  {id:'n10',time:'١:٤٠ م',time_en:'1:40 PM',icon:'🏋️',name:'جيم أو رياضة',name_en:'Gym / Exercise',note:'٣-٤ أيام أسبوعياً',note_en:'3-4 days/week',type:'health',timer:60},
  {id:'n11',time:'٣:٢٠ م',time_en:'3:20 PM',icon:'🍽️',name:'الغداء بعد الجيم',name_en:'Lunch After Gym',note:'بروتين + خضار + كربوهيدرات',note_en:'Protein + Veggies + Carbs',type:'meal',timer:25},
  {id:'n12',time:'أذان العصر',time_en:'Asr Time',icon:'🕌',name:'صلاة العصر',name_en:'Asr Prayer',note:'في أول وقتها',note_en:'At earliest time',type:'prayer',timer:10,apiKey:'Asr'},
  {id:'n13',time:'بعد العصر',time_en:'After Asr',icon:'📿',name:'أذكار المساء',name_en:'Evening Adhkar',note:'خذ وقتك',note_en:'Take your time',type:'quran',timer:20},
  {id:'n14',time:'٥:١٥ م',time_en:'5:15 PM',icon:'👨‍👩‍👦',name:'وقت العائلة',name_en:'Family Time',note:'حضور حقيقي — لا هاتف',note_en:'Real presence — no phone',type:'family',timer:60},
  {id:'n15',time:'٦:٠٠ م',time_en:'6:00 PM',icon:'📚',name:'قراءة كتاب',name_en:'Book Reading',note:'١٥-٣٠ دقيقة',note_en:'15-30 minutes',type:'quran',timer:20},
  {id:'n16',time:'٦:٣٠ م',time_en:'6:30 PM',icon:'🫐',name:'سناك — آخر أكل',name_en:'Snack — Last Meal',note:'٣ ساعات قبل النوم',note_en:'3 hours before sleep',type:'meal',timer:15},
  {id:'n17',time:'أذان المغرب',time_en:'Maghrib Time',icon:'🕌',name:'صلاة المغرب',name_en:'Maghrib Prayer',note:'',note_en:'',type:'prayer',timer:10,apiKey:'Maghrib'},
  {id:'n18',time:'بعد المغرب',time_en:'After Maghrib',icon:'📋',name:'تخطيط الغد',name_en:'Plan Tomorrow',note:'٣ مهام أساسية',note_en:'3 key tasks',type:'work',timer:15},
  {id:'n19',time:'+١٥ د',time_en:'+15 min',icon:'📖',name:'مراجعة الحفظ',name_en:'Review Memorization',note:'صفحة اليوم + ما قبلها',note_en:"Today's + previous pages",type:'quran',timer:20},
  {id:'n20',time:'٨:٣٠ م',time_en:'8:30 PM',icon:'📵',name:'لا شاشات — ٣-٢-١',name_en:'No Screens — 3-2-1',note:'ساعة قبل النوم',note_en:'1 hour before sleep',type:'sleep',timer:0},
  {id:'n21',time:'أذان العشاء',time_en:'Isha Time',icon:'🕌',name:'صلاة العشاء',name_en:'Isha Prayer',note:'',note_en:'',type:'prayer',timer:10,apiKey:'Isha'},
  {id:'n22',time:'٩:٣٠ م',time_en:'9:30 PM',icon:'🌙',name:'النوم',name_en:'Sleep',note:'٦-٧ ساعات · آية الكرسي',note_en:'6-7 hours · Ayat Al-Kursi',type:'sleep',timer:0}
]);

var schedFast=[
  {id:'f1',time:'٢:٤٠ ص',time_en:'2:40 AM',icon:'🍳',name:'السحور',name_en:'Suhoor',note:'بروتين + ماء كثير',note_en:'Protein + lots of water',type:'meal',timer:20},
  {id:'f2',time:'٣:٠٠ ص',time_en:'3:00 AM',icon:'🌙',name:'قيام الليل',name_en:'Night Prayer',note:'الدعاء مستجاب',note_en:'Duaa is answered',type:'sleep',timer:60},
  {id:'f3',time:'أذان الفجر',time_en:'Fajr',icon:'⭐',name:'بداية الصيام',name_en:'Start of Fast',note:'نية الصيام',note_en:'Intention to fast',type:'fast',timer:0,apiKey:'Fajr'},
  {id:'f4',time:'بعد الفجر',time_en:'After Fajr',icon:'📖',name:'حفظ القرآن + أذكار',name_en:'Quran + Adhkar',note:'',note_en:'',type:'quran',timer:45},
  {id:'f5',time:'+٢٠ د',time_en:'+20 min',icon:'🎯',name:'Deep Work',name_en:'Deep Work',note:'الطاقة عالية صباحاً مع الصيام',note_en:'Energy is high in the morning',type:'work',timer:90},
  {id:'f6',time:'أذان الظهر',time_en:'Dhuhr',icon:'🕌',name:'صلاة الظهر',name_en:'Dhuhr Prayer',note:'',note_en:'',type:'prayer',timer:10,apiKey:'Dhuhr'},
  {id:'f7',time:'١:٠٠ م',time_en:'1:00 PM',icon:'😴',name:'قيلولة',name_en:'Nap',note:'٣٠-٤٥ دقيقة',note_en:'30-45 min',type:'sleep',timer:35},
  {id:'f8',time:'أذان العصر',time_en:'Asr',icon:'🕌',name:'صلاة العصر',name_en:'Asr Prayer',note:'',note_en:'',type:'prayer',timer:10,apiKey:'Asr'},
  {id:'f9',time:'بعد العصر',time_en:'After Asr',icon:'📿',name:'أذكار المساء + دعاء',name_en:'Evening Adhkar + Duaa',note:'دعاء الصائم مستجاب',note_en:"Fasting person's Duaa is answered",type:'quran',timer:20},
  {id:'f10',time:'٦:٠٠ م',time_en:'6:00 PM',icon:'📖',name:'تلاوة حتى الإفطار',name_en:'Recitation Until Iftar',note:'',note_en:'',type:'quran',timer:45},
  {id:'f11',time:'أذان المغرب',time_en:'Maghrib',icon:'🍴',name:'الإفطار',name_en:'Iftar',note:'تمر وماء · لا تفرط',note_en:'Dates & water · moderation',type:'meal',timer:0,apiKey:'Maghrib'},
  {id:'f12',time:'أذان العشاء',time_en:'Isha',icon:'🕌',name:'صلاة العشاء',name_en:'Isha Prayer',note:'',note_en:'',type:'prayer',timer:10,apiKey:'Isha'},
  {id:'f13',time:'٩:٣٠ م',time_en:'9:30 PM',icon:'🌙',name:'النوم مبكراً',name_en:'Early Sleep',note:'ستستيقظ للسحور ٢:٤٠ ص',note_en:'Will wake for Suhoor 2:40 AM',type:'sleep',timer:0}
];

// ═══════════════════════════════════════════════════
// HABITS DATA
// ═══════════════════════════════════════════════════
var habitDefs=[
  {id:'fajr',ico:'🕌',ar:'صلاة الفجر في وقتها',en:'Fajr Prayer on Time',links:[{ar:'فضل صلاة الفجر',en:'Virtues of Fajr',url:'https://www.youtube.com/results?search_query=فضل+صلاة+الفجر'}]},
  {id:'prayers',ico:'🕌',ar:'الصلوات الخمس في وقتها',en:'5 Prayers on Time',links:[{ar:'أهمية الصلاة في وقتها',en:'Importance of Prayer',url:'https://www.youtube.com/results?search_query=أهمية+الصلاة+في+وقتها'}]},
  {id:'quran',ico:'📖',ar:'حفظ صفحة قرآن',en:'Memorize 1 Quran Page',links:[{ar:'أفضل طريقة لحفظ القرآن',en:'Best Quran Memorization Method',url:'https://www.youtube.com/results?search_query=أفضل+طريقة+حفظ+القرآن'},{ar:'تقنيات الحفظ السريع',en:'Speed Memorization',url:'https://www.youtube.com/results?search_query=تقنيات+الحفظ+السريع+قرآن'}]},
  {id:'adhkar',ico:'📿',ar:'أذكار الصباح والمساء',en:'Morning & Evening Adhkar',links:[{ar:'أذكار الصباح والمساء كاملة',en:'Full Adhkar Audio',url:'https://www.youtube.com/results?search_query=أذكار+الصباح+والمساء+كاملة'}]},
  {id:'sport',ico:'🏋️',ar:'ممارسة الرياضة',en:'Exercise / Workout',links:[{ar:'تمارين يومية 30 دقيقة',en:'30-min Daily Workout',url:'https://www.youtube.com/results?search_query=تمارين+رياضية+يومية+30+دقيقة'}]},
  {id:'read',ico:'📚',ar:'قراءة كتاب',en:'Read a Book',links:[{ar:'كيف تطور عادة القراءة',en:'Build a Reading Habit',url:'https://www.youtube.com/results?search_query=كيف+تطور+عادة+القراءة'}]},
  {id:'water',ico:'💧',ar:'شرب ٢ لتر ماء',en:'Drink 2L Water',links:[{ar:'فوائد شرب الماء',en:'Benefits of Water',url:'https://www.youtube.com/results?search_query=فوائد+شرب+الماء+يومياً'}]},
  {id:'sleep',ico:'😴',ar:'النوم قبل العشاء',en:'Sleep Before 10 PM',links:[{ar:'فوائد النوم المبكر',en:'Benefits of Early Sleep',url:'https://www.youtube.com/results?search_query=فوائد+النوم+المبكر'}]},
  {id:'plan',ico:'📋',ar:'تخطيط اليوم القادم',en:'Plan Tomorrow',links:[{ar:'كيف تخطط يومك',en:'How to Plan Your Day',url:'https://www.youtube.com/results?search_query=كيف+تخطط+يومك+بشكل+فعال'}]}
];

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function toAr(s){return String(s).replace(/\d/g,function(d){return'٠١٢٣٤٥٦٧٨٩'[d];});}
function numD(n){return lang==='ar'?toAr(n):String(n);}
function fmt12(tm){
  if(!tm)return'—';
  var p=tm.split(':'),h=parseInt(p[0]),m=parseInt(p[1]);
  var ap=h<12?(lang==='ar'?'ص':'AM'):(lang==='ar'?'م':'PM');
  return(lang==='ar'?toAr(h%12||12)+':'+toAr(String(m).padStart(2,'0')):String(h%12||12)+':'+String(m).padStart(2,'0'))+' '+ap;
}
function addM(tm,n){var p=tm.split(':'),h=parseInt(p[0]),m=parseInt(p[1]),tot=h*60+m+n;return Math.floor(tot/60)%24+':'+String(tot%60).padStart(2,'0');}
function isPassed(tm){var n=new Date(),p=tm.split(':');return n.getHours()*60+n.getMinutes()>parseInt(p[0])*60+parseInt(p[1]);}
function setText(id,v){var e=document.getElementById(id);if(e)e.textContent=v;}
function toast(msg,dur){dur=dur||2400;var el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(function(){el.classList.remove('show');},dur);}
var HIJRI=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];

// ═══════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════
function getAudio(){if(!_audioCtx)_audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(_audioCtx.state==='suspended')_audioCtx.resume();return _audioCtx;}
document.addEventListener('click',function ia(){try{getAudio();}catch(e){}document.removeEventListener('click',ia,true);},true);
function playDone(){
  try{var ctx=getAudio();var notes=[523.25,659.25,783.99,1046.5,783.99,1046.5],times=[0,.18,.36,.54,.75,.9];
  notes.forEach(function(freq,i){var osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(0,ctx.currentTime+times[i]);gain.gain.linearRampToValueAtTime(.35,ctx.currentTime+times[i]+.06);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+times[i]+.55);osc.start(ctx.currentTime+times[i]);osc.stop(ctx.currentTime+times[i]+.6);});}catch(e){}
}
function playTick(){try{var ctx=getAudio(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.connect(gain);gain.connect(ctx.destination);osc.frequency.value=880;osc.type='sine';gain.gain.setValueAtTime(.15,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.1);osc.start(ctx.currentTime);osc.stop(ctx.currentTime+.12);}catch(e){}}

// ═══════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════
function toggleSettings(){var p=document.getElementById('settingsPanel');p.classList.toggle('show');if(p.classList.contains('show')){document.getElementById('cityInp').value=city;document.getElementById('countryInp').value=country;document.getElementById('methodSel').value=method;}}
function saveSettings(){city=document.getElementById('cityInp').value.trim()||'Cairo';country=document.getElementById('countryInp').value.trim()||'Egypt';method=document.getElementById('methodSel').value;sv('city',city);sv('country',country);sv('method',method);toggleSettings();init();toast(lang==='ar'?'✅ تم الحفظ':'✅ Saved');}
function useLocation(){
  var btn=document.getElementById('locBtn');btn.textContent='⏳...';
  if(!navigator.geolocation){toast('Geolocation not supported');return;}
  navigator.geolocation.getCurrentPosition(function(pos){
    var lat=pos.coords.latitude.toFixed(4),lng=pos.coords.longitude.toFixed(4);
    city=lat+','+lng;country='';sv('city',city);sv('country',country);
    btn.textContent=lang==='ar'?'📍 تحديد موقعي':'📍 Auto-detect';
    document.getElementById('cityInp').value='('+lat+','+lng+')';
    document.getElementById('countryInp').value='';
    toggleSettings();init();toast('📍 '+(lang==='ar'?'تم تحديد موقعك':'Location detected'));
  },function(){btn.textContent=lang==='ar'?'📍 تحديد موقعي':'📍 Auto-detect';toast(lang==='ar'?'⚠️ تعذر التحديد':'⚠️ Could not detect');});
}

// ═══════════════════════════════════════════════════
// THEME & LANGUAGE
// ═══════════════════════════════════════════════════
function applyTheme(){document.body.setAttribute('data-theme',theme);setText('themeBtn',theme==='dark'?'☀️':'🌙');}
function toggleTheme(){theme=theme==='dark'?'light':'dark';sv('theme',theme);applyTheme();}

function applyLang(){
  document.documentElement.lang=lang;
  document.documentElement.dir=lang==='ar'?'rtl':'ltr';
  setText('langBtn',lang==='ar'?'EN':'ع');
  var isAr=lang==='ar';
  setText('appTitle',isAr?'روتيني ✦':'My Routine ✦');
  document.getElementById('heroH1').innerHTML=(isAr?'روتيني ':'My ')+'<em id="heroEm">'+(isAr?'المثالي':'Ideal Routine')+'</em>';
  setText('liveLabel','Live — Aladhan API');
  setText('stTitle',isAr?'⚙️ إعدادات أوقات الصلاة':'⚙️ Prayer Time Settings');
  setText('lbl-city',isAr?'المدينة':'City');
  setText('lbl-country',isAr?'الدولة':'Country');
  setText('lbl-method',isAr?'طريقة الحساب':'Calculation Method');
  setText('lbl-loc',isAr?'أو موقعي التلقائي':'Or auto-detect');
  setText('locBtn',isAr?'📍 تحديد موقعي':'📍 Auto-detect location');
  setText('saveStBtn',isAr?'💾 حفظ وتحديث':'💾 Save & Update');
  setText('stNote',isAr?'* اتركها فارغة لاستخدام القاهرة':'* Leave empty to use Cairo');
  setText('tb-normal',isAr?'📅 يوم عادي':'📅 Normal Day');
  setText('tb-fast',isAr?'⭐ صيام':'⭐ Fasting');
  setText('tb-timer',isAr?'⏱ التركيز':'⏱ Focus');
  setText('tb-tasks',isAr?'✅ مهامي':'✅ Tasks');
  setText('tb-habits',isAr?'🔥 عاداتي':'🔥 Habits');
  setText('tb-ai',isAr?'🤖 مساعد AI':'🤖 AI Assistant');
  setText('tb-week',isAr?'📆 الأسبوع':'📆 Week');
  setText('tb-rules',isAr?'📋 قواعد':'📋 Rules');
  setText('editSchedBtn',isAr?'✏️ تعديل الجدول':'✏️ Edit Schedule');
  setText('timerLbl',isAr?'⏱ مؤقت التركيز':'⏱ Focus Timer');
  setText('setCustomBtn',isAr?'تعيين':'Set');
  setText('histLbl',isAr?'سجل اليوم':"Today's Sessions");
  setText('noSessLbl',isAr?'لا توجد جلسات بعد':'No sessions yet');
  setText('focusTotLbl',isAr?'إجمالي دقائق التركيز':'Total focus minutes today');
  setText('noTasksLbl',isAr?'🎯 أضف أول مهمة':'🎯 Add your first task');
  setText('fltAll',isAr?'الكل':'All');
  setText('fltActive',isAr?'المعلقة':'Pending');
  setText('fltDone',isAr?'المنجزة':'Done');
  setText('qCounterLbl',isAr?'عداد حفظ القرآن':'Quran Memorization Counter');
  setText('qLbl',isAr?'صفحة متبقية من ٦٠٤':'pages remaining out of 604');
  setText('qPlusBtn',isAr?'+ صفحة':'+ Page');
  setText('habitsLbl',isAr?'عاداتي اليومية':'My Daily Habits');
  setText('mealPlanTitle',isAr?'🍽️ الخطة الغذائية اليومية':'🍽️ Daily Meal Plan');
  setText('mLocal',isAr?'⚡ محلي':'⚡ Local');
  setText('mGroq','🦙 Groq مجاني');
  setText('mClaude','🤖 Claude AI');
  setText('chatSend',isAr?'إرسال':'Send');
  document.getElementById('chatInp').placeholder=isAr?'اسألني أي شيء...':'Ask me anything...';
  setText('qProgLbl',isAr?'📖 تتبع حفظ القرآن':'📖 Quran Memorization');
  setText('qDaysL',isAr?'يوم للختم':'days to finish');
  setText('qMonsL',isAr?'أشهر متبقية':'months remaining');
  setText('fastSumLbl',isAr?'الصيام السنوي':'Annual Fasting');
  setText('fMonLbl',isAr?'الإثنين والخميس':'Mon & Thu Fasting');
  setText('fMonNote',isAr?'٥٢ × ٢ يوم':'52 × 2 days');
  setText('fWhiteLbl',isAr?'الأيام البيض (١٣-١٤-١٥)':'White Days (13-14-15)');
  setText('fWhiteNote',isAr?'١٢ × ٣ أيام':'12 × 3 Hijri days');
  setText('s1l',isAr?'صفحة قرآن':'Quran pages');
  setText('s2l',isAr?'🔥 عادات':'🔥 Habits');
  setText('s3l',isAr?'مهام منجزة':'Tasks done');
  setText('s4l',isAr?'دقائق تركيز':'Focus minutes');
  setText('r321T',isAr?'قاعدة ٣-٢-١ قبل النوم:':'3-2-1 Rule Before Sleep:');
  setText('r321D',isAr?'🚫 لا أكل ٣ ساعات · لا شرب كثير ٢ ساعة · لا شاشات ساعة':'🚫 No food 3hrs · No drinks 2hrs · No screens 1hr before sleep');
  setText('conAlert',isAr?'💡 أول ٦٦ يوم هي الأصعب — بعدها يصبح الروتين تلقائياً.':'💡 The first 66 days are hardest — after that, the routine becomes automatic.');
  setText('editMTitle',isAr?'✏️ تعديل الجدول':'✏️ Edit Schedule');
  setText('addEvBtn',isAr?'+ إضافة حدث':'+ Add Event');
  setText('saveSchedBtn',isAr?'💾 حفظ':'💾 Save');

  var rules=isAr?[
    {i:'📖',t:'صفحة قرآن يومياً',d:'الفجر للحفظ · المساء للمراجعة'},
    {i:'🏋️',t:'رياضة ٣-٤ أيام',d:'الأحد-الثلاثاء-الأربعاء-السبت'},
    {i:'📵',t:'لا شاشة قبل النوم',d:'ساعة كاملة — القرآن أو القراءة'},
    {i:'💧',t:'الماء أولاً',d:'٢-٣ لتر يومياً'},
    {i:'📋',t:'خطط لغدك الليلة',d:'١٥ دقيقة — ٣ مهام فقط'},
    {i:'🎯',t:'Deep Work بلا انقطاع',d:'من الفجر للظهر = لا هاتف'},
    {i:'😴',t:'القيلولة ٢٠-٣٠ دقيقة',d:'بعد الظهر فقط'},
    {i:'🤲',t:'الصلاة في أول وقتها',d:'هي محور اليوم'}
  ]:[
    {i:'📖',t:'1 Quran Page Daily',d:'Morning memorize · Evening review'},
    {i:'🏋️',t:'Exercise 3-4 Days',d:'Sun-Tue-Wed-Sat · Rest on fasting days'},
    {i:'📵',t:'No Screens Before Sleep',d:'1 full hour — Quran or book'},
    {i:'💧',t:'Water First',d:'2-3 liters daily'},
    {i:'📋',t:'Plan Tomorrow Tonight',d:'15 min — 3 tasks only'},
    {i:'🎯',t:'Deep Work Uninterrupted',d:'Fajr to Dhuhr = no phone'},
    {i:'😴',t:'Nap 20-30 Minutes',d:'After Dhuhr only'},
    {i:'🤲',t:'Pray at Earliest Time',d:'Core of the day'}
  ];
  var rg=document.getElementById('rulesGrid');
  if(rg)rg.innerHTML=rules.map(function(r){return'<div class="rc"><div class="rico">'+r.i+'</div><div><div class="rt">'+r.t+'</div><div class="rd">'+r.d+'</div></div></div>';}).join('');

  if(!tRun)rCtrls(tSecs===tTotal?'idle':'pause');
  if(!tLbl)setText('tName',isAr?'اختر مهمة أو ابدأ مباشرة':'Pick a task or start now');
  rendNormal();rendFast();rendHabits();rendQuickBtns();rendMealGridAI();rendMealHistory();
}
function toggleLang(){lang=lang==='ar'?'en':'ar';sv('lang',lang);applyLang();}

// ═══════════════════════════════════════════════════
// PRAYER TIMES API
// ═══════════════════════════════════════════════════
var apiTimes={};
function init(){
  var now=new Date();
  var dd=String(now.getDate()).padStart(2,'0'),mm=String(now.getMonth()+1).padStart(2,'0'),yyyy=now.getFullYear();
  var isLL=/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(city);
  var url=isLL
    ?'https://api.aladhan.com/v1/timings/'+dd+'-'+mm+'-'+yyyy+'?latitude='+city.split(',')[0]+'&longitude='+city.split(',')[1]+'&method='+method
    :'https://api.aladhan.com/v1/timingsByCity/'+dd+'-'+mm+'-'+yyyy+'?city='+encodeURIComponent(city)+'&country='+encodeURIComponent(country)+'&method='+method;
  fetch(url).then(function(r){return r.json();}).then(function(data){
    if(data.code!==200)throw new Error();
    var T2=data.data.timings,h=data.data.date.hijri;
    var hDay=parseInt(h.day),hMon=parseInt(h.month.number),hMN=HIJRI[hMon-1],hY=h.year;
    var dow=now.getDay(),isMon=dow===1,isThu=dow===4;
    var isW=(hDay===13||hDay===14||hDay===15),isFast=isMon||isThu||isW;
    apiTimes=T2;
    var lt=document.getElementById('locTag'),ln=document.getElementById('locName');
    if(ln){ln.textContent=isLL?'GPS':city+(country?', '+country:'');lt.style.display='flex';}
    var dN=lang==='ar'?DAY_AR[dow]:DAY_EN[dow];
    document.getElementById('hDate').innerHTML='<strong>'+dN+' '+dd+'/'+mm+'/'+yyyy+'</strong> · '+toAr(hDay)+' '+hMN+' هـ';
    var dtw=hDay<13?13-hDay:hDay<=15?0:30-hDay+13;
    var isAr=lang==='ar';
    document.getElementById('chips').innerHTML=
      (isFast?'<div class="chip c-fast">⭐ '+(isAr?'يوم صيام':'Fasting Day')+(isW?isAr?' (أيام بيض)':' (White Days)':isMon?isAr?' (الإثنين)':' (Mon)':isAr?' (الخميس)':' (Thu)')+'</div>':'<div class="chip c-norm">📅 '+(isAr?'يوم عادي':'Regular Day')+'</div>')+
      '<div class="chip c-moon">🌕 '+toAr(hDay)+' '+hMN+(isW?isAr?' ✓ أبيض':' ✓ White':'')+'</div>'+
      (isW?'<div class="chip c-hij">🌙 '+(isAr?'أنت في الأيام البيض':'You\'re in the White Days!')+'</div>':'<div class="chip c-hij">🌙 '+(isAr?'الأيام البيض بعد ':'White Days in ')+numD(dtw)+(isAr?' يوم':' days')+'</div>');
    var ps=[{n:isAr?'الفجر':'Fajr',i:'🌙',k:'Fajr'},{n:isAr?'الظهر':'Dhuhr',i:'☀️',k:'Dhuhr'},{n:isAr?'العصر':'Asr',i:'🌤️',k:'Asr'},{n:isAr?'المغرب':'Maghrib',i:'🌅',k:'Maghrib'},{n:isAr?'العشاء':'Isha',i:'🌃',k:'Isha'}];
    var nm=now.getHours()*60+now.getMinutes(),nxt=-1;
    for(var i=0;i<ps.length;i++){var pp=T2[ps[i].k].split(':');if(parseInt(pp[0])*60+parseInt(pp[1])>nm){nxt=i;break;}}
    document.getElementById('pbar').innerHTML=ps.map(function(p,i){return'<div class="pc '+(i===nxt?'nxt':isPassed(T2[p.k])?'done':'')+'"><div class="pi">'+p.i+'</div><div class="pn">'+p.n+'</div><div class="pt">'+fmt12(T2[p.k])+'</div></div>';}).join('');
    var fa=document.getElementById('fastAlert');
    fa.innerHTML=isFast?'<strong>⭐ '+(isAr?'يوم صيام':'Fasting Day')+(isW?isAr?' (الأيام البيض)':' (White Days)':'')+'</strong> '+(isAr?'الإفطار عند المغرب':'Iftar at Maghrib')+' '+fmt12(T2.Maghrib):'<strong>📅 '+(isAr?'اليوم ليس يوم صيام':'Not a fasting day')+'</strong>';
    fa.className='alert '+(isFast?'a-i':'a-g');
    document.getElementById('wkAlert').innerHTML='<strong>🌕 '+(isAr?'الأيام البيض':'White Days')+' — '+hMN+' '+toAr(hY)+' هـ</strong><br>'+(isAr?'١٣ و١٤ و١٥ ':'13, 14, 15 ')+hMN+' — '+(isW?'<strong>'+(isAr?'أنت فيها الآن':'You\'re in them now!')+'</strong>':(isAr?'بعد ':' in ')+numD(dtw)+(isAr?' يوم':' days'));
    var wH='';
    for(var d=0;d<7;d++){var it=d===dow,dNw=isAr?DAY_AR[d]:DAY_EN[d];var tgs=(d===1||d===4)?'<span class="dtag dt-f">⭐</span>':d===5?'<span class="dtag dt-j">🕌</span>':'<span class="dtag dt-g">🏋️</span>';if(it&&isW)tgs+='<span class="dtag" style="background:rgba(201,168,76,.2);color:var(--gold)">🌕</span>';tgs+='<span class="dtag dt-q">📖</span>';wH+='<div class="dc'+(it?' today':'')+'"><div class="dn">'+dNw+'</div>'+tgs+'</div>';}
    document.getElementById('wk').innerHTML=wH;
    rendNormal();rendFast();
    document.getElementById('bar').style.opacity='0';
    setTimeout(function(){var b=document.getElementById('bar');if(b)b.remove();},500);
  }).catch(function(){
    document.getElementById('bar').style.opacity='0';
    document.getElementById('pbar').innerHTML='<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:1rem;font-size:.82rem">⚠️ '+(lang==='ar'?'تعذر تحميل أوقات الصلاة — اضغط ⚙️ لتغيير المدينة':'Could not load prayer times — tap ⚙️ to change city')+'</div>';
    document.getElementById('chips').innerHTML='<div class="chip c-norm">⚠️ '+(lang==='ar'?'خطأ في التحميل':'Load Error')+'</div>';
  });
}
init();setInterval(init,3600000);

// ═══════════════════════════════════════════════════
// SCHEDULE RENDER
// ═══════════════════════════════════════════════════
function getEvTime(ev){
  if(ev.apiKey&&apiTimes[ev.apiKey]){
    var t2=apiTimes[ev.apiKey];
    if(ev.apiPlus)t2=addM(t2,ev.apiPlus);
    return fmt12(t2);
  }
  return lang==='ar'?ev.time:ev.time_en;
}
function rendSchedule(evs,cid){
  var html='';
  for(var i=0;i<evs.length;i++){
    var ev=evs[i];
    var nm=lang==='ar'?ev.name:ev.name_en,nt=lang==='ar'?ev.note:ev.note_en;
    var tb=ev.timer>0?'<button class="tbtn" onclick="qt('+ev.timer+',\''+nm.substring(0,20).replace(/'/g,'').replace(/"/g,'')+'\')">⏱ '+numD(ev.timer)+(lang==='ar'?'د':'m')+'</button>':'';
    html+='<div class="ev '+ev.type+'"><div class="et">'+getEvTime(ev)+'</div><div><div class="en">'+ev.icon+' '+nm+'</div>'+(nt?'<div class="enote">'+nt+'</div>':'')+'</div><div>'+tb+'</div></div>';
  }
  var c=document.getElementById(cid);if(c)c.innerHTML=html;
}
function rendNormal(){rendSchedule(schedNormal,'normal-schedule');}
function rendFast(){rendSchedule(schedFast,'fast-schedule');}

// ═══════════════════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════════════════
function openEditModal(){
  var types=['prayer','quran','work','health','family','sleep','meal','fast'];
  document.getElementById('editList').innerHTML=schedNormal.map(function(ev,idx){
    var nm=lang==='ar'?ev.name:ev.name_en,nt=lang==='ar'?ev.note:ev.note_en,tm=lang==='ar'?ev.time:ev.time_en;
    var tSel=types.map(function(tp){return'<option value="'+tp+'"'+(ev.type===tp?' selected':'')+'>'+tp+'</option>';}).join('');
    return'<div class="ei"><div class="ei-row"><span class="ei-lbl">'+(lang==='ar'?'أيقونة':'Icon')+'</span><input class="ei-inp" style="max-width:55px" id="ico'+idx+'" value="'+ev.icon+'"><span class="ei-lbl">'+(lang==='ar'?'نوع':'Type')+'</span><select class="ei-sel" id="tp'+idx+'">'+tSel+'</select><button class="ei-del" onclick="delEv('+idx+')">'+(lang==='ar'?'حذف':'Del')+'</button></div><div class="ei-row"><span class="ei-lbl">'+(lang==='ar'?'وقت':'Time')+'</span><input class="ei-inp" id="tm'+idx+'" value="'+tm+'"><span class="ei-lbl">'+(lang==='ar'?'تايمر':'Timer')+'</span><input class="ei-inp" style="max-width:50px" id="tmr'+idx+'" type="number" value="'+ev.timer+'"></div><div class="ei-row"><span class="ei-lbl">'+(lang==='ar'?'اسم':'Name')+'</span><input class="ei-inp" id="nm'+idx+'" value="'+nm+'"></div><div class="ei-row"><span class="ei-lbl">'+(lang==='ar'?'ملاحظة':'Note')+'</span><input class="ei-inp" id="nt'+idx+'" value="'+(nt||'')+'"></div></div>';
  }).join('');
  document.getElementById('editModal').classList.add('show');
}
function closeEditModal(){document.getElementById('editModal').classList.remove('show');}
function delEv(idx){schedNormal.splice(idx,1);sv('schedNormal',schedNormal);openEditModal();}
function addNewEvent(){schedNormal.push({id:'e'+Date.now(),time:'',time_en:'',icon:'📌',name:'حدث جديد',name_en:'New Event',note:'',note_en:'',type:'work',timer:30});sv('schedNormal',schedNormal);openEditModal();setTimeout(function(){var el=document.getElementById('editList');if(el)el.scrollTop=el.scrollHeight;},100);}
function saveSchedule(){
  for(var i=0;i<schedNormal.length;i++){
    var ico=document.getElementById('ico'+i),tp=document.getElementById('tp'+i),tm=document.getElementById('tm'+i),nm=document.getElementById('nm'+i),nt=document.getElementById('nt'+i),tmr=document.getElementById('tmr'+i);
    if(ico)schedNormal[i].icon=ico.value;
    if(tp)schedNormal[i].type=tp.value;
    if(tm){if(lang==='ar')schedNormal[i].time=tm.value;else schedNormal[i].time_en=tm.value;}
    if(nm){if(lang==='ar')schedNormal[i].name=nm.value;else schedNormal[i].name_en=nm.value;}
    if(nt){if(lang==='ar')schedNormal[i].note=nt.value;else schedNormal[i].note_en=nt.value;}
    if(tmr)schedNormal[i].timer=parseInt(tmr.value)||0;
  }
  sv('schedNormal',schedNormal);closeEditModal();rendNormal();toast(lang==='ar'?'✅ تم حفظ الجدول':'✅ Schedule saved');
}
document.getElementById('editModal').addEventListener('click',function(e){if(e.target===this)closeEditModal();});

// ═══════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════
function switchTab(name,btn){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on');});
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('on');});
  document.getElementById('tab-'+name).classList.add('on');
  btn.classList.add('on');
}

// ═══════════════════════════════════════════════════
// TIMER
// ═══════════════════════════════════════════════════
function updRing(){
  var pct=tSecs/tTotal,circ=427,fg=document.getElementById('rfg');
  fg.style.strokeDashoffset=String(circ*(1-pct));
  fg.style.stroke=pct>0.5?'var(--gold)':pct>0.2?'var(--orange)':'var(--rose)';
  var m=Math.floor(tSecs/60),s=tSecs%60;
  setText('rTime',(lang==='ar'?toAr(String(m).padStart(2,'0'))+':'+toAr(String(s).padStart(2,'0')):String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')));
  setText('rSub',tRun?(lang==='ar'?'جارٍ التركيز':'Focusing'):tSecs===tTotal?(lang==='ar'?'جاهز':'Ready'):(lang==='ar'?'متوقف':'Paused'));
}
function rCtrls(st){
  var el=document.getElementById('ctrls');if(!el)return;
  var isAr=lang==='ar';
  if(st==='idle')el.innerHTML='<button class="cbtn c-start" onclick="startT()">▶ '+(isAr?'ابدأ':'Start')+'</button><button class="cbtn c-reset" onclick="resetT()">↺ '+(isAr?'إعادة':'Reset')+'</button>';
  else if(st==='run')el.innerHTML='<button class="cbtn c-pause" onclick="pauseT()">⏸ '+(isAr?'إيقاف مؤقت':'Pause')+'</button><button class="cbtn c-stop" onclick="stopT()">⏹ '+(isAr?'إنهاء':'Stop')+'</button>';
  else el.innerHTML='<button class="cbtn c-start" onclick="startT()">▶ '+(isAr?'استئناف':'Resume')+'</button><button class="cbtn c-reset" onclick="resetT()">↺ '+(isAr?'إعادة':'Reset')+'</button><button class="cbtn c-stop" onclick="stopT()">⏹ '+(isAr?'إنهاء':'Stop')+'</button>';
}
function setP(m,btn){if(tRun)return;tSecs=m*60;tTotal=m*60;document.querySelectorAll('.pbtn').forEach(function(b){b.classList.remove('sel');});btn.classList.add('sel');updRing();}
function setCustom(){var v=parseInt(document.getElementById('cMins').value);if(!v||v<1||v>240){toast(lang==='ar'?'أدخل قيمة ١-٢٤٠':'Enter 1-240');return;}tSecs=v*60;tTotal=v*60;document.querySelectorAll('.pbtn').forEach(function(b){b.classList.remove('sel');});updRing();}
function startT(){if(tRun)return;tRun=true;rCtrls('run');tInt=setInterval(function(){if(tSecs<=0){clearInterval(tInt);finishT();return;}tSecs--;updRing();if(tSecs===60)toast(lang==='ar'?'دقيقة واحدة متبقية 💪':'One minute left! 💪',3000);if(tSecs===300)toast(lang==='ar'?'٥ دقائق متبقية':'5 min left',2500);},1000);updRing();}
function pauseT(){clearInterval(tInt);tRun=false;rCtrls('pause');updRing();}
function resetT(){clearInterval(tInt);tRun=false;tSecs=tTotal;tLbl='';setText('tName',lang==='ar'?'اختر مهمة أو ابدأ مباشرة':'Pick a task or start now');rCtrls('idle');updRing();}
function stopT(){var done=tTotal-tSecs;clearInterval(tInt);tRun=false;if(done>30){var mins=Math.floor(done/60);totFocus+=mins;sessions.unshift({n:tLbl||(lang==='ar'?'جلسة تركيز':'Focus Session'),m:mins});rendHist();setText('focusTotal',numD(totFocus)+(lang==='ar'?' د':' m'));setText('focusStat',numD(totFocus));sv('focusToday',totFocus);sv('sessions',sessions);toast((lang==='ar'?'✅ أتممت ':'✅ ')+numD(mins)+(lang==='ar'?' دقيقة':' min'),2500);}tSecs=tTotal;tLbl='';setText('tName',lang==='ar'?'اختر مهمة أو ابدأ مباشرة':'Pick a task or start now');rCtrls('idle');updRing();}
function finishT(){tRun=false;playDone();var mins=Math.floor(tTotal/60);totFocus+=mins;sessions.unshift({n:tLbl||(lang==='ar'?'جلسة تركيز':'Focus Session'),m:mins});rendHist();setText('focusTotal',numD(totFocus)+(lang==='ar'?' د':' m'));setText('focusStat',numD(totFocus));sv('focusToday',totFocus);sv('sessions',sessions);setText('rSub',lang==='ar'?'مكتمل! 🎉':'Done! 🎉');toast('🎉 '+(lang==='ar'?'أحسنت! أتممت ':'Finished! ')+numD(mins)+(lang==='ar'?' دقيقة':' min'),3500);tSecs=tTotal;tLbl='';setText('tName',lang==='ar'?'اختر مهمة':'Pick a task');rCtrls('idle');updRing();}
function rendHist(){var el=document.getElementById('hist');if(!sessions.length){el.innerHTML='<div class="empty">'+(lang==='ar'?'لا توجد جلسات بعد':'No sessions yet')+'</div>';return;}el.innerHTML=sessions.slice(0,8).map(function(s,i){return'<div class="hi"><span class="hin">'+(i===0?'🟢 ':'')+s.n+'</span><span class="hid">'+numD(s.m)+(lang==='ar'?' د':' m')+'</span></div>';}).join('');}
function qt(mins,name){tSecs=mins*60;tTotal=mins*60;tLbl=name;setText('tName','⏱ '+name);document.querySelectorAll('.pbtn').forEach(function(b){b.classList.remove('sel');});updRing();var tb=document.querySelector('.tabs .tab:nth-child(3)');switchTab('timer',tb);toast((lang==='ar'?'تم تعيين ':'Set ')+numD(mins)+(lang==='ar'?' دقيقة لـ ':' min for ')+name);}
updRing();rCtrls('idle');rendHist();

// ═══════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════
var CICO={prayer:'🕌',work:'💻',quran:'📖',health:'🏋️',other:'📌'};
var CNMS_AR={prayer:'صلاة',work:'عمل',quran:'قرآن',health:'صحة',other:'أخرى'};
var CNMS_EN={prayer:'Prayer',work:'Work',quran:'Quran',health:'Health',other:'Other'};
function getCN(c){return lang==='ar'?CNMS_AR[c]:CNMS_EN[c];}
function addTask(){
  var inp=document.getElementById('tInput'),cat=document.getElementById('tCat').value,txt=inp.value.trim();
  if(!txt)return;
  var n=new Date(),h=n.getHours(),m=n.getMinutes(),ap=h<12?(lang==='ar'?'ص':'AM'):(lang==='ar'?'م':'PM'),h12=h%12||12;
  var ts=(lang==='ar'?toAr(h12)+':'+toAr(String(m).padStart(2,'0')):String(h12)+':'+String(m).padStart(2,'0'))+' '+ap;
  tasks.unshift({id:Date.now(),text:txt,cat:cat,done:false,time:ts});
  inp.value='';sv('tasks',tasks);rendTasks();updTS();toast(lang==='ar'?'✅ تمت الإضافة':'✅ Added');
}
function toggleTask(id){for(var i=0;i<tasks.length;i++){if(tasks[i].id===id){tasks[i].done=!tasks[i].done;if(tasks[i].done){toast(lang==='ar'?'🎉 أحسنت!':'🎉 Done!');playTick();}break;}}sv('tasks',tasks);rendTasks();updTS();}
function deleteTask(id){tasks=tasks.filter(function(t){return t.id!==id;});sv('tasks',tasks);rendTasks();updTS();toast(lang==='ar'?'🗑 حذف':'🗑 Deleted');}
function flt(f,btn){taskFlt=f;document.querySelectorAll('.flt').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');rendTasks();}
function rendTasks(){
  var list=document.getElementById('taskList');
  var fil=tasks.filter(function(t){if(taskFlt==='all')return true;if(taskFlt==='active')return!t.done;if(taskFlt==='done')return t.done;return t.cat===taskFlt;});
  if(!fil.length){list.innerHTML='<div class="empty">'+(lang==='ar'?'لا توجد مهام في هذه الفئة':'No tasks in this category')+'</div>';return;}
  list.innerHTML=fil.map(function(t){
    return'<div class="ti'+(t.done?' done':'')+'"><div class="chk'+(t.done?' c':'')+'" onclick="toggleTask('+t.id+')">'+(t.done?'✓':'')+'</div><div class="ti-body"><div class="ti-txt">'+t.text+'</div><div class="ti-meta"><span class="ti-cat cat-'+t.cat+'">'+CICO[t.cat]+' '+getCN(t.cat)+'</span><span>'+t.time+'</span></div></div><div class="ti-acts"><button class="tia" onclick="qt(25,\''+t.text.substring(0,18).replace(/[\'\"]/g,'')+'\')">⏱</button><button class="tia del" onclick="deleteTask('+t.id+')">✕</button></div></div>';
  }).join('');
}
function updTS(){
  var done=tasks.filter(function(t){return t.done;}).length,tot=tasks.length,pct=tot?Math.round(done/tot*100):0;
  document.getElementById('tsum').innerHTML='<span class="ts-d">'+numD(done)+'</span><span class="ts-t"> / '+numD(tot)+'</span><div class="ts-bar"><div class="ts-fill" style="width:'+pct+'%"></div></div><span class="ts-pct">'+numD(pct)+'%</span>';
  setText('doneStat',numD(done));
}
rendTasks();updTS();

// ═══════════════════════════════════════════════════
// HABITS
// ═══════════════════════════════════════════════════
function rendHabits(){
  habitDefs.forEach(function(h){var el=document.getElementById('yt-'+h.id);if(el&&el.classList.contains('open'))openYTSet[h.id]=true;else if(el)delete openYTSet[h.id];});
  var cnt=0;
  document.getElementById('habitsGrid').innerHTML=habitDefs.map(function(h){
    var done=!!habitDone[h.id];if(done)cnt++;
    var nm=lang==='ar'?h.ar:h.en;
    var linksHtml='';
    if(h.links&&h.links.length){
      var ll=h.links.map(function(lk){return'<a class="yt-link" href="'+lk.url+'" target="_blank" rel="noopener"><span class="yt-ico">▶</span>'+(lang==='ar'?lk.ar:lk.en)+'</a>';}).join('');
      linksHtml='<div class="yt-links'+(openYTSet[h.id]?' open':'')+'" id="yt-'+h.id+'"><div style="font-size:.67rem;color:var(--muted);font-weight:700;margin-bottom:.4rem;">'+(lang==='ar'?'📹 موارد مفيدة':'📹 Helpful Resources')+'</div>'+ll+'</div>';
    }
    return'<div class="hc'+(done?' done':'')+'" id="hc-'+h.id+'"><div class="hc-main" onclick="toggleHabit(\''+h.id+'\')">' +
      '<div class="hc-ico">'+h.ico+'</div><div class="hc-body"><div class="hc-name">'+nm+'</div><div class="hc-str">'+(done?(lang==='ar'?'✓ أتممت اليوم':'✓ Done today'):(lang==='ar'?'لم يكتمل بعد':'Not done yet'))+'</div></div>'+
      (h.links&&h.links.length?'<button class="yt-toggle" onclick="event.stopPropagation();toggleYT(\''+h.id+'\')" id="ytbtn-'+h.id+'">📹</button>':'')+
      '<div class="hc-chk">'+(done?'✓':'')+'</div></div>'+linksHtml+'</div>';
  }).join('');
  setText('streakStat',numD(cnt));
  qUpdate();
}
function toggleHabit(id){habitDone[id]=!habitDone[id];if(habitDone[id]){playTick();toast(lang==='ar'?'🎉 أحسنت!':'🎉 Well done!');}sv('habitDone',habitDone);rendHabits();}
function toggleYT(id){if(openYTSet[id])delete openYTSet[id];else openYTSet[id]=true;var el=document.getElementById('yt-'+id);if(el)el.classList.toggle('open');}
rendHabits();

// ═══════════════════════════════════════════════════
// QURAN COUNTER
// ═══════════════════════════════════════════════════
function qUpdate(){
  var done=qTotal-qPages,pct=Math.round(done/qTotal*100);
  setText('qRemain',numD(qPages));
  var f=document.getElementById('qpFill');if(f)f.style.width=pct+'%';
  setText('qpNote',numD(pct)+'% '+(lang==='ar'?'مكتمل · ':'complete · ')+numD(qPages)+(lang==='ar'?' يوم للإتمام':' days to finish'));
  setText('qPagesStat',numD(qPages));
  setText('progCount',numD(qPages)+' / '+numD(qTotal));
  var pf=document.getElementById('progFill');if(pf)pf.style.width=pct+'%';
  setText('progNote',numD(pct)+'% '+(lang==='ar'?'مكتمل':'complete'));
  setText('qDays',numD(qPages));
  setText('qMons','~'+numD(Math.ceil(qPages/30)));
}
function qChange(n){qPages=Math.max(0,Math.min(qTotal,qPages-n));sv('qPages',qPages);qUpdate();if(n>0){playTick();toast(lang==='ar'?'📖 +صفحة! متبقي '+numD(qPages):'📖 +Page! '+qPages+' remaining');}}
qUpdate();

// ═══════════════════════════════════════════════════
// INIT AI MODE
// ═══════════════════════════════════════════════════
(function(){
  if(groqKey)document.getElementById('groqKeyInp').value=groqKey;
  if(claudeKey)document.getElementById('claudeKeyInp').value=claudeKey;
  var modeBtn=document.getElementById(aiMode==='groq'?'mGroq':aiMode==='claude'?'mClaude':'mLocal');
  if(modeBtn)setAIMode(aiMode,modeBtn);
})();

// ═══════════════════════════════════════════════════
// APPLY INITIAL STATE
// ═══════════════════════════════════════════════════
applyTheme();
applyLang();

setTimeout(function(){
  var isAr=lang==='ar';
  var modeLabels={local:isAr?'⚡ محلي (بدون إنترنت)':'⚡ Local (offline)',groq:'🦙 Groq AI (Llama 3.1)',claude:'🤖 Claude Sonnet'};
  appendMsg('ai', isAr
    ?'وعليكم السلام ورحمة الله وبركاته 🌙\n\nأهلاً بك في مساعدك الذكي!\n\n**اختر وضع المساعد أعلاه:**\n⚡ **محلي** — ردود فورية بدون إنترنت، بدون مفتاح\n🦙 **Groq AI** — ذكاء اصطناعي مجاني (يحتاج مفتاح من console.groq.com)\n🤖 **Claude AI** — أقوى وأدق استجابة (يحتاج مفتاح من console.anthropic.com)\n\n**الوضع الحالي:** '+modeLabels[aiMode]+'\n\nالخطة الغذائية الأسبوعية جاهزة في البطاقات أعلاه!\nاضغط أي زر أو اسألني مباشرة. 🤲'
    :'Peace and blessings! 🌙\n\nWelcome to your AI assistant!\n\n**Choose your AI mode above:**\n⚡ **Local** — Instant offline responses, no key needed\n🦙 **Groq AI** — Free AI (get key from console.groq.com)\n🤖 **Claude AI** — Most powerful (get key from console.anthropic.com)\n\n**Current mode:** '+modeLabels[aiMode]+'\n\nThe weekly meal plan is ready in the cards above!\nTap any button or ask me directly. 🤲'
  );
},500);