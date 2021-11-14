export const mapNodeListToArray = (nodeList: NodeList): Element[] => {
  return Array.prototype.slice.call(nodeList);
};
