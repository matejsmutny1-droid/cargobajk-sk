import {seller} from '@/lib/seller';
import {returnPolicy} from '@/lib/return-policy';

export default function ReturnPolicy({english = false}: {english?: boolean}) {
 return <section className="article-block" id="vratenie-tovaru">
  <h2>{english ? 'Withdrawal and returns' : 'Odstúpenie od zmluvy a vrátenie tovaru'}</h2>
  <p>{english
   ? `Consumers buying at a distance may withdraw without giving a reason within ${returnPolicy.days} days of receiving the goods, including before delivery. Send an unambiguous notice by email or post; dispatching the notice within the deadline is sufficient. No prior approval is required.`
   : `Spotrebiteľ môže pri nákupe na diaľku odstúpiť bez uvedenia dôvodu do ${returnPolicy.days} dní od prevzatia tovaru, aj pred dodaním. Jednoznačné oznámenie pošlite e-mailom alebo poštou; stačí ho odoslať v lehote. Predchádzajúci súhlas nevyžadujeme.`}</p>
  <p><strong>{seller.name}</strong><br/>{seller.returnAddress}<br/><a href={'mailto:'+seller.email}>{seller.email}</a> · <a href={'tel:'+seller.phoneLink}>{seller.phone}</a></p>
  <p>{english
   ? 'Send the goods back or hand them over at this address within 14 days of withdrawal. Arrange an appointment for personal handover; contacting us does not extend or condition your rights. For a bulky bicycle, use a carrier able to transport its weight and battery safely.'
   : 'Tovar odošlite späť alebo odovzdajte na tejto adrese do 14 dní od odstúpenia. Termín osobného odovzdania si dohodnite; kontaktovanie nás nie je podmienkou ani predĺžením vašich práv. Pri rozmernom bicykli využite prepravcu schopného bezpečne prepraviť jeho hmotnosť aj batériu.'}</p>
  <p>{english
   ? 'For a non-defective return, you normally arrange and pay return transport. For goods unsuitable for ordinary post, we provide the cost or a reasonable estimate in your quote before the order is binding. If we fail to provide the legally required information, or agree to cover the cost, you do not bear it. Defect claims are handled separately under statutory rights.'
   : 'Pri vrátení bez vady spravidla zabezpečujete a hradíte spätnú prepravu. Pri tovare nevhodnom na bežné poštové vrátenie uvedieme náklady alebo primeraný odhad v ponuke pred záväznou objednávkou. Ak si nesplníme zákonnú informačnú povinnosť alebo sa zaviažeme náklady uhradiť, neznášate ich. Reklamácie vád sa riadia samostatnými zákonnými právami.'}</p>
  <p>{english
   ? 'We refund payments, including the cheapest standard outbound delivery offered, within 14 days of receiving the notice, using the original payment method without a fee unless otherwise agreed. We may withhold the refund until receiving the goods or proof of dispatch, whichever comes first, unless we offer collection. Only diminished value caused by handling beyond checking the goods may be claimed, subject to law; no fixed restocking fee applies.'
   : 'Platby vrátane najlacnejšieho ponúkaného bežného dodania vrátime do 14 dní od doručenia oznámenia, pôvodným spôsobom bez poplatku, ak sa nedohodneme inak. Vrátenie môžeme zadržať do prevzatia tovaru alebo preukázania odoslania, podľa toho, čo nastane skôr, ak neponúkneme vyzdvihnutie. Podľa zákona možno uplatniť iba zníženie hodnoty spôsobené zaobchádzaním nad rámec odskúšania; paušálny poplatok za vrátenie neúčtujeme.'}</p>
  <p><a href="/documents/odstupenie-od-zmluvy.txt" download>{english ? 'Download an optional withdrawal form (Slovak)' : 'Stiahnuť nepovinný vzor odstúpenia od zmluvy'}</a></p>
  <p className="source-note">{english ? 'This policy covers consumer distance purchases. The non-binding enquiry is not an order. It does not limit statutory rights.' : 'Tieto podmienky sa týkajú spotrebiteľských nákupov na diaľku. Nezáväzný dopyt nie je objednávkou. Zákonné práva tým nie sú obmedzené.'}</p>
 </section>;
}
