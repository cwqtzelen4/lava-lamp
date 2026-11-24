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
    { name: "remove", label: "Delete this image (tick this box, then save: the image is removed from the article)", widget: "boolean", default: false },
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
      remove: false,
    };
  },
  toBlock: function (obj) {
    if (obj.remove) return ""; // ticked "Delete this image": write nothing, so the image leaves the article
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
    if (obj.remove) return "This image will be removed when you save";
    return "Image (" + obj.align + ", " + (obj.size || "medium") + "): " + obj.image;
  },
});

// Adds a "YouTube Video" button: paste a YouTube link and the video plays inside the story.
// Tick the box to show it inside the antler frame.
var FRAME_IMAGE = "/assets/uploads/video-frame-antlers.png";
CMS.registerEditorComponent({
  id: "youtube-video",
  label: "YouTube Video",
  fields: [
    { name: "url", label: "YouTube link (for example https://www.youtube.com/watch?v=...)", widget: "string" },
    { name: "frame", label: "Show the video inside the antler frame", widget: "boolean", default: true },
  ],
  pattern: /^<div class="video-embed( video-framed)?">\n<div class="video-screen"><iframe src="https:\/\/www\.youtube-nocookie\.com\/embed\/([\w-]+)"[^>]*><\/iframe><\/div>(?:\n<img src="[^"]*" alt="">)?\n<\/div>$/,
  fromBlock: function (match) {
    return { url: "https://www.youtube.com/watch?v=" + match[2], frame: !!match[1] };
  },
  toBlock: function (obj) {
    var found = (obj.url || "").match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
    if (!found) return "";
    var html =
      '<div class="video-embed' + (obj.frame ? " video-framed" : "") + '">\n' +
      '<div class="video-screen"><iframe src="https://www.youtube-nocookie.com/embed/' + found[1] + '" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    if (obj.frame) html += '\n<img src="' + FRAME_IMAGE + '" alt="">';
    return html + "\n</div>";
  },
  toPreview: function (obj) {
    return "YouTube video: " + (obj.url || "") + (obj.frame ? " (in the antler frame)" : "");
  },
});
