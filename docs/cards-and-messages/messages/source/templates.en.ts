import { buildTemplates, TemplateRow } from './types';

// English templates. Same rules as the Italian file: append only, never reuse an id.
// English needs no gender agreement, so {g:..|..} is not used here.
const rows: TemplateRow[] = [
  // ---- warm  any
  ['warm-any-1', 'warm', 'any', 'Happy birthday, {name}! Wishing you a year full of good things, big smiles, and the people who love you. '],
  ['warm-any-2', 'warm', 'any', 'Happy birthday {name}! May this year bring you peace, health, and everything you wish for. Enjoy your day!'],
  ['warm-any-3', 'warm', 'any', 'Many happy returns, {name}! I hope today treats you exactly the way you deserve.'],
  ['warm-any-4', 'warm', 'any', 'Happy birthday, {name}! A special thought for you on your special day. Have a wonderful year.'],
  ['warm-any-5', 'warm', 'any', '{age} and getting better every year! Happy birthday, {name}, all the best.'],
  ['warm-any-6', 'warm', 'any', 'Turning {age}! Happy birthday {name}, may this be your best year yet.'],
  ['warm-any-7', 'warm', 'any', 'Happy birthday, dear {name}! Wishing you a beautiful day and an even better year.'],

  // ---- warm  amico (friend)
  ['warm-amico-1', 'warm', 'amico', 'Happy birthday, {name}! Thanks for always being there. Wishing you a year full of adventures and laughter.'],
  ['warm-amico-2', 'warm', 'amico', 'Happy birthday {name}! As soon as you can, we’re celebrating properly. I owe you at least one drink. '],
  ['warm-amico-3', 'warm', 'amico', 'Happy birthday, {name}! You’re such a special friend and I’m so glad to have you in my life.'],

  // ---- warm  famiglia (family)
  ['warm-famiglia-1', 'warm', 'famiglia', 'Happy birthday {name}! I love you so much. I hope today is sweet and full of love.'],
  ['warm-famiglia-2', 'warm', 'famiglia', 'Happy birthday, {name}! Our family is better with you in it. Big hug!'],
  ['warm-famiglia-3', 'warm', 'famiglia', 'Happy birthday {name}! Thank you for everything you do and for always being there. Love you.'],
  ['warm-famiglia-4', 'warm', 'famiglia', 'Happy birthday, dear {name}! Sending you a huge hug and lots of love.'],

  // ---- funny  any
  ['funny-any-1', 'funny', 'any', 'Happy birthday {name}! Another year older, but don’t worry: wine gets better with age. '],
  ['funny-any-2', 'funny', 'any', 'You’re not getting older, {name}, you’re maturing like good cheese. Happy birthday! '],
  ['funny-any-3', 'funny', 'any', 'Happy birthday {name}! Today you can eat cake without guilt. It’s the law (I just wrote it). '],
  ['funny-any-4', 'funny', 'any', 'Happy birthday {name}! At {age}, the candles cost more than the cake. Blow carefully! '],
  ['funny-any-5', 'funny', 'any', 'Happy birthday {name}! Wishing you a year with fewer emails and more pizza. '],
  ['funny-any-6', 'funny', 'any', 'Happy birthday {name}! One more year of experience, zero more of maturity. Never change! '],

  // ---- funny  amico (friend)
  ['funny-amico-1', 'funny', 'amico', 'Happy birthday {name}! You’re officially a year wiser, but tonight we’ll act like it isn’t true. '],

  // ---- funny  collega (colleague)
  ['funny-collega-1', 'funny', 'collega', 'Happy birthday {name}! No meetings on your calendar today… at least in my wishes. '],
  ['funny-collega-2', 'funny', 'collega', 'Happy birthday {name}! May your year be like a good office coffee: hot, strong, and never gone too soon. '],

  // ---- formal
  ['formal-any-1', 'formal', 'any', 'Happy birthday, {name}. Please accept my best wishes for health, happiness, and success in the year ahead.'],
  ['formal-any-2', 'formal', 'any', 'Dear {name}, warmest birthday wishes. May the coming year bring you many personal and professional rewards.'],
  ['formal-any-3', 'formal', 'any', 'Dear {name}, my best wishes on your birthday. With kind regards.'],
  ['formal-collega-1', 'formal', 'collega', 'Happy birthday, {name}! Thank you for your collaboration and hard work every day. Best wishes.'],
  ['formal-collega-2', 'formal', 'collega', 'Happy birthday {name}! Wishing you a year of new milestones and great achievements, at work and beyond.'],

  // ---- short
  ['short-any-1', 'short', 'any', 'Happy birthday, {name}! '],
  ['short-any-2', 'short', 'any', 'Happy birthday {name}! '],
  ['short-any-3', 'short', 'any', 'Happy birthday, {name}! Enjoy your day.'],
  ['short-any-4', 'short', 'any', 'Happy birthday {name}, big hug!'],
  ['short-any-5', 'short', 'any', 'Best wishes, {name}! '],
  ['short-any-6', 'short', 'any', '{age} today! Happy birthday, {name}! '],

  // ---- additions (fill gaps: colleagues, family, more friends)
  ['warm-collega-1', 'warm', 'collega', 'Happy birthday, {name}! Thank you for your teamwork and the positive energy you bring every day. Wishing you a wonderful year!'],
  ['warm-collega-2', 'warm', 'collega', 'Happy birthday {name}! It’s a pleasure working with you. May this new year bring you great moments and plenty of calm ones.'],
  ['funny-famiglia-1', 'funny', 'famiglia', 'Happy birthday {name}! Another year as a family and we still put up with each other: we’re doing great. '],
  ['funny-famiglia-2', 'funny', 'famiglia', 'Happy birthday {name}! Today you’re in charge: you pick the cake and you pick the music. For today only! '],
  ['funny-amico-2', 'funny', 'amico', 'Happy birthday {name}! We celebrate today and pretend nothing happened tomorrow. See you for the toast! '],
  ['funny-amico-3', 'funny', 'amico', 'Hey {name}, another trip around the sun and you’re still my favorite excuse to party. Happy birthday! '],
  ['funny-any-7', 'funny', 'any', '{age} and still going strong! Well, mostly. Happy birthday, {name}! '],
];

export const EN_TEMPLATES = buildTemplates('en', rows);
