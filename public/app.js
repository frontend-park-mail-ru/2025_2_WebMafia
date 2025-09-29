import { router } from './static/js/routing.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('router');
    initializePage();
});

function initializePage(){
    console.log('router');
    router.init();
}