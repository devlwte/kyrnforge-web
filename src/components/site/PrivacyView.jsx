import React, { useEffect } from 'react';
import Layout from './Layout';

const UPDATED = '27 de octubre de 2026';

const linkClass = 'text-fg underline underline-offset-4 decoration-line hover:decoration-accent';

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyView({ navigate }) {
  useEffect(() => {
    document.title = 'Privacidad · KyrnForge';
  }, []);

  return (
    <Layout navigate={navigate} current="/privacidad">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        <p className="eyebrow">Última actualización: {UPDATED}</p>
        <h1 className="display text-4xl sm:text-5xl leading-tight mt-4">Política de privacidad</h1>
        <p className="mt-6 text-lg text-muted leading-relaxed">
          Esta página explica qué datos se usan en kyrnforge.dev y para qué. Las aplicaciones que se descargan
          desde aquí tienen sus propias políticas en{' '}
          <a href="/privacy-policy/" className={linkClass}>este directorio</a>.
        </p>

        <div className="mt-12 space-y-10 text-muted leading-relaxed">
          <Section title="Lo que se guarda en tu navegador">
            <p>
              El sitio guarda en el almacenamiento local de tu navegador el tema que eliges (claro u oscuro), una
              copia del catálogo para que cargue más rápido y la lista de enlaces que acortaste desde este
              dispositivo. Nada de eso se envía a ningún servidor y puedes borrarlo limpiando los datos del sitio.
            </p>
          </Section>

          <Section title="Acortador de enlaces">
            <p>
              Al acortar un enlace se guarda la dirección de destino, su dominio y la fecha de creación. Los enlaces
              caducan solos a los 90 días. Para evitar abusos se lleva un contador temporal por dirección IP que se
              borra a los pocos minutos y no se asocia con el enlace.
            </p>
            <p>
              El código QR se genera con el servicio público api.qrserver.com, que recibe solo el enlace corto.
            </p>
          </Section>

          <Section title="Cuentas de KyrnForge Skins">
            <p>
              Si creas una cuenta se guardan tu nombre de usuario, tu correo y tu contraseña cifrada, además de
              los aspectos que subas. El correo solo se usa para iniciar sesión. Puedes pedir que se borre tu
              cuenta escribiendo al contacto de abajo.
            </p>
          </Section>

          <Section title="Publicidad de Google">
            <p>
              Este sitio muestra anuncios de Google AdSense. Google y sus socios usan cookies para mostrar anuncios
              según tus visitas anteriores a este y a otros sitios web.
            </p>
            <p>
              Puedes desactivar los anuncios personalizados en la{' '}
              <a href="https://adssettings.google.com" target="_blank" rel="noreferrer" className={linkClass}>
                configuración de anuncios de Google
              </a>{' '}
              o los de otros proveedores en{' '}
              <a href="https://www.aboutads.info/choices" target="_blank" rel="noreferrer" className={linkClass}>
                aboutads.info
              </a>
              . Más detalles en{' '}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noreferrer" className={linkClass}>
                cómo usa Google la información de los sitios que usan sus servicios
              </a>
              .
            </p>
          </Section>

          <Section title="Alojamiento">
            <p>
              El sitio está alojado en Cloudflare, que puede registrar datos técnicos de cada visita (IP, navegador,
              hora) para proteger el servicio. Las descargas se sirven desde GitHub.
            </p>
          </Section>

          <Section title="Contacto">
            <p>
              Para cualquier duda o para pedir que se borre un dato, escribe a{' '}
              <a href="mailto:abuse@kyrnforge.dev" className={linkClass}>abuse@kyrnforge.dev</a> o abre un issue en{' '}
              <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className={linkClass}>GitHub</a>.
            </p>
          </Section>
        </div>
      </main>
    </Layout>
  );
}
