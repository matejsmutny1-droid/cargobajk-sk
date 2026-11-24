import {pricePreviewNote} from '@/lib/retail-display';
import {salesTerms} from '@/lib/sales-terms';
export default function ProductSupply({english=false,modelSlug}:{english?:boolean;modelSlug?:string}) {
 if(modelSlug==='longtail')return <p className="source-note">{pricePreviewNote(english)}<br/><strong>{english?'Availability for Slovakia is being verified. Ask us for a current quote before ordering.':'Dostupnosť pre Slovensko aktuálne overujeme. Pred objednaním si vyžiadajte aktuálnu ponuku.'}</strong></p>;
 return <p className="source-note">{english ? <>{pricePreviewNote(true)}<br/><strong>Available to order · delivery within {salesTerms.deliveryDays} calendar days</strong> from order confirmation and the agreed payment. We quote shipping from Žilina for your delivery address before you order.</> : <>{pricePreviewNote()}<br/><strong>Na objednávku · dodanie do {salesTerms.deliveryDays} kalendárnych dní</strong> od potvrdenia objednávky a dohodnutej platby. Dopravu zo Žiliny naceníme podľa vašej adresy pred objednaním.</>}</p>;
}
