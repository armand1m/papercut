import { JSDOM } from 'jsdom';
import { geosearch } from './geosearch';
import { fetchPage } from './fetchPage';

export type SelectorFnProps = ReturnType<typeof createSelectors>;

export const createSelectors = (element: Element) => {
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
    return new JSDOM(htmlContent).window;
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
