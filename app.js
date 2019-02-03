const puppeteer = require('puppeteer');
const request = require('request');

(async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox']});
    const page = await browser.newPage();
    const categories = [
        {
            id: '5',
            ndc: [7]
        },
        {
            id: '9',
            ndc: [507, 548,]
        },
    ];
    const books = [];

    for (let j = 0; j < categories.length; j++) {
        const category = categories[j];
        await page.goto('https://www.shinagawa-lib.jp/opw/OPW/OPWNEWBOOK.CSP');

        await page.select('select[name="SK"]', category.id);
        await page.select('select[name="SPAN"]', '1');
        await page.click('input[name=syukei]');
        await page.waitFor(250);

        await page.select('select[name="WRTCOUNT"]', '100');
        await page.waitFor(250);

        // TODO  Error: Protocol error (Runtime.callFunctionOn): Cannot find context with specified id
        const urls = await page.$$eval('.table tr.lightcolor a, .table tr.basecolor a', anchors => anchors.map((anchor => anchor.href)));

        for (let i = 0; i < urls.length; i++) {
            await page.goto(urls[i]);
            await page.waitFor(250);

            let data = {};
            let rows = (await page.$$eval('#content div:nth-child(1) table.table tr', elems => elems.map(elem => {
                switch (elem.querySelector('th').innerText) {
                    case "タイトル":
                        return {
                            key: 'title',
                            value: elem.querySelector('td a').innerText,
                        };

                    case "ISBN":
                        return {
                            key: 'isbn',
                            value: elem.querySelector('td').innerText,
                        };

                    case "NDC10[NDC9](NDC8)":
                        return {
                            key: 'ndc',
                            value: elem.querySelector('td a:nth-child(1)').innerText,
                        };
                }
                return null;
            }))).filter((elem) => elem);

            rows.forEach((item) => {
                data[item.key] = item.value;
            });

            console.log(data);
            let ndc = parseInt(data.ndc || -1, 10);
            if (category.ndc.indexOf(ndc) !== -1) {
                if (data.isbn) {
                    data.url = 'https://www.amazon.co.jp/dp/' + convertISBN13to10(data.isbn);
                }
                books.push(data);
            }
        }
    }

    await browser.close();

    const message = books.map((book) => {
        return '▼' + book.title + '\n' + book.url;
    }).join('\n\n');

    const options = {
        url: "https://api.chatwork.com/v2/rooms/" + process.env.ROOM_ID + "/messages",
        headers: {
            "X-ChatWorkToken": process.env.API_TOKEN
        },
        form: {
            body: message
        }
    };

    request.post(options);
})().catch((err) => {
    console.log(err);
    process.exit(1);
});

function convertISBN13to10(str) {
    str = str.replace(/-/g, '');
    const chars = str.split('');

    let digit = 11 - (
        10 * chars[3]
        + 9 * chars[4]
        + 8 * chars[5]
        + 7 * chars[6]
        + 6 * chars[7]
        + 5 * chars[8]
        + 4 * chars[9]
        + 3 * chars[10]
        + 2 * chars[11]
    ) % 11;
    if (digit === 10) {
        digit = 'X'
    } else if (digit === 11) {
        digit = 0;
    }

    return str.substr(3, 9) + digit;
}
