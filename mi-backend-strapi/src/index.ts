const SEED_EVENTS = [
  {
    title: 'Inauguració Col·lectiva',
    date: '2026-07-15',
    time: '19:00',
    location: 'Espai Barri Vell, Girona',
    description:
      'Exposició col·lectiva dels artistes de Victoria Taylor. Una nit per descobrir noves col·leccions.',
    type: 'upcoming',
    cta_text: 'Reservar plaça',
    cta_url: '#',
  },
  {
    title: 'Prova Pau',
    date: '2025-03-10',
    time: '18:30',
    location: 'Galeria Espai Barri Vell, Girona',
    description:
      'Exposició individual de Judà Muñoz amb les seves darreres peces d\'expressionisme abstracte.',
    type: 'historical',
    cta_text: 'Veure galeria',
    cta_url: '#',
  },
];

const SEED_NEWS = [
  { title: 'Exposició de Judà Muñoz a la Galeria Espai Barri Vell de Girona', date: '2025-09-19', cta_url: '#' },
  { title: 'Rosa Martín expone su serie "Vestigis"', date: '2025-05-28', cta_url: '#' },
  { title: 'Judà Muñoz expone en el edificio de la Farinera, en Girona', date: '2024-12-13', cta_url: '#' },
  { title: 'Exposición de Mohammed Rabey en Girona', date: '2024-12-09', cta_url: '#' },
  { title: 'Judà Muñoz recibe un reconocimiento por parte de Cruz Roja', date: '2024-10-19', cta_url: '#' },
  { title: 'Exposición de Rosa Martín en la Capilla de Santa Anna d\'Argelaguer', date: '2024-10-17', cta_url: '#' },
  { title: 'Judà Muñoz participa en la cena solidaria de Cruz Roja en Palamós', date: '2024-10-12', cta_url: '#' },
  { title: 'Cristina Montero en Vallviva', date: '2024-07-01', cta_url: '#' },
];

async function enablePublicPermissions(strapi: any, actions: string[], label: string) {
  try {
    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

    for (const action of actions) {
      const existingPerms = await strapi
        .query('plugin::users-permissions.permission')
        .findMany({ where: { action } });

      let perm;
      if (existingPerms.length > 0) {
        perm = existingPerms[0];
      } else {
        perm = await strapi
          .query('plugin::users-permissions.permission')
          .create({ data: { action } });
      }

      // Check if link exists using raw DB query
      const link = await strapi.db.connection('up_permissions_role_lnk')
        .where({ permission_id: perm.id, role_id: publicRole.id })
        .first();

      if (!link) {
        const maxOrd = await strapi.db.connection('up_permissions_role_lnk')
          .where({ role_id: publicRole.id })
          .max('permission_ord as max')
          .first();
        await strapi.db.connection('up_permissions_role_lnk').insert({
          permission_id: perm.id,
          role_id: publicRole.id,
          permission_ord: (maxOrd?.max || 0) + 1,
        });
      }
    }
    strapi.log.info(`✅ Permisos públics per a ${label} activats`);
  } catch (err) {
    strapi.log.warn(`⚠️ Error en permisos per a ${label}:`, err);
  }
}

export default {
  register({ strapi }: { strapi: any }) {},

  bootstrap: async ({ strapi }: { strapi: any }) => {
    // ── Permisos ──
    await enablePublicPermissions(
      strapi,
      ['api::event.event.find', 'api::event.event.findOne'],
      'Event'
    );
    await enablePublicPermissions(
      strapi,
      ['api::article.article.find', 'api::article.article.findOne'],
      'Notícia'
    );

    // ── Seed events ──
    try {
      const count = await strapi.query('api::event.event').count();
      if (count === 0) {
        for (const event of SEED_EVENTS) {
          await strapi.query('api::event.event').create({ data: event });
        }
        strapi.log.info(`✅ ${SEED_EVENTS.length} events de seed creats`);
      }
    } catch (err) {
      strapi.log.warn('⚠️ Error creant events de seed:', err);
    }

    // ── Seed news ──
    try {
      const count = await strapi.query('api::article.article').count();
      if (count === 0) {
        for (const article of SEED_NEWS) {
          await strapi.query('api::article.article').create({ data: article });
        }
        strapi.log.info(`✅ ${SEED_NEWS.length} notícies de seed creades`);
      }
    } catch (err) {
      strapi.log.warn('⚠️ Error creant notícies de seed:', err);
    }
  },
};
