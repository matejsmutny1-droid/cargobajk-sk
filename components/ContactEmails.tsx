const contacts = {
 hello: ['hello@cargobajk.sk','Výber bicykla a dopyty','Bike enquiries'],
 info: ['info@cargobajk.sk','Všeobecné informácie','General information'],
 service: ['service@cargobajk.sk','Servis, diely a reklamácie','Service, parts and complaints'],
 shipping: ['shipping@cargobajk.sk','Doprava a dodanie','Shipping and delivery'],
 b2b: ['b2b@cargobajk.sk','Firemná spolupráca','Business partnerships'],
 press: ['press@cargobajk.sk','Médiá a tlač','Media and press'],
 gdpr: ['gdpr@cargobajk.sk','Súkromie a osobné údaje','Privacy and personal data'],
 matej: ['matej@cargobajk.sk','Napíšte Matejovi','Contact Matej'],
} as const;
const byPage: Record<string,(keyof typeof contacts)[]> = {kontakt:['hello','info','b2b','press'],servis:['service'],'sukromie':['gdpr'],'obchodne-informacie':['hello','shipping','service'],'o-nas':['matej']};
export default function ContactEmails({page,english=false}:{page:string;english?:boolean}) {
 const keys=byPage[page];if(!keys)return null;
 return <aside className="contact-emails" aria-label={english?'Email contacts':'E-mailové kontakty'}>{keys.map(key=>{const [email,sk,en]=contacts[key];return <div key={key}><span>{english?en:sk}</span><a href={'mailto:'+email}>{email}</a></div>})}</aside>;
}
