export default async ({app}) => {
    const lang = app.$cookies.get('language') ?? app.i18n.locale;

    if (!lang) app.$cookies.set('language', app.i18n.locale);

    app.i18n.locale = lang;
}