import Link from '@/components/PageLink';
import Arrow from '@/components/Arrow';

export default function TestRide({english = false}: {english?: boolean}) {
  const t = (sk: string, en: string) => english ? en : sk;
  return <section className="test-ride section" id="vyskusat" aria-labelledby="test-ride-title">
    <div className="test-ride-photo"><img src="/media/hero-life-desktop.webp" width={1600} height={900} loading="lazy"
      alt={t('Rodina počas jazdy na cargo bicykli – ilustračná fotografia výrobcu', 'Family riding a cargo bike — illustrative manufacturer image')}/>
      <span>{t('INŠPIRÁCIA ZO ŠVÉDSKA · FOTO VÝROBCU', 'INSPIRATION FROM SWEDEN · MANUFACTURER IMAGE')}</span>
    </div>
    <div className="test-ride-copy"><span className="eyebrow">{t('SKÚŠOBNÁ JAZDA · RAJECKÉ TEPLICE', 'TEST RIDE · RAJECKÉ TEPLICE')}</span>
      <h2 id="test-ride-title">{t('Najprv sa prevezte.', 'Take a ride first.')}<br/><em>{t('Potom sa rozhodnite.', 'Then decide.')}</em></h2>
      <p>{t('Ako sa na cargobajku zatáča? Aký je pocit viezť deti či nákup? Príďte si ho vyskúšať do nášho showroomu v Rajeckých Tepliciach. Ukážeme vám bicykel, odpovieme na otázky a spolu zistíme, čo vám sadne.', 'How does a cargo bike handle? What does it feel like to carry children or shopping? Come and try one at our showroom in Rajecké Teplice. We will show you the bike, answer your questions and help you find what feels right.')}</p>
      <address>Lúčna 350/5, 013 13 Rajecké Teplice</address>
      <p className="test-ride-note">{t('Návštevy sú po dohode. Pred cestou si s nami potvrďte termín a model, ktorý si chcete vyskúšať.', 'Visits are by appointment. Please confirm the time and the model you want to try before travelling.')}</p>
      <div className="test-ride-actions"><Link href={(english ? '/en' : '') + '/kontakt?tema=skusobna-jazda#dopyt'} className="button dark">{t('Dohodnúť skúšobnú jazdu', 'Arrange a test ride')} <Arrow/></Link>
      <a className="text-link" href="tel:+421904501703">+421 904 501 703</a></div>
    </div>
  </section>;
}
