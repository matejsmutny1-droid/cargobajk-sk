import QuotePage from '@/components/QuotePage';
export const metadata={title:'Nezáväzná ponuka',robots:{index:false,follow:false},description:'Vyberte si cargo bicykel a výbavu. Získajte nezáväzný súhrn s cenou bicykla e-mailom.'};
export default async function Page({searchParams}:{searchParams:Promise<{model?:string}>}) {const {model}=await searchParams;return <QuotePage model={model}/>}
