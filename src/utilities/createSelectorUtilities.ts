import { DOMWindow, JSDOM } from 'jsdom';
import { geosearch } from './geosearch';
import { fetchPage } from '../http/fetchPage';

export type SelectorUtilities = ReturnType<
  typeof createSelectorUtilities
>;

export const createSelectorUtilities = (element: Element) => {
  const $ = (selector: string) => element.querySelector(selector);
  const attr = (selector: string, attribute: string) => {
    const fallback = '';
    const elm = $(selector);

    if (!elm) return fallback;

    const attr =
      attribute === 'textContent'
        ? elm[attribute]
        : elm.getAttribute(attribute);

    return attr || fallback;
  };

  const text = (selector: string) => attr(selector, 'textContent');
  const src = (selector: string) => attr(selector, 'src');
  const href = (selector: string) => attr(selector, 'href');
  const className = (selector: string) => attr(selector, 'class');

  const createWindowForHTMLContent = (htmlContent: string) => {
    let window: DOMWindow | null = new JSDOM(htmlContent).window;

    return {
      window,
      close: () => {
        window?.close();
        window = null;
      },
    };
  };

  const all = (selector: string) => {
    return element.querySelectorAll(selector);
  };

  return {
    text,
    src,
    href,
    attr,
    all,
    className,
    element,
    geosearch,
    fetchPage,
    createWindowForHTMLContent,
  };
};
