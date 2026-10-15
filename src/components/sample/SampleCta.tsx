import "./sample-cta.css";

/**
 * Namuna sahifasining pastki paneli: mijoz dizaynni ko'rib turib, bir bosishda xuddi shunday taklifnoma boshlaydi.
 * Haqiqiy (mehmonlarga yuborilgan) taklifnomalarda ko'rsatilmaydi.
 */
export function SampleCta({ templateId, name, eventType }: { templateId: string; name: string; eventType: string }) {
  return (
    <div className="sample-cta" role="region" aria-label="Namuna taklifnoma">
      <a className="sample-cta__back" href="/#dizaynlar">
        <span aria-hidden>←</span> Dizaynlar
      </a>
      <span className="sample-cta__name">«{name}» namunasi</span>
      <a className="sample-cta__go" href={`/kabinet/yangi?dizayn=${templateId}&tur=${eventType}`}>
        Shu dizaynda yaratish
      </a>
    </div>
  );
}
