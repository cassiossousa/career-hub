import { useTranslation } from '../../i18n/provider';

export default function Home() {
  const { messages: t } = useTranslation();

  return (
    <section className="container-main">
      <h1>{t.home.name}</h1>
      <h2 className="text-xl">{t.home.title}</h2>
      <p className="text-lg mt-2">{t.home.subtitle}</p>
      <p className="mt-4 text-justify">{t.resume.summary}</p>
    </section>
  );
}
