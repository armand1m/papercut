import { geosearch } from './geosearch';

export const createSelectors = (el: Element) => {
  const $ = (selector: string) => el.querySelector(selector);

  const attr = (selector: string, attribute: string) => {
    const fallback = "";
    const elm = $(selector);

    if (!elm) return fallback;

    const attr = attribute === "textContent"
      ? elm[attribute]
      : elm.getAttribute(attribute);

    return attr || fallback;
  };

  const text = (selector: string) => attr(selector, "textContent");
  const src = (selector: string) => attr(selector, "src");
  const href = (selector: string) => attr(selector, "href");
  const className = (selector: string) => attr(selector, "class");

  return {
    text,
    src,
    href,
    attr,
    className,
    element: el,
    geosearch,
  }
};