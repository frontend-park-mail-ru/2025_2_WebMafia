declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare const Handlebars: {
  compile: (template: string) => (data: any) => string;
  templates: { [key: string]: (data: any) => string };
  registerPartial: (name: string, template: string | Function) => void;
  registerHelper: (name: string, fn: Function) => void;
};
