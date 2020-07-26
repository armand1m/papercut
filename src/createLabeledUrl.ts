export interface LabeledUrl {
  label: string;
  url: string;
}

export const createLabeledUrl = (label: string, url: string) => ({ label, url }) as LabeledUrl;