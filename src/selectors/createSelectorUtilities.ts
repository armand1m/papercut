import { DOMWindow, JSDOM } from 'jsdom';
import { geosearch } from '../http/geosearch';
import { fetchPage } from '../http/fetchPage';
import { mapNodeListToArray } from '../utilities/mapNodeListToArray';

export type SelectorUtilities = ReturnType<
  typeof createSelectorUtilities
>;

/**
 * This method creates the selector utilities provided
 * to every selector function given to the scrape method.
 *
 * These utilities are meant to make the experience of
 * using papercut a bit more pleasant. They're currently
 * not extendable, but one could, in theory, create higher
 * order functions extension.
 *
 * Almost every single one of these methods have a default
 * fallback of an empty string, in case it fails to find the
 * element or a specific property.
 *
 * At the same time, you also have direct access to the elementfrom selector functions if needed for more complex tasks.
 */
export const createSelectorUtilities = (element: Element) => {
  const $ = element.querySelector.bind(element);
  const attr = (selector: string, attribute: string) => {
    const fallback = '';
    const innerElement = $(selector);

    if (!innerElement) {
      return fallback;
    }

    const attr =
      attribute === 'textContent'
        ? innerElement[attribute]
        : innerElement.getAttribute(attribute);

    return attr ?? fallback;
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
    const nodes = element.querySelectorAll(selector);

    return {
      nodes,
      asArray: mapNodeListToArray(nodes),
    };
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
    mapNodeListToArray,
  };
};
