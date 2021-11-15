import { DOMWindow, JSDOM } from 'jsdom';

export const createWindow = (htmlContent: string) => {
  let window: DOMWindow | null = new JSDOM(htmlContent).window;
  let document: Document | null = window.document;

  return {
    window,
    document,
    close: () => {
      window?.close();
      window = null;
      document = null;
    },
  };
};
