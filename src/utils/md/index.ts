/*
 * 图片转md格式
 * @param url 图片url
 * @returns md格式图片
 */
export function imageToMd(url: string, alt = "image") {
  return `![${alt}](${url})`;
}

const safeProtocol = /^(https?|ircs?|mailto|xmpp|blob)$/i;

export function isImageUrl(value: string) {
  return value.startsWith("http") || value.startsWith("blob");
}

export function urlTransform(value: string) {
  // Same as:
  // <https://github.com/micromark/micromark/blob/929275e/packages/micromark-util-sanitize-uri/dev/index.js#L34>
  // But without the `encode` part.
  const colon = value.indexOf(":");
  const questionMark = value.indexOf("?");
  const numberSign = value.indexOf("#");
  const slash = value.indexOf("/");

  if (
    // If there is no protocol, it’s relative.
    colon === -1 ||
    // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    // It is a protocol, it should be allowed.
    safeProtocol.test(value.slice(0, colon))
  ) {
    return value;
  }

  return "";
}
