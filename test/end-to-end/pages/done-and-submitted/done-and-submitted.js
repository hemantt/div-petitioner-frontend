const content = require ('app/steps/done-and-submitted/content.json').resources.en.translation.content;

function amDoneAndSubmitted() {

  const I = this;

  I.waitUrlEquals('/done-and-submitted');
  I.see(content.title);
}
module.exports = { amDoneAndSubmitted };
