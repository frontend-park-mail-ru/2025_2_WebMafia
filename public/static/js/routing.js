// const url = require('url');
// const path = require('path');
// const fs = require('fs')

// const define = function(req, res, postData) {
//   const urlParsed = url.parse(req.url, true);
//   let pathName = urlParsed.pathname;
//   console.log('Запрос:', pathName);

//   const getContentTypes = (filePath) => {
//     const ext = path.extname(filePath);
//     console.log('type',filePath);
//     const types = {
//             '.html': 'text/html',
//             '.css': 'text/css',
//             '.js': 'text/javascript',
//             '.png': 'image/png',
//             '.jpg': 'image/jpeg',
//             '.jpeg': 'image/jpeg',
//             '.gif': 'image/gif',
//             '.ico': 'image/x-icon',
//             '.json': 'application/json'
//         };
//         return types[ext];
//   }


//   //обработка статики
//   if (pathName.startsWith('/static/')) {
//     const filePath =path.join(__dirname, 'public', pathName);
//     console.log('statiks',filePath);

//     return;
//   }

//   //обработка api запросов
//   if (pathName.startsWith('/api/')) {
//     res.writeHead(404);
//     res.end('API route not handled by Node.js');
//     return;
//   }
  
//   const htmlFile = path.join(__dirname, 'public', 'index.html');
//   console.log('file', htmlFile);

//   fs.readFile(htmlFile, 'utf-8', (err, html) => {
//     if (err){
//       res.writeHead(404, {'Content-Type': 'text/html'});
//       res.end('страница не найдена');
//     } else {
//       res.writeHead(200, {'Content-Type': 'text/html'});
//       res.end(html);
//     }
//   });
// };
// exports.define = define;

import { MainPage } from './pages/mainpage/mainpage.js';
import { notFoundPage } from './pages/notfoundpage/notFoundPage.js';
import { LoginPage } from './pages/login/login.js';
import { RegistrationPage } from './pages/register/register.js';

export class Router {
    constructor() {
        this.routes = {
            '/': new MainPage,
            '/login': new LoginPage,
            '/register': new RegistrationPage
        };

        this.currentPage = null;
    }

    handlePath(path){
      const component = this.routes[path];
      const newNotFoundPage = new notFoundPage;
      console.log(component);
      if(!component){
        return(newNotFoundPage.render());
      }
      return component.render();  
    }


    init() {
        
        // Обработка кликов по ссылкам с data-link
        window.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            console.log('window init');
            if (link) {
                e.preventDefault();
                this.navigate(link.href);
            }
        });

        // Обработка навигации браузера (назад/вперед)
        window.addEventListener('popstate', (e) => {
            e.preventDefault();  
            console.log('window init');
            this.navigate(window.location.pathname);
        });

        window.addEventListener('load', () =>{
            console.log('window init');
          this.navigate(window.location.pathname);
        });
    }

    navigate(url) {
        const path = new URL(url, window.location.origin).pathname;
        console.log('window url', path);
        if (window.location.pathname !== path) {
            window.history.pushState(null, null, path);
        }
        this.handlePath(path);
    }

    // async renderPage(path) {
    //     // Нормализуем путь
    //     path = path.replace(/\/$/, '') || '/';
        
    //     console.log('🔄 Rendering page for path:', path);
        
    //     const PageClass = this.routes[path];
        
    //     if (!PageClass) {
    //         console.warn(`No route found for ${path}, falling back to main page`);
    //         this.navigate('/');
    //         return;
    //     }
        
    //     if (this.currentPage && this.currentPage.destroy) {
    //         this.currentPage.destroy();
    //     }

    //     this.currentPage = new PageClass();
        
    //     try {
    //         await this.currentPage.render();
    //         this.updateActiveLink(path);
    //     } catch (error) {
    //         console.error('Error rendering page:', error);
    //         this.navigate('/');
    //     }
    // }

    // updateActiveLink(currentPath) {
    //     document.querySelectorAll('[data-link]').forEach(link => {
    //         const linkPath = new URL(link.href).pathname;
    //         if (linkPath === currentPath) {
    //             link.classList.add('active');
    //         } else {
    //             link.classList.remove('active');
    //         }
    //     });
    // }
}