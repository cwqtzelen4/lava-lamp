// Adds a "Floating Image" button to the markdown editors so a small photo can
// sit inside the text (left, right or centred, in a few sizes) without anyone
// needing to type or edit HTML. Text wraps around left/right images.
CMS.registerEditorComponent({
  id: "floating-image",
  label: "Floating Image",
  fields: [
    { name: "image", label: "Image", widget: "image" },
    {
      name: "align",
      label: "Placement",
      widget: "select",
      options: [
        { label: "Left (text wraps on the right)", value: "left" },
        { label: "Right (text wraps on the left)", value: "right" },
        { label: "Centre (on its own line)", value: "center" },
      ],
      default: "left",
    },
    {
      name: "size",
      label: "Size",
      widget: "select",
      options: [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
        { label: "Full width", value: "full" },
      ],
      default: "medium",
    },
    { name: "caption", label: "Caption (optional)", widget: "string", required: false, default: "" },
    { name: "alt", label: "Alt text (for screen readers)", widget: "string", required: false, default: "" },
  ],
  // also matches the older figures that had no size or caption
  pattern: /^<figure class="inline-float inline-float-(left|right|center)(?: inline-float-(small|medium|large|full))?">\n<img src="([^"]*)" alt="([^"]*)">(?:\n<figcaption>([^<]*)<\/figcaption>)?\n<\/figure>$/,
  fromBlock: function (match) {
    return {
      align: match[1],
      size: match[2] || "medium",
      image: match[3],
      alt: match[4].replace(/&quot;/g, '"'),
      caption: (match[5] || "").replace(/&quot;/g, '"'),
    };
  },
  toBlock: function (obj) {
    var clean = function (s) {
      return (s || "").replace(/"/g, "&quot;").replace(/</g, "").replace(/>/g, "").replace(/\n/g, " ");
    };
    var html =
      '<figure class="inline-float inline-float-' + obj.align + " inline-float-" + (obj.size || "medium") + '">\n' +
      '<img src="' + (obj.image || "") + '" alt="' + clean(obj.alt) + '">';
    if (obj.caption) html += "\n<figcaption>" + clean(obj.caption) + "</figcaption>";
    return html + "\n</figure>";
  },
  toPreview: function (obj) {
    return "Image (" + obj.align + ", " + (obj.size || "medium") + "): " + obj.image;
  },
});
