import React, { useEffect } from 'react';
import Layout, { Link } from './Layout';

export default function AboutView({ navigate }) {
  useEffect(() => {
    document.title = 'Acerca de · KyrnForge';
  }, []);

  return (
    <Layout navigate={navigate} current="/acerca">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        <p className="eyebrow">Acerca de</p>
        <h1 className="display text-4xl sm:text-5xl leading-[1.05] mt-4">Un taller pequeño, sin prisa.</h1>

        <div className="mt-10 space-y-6 text-lg text-muted leading-relaxed">
          <p>
            KyrnForge es el nombre bajo el que publico mis proyectos. Empezó como una carpeta de utilidades que
            hacía para mí mismo y fue creciendo: hoy incluye programas para Windows, apps y juegos para Android,
            y varias herramientas alrededor de Minecraft.
          </p>
          <p>
            Me gusta que las cosas funcionen sin conexión, que ocupen poco y que no pidan más permisos de los que
            necesitan. Cuando algo depende de un servidor, como el acortador o las skins, lo explico en la
            página de <Link to="/privacidad" navigate={navigate} className="text-fg underline underline-offset-4 decoration-line hover:decoration-accent">privacidad</Link>.
          </p>
          <p>
            Todo lo que hay aquí se puede usar gratis. Los anuncios del sitio ayudan a pagar el dominio y el
            alojamiento.
          </p>
        </div>

        <section className="mt-14 card p-6 space-y-3">
          <h2 className="font-semibold">Contacto</h2>
          <p className="text-muted leading-relaxed">
            Para errores, ideas o reportes de un enlace abusivo puedes abrir un issue en{' '}
            <a href="https://github.com/devlwte" target="_blank" rel="noreferrer" className="text-fg underline underline-offset-4 decoration-line hover:decoration-accent">
              github.com/devlwte
            </a>{' '}
            o escribir a{' '}
            <a href="mailto:abuse@kyrnforge.dev" className="text-fg underline underline-offset-4 decoration-line hover:decoration-accent">
              abuse@kyrnforge.dev
            </a>.
          </p>
        </section>
      </main>
    </Layout>
  );
}
