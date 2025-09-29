export class notFoundPage{
    async render(){
            const contentTemplate = Handlebars.templates['404.hbs'];
            document.getElementById('app').innerHTML = contentTemplate();
    }
}
