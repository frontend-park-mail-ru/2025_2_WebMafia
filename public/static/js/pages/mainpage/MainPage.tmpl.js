(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['MainPage.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "            <a id=\"logoutBtn\" class=\"nav-link login\" href=\"#\">Выйти</a>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "            <a class=\"nav-link login\" href=\"/login\">Войти</a>\n            <a class=\"nav-link register\" href=\"/register\">Зарегистрироваться</a>\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div class=\"card\" >\n                        <a href=\"#\">\n                            <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"image","hash":{},"data":data,"loc":{"start":{"line":43,"column":38},"end":{"line":43,"column":47}}}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":43,"column":54},"end":{"line":43,"column":62}}}) : helper)))
    + "\">\n                            <p class=\"card-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":44,"column":49},"end":{"line":44,"column":57}}}) : helper)))
    + "</p>\n                        </a>\n                    </div>\n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div class=\"card\">\n                        <a href=\"#\">\n                            <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"image","hash":{},"data":data,"loc":{"start":{"line":63,"column":38},"end":{"line":63,"column":47}}}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":63,"column":54},"end":{"line":63,"column":62}}}) : helper)))
    + "\">\n                            <p class=\"card-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":64,"column":49},"end":{"line":64,"column":57}}}) : helper)))
    + "</p>\n                            <p class=\"card-sub\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"artist") || (depth0 != null ? lookupProperty(depth0,"artist") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artist","hash":{},"data":data,"loc":{"start":{"line":65,"column":48},"end":{"line":65,"column":58}}}) : helper)))
    + "</p>\n                        </a>\n                    </div>\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div class=\"card\">\n                        <a href=\"#\"><img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"image","hash":{},"data":data,"loc":{"start":{"line":83,"column":46},"end":{"line":83,"column":55}}}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":83,"column":62},"end":{"line":83,"column":70}}}) : helper)))
    + "\">\n                        <p class=\"card-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":84,"column":45},"end":{"line":84,"column":53}}}) : helper)))
    + "</p>\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"artists") : depth0),{"name":"each","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":85,"column":24},"end":{"line":87,"column":33}}})) != null ? stack1 : "")
    + "                    </div>\n";
},"10":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                            <p class=\"card-sub\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":86,"column":48},"end":{"line":86,"column":56}}}) : helper)))
    + "</p></a>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"section\">\n    <header class=\"head\" id=\"header\">\n    <div class=\"head-left\">\n        <div class=\"logo\">\n            <span><img src=\"static/img/wave.png\" class=\"wave-icon\"></span>\n            <h1 class=\"icon-name\">Wave</h1>\n        </div>\n    </div>\n    <div class=\"head-right\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isAuthenticated") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":10,"column":8},"end":{"line":15,"column":15}}})) != null ? stack1 : "")
    + "    </div>\n</header>\n\n\n<div class=\"layout\">\n    <aside class=\"sidebar\">\n        <nav class=\"menu\">\n            <span class=\"menuicon\"><img src=\"static/img/search.png\"><a href=\"#\">Поиск</a></span>\n            <span class=\"menuicon\"><img src=\"static/img/home.png\" alt=\"\"><a href=\"/\">Главная</a></span>\n            <span class=\"menuicon\"><img src=\"static/img/library.png\" alt=\"\"><a href=\"/\">Библиотека</a></span>\n        </nav>\n    </aside>\n    \n    <div class=\"divide-line\"></div>\n    \n    <div class=\"page\">\n        <!-- Артисты -->\n        <div class=\"title\">\n            <div class=\"title-name\">Артисты</div>\n            <div class=\"show-all\"><a href=\"\">Показать всё</a></div>\n        </div>\n        <div class=\"slider\">\n            <p> <i class=\"slide-btn left\"></i></p>\n            <div class=\"cards\" id=\"slidebar\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"artists") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":40,"column":16},"end":{"line":47,"column":25}}})) != null ? stack1 : "")
    + "            </div>\n            <p> <i class=\"slide-btn right\"></i></p>\n        </div>\n\n        <!-- Альбомы -->\n        <div class=\"title\">\n            <div class=\"title-name\">Альбомы</div>\n            <div class=\"show-all\"><a href=\"\">Показать всё</a></div>\n        </div>\n        <div class=\"slider\">\n            <i class=\"slide-btn left\"></i>\n            <div class=\"cards\" id=\"slidebar\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"albums") : depth0),{"name":"each","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":16},"end":{"line":68,"column":25}}})) != null ? stack1 : "")
    + "            </div>\n            <i class=\"slide-btn right\"></i>\n        </div>\n\n        <!-- Треки -->\n        <div class=\"title\">\n            <div class=\"title-name\">Треки</div>\n            <div class=\"show-all\"><a href=\"\">Показать всё</a></div>\n        </div>\n        <div class=\"slider\">\n            <p> <i class=\"slide-btn left\"></i></p>\n            <div class=\"cards\" id=\"slidebar\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"tracks") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":81,"column":16},"end":{"line":89,"column":25}}})) != null ? stack1 : "")
    + "            </div>\n            <p> <i class=\"slide-btn right\"></i></p>\n        </div>\n        \n    </div>\n</div>\n</div>";
},"useData":true});
})();