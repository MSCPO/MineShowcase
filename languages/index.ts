import zh_CN from "./zh_CN.toml";
import en_US from "./en_US.toml";

interface Lang {
  NavBar: NavBar;
}

interface NavBar {
  title: string;
}

type TranslationRecord = Record<string, Lang>;

const translations: TranslationRecord = {
  "zh-CN": zh_CN,
  "en-US": en_US,
};

const createFallbackProxy = (primary: Lang, fallback: Lang): Lang => {
  return new Proxy(primary, {
    get(target, prop: keyof Lang) {
      const primaryValue = target[prop];
      const fallbackValue = fallback[prop];
      if (
        typeof primaryValue === "object" &&
        primaryValue !== null &&
        typeof fallbackValue === "object" &&
        fallbackValue !== null
      ) {
        return createFallbackProxy(
          primaryValue as unknown as Lang,
          fallbackValue as unknown as Lang,
        );
      }
      return primaryValue ?? fallbackValue;
    },
  });
};

const defaultLang: Lang = createFallbackProxy(
  translations["en-US"],
  translations["zh-CN"],
);
export default defaultLang;
