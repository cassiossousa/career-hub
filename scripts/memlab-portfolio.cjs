function url() {
  return 'http://localhost:4173/';
}

async function action(page) {
  await page.click('a[href="/projects"]');
}

async function back(page) {
  await page.goBack();
}

module.exports = { url, action, back };
