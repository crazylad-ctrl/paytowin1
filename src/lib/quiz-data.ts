export type Category = "general" | "anime" | "school" | "chaos";

export interface Question {
  q: string;
  choices: string[];
  answer: number; // index
}

export const CATEGORIES: { id: Category; label: string; emoji: string; blurb: string }[] = [
  { id: "general", label: "General Knowledge", emoji: "🌍", blurb: "Facts, places, history" },
  { id: "anime", label: "Anime & Games", emoji: "🎮", blurb: "Otaku & gamer trivia" },
  { id: "school", label: "School Subjects", emoji: "📚", blurb: "Math, science, English" },
  { id: "chaos", label: "Random Chaos", emoji: "😈", blurb: "Pure unhinged questions" },
];

export const QUESTIONS: Record<Category, Question[]> = {
  general: [
    { q: "What is the capital of Nepal?", choices: ["Pokhara", "Kathmandu", "Lalitpur", "Biratnagar"], answer: 1 },
    { q: "Which is the largest ocean?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 },
    { q: "Mount Everest lies on the border of Nepal and…", choices: ["India", "China", "Bhutan", "Pakistan"], answer: 1 },
    { q: "Who painted the Mona Lisa?", choices: ["Van Gogh", "Da Vinci", "Picasso", "Michelangelo"], answer: 1 },
    { q: "How many continents are there?", choices: ["5", "6", "7", "8"], answer: 2 },
    { q: "Currency of Japan?", choices: ["Won", "Yuan", "Yen", "Ringgit"], answer: 2 },
    { q: "Which planet is the Red Planet?", choices: ["Venus", "Mars", "Jupiter", "Mercury"], answer: 1 },
    { q: "Who wrote 'Romeo and Juliet'?", choices: ["Dickens", "Shakespeare", "Hemingway", "Tolkien"], answer: 1 },
    { q: "What is the tallest animal?", choices: ["Elephant", "Giraffe", "Horse", "Camel"], answer: 1 },
    { q: "Which gas do plants absorb?", choices: ["Oxygen", "Nitrogen", "CO₂", "Helium"], answer: 2 },
  ],
  anime: [
    { q: "Who is the protagonist of Naruto?", choices: ["Sasuke", "Naruto", "Kakashi", "Itachi"], answer: 1 },
    { q: "What does 'Dattebayo' mean?", choices: ["I'm hungry", "Believe it", "Goodbye", "Let's go"], answer: 1 },
    { q: "Studio that made 'Your Name'?", choices: ["Ghibli", "CoMix Wave", "Madhouse", "Trigger"], answer: 1 },
    { q: "In Pokémon, what type is Pikachu?", choices: ["Fire", "Water", "Electric", "Grass"], answer: 2 },
    { q: "Who is the Pirate King target in One Piece?", choices: ["Luffy", "Zoro", "Shanks", "Ace"], answer: 0 },
    { q: "Final boss of Elden Ring?", choices: ["Malenia", "Radagon", "Radahn", "Elden Beast"], answer: 3 },
    { q: "Death Note's main weapon is a…", choices: ["Sword", "Notebook", "Pen", "Phone"], answer: 1 },
    { q: "Minecraft's blocky enemy that explodes?", choices: ["Zombie", "Skeleton", "Creeper", "Enderman"], answer: 2 },
    { q: "Goku's signature attack?", choices: ["Rasengan", "Kamehameha", "Bankai", "Galick Gun"], answer: 1 },
    { q: "Fortnite's main game mode?", choices: ["Co-op", "Battle Royale", "Racing", "MMO"], answer: 1 },
  ],
  school: [
    { q: "What is 12 × 8?", choices: ["86", "96", "104", "112"], answer: 1 },
    { q: "Square root of 144?", choices: ["10", "11", "12", "14"], answer: 2 },
    { q: "H₂O is…", choices: ["Salt", "Water", "Sugar", "Acid"], answer: 1 },
    { q: "Speed of light (approx)?", choices: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁵ m/s"], answer: 0 },
    { q: "Past tense of 'go'?", choices: ["Goed", "Went", "Gone", "Going"], answer: 1 },
    { q: "How many sides does a hexagon have?", choices: ["5", "6", "7", "8"], answer: 1 },
    { q: "Powerhouse of the cell?", choices: ["Nucleus", "Ribosome", "Mitochondria", "Golgi"], answer: 2 },
    { q: "Largest planet in our solar system?", choices: ["Saturn", "Jupiter", "Neptune", "Earth"], answer: 1 },
    { q: "Who invented the light bulb?", choices: ["Tesla", "Edison", "Newton", "Bell"], answer: 1 },
    { q: "180° is equal to how many radians?", choices: ["π", "2π", "π/2", "π/4"], answer: 0 },
  ],
  chaos: [
    { q: "If a chicken says 'meow', what is it?", choices: ["A cat", "Confused", "A glitch", "All of the above"], answer: 3 },
    { q: "How many holes does a straw have?", choices: ["0", "1", "2", "Yes"], answer: 1 },
    { q: "What color is a mirror?", choices: ["Silver", "Clear", "Slightly green", "Vibes"], answer: 2 },
    { q: "Is cereal a soup?", choices: ["Yes", "No", "Only on Sundays", "Don't @ me"], answer: 1 },
    { q: "Bro… what is bro doing?", choices: ["Cooking", "Sleeping", "Vibing", "Skibidi"], answer: 3 },
    { q: "Which is heavier: 1kg feathers or 1kg steel?", choices: ["Feathers", "Steel", "Same", "Depends"], answer: 2 },
    { q: "If you delete Twitter, what bird dies?", choices: ["Robin", "Larry", "Eagle", "None it's just a logo"], answer: 1 },
    { q: "Why did the chicken cross the road?", choices: ["Food", "To get to the other side", "Bus", "Vibes"], answer: 1 },
    { q: "What's the speed of dark?", choices: ["0", "Infinity", "Faster than light", "Just the absence of light"], answer: 3 },
    { q: "Can a fish drown?", choices: ["Yes", "No", "Only catfish", "Don't ask me bro"], answer: 0 },
  ],
};
