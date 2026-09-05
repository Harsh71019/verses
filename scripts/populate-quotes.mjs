import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Clean and normalize quote text
const blocklist = [
  /\b(naked|virgin|sperm|sexy|lust|erotic|boobs|penis|vagina|slut|bitch|whore|fuck|shit|asshole|filly)\b/i,
  /\b(chapter\s*\d|page\s*\d|http|www\.)\b/i
];

// Clean and normalize quote text
function cleanText(t) {
  if (!t) return '';
  const cleaned = t
    .replace(/^["'\u201C\u201D\u2018\u2019\s]+/, '')
    .replace(/["'\u201C\u201D\u2018\u2019\s]+$/, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (blocklist.some(r => r.test(cleaned))) return '';
  return cleaned;
}

// Clean and normalize author
function cleanAuthor(a) {
  if (!a) return 'Anonymous';
  let s = a.trim();
  if (s.startsWith('by ')) s = s.slice(3).trim();
  s = s.replace(/,?\s*(type\.fit|Unknown|Quotes|author).*$/i, '');
  s = s.replace(/^["'\s]+|["'\s]+$/g, '');
  if (!s || s.toLowerCase() === 'unknown' || s.toLowerCase() === 'anonymous') return 'Anonymous';
  return s;
}

const pools = {
  drive: [],
  calm: [],
  grit: [],
  joy: [],
  revenge: [],
  hardwork: [],
  focus: []
};

const seenQuotes = new Set();

function addQuote(cat, quote, author) {
  const cQuote = cleanText(quote);
  const cAuthor = cleanAuthor(author);
  if (!cQuote || cQuote.length < 15 || cQuote.length > 230) return;
  const key = cQuote.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key.length < 10 || seenQuotes.has(key)) return;
  seenQuotes.add(key);

  pools[cat].push({ quote: cQuote, author: cAuthor, category: cat });
}

// 1. Original anchor quotes (guaranteed first in each mood)
const ORIGINAL_QUOTES = [
  { id: "drive-01", quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Will Durant", category: "drive" },
  { id: "drive-02", quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "drive" },
  { id: "drive-03", quote: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "drive" },
  { id: "drive-04", quote: "Ambition is the path to success. Persistence is the vehicle you arrive in.", author: "Bill Bradley", category: "drive" },
  { id: "drive-05", quote: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen Covey", category: "drive" },
  { id: "drive-06", quote: "Do not wait to strike till the iron is hot, but make it hot by striking.", author: "William Butler Yeats", category: "drive" },
  { id: "drive-07", quote: "The only place where success comes before work is in the dictionary.", author: "Vidal Sassoon", category: "drive" },
  { id: "drive-08", quote: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Henry David Thoreau", category: "drive" },
  { id: "drive-09", quote: "Energy and persistence conquer all things.", author: "Benjamin Franklin", category: "drive" },
  { id: "drive-10", quote: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "drive" },

  { id: "calm-01", quote: "You have power over your mind, not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "calm" },
  { id: "calm-02", quote: "Peace comes from within. Do not seek it without.", author: "Buddha", category: "calm" },
  { id: "calm-03", quote: "The quieter you become, the more you are able to hear.", author: "Rumi", category: "calm" },
  { id: "calm-04", quote: "Nothing can bring you peace but yourself.", author: "Ralph Waldo Emerson", category: "calm" },
  { id: "calm-05", quote: "In the midst of movement and chaos, keep stillness inside of you.", author: "Deng Ming-Dao", category: "calm" },
  { id: "calm-06", quote: "He who is not contented with what he has, would not be contented with what he would like to have.", author: "Socrates", category: "calm" },
  { id: "calm-07", quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott", category: "calm" },
  { id: "calm-08", quote: "Some days there won't be a song in your heart. Sing anyway.", author: "Emory Austin", category: "calm" },
  { id: "calm-09", quote: "Wherever you are, be all there.", author: "Jim Elliot", category: "calm" },
  { id: "calm-10", quote: "Calm mind brings inner strength and self-confidence.", author: "Dalai Lama", category: "calm" },

  { id: "grit-01", quote: "Fall seven times, stand up eight.", author: "Japanese Proverb", category: "grit" },
  { id: "grit-02", quote: "The oak fought the wind and was broken, the willow bent when it must and survived.", author: "Robert Jordan", category: "grit" },
  { id: "grit-03", quote: "Out of suffering have emerged the strongest souls; the most massive characters are seared with scars.", author: "Kahlil Gibran", category: "grit" },
  { id: "grit-04", quote: "Smooth seas do not make skillful sailors.", author: "African Proverb", category: "grit" },
  { id: "grit-05", quote: "The gem cannot be polished without friction, nor man perfected without trials.", author: "Confucius", category: "grit" },
  { id: "grit-06", quote: "Rock bottom became the solid foundation on which I rebuilt my life.", author: "J.K. Rowling", category: "grit" },
  { id: "grit-07", quote: "Tough times never last, but tough people do.", author: "Robert H. Schuller", category: "grit" },
  { id: "grit-08", quote: "The wound is the place where the light enters you.", author: "Rumi", category: "grit" },
  { id: "grit-09", quote: "It is not the mountain we conquer, but ourselves.", author: "Edmund Hillary", category: "grit" },
  { id: "grit-10", quote: "When you get into a tight place and everything goes against you, never give up then.", author: "Harriet Beecher Stowe", category: "grit" },

  { id: "joy-01", quote: "Fill your life with as many memories as you can, they'll be worth more than any currency.", author: "Anonymous", category: "joy" },
  { id: "joy-02", quote: "The most wasted of all days is one without laughter.", author: "E. E. Cummings", category: "joy" },
  { id: "joy-03", quote: "For every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson", category: "joy" },
  { id: "joy-04", quote: "Joy is the simplest form of gratitude.", author: "Karl Barth", category: "joy" },
  { id: "joy-05", quote: "Sunshine is delicious, rain is refreshing, wind braces us up.", author: "John Ruskin", category: "joy" },
  { id: "joy-06", quote: "Happiness is not something ready made. It comes from your own actions.", author: "Dalai Lama", category: "joy" },
  { id: "joy-07", quote: "Find a place inside where there's joy, and the joy will burn out the pain.", author: "Joseph Campbell", category: "joy" },
  { id: "joy-08", quote: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde", category: "joy" },
  { id: "joy-09", quote: "Every day may not be good, but there's something good in every day.", author: "Alice Morse Earle", category: "joy" },
  { id: "joy-10", quote: "The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.", author: "Charles Dickens", category: "joy" },

  { id: "revenge-01", quote: "Living well is the best revenge.", author: "George Herbert", category: "revenge" },
  { id: "revenge-02", quote: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius", category: "revenge" },
  { id: "revenge-03", quote: "Win so completely that the doubt becomes part of your origin story.", author: "Verse", category: "revenge" },
  { id: "revenge-04", quote: "Do not get even. Get so far ahead that the past cannot find you.", author: "Verse", category: "revenge" },

  { id: "hardwork-01", quote: "Nothing will work unless you do.", author: "Maya Angelou", category: "hardwork" },
  { id: "hardwork-02", quote: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison", category: "hardwork" },
  { id: "hardwork-03", quote: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh", category: "hardwork" },
  { id: "hardwork-04", quote: "The work nobody sees creates the result nobody can ignore.", author: "Verse", category: "hardwork" },

  { id: "focus-01", quote: "Concentrate all your thoughts upon the work in hand.", author: "Alexander Graham Bell", category: "focus" },
  { id: "focus-02", quote: "Lack of direction, not lack of time, is the problem.", author: "Zig Ziglar", category: "focus" },
  { id: "focus-03", quote: "Starve your distractions. Feed your focus.", author: "Anonymous", category: "focus" },
  { id: "focus-04", quote: "Your life moves in the direction of your most repeated attention.", author: "Verse", category: "focus" }
];

ORIGINAL_QUOTES.forEach(q => addQuote(q.category, q.quote, q.author));
const origPath = path.join(rootDir, 'src', 'data', 'quotes.json');

// 2. Curated iconic supplemental quotes for punchy moods (Revenge, Focus, Hard Work, Grit, Calm, Joy, Drive)
const curatedAdditions = [
  // Revenge / Comeback / Outgrow / Prove them wrong
  { quote: "The best revenge is massive success.", author: "Frank Sinatra", category: "revenge" },
  { quote: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius", category: "revenge" },
  { quote: "Living well is the best revenge.", author: "George Herbert", category: "revenge" },
  { quote: "Always forgive your enemies; nothing annoys them so much.", author: "Oscar Wilde", category: "revenge" },
  { quote: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "revenge" },
  { quote: "Move in silence. Only speak when it's time to say checkmate.", author: "Anonymous", category: "revenge" },
  { quote: "The comeback is always stronger than the setback.", author: "Catherine Plano", category: "revenge" },
  { quote: "They said you could not make it. Prove them wrong.", author: "Jon Jones", category: "revenge" },
  { quote: "There are always going to be skeptics. Prove them wrong.", author: "Robert Kiyosaki", category: "revenge" },
  { quote: "Don't doubt me, because that's when I get stronger.", author: "Marvelous Marvin Hagler", category: "revenge" },
  { quote: "I don't listen to people who say my dreams are impossible; I just work to prove them wrong.", author: "Liya Kebede", category: "revenge" },
  { quote: "The sweetest revenge is living a life so good that you will always wonder what went wrong.", author: "Anonymous", category: "revenge" },
  { quote: "Your setback is just a setup for your comeback.", author: "Joel Osteen", category: "revenge" },
  { quote: "A wise man gets more use from his enemies than a fool from his friends.", author: "Baltasar Gracián", category: "revenge" },
  { quote: "Your friends will believe in your potential, your enemies will make you live up to it.", author: "Tim Fargo", category: "revenge" },
  { quote: "Victory is a thousand times sweeter when you're the underdog.", author: "Jenny Han", category: "revenge" },
  { quote: "Underdogs don't just fight to win. They fight to prove they belong.", author: "Anonymous", category: "revenge" },
  { quote: "Life is never more fun than when you're the underdog competing against the giants.", author: "Ross Perot", category: "revenge" },
  { quote: "You are allowed to outgrow people. This includes past versions of yourself.", author: "Mandy Hale", category: "revenge" },
  { quote: "Let your success do the talking and your silence remind them who you are.", author: "Anonymous", category: "revenge" },
  { quote: "When you display your talents, you naturally stir envy. You cannot spend your life worrying about petty feelings.", author: "Robert Greene", category: "revenge" },
  { quote: "Never interrupt your enemy when he is making a mistake.", author: "Napoleon Bonaparte", category: "revenge" },
  { quote: "The best way to counter a hater is to make it obvious their attack had zero impact.", author: "Tim Ferriss", category: "revenge" },
  { quote: "People only throw stones at trees that bear fruit.", author: "Proverb", category: "revenge" },
  { quote: "They laughed at my dreams, now they ask how I did it.", author: "Anonymous", category: "revenge" },
  { quote: "Don't get mad. Don't get even. Do better. Much better. Rise so high that their opinions cannot reach you.", author: "Anonymous", category: "revenge" },
  { quote: "The roar of the crowd is nothing compared to the silence of your doubters.", author: "Anonymous", category: "revenge" },
  { quote: "Win in silence. Let them think you gave up until you reveal the masterpiece.", author: "Anonymous", category: "revenge" },
  { quote: "Be so good they cannot ignore you, and so resilient they regret doubting you.", author: "Anonymous", category: "revenge" },
  { quote: "Outwork your yesterday. Outshine every ceiling they set above your head.", author: "Verse", category: "revenge" },
  { quote: "They told me I couldn't, so I worked twice as hard until they asked how.", author: "Anonymous", category: "revenge" },
  { quote: "Turn every insult into an investment in your relentless work ethic.", author: "Anonymous", category: "revenge" },
  { quote: "The fire inside me was built from all the bridges they burned.", author: "Anonymous", category: "revenge" },
  { quote: "The greatest pleasure in life is doing what people say you cannot do.", author: "Walter Bagehot", category: "revenge" },
  { quote: "First they ignore you, then they laugh at you, then they fight you, then you win.", author: "Mahatma Gandhi", category: "revenge" },
  { quote: "Let them underestimate you. That way, they never see you coming.", author: "Anonymous", category: "revenge" },
  { quote: "They counted me out. They just forgot to check if I was done fighting.", author: "Anonymous", category: "revenge" },
  { quote: "Your highest revenge is total indifference coupled with absolute mastery.", author: "Anonymous", category: "revenge" },
  { quote: "Build in the dark what will blind them in the daylight.", author: "Anonymous", category: "revenge" },
  { quote: "Don't compete with those who envy you. Operate on a level they cannot even observe.", author: "Anonymous", category: "revenge" },
  { quote: "The strongest comeback requires neither an explanation nor an apology—only the result.", author: "Anonymous", category: "revenge" },
  { quote: "They wanted a confession of defeat; I delivered an exhibition of triumph.", author: "Verse", category: "revenge" },
  { quote: "When they lock the door, you build the whole building.", author: "Anonymous", category: "revenge" },
  { quote: "I didn't come this far to only come this far and prove them right.", author: "Anonymous", category: "revenge" },
  { quote: "Outgrow the room that tried to shrink you.", author: "Anonymous", category: "revenge" },
  { quote: "Treat criticism as unrefined fuel. Burn it to propel yourself further.", author: "Anonymous", category: "revenge" },
  { quote: "Never let someone who gave up on their dreams talk you out of yours.", author: "Anonymous", category: "revenge" },
  { quote: "Success is the sweetest revenge for every ounce of doubt.", author: "Ed Sheeran", category: "revenge" },
  { quote: "Do not look back. You are not going that way, and they are not following.", author: "Anonymous", category: "revenge" },
  { quote: "Let your triumphs echo louder than their insults ever could.", author: "Anonymous", category: "revenge" },
  { quote: "The best response to criticism is brilliant work.", author: "Anonymous", category: "revenge" },
  { quote: "They told me I was dreaming too big. I told them they were thinking too small.", author: "Anonymous", category: "revenge" },
  { quote: "Silence is the ultimate weapon of power. Let them wonder.", author: "Anonymous", category: "revenge" },
  { quote: "A lion does not concern himself with the opinion of sheep.", author: "George R.R. Martin", category: "revenge" },
  { quote: "When you are an underdog, you have everything to prove and nothing to lose.", author: "Anonymous", category: "revenge" },
  { quote: "Never let small minds convince you that your dreams are too big.", author: "Anonymous", category: "revenge" },
  { quote: "The comeback always hits harder than the blow that brought you down.", author: "Anonymous", category: "revenge" },
  { quote: "Don't announce your moves. Let your arrival be the shock.", author: "Anonymous", category: "revenge" },
  { quote: "People said it was impossible, but that is their limitation, not mine.", author: "Anonymous", category: "revenge" },
  { quote: "The best form of revenge is to thrive where they expected you to fail.", author: "Anonymous", category: "revenge" },
  { quote: "They wanted me to stay down. But gravity was the only thing holding me.", author: "Verse", category: "revenge" },
  { quote: "I don't need easy. I just need possible. Watch what I do next.", author: "Anonymous", category: "revenge" },
  { quote: "Nothing speaks louder than results they swore you would never deliver.", author: "Anonymous", category: "revenge" },
  { quote: "Let your haters be your biggest promoters.", author: "Anonymous", category: "revenge" },
  { quote: "The greatest satisfaction is finishing what they said you could never start.", author: "Anonymous", category: "revenge" },
  { quote: "Let your growth be the answer to every unasked question.", author: "Anonymous", category: "revenge" },
  { quote: "Rise above the noise and let your legacy be your rebuttal.", author: "Anonymous", category: "revenge" },
  { quote: "They counted my mistakes, but forgot to count my resilience.", author: "Anonymous", category: "revenge" },
  { quote: "I am building a monument out of the bricks they threw at me.", author: "Anonymous", category: "revenge" },
  { quote: "Never beg for a seat at the table when you can buy the whole building.", author: "Anonymous", category: "revenge" },
  { quote: "They said I changed. I replied: I didn't work this hard to stay the same.", author: "Anonymous", category: "revenge" },
  { quote: "The stone that the builders rejected has become the cornerstone.", author: "Proverb", category: "revenge" },
  { quote: "Do not let their lack of imagination define your capacity.", author: "Anonymous", category: "revenge" },
  { quote: "Outwork their disbelief until their disbelief becomes respect.", author: "Anonymous", category: "revenge" },
  { quote: "Forgive them, then outshine them so bright they need shades.", author: "Anonymous", category: "revenge" },
  { quote: "Let them talk. While they are busy talking, you are busy conquering.", author: "Anonymous", category: "revenge" },
  { quote: "Prove yourself to yourself, not to those who were never in the arena.", author: "Anonymous", category: "revenge" },
  { quote: "The underdog mindset is the most dangerous weapon in any competition.", author: "Anonymous", category: "revenge" },
  { quote: "Every time they doubted me, they were just adding fuel to my fire.", author: "Anonymous", category: "revenge" },
  { quote: "Don't shrink to fit places you have outgrown.", author: "Anonymous", category: "revenge" },
  { quote: "They were laughing at chapter one; they will be silent by the final chapter.", author: "Anonymous", category: "revenge" },
  { quote: "Your critics are merely spectators in a game you are playing to win.", author: "Anonymous", category: "revenge" },
  { quote: "Let your comeback be so silent that only your trophy makes a sound.", author: "Anonymous", category: "revenge" },
  { quote: "Be the exception they cannot explain.", author: "Anonymous", category: "revenge" },
  { quote: "Rise so high that the ground they stood on looks like a speck of dust.", author: "Anonymous", category: "revenge" },
  { quote: "They thought I was buried. They did not realize I was a seed.", author: "Mexican Proverb", category: "revenge" },
  { quote: "The victory that nobody expected is always the sweetest victory.", author: "Anonymous", category: "revenge" },
  { quote: "Turn every closed door into a blueprint for your own palace.", author: "Anonymous", category: "revenge" },
  { quote: "When someone says 'you cannot', do it twice and make it effortless.", author: "Anonymous", category: "revenge" },
  { quote: "The world belongs to the disciplined underdog who refused to sit down.", author: "Anonymous", category: "revenge" },

  // Focus / Deep Work / Attention
  { quote: "Concentrate all your thoughts upon the work in hand. The sun's rays do not burn until brought to a focus.", author: "Alexander Graham Bell", category: "focus" },
  { quote: "The ability to focus is becoming the scarcest commodity of the 21st century.", author: "Cal Newport", category: "focus" },
  { quote: "Who you are, what you think, feel, and do, is the sum of what you focus on.", author: "Cal Newport", category: "focus" },
  { quote: "The ability to concentrate and to use time well is everything.", author: "Lee Iacocca", category: "focus" },
  { quote: "Clarity about what matters provides clarity about what does not.", author: "Cal Newport", category: "focus" },
  { quote: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee", category: "focus" },
  { quote: "In an age of distraction, nothing can feel more luxurious than paying attention.", author: "Pico Iyer", category: "focus" },
  { quote: "An addiction to distraction is the end of your creative production.", author: "Robin Sharma", category: "focus" },
  { quote: "The most dangerous distractions are the ones you love, but that don't love you back.", author: "Warren Buffett", category: "focus" },
  { quote: "Distraction remains a destroyer of depth.", author: "Cal Newport", category: "focus" },
  { quote: "You can't do big things if you're distracted by small things.", author: "Anonymous", category: "focus" },
  { quote: "Tell me to what you pay attention and I will tell you who you are.", author: "José Ortega y Gasset", category: "focus" },
  { quote: "Distraction destroys action. If it's not moving you towards your purpose, leave it alone.", author: "Jermaine Riley", category: "focus" },
  { quote: "Deciding what not to do is as important as deciding what to do.", author: "Steve Jobs", category: "focus" },
  { quote: "Focus is a muscle. The more you protect it from distractions, the stronger it becomes.", author: "Anonymous", category: "focus" },
  { quote: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.", author: "Leo Babauta", category: "focus" },
  { quote: "Mastery requires solitary, single-minded focus on the matter at hand.", author: "Robert Greene", category: "focus" },
  { quote: "Beware the barrenness of a busy life. Do one thing deeply rather than ten things shallowly.", author: "Socrates", category: "focus" },
  { quote: "Attention is the rarest and purest form of generosity.", author: "Simone Weil", category: "focus" },
  { quote: "Starve your distractions, feed your focus, and watch how your life transforms.", author: "Anonymous", category: "focus" },

  // Hard Work / Discipline / Craft
  { quote: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke", category: "hardwork" },
  { quote: "Discipline equals freedom.", author: "Jocko Willink", category: "hardwork" },
  { quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn", category: "hardwork" },
  { quote: "We must all suffer one of two things: the pain of discipline or the pain of regret.", author: "Jim Rohn", category: "hardwork" },
  { quote: "No man is free who is not master of himself.", author: "Epictetus", category: "hardwork" },
  { quote: "Rule your mind or it will rule you.", author: "Horace", category: "hardwork" },
  { quote: "Discipline is doing what you hate to do, but doing it like you love it.", author: "Mike Tyson", category: "hardwork" },
  { quote: "I don't stop when I'm tired. I stop when I'm done.", author: "David Goggins", category: "hardwork" },
  { quote: "Chop your own wood and it will warm you twice.", author: "Henry Ford", category: "hardwork" },
  { quote: "Opportunities are usually disguised as hard work, so most people don't recognize them.", author: "Ann Landers", category: "hardwork" },
  { quote: "Mastering others is strength. Mastering yourself is true power.", author: "Lao Tzu", category: "hardwork" },
  { quote: "One can have no smaller or greater mastery than mastery of oneself.", author: "Leonardo da Vinci", category: "hardwork" },
  { quote: "Patience, persistence, and perspiration make an unbeatable combination for success.", author: "Napoleon Hill", category: "hardwork" },
  { quote: "Hard work outweighs talent—every single time.", author: "Kobe Bryant", category: "hardwork" },
  { quote: "You have to work hard in the dark to shine in the light.", author: "Kobe Bryant", category: "hardwork" },
  { quote: "Mastery is not a function of genius, it is a function of time and intense devotion.", author: "Robert Greene", category: "hardwork" },
  { quote: "If people knew how hard I worked to gain my mastery, it would not seem so wonderful at all.", author: "Michelangelo", category: "hardwork" },
  { quote: "Greatness is not born. It is forged through thousand repetitions in cold silence.", author: "Verse", category: "hardwork" },
  { quote: "The grind may be lonely, but the summit view is shared with few.", author: "Anonymous", category: "hardwork" },
  { quote: "Don't count the days, make the days count through relentless execution.", author: "Muhammad Ali", category: "hardwork" },

  // Grit / Resilience / Scars
  { quote: "Although the world is full of suffering, it is also full of the overcoming of it.", author: "Helen Keller", category: "grit" },
  { quote: "If you're going through hell, keep going.", author: "Winston Churchill", category: "grit" },
  { quote: "Life is not about waiting for the storms to pass. It's about learning to dance in the rain.", author: "Vivian Greene", category: "grit" },
  { quote: "When everything seems to be going against you, remember that airplanes take off against the wind.", author: "Henry Ford", category: "grit" },
  { quote: "Nothing in the world can take the place of persistence.", author: "Calvin Coolidge", category: "grit" },
  { quote: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl.", author: "Martin Luther King Jr.", category: "grit" },
  { quote: "Courage doesn't always roar. Sometimes courage is the quiet voice saying, 'I will try again tomorrow.'", author: "Mary Anne Radmacher", category: "grit" },
  { quote: "A scar does not form on the dying. A scar means I survived.", author: "Chris Cleave", category: "grit" },
  { quote: "Wounds turn into scars and scars make you tough.", author: "Aisha Tyler", category: "grit" },
  { quote: "My scars remind me that I did indeed survive my deepest wounds.", author: "Steve Goodier", category: "grit" },
  { quote: "A hero is an ordinary individual who finds strength to endure despite overwhelming obstacles.", author: "Christopher Reeve", category: "grit" },
  { quote: "Pain unlocks a secret doorway in the mind, one that leads to peak performance.", author: "David Goggins", category: "grit" },
  { quote: "Everything negative—pressure, challenges—is all an opportunity for me to rise.", author: "Kobe Bryant", category: "grit" },
  { quote: "Once you know what failure feels like, determination chases success.", author: "Kobe Bryant", category: "grit" },

  // Calm / Peace / Presence
  { quote: "Peace comes from within. Do not seek it without.", author: "Buddha", category: "calm" },
  { quote: "Smile, breathe, and go slowly. There is no destination except here.", author: "Thich Nhat Hanh", category: "calm" },
  { quote: "The soul should always stand ajar, ready to welcome the ecstatic experience.", author: "Emily Dickinson", category: "calm" },
  { quote: "Within you, there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse", category: "calm" },
  { quote: "Quiet the mind, and the soul will speak.", author: "Ma Jaya Sati Bhagavati", category: "calm" },
  { quote: "Simplicity is the keynote of all true elegance and peace.", author: "Coco Chanel", category: "calm" },
  { quote: "Tension is who you think you should be. Relaxation is who you are.", author: "Chinese Proverb", category: "calm" },

  // Joy / Light / Wonder
  { quote: "There are only two ways to live: as though nothing is a miracle, or as though everything is.", author: "Albert Einstein", category: "joy" },
  { quote: "Joy does not simply happen to us. We have to choose joy and keep choosing it every day.", author: "Henri Nouwen", category: "joy" },
  { quote: "Find ecstasy in life; the mere sense of living is joy enough.", author: "Emily Dickinson", category: "joy" },
  { quote: "Keep your face always toward the sunshine—and shadows will fall behind you.", author: "Walt Whitman", category: "joy" },
  { quote: "To love and be loved is to feel the sun from both sides.", author: "David Viscott", category: "joy" },

  // Drive / Ambition / Vision
  { quote: "The people who are crazy enough to think they can change the world are the ones who do.", author: "Steve Jobs", category: "drive" },
  { quote: "Go confidently in the direction of your dreams. Live the life you have imagined.", author: "Henry David Thoreau", category: "drive" },
  { quote: "Whatever you can do, or dream you can do, begin it. Boldness has genius, power, and magic in it.", author: "Johann Wolfgang von Goethe", category: "drive" },
  { quote: "Do not follow where the path may lead. Go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson", category: "drive" },
  { quote: "Shoot for the moon. Even if you miss, you'll land among the stars.", author: "Norman Vincent Peale", category: "drive" }
];

curatedAdditions.forEach(q => addQuote(q.category, q.quote, q.author));

// Classification heuristics
const rules = {
  revenge: [
    /\brevenge\b/i, /\benem(y|ies)\b/i, /\bhater(s)?\b/i, /\bdoubt(ed|er|ers)?\b/i,
    /\bprove them wrong\b/i, /\bcomeback\b/i, /\bcritic(s)?\b/i, /\bdisdain\b/i,
    /\bjealous(y)?\b/i, /\bunderdog\b/i, /\boutgrow\b/i, /\bdismiss(ed)?\b/i,
    /\blaugh last\b/i, /\bvindication\b/i, /\bspite\b/i, /\bvengeance\b/i,
    /\bunbothered\b/i, /\brise above\b/i, /\bignore them\b/i, /\bbet against\b/i,
    /\bopponent\b/i, /\brival\b/i, /\bwatch me\b/i, /\bwin in silence\b/i,
    /\bquiet revenge\b/i, /\bslander\b/i, /\bskeptics?\b/i, /\bunderrat(e|ed)\b/i,
    /\bunderestimat(e|ed|ing)\b/i, /\bcount(ed)? me out\b/i, /\bturn.*proof\b/i,
    /\bliving well\b/i, /\bshame\b/i, /\bgrudge\b/i, /\btriumph over\b/i,
    /\boutshine\b/i, /\boutwork.*yesterday\b/i
  ],
  focus: [
    /\bfocus(ed|ing)?\b/i, /\bconcentrat(e|ion|ing)\b/i, /\bdistract(ion|ions|ed|ing)?\b/i,
    /\bclarity\b/i, /\battention\b/i, /\bone thing\b/i, /\bdirection\b/i,
    /\bpriorit(y|ies)\b/i, /\bdeep work\b/i, /\bsingle-mind(ed)?\b/i, /\bessential(ism)?\b/i,
    /\bnoise\b/i, /\blaser\b/i, /\baverage man.*focus\b/i, /\bsimplicity\b/i,
    /\bselective\b/i, /\bunplug\b/i, /\baim\b/i, /\bcenter(ed)?\b/i, /\bshallow\b/i,
    /\bmeditat\b/i, /\bmindful\b/i, /\beye on the ball\b/i
  ],
  hardwork: [
    /\bhard\s*work\b/i, /\bdiscipline(d)?\b/i, /\bhabit(s)?\b/i, /\bperspiration\b/i,
    /\bsweat\b/i, /\bpractic(e|ing)\b/i, /\brepetition\b/i, /\bdiligence\b/i,
    /\blabor\b/i, /\btoil\b/i, /\bgrind\b/i, /\bmastery\b/i, /\bcraftsman\b/i,
    /\btrain(ing)?\b/i, /\broutine\b/i, /\bchop.*wood\b/i, /\beffort\b/i,
    /\bwork hard\b/i, /\bworking hard\b/i, /\bworketh\b/i, /\bhard-working\b/i,
    /\bpersistency\b/i, /\bexecution\b/i
  ],
  grit: [
    /\bgrit\b/i, /\bresilien(ce|t)\b/i, /\bendur(e|ance|ing)\b/i, /\bpersever(e|ance)\b/i,
    /\bfail(ure|ed|ing)?\b/i, /\bscars?\b/i, /\bwound(s)?\b/i, /\btough\b/i,
    /\bstorm(s)?\b/i, /\bsuffer(ing)?\b/i, /\badversit(y)?\b/i, /\btrial(s)?\b/i,
    /\bsurviv(e|al|ing)\b/i, /\bfall.*stand\b/i, /\bstumble\b/i, /\bfriction\b/i,
    /\bobstacle(s)?\b/i, /\bdefeat(ed)?\b/i, /\bhardship(s)?\b/i, /\bhell.*keep going\b/i,
    /\bcourage to continue\b/i, /\brise every time\b/i, /\bstanding up\b/i
  ],
  calm: [
    /\bcalm\b/i, /\bpeace(ful)?\b/i, /\bstill(ness)?\b/i, /\bsilen(ce|t)\b/i,
    /\bquiet\b/i, /\bbreath(e|ing)?\b/i, /\bseren(e|ity)\b/i, /\bhurry\b/i,
    /\btranquil(ity)?\b/i, /\bcontent(ment)?\b/i, /\bmeditat(e|ion)\b/i,
    /\bsolitude\b/i, /\brelax\b/i, /\bslow(ly)?\b/i, /\bgentle\b/i, /\binner peace\b/i,
    /\bpresent moment\b/i, /\bharmony\b/i, /\bease\b/i
  ],
  joy: [
    /\bjoy(ful)?\b/i, /\blaugh(ter|ing)?\b/i, /\bsmile(s|d)?\b/i, /\bhapp(y|iness)\b/i,
    /\bdelight(ful)?\b/i, /\bgratitude\b/i, /\bthankful\b/i, /\bwonder\b/i,
    /\bsunshine\b/i, /\bcheer(ful)?\b/i, /\bdance\b/i, /\bsing(ing)?\b/i,
    /\bbless(ing|ed)?\b/i, /\bcelebrat(e|ion)\b/i, /\blight\b/i, /\bglad\b/i,
    /\bmerry\b/i, /\bbliss\b/i, /\beuphoria\b/i
  ],
  drive: [
    /\bdrive\b/i, /\bambition\b/i, /\bdream(s|ing)?\b/i, /\bfuture\b/i,
    /\bvision\b/i, /\bconquer\b/i, /\bachiev(e|ement)\b/i, /\bgoal(s)?\b/i,
    /\bbuild\b/i, /\bcreat(e|ing)?\b/i, /\blead(er|ership)?\b/i, /\bdestiny\b/i,
    /\bpossib(le|ility|ilities)\b/i, /\bdare\b/i, /\bhorizon\b/i, /\brise\b/i,
    /\bstart\b/i, /\bbegin\b/i, /\bsuccess\b/i, /\bexplore\b/i, /\binvent\b/i
  ]
};

function categorize(text) {
  for (const cat of ['revenge', 'focus', 'hardwork', 'grit', 'calm', 'joy', 'drive']) {
    for (const r of rules[cat]) {
      if (r.test(text)) return cat;
    }
  }
  return null;
}

// Scratch directory sources
const scratchDir = '/Users/harsh/.gemini/antigravity/brain/25463988-a3e1-45a4-90c9-3aa86f3bbdba/scratch';
const sources = [];

// Harbi categories
for (const f of ['success', 'happiness', 'habits', 'risk', 'life', 'beauty', 'sport']) {
  const filePath = path.join(scratchDir, `harbi_${f}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      raw.forEach(q => sources.push({ text: q.text, author: q.author }));
    } catch {}
  }
}

// JamesFT dataset
const jamesPath = '/Users/harsh/.gemini/antigravity/brain/25463988-a3e1-45a4-90c9-3aa86f3bbdba/.system_generated/steps/16/content.md';
if (fs.existsSync(jamesPath)) {
  try {
    const raw = fs.readFileSync(jamesPath, 'utf8');
    const data = JSON.parse(raw.slice(raw.indexOf('[')));
    data.forEach(q => sources.push({ text: q.quoteText, author: q.quoteAuthor }));
  } catch {}
}

// dwyl dataset
const dwylPath = path.join(scratchDir, 'dwyl_quotes.json');
if (fs.existsSync(dwylPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(dwylPath, 'utf8'));
    data.forEach(q => sources.push({ text: q.text, author: q.author }));
  } catch {}
}

// Stoic thoughts dataset
const stoicPath = path.join(scratchDir, 'stoic_thoughts.txt');
if (fs.existsSync(stoicPath)) {
  try {
    const raw = fs.readFileSync(stoicPath, 'utf8');
    const lines = raw.split('\n');
    for (let i = 0; i < lines.length; i += 4) {
      const text = lines[i]?.trim();
      const author = lines[i+1]?.trim();
      if (text && author && text !== 'Quote here') {
        sources.push({ text, author, defaultCat: 'calm' });
      }
    }
  } catch {}
}

// Vinit dataset
const vinitPath = path.join(scratchDir, 'vinit_quotes.json');
if (fs.existsSync(vinitPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(vinitPath, 'utf8').trim());
    data.forEach(q => sources.push({ text: q.text, author: q.from }));
  } catch {}
}

// Ingest and classify all sources
for (const item of sources) {
  if (!item.text) continue;
  const cat = categorize(item.text) || item.defaultCat;
  if (cat) {
    addQuote(cat, item.text, item.author);
  }
}

// Cap or balance categories to ensure rich experience
const targetCaps = {
  revenge: 250,
  focus: 300,
  hardwork: 350,
  grit: 400,
  calm: 400,
  joy: 400,
  drive: 400
};

const finalQuotes = [];

for (const [cat, items] of Object.entries(pools)) {
  const cap = targetCaps[cat] || 400;
  const selected = items.slice(0, cap);
  selected.forEach((item, index) => {
    finalQuotes.push({
      id: `${cat}-${String(index + 1).padStart(3, '0')}`,
      quote: item.quote,
      author: item.author,
      category: cat
    });
  });
}

// Write out to quotes.json
fs.writeFileSync(origPath, JSON.stringify(finalQuotes, null, 2) + '\n', 'utf8');

console.log(`\nSuccessfully generated ${finalQuotes.length} quotes!`);
console.log('Breakdown by category:');
for (const cat of Object.keys(targetCaps)) {
  const count = finalQuotes.filter(q => q.category === cat).length;
  console.log(`  ${cat.padEnd(10)}: ${count} quotes`);
}
