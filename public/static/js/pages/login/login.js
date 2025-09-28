export class LoginPage {
    async render() {
            const contentTemplate = Handlebars.templates['login.hbs'];
            document.getElementById('app').innerHTML = contentTemplate();
    }
}