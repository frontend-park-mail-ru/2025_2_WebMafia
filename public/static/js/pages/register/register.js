export class RegistrationPage {
    async render() {
            const contentTemplate = Handlebars.templates['register.hbs'];
            document.getElementById('app').innerHTML = contentTemplate();
    }
}