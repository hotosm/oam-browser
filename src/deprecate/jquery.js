// TODO: jQuery isn't needed with React.
// Plus it adds bloat.
// Also it makes testing harder in node when a virtual DOM is needed.
// So let's plan to refactor it out.

let jQuery = {};
if (typeof window !== "undefined") {
  jQuery = require("jquery");
}

module.exports = jQuery;
