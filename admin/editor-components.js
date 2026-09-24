// Adds a "Floating Image" button to the Body markdown editor toolbar so a
// small image can sit beside a paragraph of text (image floats left/right,
// text wraps around it) without anyone needing to type or edit HTML.
CMS.registerEditorComponent({
  id: "floating-image",
  label: "Floating Image",
  fields: [
    { name: "image", label: "Image", widget: "image" },
    {
      name: "align",
      label: "Side",
      widget: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ],
      default: "left",
    },
    { name: "alt", label: "Alt text (for screen readers)", widget: "string", required: false, default: "" },
  ],
  pattern: /^<figure class="inline-float inline-float-(left|right)">\n<img src="([^"]*)" alt="([^"]*)">\n<\/figure>$/,
  fromBlock: function (match) {
    return {
      align: match[1],
      image: match[2],
      alt: match[3],
    };
  },
  toBlock: function (obj) {
    return '<figure class="inline-float inline-float-' + obj.align + '">\n<img src="' + obj.image + '" alt="' + (obj.alt || "") + '">\n</figure>';
  },
  toPreview: function (obj) {
    return "Floating image (" + obj.align + "-aligned): " + obj.image;
  },
});
