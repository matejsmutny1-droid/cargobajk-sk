import {bikes as slovakBikes, featuredSlugs} from '../catalog';
export {featuredSlugs};
export type {Bike} from '../catalog';
const descriptions:Record<string,string>={
  "flex": "Room for children, shopping and a spontaneous stop in the park. An electric cargo bike for sharing everyday life.",
  "delight": "Turn everyday journeys into time together. A family cargo bike with an Ananda mid-drive motor.",
  "flex-dog": "Shared adventures and everyday journeys with your four-legged friend. A Flex model designed for dogs.",
  "longtail": "An extended rear rack instead of a front box. A city cargo bike with options for passengers and cargo.",
  "flex-kindergarten": "Room for up to six children on two lengthwise benches. A larger box with a front door for nurseries and bigger families.",
  "delight-kindergarten": "Room for up to six children on two lengthwise benches. A larger box with a front door for nurseries and bigger families.",
  "classic-kindergarten": "Room for up to six children on two lengthwise benches. A larger box with a front door for nurseries and bigger families.",
  "flex-box": "The cargo version of the Flex range. Room for work equipment, deliveries and everyday loads.",
  "delight-box": "The cargo version of the Delight range. Room for work equipment, deliveries and everyday loads.",
  "delight-dog": "The Delight version for travelling with a dog. The front box has a door for easier access.",
  "classic": "A classic three-wheel cargo bike for family journeys and everyday travel. With electric assistance and a front box.",
  "classic-dog": "The Classic version for travelling with a dog. The front box has a door for easier access.",
  "classic-box": "The cargo version of the Classic range. Room for work equipment, deliveries and everyday loads.",
  "longlite": "Two wheels, a front box and room for up to two children. Long Lite combines family travel with an Ananda mid-drive motor."
};
const vocabulary:Record<string,string>={
  "Rodina": "Family",
  "Počet detí": "Child capacity",
  "Až 4 detí": "Up to 4 children",
  "Batéria": "Battery",
  "Nosnosť": "Load capacity",
  "100 kg v boxe + 100 kg jazdec": "100 kg in the box + 100 kg rider",
  "Prevody": "Gears",
  "Shimano · 7 stupňov": "Shimano · 7 speeds",
  "Rozmery boxu": "Box dimensions",
  "dĺžka 90,5 cm šírka 59,5 cm výška vzadu 50,5 cm, výška vpredu 42,5 cm": "length 90,5 cm width 59,5 cm rear height 50,5 cm, front height 42,5 cm",
  "250 W, Ananda stredový motor 110 Nm": "250 W, Ananda mid-drive motor 110 Nm",
  "Shimano Altus · 8 stupňov": "Shimano Altus · 8 speeds",
  "So psom": "With a dog",
  "Mesto": "City",
  "Pre škôlky": "For nurseries",
  "Až 6 detí": "Up to 6 children",
  "Ananda v zadnom náboji · 250 W · 45 Nm": "Ananda rear hub · 250 W · 45 Nm",
  "Shimano Tourney · 7 stupňov": "Shimano Tourney · 7 speeds",
  "dĺžka 91,5 cm × šírka 89 cm × výška 55 cm": "length 91,5 cm × width 89 cm × height 55 cm",
  "Ananda stredový motor 110 Nm": "Ananda mid-drive motor 110 Nm",
  "dĺžka 91,5 cm šírka 89 cm výška 55 cm": "length 91,5 cm width 89 cm height 55 cm",
  "Shimano SiS · 6 stupňov": "Shimano SiS · 6 speeds",
  "Náklad a podnikanie": "Cargo and business",
  "dĺžka 90 cm šírka 59 cm výška 59 cm": "length 90 cm width 59 cm height 59 cm",
  "Shimano Alfine · 8 stupňov": "Shimano Alfine · 8 speeds",
  "dĺžka 91,5 cm šírka 61,5 cm výška 49,5 cm": "length 91,5 cm width 61,5 cm height 49,5 cm",
  "dĺžka 87 cm, šírka 59 cm, výška vzadu 59 cm, výška vpredu 55 cm": "length 87 cm, width 59 cm, rear height 59 cm, front height 55 cm",
  "Až 2 deti": "Up to 2 children"
};
export const bikes=slovakBikes.map(bike=>({...bike,use:vocabulary[bike.use]??bike.use,description:descriptions[bike.slug]??bike.description,specs:bike.specs.map(row=>row.map(value=>vocabulary[value]??value))}));
