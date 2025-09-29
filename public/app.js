import { router } from './static/js/routing.js';

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage(){
    router.init();
}