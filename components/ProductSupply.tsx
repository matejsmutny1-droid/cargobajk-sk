import {salesTerms} from '@/lib/sales-terms';
export default function ProductSupply({english=false}:{english?:boolean}) {
 return <p className="source-note">{english ? <>Final bike price. Shipping and optional accessories are charged separately.<br/><strong>Available to order · delivery within {salesTerms.deliveryDays} calendar days</strong> from order confirmation and the agreed payment. We quote shipping from Žilina for your delivery address before you order.</> : <>Konečná cena bicykla. Doprava a zvolené doplnky sa účtujú osobitne.<br/><strong>Na objednávku · dodanie do {salesTerms.deliveryDays} kalendárnych dní</strong> od potvrdenia objednávky a dohodnutej platby. Dopravu zo Žiliny naceníme podľa vašej adresy pred objednaním.</>}</p>;
}
