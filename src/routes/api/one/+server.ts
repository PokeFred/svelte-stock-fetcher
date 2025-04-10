import type { RequestHandler } from "./$types"
import { Builder, Browser, By, until } from "selenium-webdriver"
import type { WebDriver, WebElement } from "selenium-webdriver"
import { Options } from "selenium-webdriver/chrome"

type Exchange = {
    notation: string,
    name: string
}

async function fetchExchanges(isin: string): Promise<Exchange[]> {
    const options: Options = new Options()
    options.addArguments("--headless")

    const driver: WebDriver = new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build()

    let exchanges: Exchange[] = []
    try {
        let url: string = `https://www.onvista.de/suche/?searchValue=${isin}`
        await driver.get(url)

        url = await driver.getCurrentUrl()
        url = url.replace("https://www.onvista.de/etf", "https://www.onvista.de/etf/handelsplaetze")
        await driver.get(url)

        await driver.wait(until.elementsLocated(By.css("select#select-history-market")), 5000)
        const selectBox: WebElement = await driver.findElement(By.css("select#select-history-market"))
        const selectOptions: WebElement[] = await selectBox.findElements(By.css("option"))

        for (const element of selectOptions) {
            const s: string = await element.getText()

            if (s === "Xetra (EUR, verzögert)") {
                exchanges.push({ notation: await element.getAttribute("value"), name: "Xetra" })
            } else if (s === "gettex (EUR, Echtzeit)") {
                exchanges.push({ notation: await element.getAttribute("value"), name: "gettex" })
            } else if (s === "LS Exchange (EUR, Echtzeit)") {
                exchanges.push({ notation: await element.getAttribute("value"), name: "LS Exchange" })
            }
        }
    } catch (error: unknown) {
        console.log(error)
        exchanges = []
    }

    await driver.quit()
    return exchanges
}

export const GET: RequestHandler = async (): Promise<Response> => {
    const isin: string = "IE00B4L5Y983"
    const exchanges: Exchange[] = await fetchExchanges(isin)

    const data: string = JSON.stringify(exchanges)
    return new Response(data, {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Length": data.length.toString(),
            "Accept-Ranges": "bytes"
        }
    })
}
