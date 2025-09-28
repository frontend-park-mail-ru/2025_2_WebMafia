(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['MainPage.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div class=\"card\" >\r\n                        <a href=\"#\">\r\n                            <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"image","hash":{},"data":data,"loc":{"start":{"line":39,"column":38},"end":{"line":39,"column":47}}}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":39,"column":54},"end":{"line":39,"column":62}}}) : helper)))
    + "\">\r\n                            <p class=\"card-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":40,"column":49},"end":{"line":40,"column":57}}}) : helper)))
    + "</p>\r\n                        </a>\r\n                    </div>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div class=\"card\">\r\n                        <a href=\"#\">\r\n                            <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"image","hash":{},"data":data,"loc":{"start":{"line":59,"column":38},"end":{"line":59,"column":47}}}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":59,"column":54},"end":{"line":59,"column":62}}}) : helper)))
    + "\">\r\n                            <p class=\"card-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":60,"column":49},"end":{"line":60,"column":57}}}) : helper)))
    + "</p>\r\n                            <p class=\"card-sub\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"artist") || (depth0 != null ? lookupProperty(depth0,"artist") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"artist","hash":{},"data":data,"loc":{"start":{"line":61,"column":48},"end":{"line":61,"column":58}}}) : helper)))
    + "</p>\r\n                        </a>\r\n                    </div>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <div class=\"card\">\r\n                        <a href=\"#\"><img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"image") || (depth0 != null ? lookupProperty(depth0,"image") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"image","hash":{},"data":data,"loc":{"start":{"line":79,"column":46},"end":{"line":79,"column":55}}}) : helper)))
    + "\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":79,"column":62},"end":{"line":79,"column":70}}}) : helper)))
    + "\">\r\n                        <p class=\"card-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":80,"column":45},"end":{"line":80,"column":53}}}) : helper)))
    + "</p>\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"artists") : depth0),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":81,"column":24},"end":{"line":83,"column":33}}})) != null ? stack1 : "")
    + "                    </div>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                            <p class=\"card-sub\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"name","hash":{},"data":data,"loc":{"start":{"line":82,"column":48},"end":{"line":82,"column":56}}}) : helper)))
    + "</p></a>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"section\">\r\n    <header class=\"head\" id=\"header\">\r\n            <div class=\"head-left\">\r\n                <div class=\"logo\">\r\n                <span ><img src=\"static/img/wave.png\" class=\"wave-icon\"></span>\r\n                <h1 class=\"icon-name\">Wave</h1>\r\n                </div>\r\n            </div>\r\n            <div class=\"head-right\">\r\n                <a class=\"nav-link login\" href=\"/login\">Войти</a>\r\n                <a class=\"nav-link register\" href=\"/registration\">Зарегистрироваться</a>\r\n            </div>\r\n    </header>\r\n\r\n\r\n<div class=\"layout\">\r\n    <aside class=\"sidebar\">\r\n        <nav class=\"menu\">\r\n            <span class=\"menuicon\"><img src=\"static/img/search.png\"><a href=\"#\">Поиск</a></span>\r\n            <span class=\"menuicon\"><img src=\"static/img/home.png\" alt=\"\"><a href=\"/\">Главная</a></span>\r\n            <span class=\"menuicon\"><img src=\"static/img/library.png\" alt=\"\"><a href=\"/library\">Библиотека</a></span>\r\n        </nav>\r\n    </aside>\r\n    \r\n    <div class=\"divide-line\"></div>\r\n    \r\n    <div class=\"page\">\r\n        <!-- Артисты -->\r\n        <div class=\"title\">\r\n            <div class=\"title-name\">Артисты</div>\r\n            <div class=\"show-all\"><a href=\"\">Показать всё</a></div>\r\n        </div>\r\n        <div class=\"slider\">\r\n            <p> <i class=\"slide-btn left\"></i></p>\r\n            <div class=\"cards\" id=\"slidebar\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"artists") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":36,"column":16},"end":{"line":43,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n            <p> <i class=\"slide-btn right\"></i></p>\r\n        </div>\r\n\r\n        <!-- Альбомы -->\r\n        <div class=\"title\">\r\n            <div class=\"title-name\">Альбомы</div>\r\n            <div class=\"show-all\"><a href=\"\">Показать всё</a></div>\r\n        </div>\r\n        <div class=\"slider\">\r\n            <i class=\"slide-btn left\"></i>\r\n            <div class=\"cards\" id=\"slidebar\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"albums") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":56,"column":16},"end":{"line":64,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n            <i class=\"slide-btn right\"></i>\r\n        </div>\r\n\r\n        <!-- Треки -->\r\n        <div class=\"title\">\r\n            <div class=\"title-name\">Треки</div>\r\n            <div class=\"show-all\"><a href=\"\">Показать всё</a></div>\r\n        </div>\r\n        <div class=\"slider\">\r\n            <p> <i class=\"slide-btn left\"></i></p>\r\n            <div class=\"cards\" id=\"slidebar\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"tracks") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":77,"column":16},"end":{"line":85,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n            <p> <i class=\"slide-btn right\"></i></p>\r\n        </div>\r\n        \r\n    </div>\r\n</div>\r\n</div>";
},"useData":true});
})();